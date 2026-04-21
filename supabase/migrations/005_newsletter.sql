create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz not null default now()
);
alter table newsletter_subscribers enable row level security;
create policy "Anyone can subscribe" on newsletter_subscribers for insert with check (true);
