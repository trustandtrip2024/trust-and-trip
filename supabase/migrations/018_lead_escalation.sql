-- Tier-A stale-lead escalation tracking.
--
-- The hourly cron at /api/cron/escalate-stale-leads finds tier-A leads that
-- never moved past status='new' within 30 min of arrival, fires a louder
-- alert, and stamps escalated_at so we don't double-fire.

alter table leads
  add column if not exists escalated_at timestamptz,
  add column if not exists first_responded_at timestamptz;

-- Index for the cron's hot-path query: status='new' AND tier='A' AND created_at < now() - 30 min.
create index if not exists idx_leads_escalation
  on leads(status, tier, escalated_at, created_at desc)
  where status = 'new' and tier = 'A' and escalated_at is null;
