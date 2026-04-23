-- User saved trips (DB-persisted wishlist for logged-in users)
create table if not exists user_saved_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_slug text not null,
  package_title text,
  package_image text,
  package_price integer,
  duration text,
  destination_name text,
  travel_type text,
  created_at timestamptz default now(),
  unique(user_id, package_slug)
);

alter table user_saved_trips enable row level security;

create policy "Users manage own saved trips"
  on user_saved_trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists user_saved_trips_user_idx on user_saved_trips(user_id);

-- User cart
create table if not exists user_cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_slug text not null,
  package_title text,
  package_image text,
  package_price integer,
  duration text,
  destination_name text,
  travel_type text,
  num_travelers integer default 2,
  travel_date text,
  created_at timestamptz default now(),
  unique(user_id, package_slug)
);

alter table user_cart enable row level security;

create policy "Users manage own cart"
  on user_cart for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists user_cart_user_idx on user_cart(user_id);
