-- Itinerary versioning.
--
-- Every call to /api/itinerary or /api/itinerary/stream stores the engine
-- output here so ops can see history (which drafts the customer received,
-- when, what the planner edited). Tied to lead_id when available.

create table if not exists itineraries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  lead_id       uuid references leads(id) on delete set null,
  destination   text not null,
  travel_type   text not null,
  days          integer not null,
  -- Source of the call: api, stream, whatsapp, regenerate.
  source        text not null default 'api',
  -- Full structured itinerary as returned by the engine. Indexed only by
  -- lead_id + created_at; jsonb is fine for the volume we expect (≤10k/mo).
  itinerary     jsonb not null,
  matched_packages jsonb,
  -- Token / cost telemetry for cost monitoring.
  input_tokens  integer,
  output_tokens integer,
  cache_read_tokens integer,
  duration_ms   integer,
  tool_calls    integer
);

create index if not exists idx_itineraries_lead_id on itineraries(lead_id, created_at desc) where lead_id is not null;
create index if not exists idx_itineraries_created on itineraries(created_at desc);
