-- Phase-2 RLS tightening (follow-up to 023).
--
-- Two pre-existing `using (true)` policies leaked data to the anon JWT:
--
--   1. coupons.`Public read by code` — exposed every coupon code, amount_off,
--      expiry, and redemption status to anyone hitting PostgREST with the
--      anon key (eg. via supabase-js from a browser console).
--   2. referrals.`Anyone can read referral by code` — exposed referrer_email
--      and referrer_phone for every row when only the existence/code → ok
--      lookup is needed.
--
-- All three /api routes that touch these tables (create-order, verify,
-- referral) use the service-role key, which bypasses RLS, so dropping the
-- public read does NOT break the application path.
--
-- Additive only — existing INSERT/UPDATE policies preserved.

-- ── 1. coupons ─────────────────────────────────────────────────────────
drop policy if exists "Public read by code" on coupons;
-- No replacement policy. Service role bypasses RLS, so /api/payment/*
-- still validates coupons. Anon role now denied SELECT/INSERT/UPDATE/DELETE
-- on coupons.

-- ── 2. referrals ───────────────────────────────────────────────────────
drop policy if exists "Anyone can read referral by code" on referrals;
drop policy if exists "Anyone can update clicks" on referrals;
-- Insert-as-anon stays available so the legacy public /refer flow
-- continues to work, but the public SELECT and UPDATE paths are gone.
-- Reads + click-bumps now flow through /api/referral which uses the
-- service-role key.

-- Authenticated users can read THEIR OWN referral row (matched by email)
-- — used by the dashboard. Customer email already on the row.
create policy "Users read own referral via email"
  on referrals
  for select
  to authenticated
  using (referrer_email = (auth.jwt() ->> 'email'));
