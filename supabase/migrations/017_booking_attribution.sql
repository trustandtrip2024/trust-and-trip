-- Booking attribution.
--
-- Stores the lead_id (and the lead's UTM block) on each booking so the
-- funnel dashboard can join lead → booking exactly instead of best-effort
-- matching by email/phone. Populated by /api/payment/create-order from the
-- most recent matching lead by phone or email at order-creation time.

alter table bookings
  add column if not exists lead_id     uuid references leads(id) on delete set null,
  add column if not exists lead_score  integer,
  add column if not exists lead_tier   text,
  add column if not exists utm_source  text,
  add column if not exists utm_medium  text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term    text;

-- Indexes for the attribution + funnel admin pages.
create index if not exists idx_bookings_lead_id     on bookings(lead_id) where lead_id is not null;
create index if not exists idx_bookings_utm_source  on bookings(utm_source) where utm_source is not null;
create index if not exists idx_bookings_lead_tier   on bookings(lead_tier) where lead_tier is not null;
