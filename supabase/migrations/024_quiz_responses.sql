-- Trip-finder quiz response storage.
--
-- Persists every completed quiz so we can:
--   1. Tune scorePackages() weights against real user popularity.
--   2. Surface "X% of similar travellers picked Maldives" social proof.
--   3. Hand Aria chat / planners full context when a lead converts.
--
-- Anonymous completion writes happen first (no PII). When the user then
-- submits the lead form we PATCH the row with lead_id.

create table if not exists quiz_responses (
  id              uuid primary key default gen_random_uuid(),
  travel_type     text not null check (travel_type in ('Couple','Family','Solo','Group','Pilgrim')),
  vibe            text not null check (vibe in ('Beach','Mountain','Culture','Spiritual','City')),
  duration        text not null check (duration in ('3-5','6-9','10+')),
  budget          text not null check (budget in ('lt50k','50-100k','100k+')),
  top_match_slug  text,
  top_match_score integer,
  top3_slugs      text[] default '{}',
  lead_id         uuid references leads(id) on delete set null,
  user_agent      text,
  referrer        text,
  created_at      timestamptz not null default now()
);

-- Hot path: pivot popularity by (travel_type, vibe) to power "X% picked Y".
create index if not exists idx_quiz_responses_pivot
  on quiz_responses(travel_type, vibe, created_at desc);

-- For correlating quiz completions to actual leads.
create index if not exists idx_quiz_responses_lead_id
  on quiz_responses(lead_id) where lead_id is not null;

-- RLS: service role only (bypasses RLS). Anon + authenticated denied.
alter table quiz_responses enable row level security;
