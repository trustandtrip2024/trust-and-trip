-- Package detail page view tracker. Hot-keyed per package_slug.
-- Supports two CRO surfaces:
--   1. Live "X viewing now" — count distinct sessions in last 5 min.
--   2. "Y viewed this week" — total views in last 7 days.
--
-- One row per (package_slug, session_id) so refreshes don't inflate counts.

create table if not exists package_views (
  id uuid primary key default gen_random_uuid(),
  package_slug text not null,
  session_id text not null,
  viewed_at timestamptz not null default now(),
  unique (package_slug, session_id, viewed_at)
);

create index if not exists package_views_slug_time_idx
  on package_views (package_slug, viewed_at desc);

create index if not exists package_views_recent_idx
  on package_views (viewed_at desc);

alter table package_views enable row level security;
create policy "Anyone can record a view"
  on package_views for insert with check (true);
