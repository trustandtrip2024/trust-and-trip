-- Daily mandatory ops checks. One row per (date, item) per IST day.
-- Keys are defined in code (src/lib/daily-checks.ts); the table is just
-- a status/notes store. Reset = a new IST date with no rows yet → all
-- items render as unchecked.
CREATE TABLE IF NOT EXISTS daily_checks (
  check_date    date         NOT NULL,
  item_key      text         NOT NULL,
  completed     boolean      NOT NULL DEFAULT false,
  completed_at  timestamptz,
  completed_by  text,
  notes         text,
  PRIMARY KEY (check_date, item_key)
);

CREATE INDEX IF NOT EXISTS daily_checks_date_idx
  ON daily_checks (check_date DESC);

ALTER TABLE daily_checks ENABLE ROW LEVEL SECURITY;
-- No policies → anon denied. Service-role bypasses for /admin reads
-- and /api/admin/daily writes.
