// Bitrix24 → Trust and Trip reverse webhook.
//
// Bitrix can fire outbound events on Lead/Deal updates. Wire it to this
// route so when a planner moves a deal to "Won" or marks a Lead as "lost"
// inside Bitrix, the change mirrors back into Supabase. Otherwise the CRM
// becomes the source of truth and our admin dashboards drift.
//
// Setup in Bitrix24:
//   - Outbound webhook (manage on portal → Marketplace → "Outgoing webhook")
//   - URL:    https://trustandtrip.com/api/bitrix24/webhook
//   - Events: ONCRMLEADUPDATE, ONCRMDEALUPDATE
//   - Token:  set BITRIX24_REVERSE_TOKEN to match the application_token field
//
// Bitrix posts application/x-www-form-urlencoded — we accept both that and
// JSON to keep dev curl tests easy.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { callBitrix } from "@/lib/bitrix24";
import { timingSafeEqualStrings } from "@/lib/timing-safe";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const REVERSE_TOKEN = process.env.BITRIX24_REVERSE_TOKEN;

// Bitrix Lead status code → Supabase status enum.
const LEAD_STATUS_MAP: Record<string, "new" | "contacted" | "qualified" | "booked" | "lost"> = {
  NEW:           "new",
  IN_PROCESS:    "contacted",
  PROCESSED:     "qualified",
  CONVERTED:     "booked",
  JUNK:          "lost",
  // Custom statuses created in Bitrix can also be mapped here. Add as needed.
};

// Bitrix Deal stage → bookings.status.
const DEAL_STAGE_MAP: Record<string, string> = {
  WON:        "verified",
  LOSE:       "cancelled",
  EXECUTING:  "verified",
  PREPARATION:"created",
};

interface BitrixForm {
  event?: string;
  application_token?: string;
  data?: Record<string, unknown>;
  ts?: string;
}

async function readBody(req: NextRequest): Promise<BitrixForm> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await req.json()) as BitrixForm;
  }
  // Bitrix default — application/x-www-form-urlencoded with bracketed keys
  // like data[FIELDS][ID]=…. Parse into a nested object.
  const txt = await req.text();
  const params = new URLSearchParams(txt);
  const out: Record<string, unknown> = {};
  for (const [k, v] of params.entries()) {
    setNested(out, k, v);
  }
  return out as BitrixForm;
}

