-- Review request email tracking.
-- /api/cron/review-request stamps this column after emailing the traveller
-- 3 days after their trip end, so each booking only gets one nudge.

alter table bookings
  add column if not exists review_request_sent_at timestamptz;

create index if not exists bookings_review_request_idx
  on bookings (status, travel_date)
  where review_request_sent_at is null;
