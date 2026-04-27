// Real-time lead alerts → Slack and/or Telegram.
// Drives sub-5-min planner response — proven to multiply conversion 50-100x
// vs 30-min response (Drift research).
//
// Env:
//   LEAD_ALERT_SLACK_WEBHOOK    — incoming-webhook URL from Slack
//   LEAD_ALERT_TELEGRAM_TOKEN   — bot token from @BotFather
//   LEAD_ALERT_TELEGRAM_CHAT_ID — group / channel chat id
//
// All sends are fire-and-forget. Missing env vars silently no-op.

import type { Lead } from "./supabase";

const SLACK = process.env.LEAD_ALERT_SLACK_WEBHOOK;
const TG_TOKEN = process.env.LEAD_ALERT_TELEGRAM_TOKEN;
const TG_CHAT = process.env.LEAD_ALERT_TELEGRAM_CHAT_ID;

interface AlertInput {
  lead: Partial<Lead> & { id?: string };
  hot?: boolean;       // mark high-value leads with extra emphasis
  source?: string;     // override
}

export async function alertLead({ lead, hot, source }: AlertInput): Promise<void> {
  if (!SLACK && !TG_TOKEN) return;

  const dest = lead.destination || "—";
  const type = lead.travel_type || "—";
  const date = lead.travel_date || "—";
  const ppl = lead.num_travellers || "—";
  const budget = lead.budget || "—";
  const phone = lead.phone || "—";
  const email = lead.email || "—";
  const name = lead.name || "Visitor";
  const src = source || lead.source || "unknown";

  const phoneClean = (phone || "").replace(/\D/g, "");
  const waLink = phoneClean
    ? `https://wa.me/${phoneClean.length === 10 ? "91" + phoneClean : phoneClean}?text=${encodeURIComponent(
        `Hi ${name.split(/\s+/)[0]}, this is ${process.env.NEXT_PUBLIC_PLANNER_NAME ?? "Trust and Trip"} — saw your ${dest} enquiry. Quick question, what dates are you considering?`
      )}`
    : null;

  const heading = hot ? "🔥 *HOT LEAD*" : "📩 *New lead*";

  // ── Slack ───────────────────────────────────────────────────────────────
  if (SLACK) {
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${heading} — *${name}* · ${dest} · ${type}`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Phone*\n${phone}` },
          { type: "mrkdwn", text: `*Email*\n${email}` },
          { type: "mrkdwn", text: `*Travel*\n${date}` },
          { type: "mrkdwn", text: `*Travelers*\n${ppl}` },
          { type: "mrkdwn", text: `*Budget*\n${budget}` },
          { type: "mrkdwn", text: `*Source*\n${src}` },
        ],
      },
      ...(lead.message
        ? [
            {
              type: "section",
              text: { type: "mrkdwn", text: `*Message*\n>${lead.message.slice(0, 500)}` },
            },
          ]
        : []),
      ...(waLink
        ? [
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: { type: "plain_text", text: "💬 WhatsApp now" },
                  url: waLink,
                  style: "primary",
                },
              ],
            },
          ]
        : []),
    ];

    fetch(SLACK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    }).catch((e) => console.error("[alert] slack failed", e));
  }

  // ── Telegram ────────────────────────────────────────────────────────────
  if (TG_TOKEN && TG_CHAT) {
    const lines = [
      `${heading} — ${name} · ${dest} · ${type}`,
      ``,
      `Phone:     ${phone}`,
      `Email:     ${email}`,
      `Travel:    ${date}`,
      `Travelers: ${ppl}`,
      `Budget:    ${budget}`,
      `Source:    ${src}`,
    ];
    if (lead.message) lines.push("", `> ${lead.message.slice(0, 400)}`);
    if (waLink) lines.push("", `WhatsApp: ${waLink}`);

    fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TG_CHAT,
        text: lines.join("\n"),
        disable_web_page_preview: true,
      }),
    }).catch((e) => console.error("[alert] telegram failed", e));
  }
}

/** Determine whether a lead qualifies as "hot" — drives the alert badge. */
export function isHotLead(lead: Partial<Lead>): boolean {
  // Heuristic: has phone + destination + (budget OR travel_date) AND not a click intent
  const hasContact = !!lead.phone?.trim();
  const hasIntent = !!lead.destination?.trim();
  const hasSignal = !!lead.budget?.trim() || !!lead.travel_date?.trim();
  const isClickIntent = (lead.source ?? "").endsWith("_click");
  return hasContact && hasIntent && hasSignal && !isClickIntent;
}
