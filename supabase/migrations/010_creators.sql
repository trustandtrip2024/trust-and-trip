-- Creator program: onboarding, attribution, earnings, payouts.

-- ─── 1. creators ──────────────────────────────────────────────────────────
create table if not exists creators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null, -- null until they create an account
  full_name text not null,
  email text not null,
  phone text,
  instagram_handle text,
  audience_size integer,
  ref_code text not null unique,                              -- CRTR-XXXXX (uppercase, no ambiguous chars)
  commission_pct numeric(5,2) not null default 5.00,           -- per-creator override
  status text not null default 'pending'
    check (status in ('pending','active','paused','rejected','banned')),
  payout_method text,                                          -- upi | bank | paypal
  payout_details jsonb,                                        -- { upi_id, ifsc, account, ... }
  kyc_url text,
  total_earned_paise bigint not null default 0,
  total_paid_paise bigint not null default 0,
  bitrix_contact_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table creators enable row level security;

-- creators can read own row
create policy "creators read own"
  on creators for select
  using (auth.uid() = user_id);

-- creators can update non-status fields on own row (status only via admin/service-role)
create policy "creators update own"
  on creators for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists creators_user_idx on creators(user_id);
create index if not exists creators_ref_code_idx on creators(ref_code);
create index if not exists creators_status_idx on creators(status);

create or replace function update_creators_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists creators_updated_at on creators;
create trigger creators_updated_at
  before update on creators
  for each row execute function update_creators_updated_at();

-- ─── 2. attribution: cookie click → lead ──────────────────────────────────
create table if not exists creator_attributions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators(id) on delete cascade,
  ref_code text not null,
  lead_id uuid references leads(id) on delete cascade,
  visitor_id text,                  -- anon cookie id, stored for conversion attribution
  source text default 'cookie',     -- cookie | utm | manual
  utm_campaign text,
  page_url text,
  captured_at timestamptz not null default now()
);

alter table creator_attributions enable row level security;

create policy "creators read own attributions"
  on creator_attributions for select
  using (
    creator_id in (select id from creators where user_id = auth.uid())
  );

create index if not exists attr_creator_idx on creator_attributions(creator_id, captured_at desc);
create index if not exists attr_lead_idx on creator_attributions(lead_id);
create index if not exists attr_visitor_idx on creator_attributions(visitor_id);

-- ─── 3. earnings: lead → booking → commission ────────────────────────────
create table if not exists creator_earnings (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators(id) on delete cascade,
  booking_id uuid not null references bookings(id) on delete cascade,
  attribution_id uuid references creator_attributions(id) on delete set null,
  gross_amount_paise bigint not null,        -- package_price * num_travellers * 100
  commission_pct numeric(5,2) not null,
  commission_amount_paise bigint not null,
  status text not null default 'pending'
    check (status in ('pending','payable','paid','reversed')),
  payout_id uuid,                            -- FK set when paid
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(booking_id)                          -- one earning per booking
);

alter table creator_earnings enable row level security;

create policy "creators read own earnings"
  on creator_earnings for select
  using (
    creator_id in (select id from creators where user_id = auth.uid())
  );

create index if not exists earn_creator_idx on creator_earnings(creator_id, created_at desc);
create index if not exists earn_status_idx on creator_earnings(status);

create or replace function update_creator_earnings_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists creator_earnings_updated_at on creator_earnings;
create trigger creator_earnings_updated_at
  before update on creator_earnings
  for each row execute function update_creator_earnings_updated_at();

-- ─── 4. payouts ───────────────────────────────────────────────────────────
create table if not exists creator_payouts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references creators(id) on delete cascade,
  amount_paise bigint not null,
  period_start date,
  period_end date,
  status text not null default 'pending'
    check (status in ('pending','processing','paid','failed')),
  paid_at timestamptz,
  txn_ref text,
  notes text,
  created_at timestamptz not null default now()
);

alter table creator_payouts enable row level security;

create policy "creators read own payouts"
  on creator_payouts for select
  using (
    creator_id in (select id from creators where user_id = auth.uid())
  );

create index if not exists payout_creator_idx on creator_payouts(creator_id, created_at desc);

-- ─── 5. lead/booking ref_code columns ─────────────────────────────────────
alter table leads
  add column if not exists ref_code text;

alter table bookings
  add column if not exists ref_code text;

create index if not exists leads_ref_code_idx on leads(ref_code);
create index if not exists bookings_ref_code_idx on bookings(ref_code);

comment on column leads.ref_code is 'Creator referral code captured from tt_ref cookie or ?ref param';
comment on column bookings.ref_code is 'Creator referral code copied forward from cart/lead at booking time';
