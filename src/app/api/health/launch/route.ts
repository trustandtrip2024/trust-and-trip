// Pre-launch deep health check.
//
// Verifies every integration is wired and the new ad-traffic pipeline can
// run end-to-end. Fail this and ad spend will burn against silent failures.
//
// Run before flipping ad spend live:
//   curl -s https://trustandtrip.com/api/health/launch | jq
//
// 200 = green for launch. 503 = something missing or unreachable.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Status = "ok" | "missing" | "error";
type Check = { status: Status; detail?: string };

const must = (name: string): boolean => !!process.env[name]?.trim();

async function checkEnv(): Promise<Record<string, Check>> {
  return {
    // Critical infra
    supabase: must("NEXT_PUBLIC_SUPABASE_URL") && must("SUPABASE_SERVICE_ROLE_KEY")
      ? { status: "ok" } : { status: "missing", detail: "NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY" },
    sanity: must("NEXT_PUBLIC_SANITY_PROJECT_ID") && must("NEXT_PUBLIC_SANITY_DATASET")
      ? { status: "ok" } : { status: "missing" },
    redis: must("UPSTASH_REDIS_REST_URL") && must("UPSTASH_REDIS_REST_TOKEN")
      ? { status: "ok" } : { status: "missing", detail: "rate limiting + caching off" },

    // Payments
    razorpay: must("RAZORPAY_KEY_ID") && must("RAZORPAY_KEY_SECRET")
      ? { status: "ok" } : { status: "missing" },

    // CRM
    bitrix24: must("BITRIX24_WEBHOOK_URL") ? { status: "ok" } : { status: "missing" },

    // AI / messaging
    anthropic: must("ANTHROPIC_API_KEY") ? { status: "ok" } : { status: "missing", detail: "itinerary engine off" },
    resend: must("RESEND_API_KEY") ? { status: "ok" } : { status: "missing", detail: "email delivery off" },
    whatsapp: must("WHATSAPP_ACCESS_TOKEN") && must("WHATSAPP_PHONE_ID") && must("WHATSAPP_VERIFY_TOKEN")
      ? { status: "ok" } : { status: "missing", detail: "WA send + webhook off" },

    // Ad attribution
    meta_capi: must("META_CAPI_ACCESS_TOKEN")
      ? { status: "ok" } : { status: "missing", detail: "30-50% Meta events lost on iOS without this" },

    // Alerts
    lead_alerts: must("LEAD_ALERT_SLACK_WEBHOOK") || (must("LEAD_ALERT_TELEGRAM_TOKEN") && must("LEAD_ALERT_TELEGRAM_CHAT_ID"))
      ? { status: "ok" } : { status: "missing", detail: "no real-time planner alerts" },

    // Errors
    sentry: must("NEXT_PUBLIC_SENTRY_DSN") ? { status: "ok" } : { status: "missing", detail: "errors silent" },
  };
}

async function pingSupabase(): Promise<Check> {
  if (!must("NEXT_PUBLIC_SUPABASE_URL") || !must("SUPABASE_SERVICE_ROLE_KEY"))
    return { status: "missing" };
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await sb.from("leads").select("id", { count: "exact", head: true }).limit(1);
    return error ? { status: "error", detail: error.message } : { status: "ok" };
  } catch (e) {
    return { status: "error", detail: e instanceof Error ? e.message : "unknown" };
  }
}

async function pingMetaCapi(): Promise<Check> {
  const pixel = process.env.META_PIXEL_ID ?? "1712300429671832";
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) return { status: "missing" };
  // Validate by POSTing a benign test event — Meta's metadata-read endpoint
  // requires extra permissions that CAPI tokens don't always carry, but the
  // /events endpoint only needs the CAPI scope itself. test_event_code keeps
  // the event out of production stats.
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixel}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "PageView",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              user_data: { client_ip_address: "1.2.3.4", client_user_agent: "healthcheck" },
            },
          ],
          test_event_code: process.env.META_TEST_EVENT_CODE ?? "TEST_HEALTH",
          access_token: token,
        }),
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { status: "error", detail: `${res.status} ${body.slice(0, 200)}` };
    }
    return { status: "ok" };
  } catch (e) {
    return { status: "error", detail: e instanceof Error ? e.message : "unknown" };
  }
}

async function pingBitrix(): Promise<Check> {
  const url = process.env.BITRIX24_WEBHOOK_URL?.replace(/\/$/, "");
  if (!url) return { status: "missing" };
  try {
    const res = await fetch(`${url}/profile.json`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { status: "error", detail: `${res.status}` };
    return { status: "ok" };
  } catch (e) {
    return { status: "error", detail: e instanceof Error ? e.message : "unknown" };
  }
}

async function pingAnthropic(): Promise<Check> {
  if (!must("ANTHROPIC_API_KEY")) return { status: "missing" };
  try {
    // Cheap call — list models endpoint, no token cost.
    const res = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      signal: AbortSignal.timeout(5000),
    });
    return res.ok ? { status: "ok" } : { status: "error", detail: `${res.status}` };
  } catch (e) {
    return { status: "error", detail: e instanceof Error ? e.message : "unknown" };
  }
}

async function pingResend(): Promise<Check> {
  if (!must("RESEND_API_KEY")) return { status: "missing" };
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    return res.ok ? { status: "ok" } : { status: "error", detail: `${res.status}` };
  } catch (e) {
    return { status: "error", detail: e instanceof Error ? e.message : "unknown" };
  }
}

async function pingWhatsApp(): Promise<Check> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return { status: "missing" };
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}?fields=display_phone_number`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      }
    );
    return res.ok ? { status: "ok" } : { status: "error", detail: `${res.status}` };
  } catch (e) {
    return { status: "error", detail: e instanceof Error ? e.message : "unknown" };
  }
}

export async function GET(req: NextRequest) {
  // Optional admin guard — if ?key= matches ADMIN_SECRET, return verbose check
  const adminKey = req.nextUrl.searchParams.get("key");
  const isAdmin = adminKey && adminKey === process.env.ADMIN_SECRET;

  const env = await checkEnv();

  // Live pings in parallel — capped at 5s each via AbortSignal.
  const [supabaseDb, metaCapi, bitrix, anthropic, resend, wa] = await Promise.all([
    pingSupabase(),
    pingMetaCapi(),
    pingBitrix(),
    pingAnthropic(),
    pingResend(),
    pingWhatsApp(),
  ]);

  const live = { supabaseDb, metaCapi, bitrix, anthropic, resend, whatsapp: wa };

  // Critical = must be "ok" before launching ads.
  const critical = ["supabase", "razorpay", "bitrix24", "meta_capi", "anthropic"] as const;
  const criticalEnvOk = critical.every((k) => env[k]?.status === "ok");
  const criticalLiveOk =
    supabaseDb.status === "ok" &&
    bitrix.status === "ok" &&
    metaCapi.status === "ok" &&
    anthropic.status === "ok";

  const launchReady = criticalEnvOk && criticalLiveOk;

  const summary = {
    ok: launchReady,
    launchReady,
    blockers: [
      ...critical.filter((k) => env[k]?.status !== "ok").map((k) => `env:${k}`),
      ...(supabaseDb.status !== "ok" ? ["live:supabase"] : []),
      ...(bitrix.status !== "ok" ? ["live:bitrix"] : []),
      ...(metaCapi.status !== "ok" ? ["live:meta_capi"] : []),
      ...(anthropic.status !== "ok" ? ["live:anthropic"] : []),
    ],
  };

  return NextResponse.json(
    isAdmin ? { ...summary, env, live } : summary,
    { status: launchReady ? 200 : 503 }
  );
}
