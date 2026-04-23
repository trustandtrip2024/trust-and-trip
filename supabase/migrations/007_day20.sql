-- Day 20: booking grouping + traveller profiles + document vault

-- ─── Part 1: booking grouping (for cart multi-item checkout) ──────────────
alter table bookings
  add column if not exists order_group_id uuid;

create index if not exists bookings_group_idx on bookings(order_group_id);

comment on column bookings.order_group_id is
  'Shared UUID linking multiple bookings paid in one Razorpay order (cart checkout).';

-- ─── Part 2: user traveller profiles ──────────────────────────────────────
create table if not exists user_travellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  relation text,  -- self, spouse, child, parent, friend
  dob date,
  gender text check (gender in ('male','female','other','prefer_not_to_say')),
  nationality text default 'Indian',
  passport_number text,
  passport_expiry date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_travellers enable row level security;

create policy "Users manage own travellers"
  on user_travellers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists user_travellers_user_idx on user_travellers(user_id);

create or replace function update_user_travellers_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists user_travellers_updated_at on user_travellers;
create trigger user_travellers_updated_at
  before update on user_travellers
  for each row execute function update_user_travellers_updated_at();

-- ─── Part 3: user documents (passport scans, visas, tickets) ──────────────
create table if not exists user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  traveller_id uuid references user_travellers(id) on delete set null,
  booking_id uuid references bookings(id) on delete set null,
  doc_type text not null check (doc_type in ('passport','visa','ticket','insurance','id_proof','other')),
  title text not null,
  storage_path text not null,  -- path in Supabase Storage bucket 'user-documents'
  file_size_bytes integer,
  mime_type text,
  created_at timestamptz not null default now()
);

alter table user_documents enable row level security;

create policy "Users manage own documents"
  on user_documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists user_documents_user_idx on user_documents(user_id);
create index if not exists user_documents_booking_idx on user_documents(booking_id);
create index if not exists user_documents_traveller_idx on user_documents(traveller_id);

-- ─── Part 4: Supabase Storage bucket for documents ────────────────────────
-- Run in Supabase Dashboard → Storage → New bucket, OR via SQL:
insert into storage.buckets (id, name, public)
values ('user-documents', 'user-documents', false)
on conflict (id) do nothing;

-- RLS policies on storage bucket: users can only upload/read their own folder
-- Folder structure: {user_id}/{doc_id}.pdf
create policy "Users upload own docs"
  on storage.objects for insert
  with check (
    bucket_id = 'user-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read own docs"
  on storage.objects for select
  using (
    bucket_id = 'user-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own docs"
  on storage.objects for delete
  using (
    bucket_id = 'user-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
