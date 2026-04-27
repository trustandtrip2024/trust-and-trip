-- Web Push subscriptions for booked travellers.
--
-- Each row is one device's push endpoint. user_id ties to auth.users so we
-- can fan out a push to every device for a given user (planner replies,
-- pre-trip reminders, in-trip alerts).

create table if not exists push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  user_id       uuid references auth.users(id) on delete cascade,
  endpoint      text not null,
  p256dh        text not null,
  auth_secret   text not null,
  user_agent    text,
  -- Tagged categories the user opted in to. Defaults: booking + planner-reply.
  topics        text[] not null default '{booking,planner_reply}',
  last_used_at  timestamptz,
  unique(endpoint)
);

create index if not exists idx_push_user on push_subscriptions(user_id);
create index if not exists idx_push_topics on push_subscriptions using gin(topics);
