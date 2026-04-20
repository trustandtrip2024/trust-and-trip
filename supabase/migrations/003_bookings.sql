-- Bookings table for Razorpay deposit payments
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  package_slug text not null,
  package_title text not null,
  package_price integer not null,
  deposit_amount integer not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  travel_date text,
  num_travellers integer default 1,
  special_requests text,
  status text not null default 'created'
    check (status in ('created','paid','verified','refunded','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_status_idx on bookings(status);
create index if not exists bookings_package_idx on bookings(package_slug);
create index if not exists bookings_created_idx on bookings(created_at desc);
create index if not exists bookings_order_idx on bookings(razorpay_order_id);

alter table bookings enable row level security;

create policy "Service role manages bookings"
  on bookings using (true);

create or replace function update_bookings_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger bookings_updated_at
  before update on bookings
  for each row execute function update_bookings_updated_at();
