-- Lead scoring + tiering — drives planner routing and ad-optimizer Lead value.
--
-- score:  0-100, computed at insert time by /api/leads from contact + intent fields.
-- tier:   A (>= 70 — hot), B (40-69 — warm), C (< 40 — cold).
--
-- Existing rows default to tier=C, score=0; the scorer backfills lazily as leads
-- get touched by ops, or you can run the SQL block below to backfill.

alter table leads
  add column if not exists score        integer not null default 0 check (score between 0 and 100),
  add column if not exists tier         text    not null default 'C' check (tier in ('A','B','C')),
  -- Full UTM set so we can attribute by ad creative (utm_content) and keyword (utm_term).
  -- utm_source / utm_medium / utm_campaign already exist on the table.
  add column if not exists utm_content  text,
  add column if not exists utm_term     text,
  -- WA click variant for A/B testing the click-to-WA template message
  add column if not exists wa_variant   text,
  add column if not exists email_subject_variant text;

-- Index for the admin panel / Bitrix sync filtering by tier.
create index if not exists idx_leads_tier_created on leads(tier, created_at desc);
create index if not exists idx_leads_utm_content   on leads(utm_content) where utm_content is not null;
