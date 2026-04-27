// Slack slash command handler — `/tt <subcommand> <args>`.
//
// Lets planners look up customers from Slack without leaving the chat.
//
// Setup in Slack (api.slack.com → Your Apps → Slash Commands):
//   Command:     /tt
//   Request URL: https://trustandtrip.com/api/slack/command
//   Description: Trust and Trip CRM lookup
//   Usage hint:  lead <phone-or-email> · booking <booking-id> · stats
//
// Auth: Slack signs every request. Set SLACK_SIGNING_SECRET to verify.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustandtrip.com";

export async function POST(req: NextRequest) {
  // Slack sends application/x-www-form-urlencoded.
  const raw = await req.text();
  if (SIGNING_SECRET && !verifySlackSignature(req, raw)) {
    return NextResponse.json({ response_type: "ephemeral", text: "Bad signature." }, { status: 401 });
  }

  const params = new URLSearchParams(raw);
  const text = (params.get("text") ?? "").trim();
  const userName = params.get("user_name") ?? "planner";

  const [sub, ...rest] = text.split(/\s+/);
  const arg = rest.join(" ").trim();

  switch ((sub ?? "").toLowerCase()) {
    case "lead":
    case "":
      return NextResponse.json(await lookupLead(arg));
    case "booking":
      return NextResponse.json(await lookupBooking(arg));
    case "stats":
      return NextResponse.json(await stats());
    case "help":
    default:
      return NextResponse.json(helpResponse(userName));
  }
}

function verifySlackSignature(req: NextRequest, raw: string): boolean {
  const timestamp = req.headers.get("x-slack-request-timestamp");
  const signature = req.headers.get("x-slack-signature");
  if (!timestamp || !signature || !SIGNING_SECRET) return false;
  // Reject anything older than 5 min — replay protection.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const base = `v0:${timestamp}:${raw}`;
  const computed = "v0=" + crypto.createHmac("sha256", SIGNING_SECRET).update(base).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
  } catch {
    return false;
  }
}

async function lookupLead(arg: string) {
  if (!arg) return ephemeral("Usage: `/tt lead <phone or email>`");

  const phoneTail = arg.replace(/\D/g, "").slice(-10);
  const emailMatch = arg.includes("@") ? arg.toLowerCase() : null;

  const filters: string[] = [];
  if (phoneTail.length === 10) filters.push(`phone.ilike.%${phoneTail}`);
  if (emailMatch) filters.push(`email.eq.${emailMatch}`);
  if (!filters.length) return ephemeral("Couldn't parse a phone or email from that.");

  const { data, error } = await supabase
    .from("leads")
    .select("id, created_at, name, phone, email, destination, travel_type, travel_date, budget, source, status, tier, score, utm_source, utm_campaign")
    .or(filters.join(","))
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return ephemeral(`DB error: ${error.message}`);
  if (!data?.length) return ephemeral(`No lead found for \`${arg}\`.`);

  const blocks: unknown[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `🔎 ${data.length} match${data.length === 1 ? "" : "es"} for ${arg}` },
    },
  ];

  for (const l of data) {
    const tierEmoji = l.tier === "A" ? "🔥" : l.tier === "B" ? "🟡" : "⚪";
    const when = new Date(l.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    blocks.push({ type: "divider" });
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `${tierEmoji} *${l.name ?? "—"}* · ${l.destination ?? "—"} · ${l.travel_type ?? "—"}\n` +
          `📞 ${l.phone ?? "—"} · ✉️ ${l.email ?? "—"}\n` +
          `Tier *${l.tier ?? "C"}* · Score ${l.score ?? 0}/100 · status \`${l.status ?? "—"}\`\n` +
          `Travel: ${l.travel_date ?? "—"} · Budget: ${l.budget ?? "—"}\n` +
          `Source: ${l.source ?? "—"} · UTM: ${l.utm_source ?? "—"}/${l.utm_campaign ?? "—"}\n` +
          `_${when}_`,
      },
      accessory: l.phone
        ? {
            type: "button",
            text: { type: "plain_text", text: "💬 WhatsApp" },
            url: `https://wa.me/${normalizePhone(l.phone)}?text=${encodeURIComponent(`Hi ${(l.name ?? "").split(/\s+/)[0]}, this is Trust and Trip — saw your ${l.destination ?? "trip"} enquiry.`)}`,
            style: "primary",
          }
        : undefined,
    });
  }

  blocks.push({
    type: "context",
    elements: [
      { type: "mrkdwn", text: `<${SITE_URL}/admin/leads|Open admin/leads>` },
    ],
  });

  return { response_type: "ephemeral", blocks };
}

