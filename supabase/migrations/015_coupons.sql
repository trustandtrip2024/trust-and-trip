-- Coupon codes issued via newsletter signup, applied at booking time.
-- One row per code. Codes are unique and case-insensitive.
--
-- Lifecycle: created (issued at signup) -> redeemed (locked to booking_id).

create table if not exists coupons (
  code text primary key,
  email text not null,
  source text not null default 'newsletter',
  amount_off integer not null default 500,
  min_order_value integer not null default 25000,
  expires_at timestamptz not null default (now() + interval '90 days'),
  redeemed_at timestamptz,
  redeemed_booking_id uuid references bookings(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists coupons_email_idx on coupons (email);
create index if not exists coupons_redeemed_idx on coupons (redeemed_at);

alter table coupons enable row level security;
-- Anyone can claim/look up their own code by code+email; service role does writes.
create policy "Public read by code" on coupons for select using (true);

-- Track newsletter signup -> issued coupon link.
alter table newsletter_subscribers
  add column if not exists coupon_code text references coupons(code) on delete set null;

-- Bookings: capture applied discount.
alter table bookings
  add column if not exists coupon_code text references coupons(code) on delete set null,
  add column if not exists discount_amount integer not null default 0;
