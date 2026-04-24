-- Cart abandonment reminder tracking.
-- The /api/cron/cart-abandonment endpoint stamps these columns after sending
-- a reminder email, so each cart item only ever receives at most one 24-hour
-- reminder and one 72-hour reminder.

alter table user_cart
  add column if not exists reminder_24h_sent_at timestamptz,
  add column if not exists reminder_72h_sent_at timestamptz;

create index if not exists user_cart_reminders_24h_idx
  on user_cart (created_at)
  where reminder_24h_sent_at is null;

create index if not exists user_cart_reminders_72h_idx
  on user_cart (created_at)
  where reminder_72h_sent_at is null;