function setNested(obj: Record<string, unknown>, key: string, value: string) {
  // "data[FIELDS][ID]" → obj.data.FIELDS.ID = value
  const parts = key.replace(/\]/g, "").split(/\[/);
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (typeof cur[k] !== "object" || cur[k] === null) cur[k] = {};
    cur = cur[k] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

export async function POST(req: NextRequest) {
  let body: BitrixForm;
  try {
    body = await readBody(req);
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  // Fail closed in production. Earlier the gate was `if (REVERSE_TOKEN &&
  // body.token !== REVERSE_TOKEN)` which left the route open to anonymous
  // POSTs whenever the env var was unset (typo, missing in a preview, etc).
  // Anyone who guessed the route URL could push fake Lead/Deal updates and
  // poison the bookings/leads tables. Now: in prod, missing env -> 503;
  // present env -> constant-time compare so the token can't be brute-forced
  // by timing the response.
  if (!REVERSE_TOKEN) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }
  } else {
    const supplied = typeof body.application_token === "string" ? body.application_token : "";
    if (!timingSafeEqualStrings(supplied, REVERSE_TOKEN)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const event = (body.event ?? "").toUpperCase();
  const data = (body.data ?? {}) as Record<string, unknown>;

  try {
    if (event === "ONCRMLEADUPDATE") {
      await handleLeadUpdate(data);
    } else if (event === "ONCRMDEALUPDATE") {
      await handleDealUpdate(data);
    }
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    console.error("[bitrix24/webhook] error", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

// Bitrix sends data.FIELDS.ID — fetch the full record via the *forward*
// webhook to read the new STATUS_ID / STAGE_ID. Skipped here for brevity:
// Bitrix's outbound payload only includes the ID, not the new status, so a
// production wire-up should re-fetch via callBitrix("crm.lead.get").
//
// For now we accept the simpler shape where Bitrix is configured to send a
// flatter `STATUS_ID` field directly (some Bitrix bots do this). If your
// Bitrix sends only the ID, follow the TODO inside.
async function handleLeadUpdate(data: Record<string, unknown>) {
  const fields = (data.FIELDS as Record<string, unknown> | undefined) ?? {};
  const bitrixLeadId = String(fields.ID ?? "").trim();
  if (!bitrixLeadId) return;

  // Bitrix outbound webhook only sends the ID — we have to fetch the full
  // record to read the new STATUS_ID, PHONE, EMAIL.
  const lead = await fetchBitrixLead(bitrixLeadId);
  if (!lead) return;

  const statusCode = String(lead.STATUS_ID ?? "").toUpperCase();
  const ttStatus = LEAD_STATUS_MAP[statusCode];
  if (!ttStatus) return;

  const phone = extractPhone(lead);
  const email = extractEmail(lead);
  if (!phone && !email) return;

  const filters: string[] = [];
  if (phone) filters.push(`phone.ilike.%${phone.slice(-10)}`);
  if (email) filters.push(`email.eq.${email}`);

  const { data: matches } = await supabase
    .from("leads")
    .select("id, first_responded_at")
    .or(filters.join(","))
    .order("created_at", { ascending: false })
    .limit(1);
  if (!matches || matches.length === 0) return;

  const update: Record<string, unknown> = { status: ttStatus };
  if (!matches[0].first_responded_at) {
    update.first_responded_at = new Date().toISOString();
  }
  await supabase.from("leads").update(update).eq("id", matches[0].id);
}

interface BitrixLead {
  ID: string;
  STATUS_ID?: string;
  PHONE?: Array<{ VALUE?: string }> | string;
  EMAIL?: Array<{ VALUE?: string }> | string;
}

async function fetchBitrixLead(id: string): Promise<BitrixLead | null> {
  const res = await callBitrix("crm.lead.get", { id });
  if (!res?.result) return null;
  return res.result as unknown as BitrixLead;
}

function extractPhone(lead: BitrixLead): string {
  const raw = Array.isArray(lead.PHONE)
    ? lead.PHONE[0]?.VALUE ?? ""
    : (lead.PHONE ?? "");
  return String(raw).replace(/\D/g, "");
}

function extractEmail(lead: BitrixLead): string {
  const raw = Array.isArray(lead.EMAIL)
    ? lead.EMAIL[0]?.VALUE ?? ""
    : (lead.EMAIL ?? "");
  return String(raw).trim().toLowerCase();
}

async function handleDealUpdate(data: Record<string, unknown>) {
  const fields = (data.FIELDS as Record<string, unknown> | undefined) ?? {};
  const bitrixDealId = String(fields.ID ?? "").trim();
  if (!bitrixDealId) return;

  // Outbound webhook only sends the ID — fetch full deal to read STAGE_ID
  // and our custom Razorpay-order-id field.
  const deal = await fetchBitrixDeal(bitrixDealId);
  if (!deal) return;

  const stageCode = String(deal.STAGE_ID ?? "").toUpperCase();
  const ttStatus = DEAL_STAGE_MAP[stageCode];
  if (!ttStatus) return;

  // The custom-field code is configurable in Bitrix24 — try common keys.
  const razorpayOrderId = String(
    deal.UF_CRM_RAZORPAY_ORDER_ID ??
    deal.UF_RAZORPAY_ORDER_ID ??
    deal.ORDER_ID ??
    ""
  ).trim();
  if (!razorpayOrderId) return;

  const update: Record<string, unknown> = { status: ttStatus };
  if (ttStatus === "cancelled") {
    update.cancelled_at = new Date().toISOString();
    update.cancel_reason = "Bitrix24 deal moved to lost stage";
  }

  await supabase
    .from("bookings")
    .update(update)
    .eq("razorpay_order_id", razorpayOrderId);
}

interface BitrixDeal {
  ID: string;
  STAGE_ID?: string;
  UF_CRM_RAZORPAY_ORDER_ID?: string;
  UF_RAZORPAY_ORDER_ID?: string;
  ORDER_ID?: string;
}

async function fetchBitrixDeal(id: string): Promise<BitrixDeal | null> {
  const res = await callBitrix("crm.deal.get", { id });
  if (!res?.result) return null;
  return res.result as unknown as BitrixDeal;
}

// Health probe.
export async function GET() {
  return NextResponse.json({ ok: true, hint: "Bitrix24 reverse webhook." });
}
