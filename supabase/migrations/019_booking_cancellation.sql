-- Booking cancellation + refund tracking.
--
-- Adds the missing fields we need for unit-econ visibility post-launch:
-- which bookings cancelled, why, when, and how much we refunded. Powers the
-- "net bookings" + cancellation% widgets on /admin/funnel.

alter table bookings
  add column if not exists cancelled_at  timestamptz,
  add column if not exists cancel_reason text,
  add column if not exists refunded_at   timestamptz,
  add column if not exists refund_amount integer,    -- ₹ paise; 0 = no refund (forfeit deposit)
  add column if not exists refund_ref    text;        -- Razorpay refund_id

-- Allow new statuses on bookings that previously only used 'created'/'verified'/'pending'.
-- Re-state the check constraint as a whitelist via a simple DO block — Supabase / pg
-- requires drop-then-add for constraint changes.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'bookings_status_check'
      and conrelid = 'bookings'::regclass
  ) then
    alter table bookings drop constraint bookings_status_check;
  end if;
exception when undefined_table then
  -- bookings table missing in this env; ignore so the migration is idempotent
  null;
end $$;

alter table bookings
  add constraint bookings_status_check
  check (status in ('created','verified','pending','cancelled','refunded','completed'));

create index if not exists idx_bookings_cancelled
  on bookings(cancelled_at) where cancelled_at is not null;