async function lookupBooking(arg: string) {
  if (!arg) return ephemeral("Usage: `/tt booking <booking-id-or-razorpay-order-id>`");
  const id = arg.trim();
  // Try id first, then razorpay_order_id.
  let row = null;
  for (const col of ["id", "razorpay_order_id"]) {
    const { data } = await supabase
      .from("bookings")
      .select("id, created_at, customer_name, customer_email, customer_phone, package_title, status, deposit_amount, package_price, travel_date, lead_tier, utm_source, refund_amount")
      .eq(col, id)
      .limit(1)
      .single();
    if (data) {
      row = data;
      break;
    }
  }
  if (!row) return ephemeral(`No booking matched \`${arg}\`.`);

  const fmt = (n: number | null | undefined) => (n == null ? "—" : "₹" + n.toLocaleString("en-IN"));
  return {
    response_type: "ephemeral",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            `📦 *${row.package_title ?? "—"}*\n` +
            `Customer: ${row.customer_name ?? "—"} · ${row.customer_phone ?? "—"} · ${row.customer_email ?? "—"}\n` +
            `Status: \`${row.status ?? "—"}\` · Tier ${row.lead_tier ?? "—"}\n` +
            `Deposit: ${fmt(row.deposit_amount)} of ${fmt(row.package_price)}\n` +
            `${row.refund_amount ? `Refunded: ${fmt(row.refund_amount)}\n` : ""}` +
            `Travel: ${row.travel_date ?? "—"} · Source: ${row.utm_source ?? "—"}\n` +
            `<${SITE_URL}/admin/bookings|Open admin/bookings>`,
        },
      },
    ],
  };
}

async function stats() {
  const day = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

  const [{ data: leads }, { data: bookings }] = await Promise.all([
    supabase.from("leads").select("tier, status").gte("created_at", day),
    supabase.from("bookings").select("status, deposit_amount").gte("created_at", day),
  ]);

  const totalLeads = leads?.length ?? 0;
  const tierA = (leads ?? []).filter((l) => l.tier === "A").length;
  const unresponded = (leads ?? []).filter((l) => l.tier === "A" && l.status === "new").length;
  const verified = (bookings ?? []).filter((b) => b.status === "verified");
  const grossDeposit = verified.reduce((s, b) => s + ((b.deposit_amount as number) ?? 0), 0);

  return {
    response_type: "ephemeral",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            `📊 *Last 24h*\n` +
            `Leads: *${totalLeads}* · Tier A: *${tierA}* · Unresponded A: ${unresponded > 0 ? `🔥 *${unresponded}*` : "0"}\n` +
            `Bookings paid: *${verified.length}* · Gross deposit: *₹${grossDeposit.toLocaleString("en-IN")}*\n` +
            `<${SITE_URL}/admin/funnel|Open funnel>`,
        },
      },
    ],
  };
}

function helpResponse(userName: string) {
  return {
    response_type: "ephemeral",
    text: `Hi ${userName} — Trust and Trip CRM commands:`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            `*\`/tt lead <phone or email>\`* — find lead(s) by contact\n` +
            `*\`/tt booking <id>\`* — booking detail by id or razorpay_order_id\n` +
            `*\`/tt stats\`* — last-24h KPIs\n` +
            `*\`/tt help\`* — show this`,
        },
      },
    ],
  };
}

function ephemeral(text: string) {
  return { response_type: "ephemeral", text };
}

function normalizePhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return d.length === 10 ? `91${d}` : d;
}
