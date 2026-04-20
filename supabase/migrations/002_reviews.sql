-- Reviews table
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  package_slug text not null,
  package_title text,
  reviewer_name text not null,
  reviewer_email text not null,
  reviewer_location text,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text not null,
  travel_type text,
  travel_date text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  helpful_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists reviews_package_slug_idx on reviews(package_slug);
create index if not exists reviews_status_idx on reviews(status);
create index if not exists reviews_created_at_idx on reviews(created_at desc);
create index if not exists reviews_rating_idx on reviews(rating);

-- Rate limiting (one review per IP per package per 7 days)
create table if not exists review_rate_limits (
  ip text not null,
  package_slug text not null,
  submitted_at timestamptz not null default now(),
  primary key (ip, package_slug)
);

create index if not exists rate_limits_time_idx on review_rate_limits(submitted_at);

alter table reviews enable row level security;
alter table review_rate_limits enable row level security;

create policy "Anyone can submit a review"
  on reviews for insert with check (true);

create policy "Public can read approved reviews"
  on reviews for select using (status = 'approved');

create policy "Insert rate limit"
  on review_rate_limits for insert with check (true);

create policy "Read rate limit"
  on review_rate_limits for select using (true);
