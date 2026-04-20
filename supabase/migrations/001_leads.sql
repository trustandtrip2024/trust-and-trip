-- Leads table for Trust and Trip CRM
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  message text,
  package_title text,
  package_slug text,
  destination text,
  travel_type text,
  travel_date text,
  num_travellers text,
  budget text,
  source text not null default 'contact_form',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  page_url text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'booked', 'lost')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for quick dashboard queries
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_created_at_idx on leads(created_at desc);
create index if not exists leads_source_idx on leads(source);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- Row-level security (read/insert only via anon key, no delete/update from client)
alter table leads enable row level security;

create policy "Anyone can insert a lead"
  on leads for insert
  with check (true);

-- No select/update/delete from anon — only via service role key in admin
