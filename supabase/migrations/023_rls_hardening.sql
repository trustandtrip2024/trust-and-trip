-- RLS hardening pass.
--
-- Locks tables so only the service-role key (used by /api routes) can
-- read/write them. Anon role gets no access. Service role bypasses RLS so
-- existing API routes keep working.
--
-- Tables fixed:
--   1. bookings — pre-existing policy `using (true)` allowed anon SELECT of
--      customer PII (name, email, phone, payment IDs).
--   2. itineraries — RLS never enabled; jsonb itinerary + lead_id readable
--      by anon.
--   3. push_subscriptions — RLS never enabled; web-push endpoints + auth
--      secrets readable by anon.

-- ── 1. bookings — drop permissive policy, deny by default ────────────────
drop policy if exists "Service role manages bookings" on bookings;
-- No replacement policy. Service role bypasses RLS, so /api routes still work.
-- Anon role now denied SELECT/INSERT/UPDATE/DELETE on bookings.

-- Authenticated users can read their OWN bookings (matched by email) — used
-- by the /my-booking page and the user dashboard. Customer email already on
-- the row; no schema change needed.
create policy "Users read own bookings via email"
  on bookings
  for select
  to authenticated
  using (customer_email = (auth.jwt() ->> 'email'));

-- ── 2. itineraries ───────────────────────────────────────────────────────
alter table itineraries enable row level security;
-- No policy = service role only (it bypasses RLS).

-- ── 3. push_subscriptions ────────────────────────────────────────────────
alter table push_subscriptions enable row level security;

-- A signed-in user can manage their own push subscriptions.
create policy "Users manage own push subscriptions"
  on push_subscriptions
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
