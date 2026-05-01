-- Race-condition hardening for payment paths.
--
-- Two flows have been observed to double-process under concurrent firing:
--
--   1. Razorpay webhook + browser-side /verify both racing to verify the
--      same order. Today both can succeed, double-awarding points and
--      double-inserting lead rows. Pinning the UPDATE to status IN
--      (created, pending) gives a single winner — but a webhook retry can
--      still re-fire the dispute alert and re-stamp refund metadata. We
--      need an event-level dedup table.
--
--   2. Cart checkout with the same coupon in two parallel windows. The
--      coupon validation reads `redeemed_at IS NULL` then proceeds; both
--      orders pass validation, both bookings carry the discount, only the
--      first /verify marks the coupon redeemed. The second booking gets a
--      free discount the company eats. Need a claim-at-create-order step.

-- ── 1. Webhook event dedup table ────────────────────────────────────────
-- Razorpay can retry a webhook for up to 24h on non-2xx. A retry must not
-- re-fire alerts or re-stamp refund/dispute fields. Store every processed
-- event id; INSERT-on-conflict short-circuits the second delivery.
create table if not exists processed_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now(),
  payload_summary jsonb
);

-- Auto-prune events older than 30 days — Razorpay won't retry past 24h, the
-- 30d window is just for debugging recent activity.
create index if not exists processed_webhook_events_processed_at_idx
  on processed_webhook_events(processed_at desc);

alter table processed_webhook_events enable row level security;
-- Service role only (bypasses RLS). No other role needs access.

-- ── 2. Coupon atomic claim ──────────────────────────────────────────────
-- Add a claim phase between "issued" and "redeemed". Create-order claims
-- the coupon atomically; verify flips it to redeemed. A unique partial
-- index ensures at most one booking can hold the claim at a time.
alter table coupons
  add column if not exists claimed_at timestamptz,
  add column if not exists claimed_by_booking_id uuid references bookings(id) on delete set null;

-- Partial unique index: only enforces uniqueness for actively-claimed
-- coupons (claimed_at IS NOT NULL AND redeemed_at IS NULL). Once redeemed
-- the row is locked. Allows abandoned claims to be reclaimed by a future
-- order — see the cleanup query below for ops.
create unique index if not exists coupons_one_active_claim_per_code
  on coupons(code)
  where claimed_at is not null and redeemed_at is null;

-- Stale-claim cleanup helper. Carts that abandon at create-order leave a
-- claim hanging; release after 30 min so a real later customer can use the
-- code. Run from a cron OR call inline in create-order.
create or replace function release_stale_coupon_claims(stale_minutes int default 30)
returns int language plpgsql as $$
declare
  released int;
begin
  update coupons
    set claimed_at = null, claimed_by_booking_id = null
    where claimed_at is not null
      and redeemed_at is null
      and claimed_at < now() - make_interval(mins => stale_minutes);
  get diagnostics released = row_count;
  return released;
end;
$$;
