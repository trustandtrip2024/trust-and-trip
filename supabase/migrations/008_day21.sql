-- Day 21: loyalty points, price drop tracking

-- ─── Part 1: Loyalty points ───────────────────────────────────────────────
create table if not exists user_points (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_points integer not null default 0,
  lifetime_points integer not null default 0,   -- never resets, drives tier
  tier text not null default 'silver' check (tier in ('silver','gold','platinum')),
  updated_at timestamptz not null default now()
);

alter table user_points enable row level security;

create policy "Users read own points"
  on user_points for select
  using (auth.uid() = user_id);

-- Writes handled by service-role (API routes), no public write policy

create table if not exists points_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,   -- +earned, -redeemed, -adjusted
  reason text not null,     -- 'booking_verified', 'referral_conversion', 'manual_adjust', 'redeemed'
  ref_id text,              -- booking id, referral code, admin note
  created_at timestamptz not null default now()
);

alter table points_log enable row level security;

create policy "Users read own points log"
  on points_log for select
  using (auth.uid() = user_id);

create index if not exists points_log_user_idx on points_log(user_id, created_at desc);

-- Tier derivation function (called by trigger + API)
create or replace function compute_tier(lifetime integer)
returns text language sql immutable as $$
  select case
    when lifetime >= 5000 then 'platinum'
    when lifetime >= 1000 then 'gold'
    else 'silver'
  end;
$$;

-- Auto-create user_points row on signup
create or replace function init_user_points()
returns trigger language plpgsql security definer as $$
begin
  insert into user_points (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function init_user_points();

-- Backfill: ensure every existing user has a points row
insert into user_points (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- ─── Part 2: Price drop tracking on saved trips ───────────────────────────
alter table user_saved_trips
  add column if not exists price_at_save integer,
  add column if not exists last_alerted_at timestamptz,
  add column if not exists last_alerted_price integer;

-- Backfill price_at_save with current package_price for existing rows
update user_saved_trips
set price_at_save = package_price
where price_at_save is null and package_price is not null;

comment on column user_saved_trips.price_at_save is
  'Package price at the moment user saved the trip. Compared against current dynamic price for drop alerts.';
comment on column user_saved_trips.last_alerted_at is
  'When we last emailed this user about a price drop on this trip. Prevents spam.';
