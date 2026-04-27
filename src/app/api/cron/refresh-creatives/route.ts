// Weekly cron — alerts when ad creative spread is too wide.
//
// Looks at last 14 days of leads grouped by utm_content (= ad-id). If the
// best creative converts to tier-A 3× more often than the worst (and both
// have ≥ 10 leads), the worst is officially burnt. Fire a Slack/TG alert
// suggesting paused/replace, and (optionally) auto-generate fresh copy via
// the existing /api/admin/creatives/generate endpoint to seed Meta with
// fresh variants.
//
// Doesn't push to Meta directly — that requires the user to confirm + run
// `npm run ads:push` from a machine with Marketing API token. This cron is
// only the early-warning system.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WINDOW_DAYS = 14;
const MIN_LEADS = 10;
const SPREAD_RATIO = 3;       // best:worst tier-A% ≥ 3× → flag

interface LeadRow {
  tier: string | null;
  utm_content: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
}

interface CreativeStats {
  utmContent: string;
  utmSource: string | null;
  utmCampaign: string | null;
  leads: number;
  tierA: number;
  rate: number;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 3600 * 1000).toISOString();

  const { data, error } = await supabase
    .from("leads")
    .select("tier, utm_content, utm_source, utm_campaign")
    .gte("created_at", since)
    .not("utm_content", "is", null)
    .limit(20_000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as LeadRow[];
  const map = new Map<string, CreativeStats>();
  for (const r of rows) {
    if (!r.utm_content) continue;
    const e = map.get(r.utm_content) ?? {
      utmContent: r.utm_content,
      utmSource: r.utm_source ?? null,
      utmCampaign: r.utm_campaign ?? null,
      leads: 0,
      tierA: 0,
      rate: 0,
    };
    e.leads++;
    if (r.tier === "A") e.tierA++;
    map.set(r.utm_content, e);
  }
  for (const e of map.values()) e.rate = e.leads ? e.tierA / e.leads : 0;

  const eligible = Array.from(map.values()).filter((e) => e.leads >= MIN_LEADS);
  if (eligible.length < 2) {
    return NextResponse.json({ ok: true, eligible: eligible.length, flagged: 0 });
  }

  eligible.sort((a, b) => b.rate - a.rate);
  const best = eligible[0];
  const worst = eligible[eligible.length - 1];

  const ratio = worst.rate > 0 ? best.rate / worst.rate : Infinity;
  const flagged: CreativeStats[] = [];
  if (ratio >= SPREAD_RATIO || (best.rate > 0 && worst.rate === 0)) {
    // Everything below half the best rate is burnt.
    const cutoff = Math.max(0.001, best.rate / 2);
    for (const e of eligible) {
      if (e.rate < cutoff) flagged.push(e);
    }
  }

  if (flagged.length === 0) {
    return NextResponse.json({
      ok: true,
      eligible: eligible.length,
      best: { id: best.utmContent, rate: pct(best.rate) },
      worst: { id: worst.utmContent, rate: pct(worst.rate) },
      flagged: 0,
    });
  }

  // Notify
  await Promise.all([
    notifySlack(best, flagged),
    notifyTelegram(best, flagged),
  ]);

  return NextResponse.json({
    ok: true,
    eligible: eligible.length,
    flagged: flagged.length,
    best: { id: best.utmContent, rate: pct(best.rate), leads: best.leads },
    flaggedIds: flagged.map((f) => ({ id: f.utmContent, rate: pct(f.rate), leads: f.leads })),
  });
}

function pct(r: number): string {
  return (r * 100).toFixed(1) + "%";
}

async function notifySlack(best: CreativeStats, flagged: CreativeStats[]) {
  const url = process.env.LEAD_ALERT_SLACK_WEBHOOK;
  if (!url) return;

  const lines = [
    `*🪦 Creative refresh flag — ${flagged.length} ad${flagged.length === 1 ? "" : "s"} underperforming*`,
    ``,
    `Best:  \`${best.utmContent}\` · ${pct(best.rate)} (${best.leads} leads)`,
    ``,
    `Pause / replace these:`,
    ...flagged.map(
      (f) => `• \`${f.utmContent}\` · ${pct(f.rate)} (${f.leads} leads, ${f.tierA} tier-A)`
    ),
    ``,
    `Open <${process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustandtrip.com"}/admin/creatives|/admin/creatives> to generate fresh copy, then \`npm run ads:push\`.`,
  ];

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: lines.join("\n") }),
  }).catch((e) => console.error("[refresh-creatives] slack failed", e));
}

async function notifyTelegram(best: CreativeStats, flagged: CreativeStats[]) {
  const token = process.env.LEAD_ALERT_TELEGRAM_TOKEN;
  const chat = process.env.LEAD_ALERT_TELEGRAM_CHAT_ID;
  if (!token || !chat) return;

  const lines = [
    `🪦 Creative refresh flag — ${flagged.length} underperforming`,
    ``,
    `Best: ${best.utmContent} · ${pct(best.rate)} (${best.leads} leads)`,
    ``,
    `Pause / replace:`,
    ...flagged.map(
      (f) => `• ${f.utmContent} · ${pct(f.rate)} (${f.leads} leads)`
    ),
  ];

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chat,
      text: lines.join("\n"),
      disable_web_page_preview: true,
    }),
  }).catch((e) => console.error("[refresh-creatives] telegram failed", e));
}
