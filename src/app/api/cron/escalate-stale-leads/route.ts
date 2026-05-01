// Hourly cron — escalate tier-A leads that didn't get touched within 30 min.
//
// SLA: tier-A → planner WhatsApp within 5 min. After 30 min with status='new'
// the optimizer signal is stale and the conversion is lost. This cron fires
// a louder alert (Slack/Telegram with @here mention) and creates a senior-
// planner Bitrix24 Task with a fresh deadline. Stamps escalated_at on the
// row so we never double-fire.
//
// Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET>.

import { NextRequest, NextResponse } from "next/server";
import { withCronLog } from "@/lib/cron-log";
import { createClient } from "@supabase/supabase-js";
import { alertLead } from "@/lib/lead-alerts";
import { createLeadTask, pushLead } from "@/lib/bitrix24";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STALE_AFTER_MINUTES = 30;
// Bitrix user id of senior planner / on-call. Falls back to portal admin (1).
const SENIOR_PLANNER_ID = Number(process.env.BITRIX_SENIOR_PLANNER_ID ?? 1);

import { assertCronAuth } from "@/lib/cron-auth";

async function _runCron(req: NextRequest) {
  const denial = assertCronAuth(req);
  if (denial) return denial;

  const cutoff = new Date(Date.now() - STALE_AFTER_MINUTES * 60 * 1000).toISOString();

  const { data: stale, error } = await supabase
    .from("leads")
    .select("*")
    .eq("status", "new")
    .eq("tier", "A")
    .is("escalated_at", null)
    .lte("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    console.error("[cron:escalate] fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!stale?.length) {
    return NextResponse.json({ ok: true, escalated: 0 });
  }

  let escalated = 0;
  for (const lead of stale) {
    try {
      // Louder alert — flagged as ESCALATION so planners can filter.
      await alertLead({
        lead,
        hot: true,
        source: `tier-A · STALE > ${STALE_AFTER_MINUTES} min`,
      });

      // New Bitrix Lead + Task assigned to senior planner with 15-min hard
      // deadline. We re-push as a new Bitrix lead because the original may
      // have been claimed already; this clones the row so the senior planner
      // sees a fresh task tied to the same data.
      const bitrixLeadId = await pushLead({
        ...lead,
        message: `[ESCALATED — first responder didn't act in ${STALE_AFTER_MINUTES} min] ${lead.message ?? ""}`,
      });
      if (bitrixLeadId) {
        await createLeadTask({
          leadId: bitrixLeadId,
          title: `🚨 ESCALATED · ${lead.name} · ${lead.destination ?? "no destination"} · ${lead.score ?? 0}/100`,
          description: [
            `STALE TIER-A LEAD — first response window missed.`,
            `Lead came in: ${new Date(lead.created_at).toISOString()}`,
            `Phone: ${lead.phone ?? "—"}`,
            `Email: ${lead.email ?? "—"}`,
            `Destination: ${lead.destination ?? "—"}`,
            `Travel type: ${lead.travel_type ?? "—"}`,
            `Travel date: ${lead.travel_date ?? "—"}`,
            `Budget: ${lead.budget ?? "—"}`,
            `Source: ${lead.source ?? "—"} · UTM: ${lead.utm_source ?? "-"}/${lead.utm_campaign ?? "-"}`,
            "",
            `WhatsApp the customer NOW. Apologise for the delay only if they bring it up.`,
          ].join("\n"),
          deadlineMinutes: 15,
          responsibleId: SENIOR_PLANNER_ID,
        }).catch((e) => console.error("[cron:escalate] createLeadTask failed:", e));
      }

      // Stamp the row.
      await supabase
        .from("leads")
        .update({ escalated_at: new Date().toISOString() })
        .eq("id", lead.id);

      escalated++;
    } catch (e) {
      console.error(`[cron:escalate] lead ${lead.id} failed:`, e);
    }
  }

  return NextResponse.json({
    ok: true,
    candidates: stale.length,
    escalated,
    cutoff,
  });
}

export async function GET(req: NextRequest) {
  return withCronLog("/api/cron/escalate-stale-leads", () => _runCron(req));
}
