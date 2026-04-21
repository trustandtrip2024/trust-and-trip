create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_name text not null,
  referrer_email text not null,
  referrer_phone text,
  code text unique not null,
  clicks integer not null default 0,
  conversions integer not null default 0,
  reward_amount integer not null default 500,
  status text not null default 'active' check (status in ('active','redeemed','expired')),
  created_at timestamptz not null default now()
);

create index if not exists referrals_code_idx on referrals(code);
create index if not exists referrals_email_idx on referrals(referrer_email);

alter table referrals enable row level security;
create policy "Anyone can read referral by code" on referrals for select using (true);
create policy "Anyone can create referral" on referrals for insert with check (true);
create policy "Anyone can update clicks" on referrals for update using (true);
