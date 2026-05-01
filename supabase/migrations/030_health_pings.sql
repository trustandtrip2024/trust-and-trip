-- Time-series of health probe results. Each cron tick / manual probe
-- inserts one row per service so /admin/health can render a 14-day
-- uptime graph + spot which service flapped first.
CREATE TABLE IF NOT EXISTS health_pings (
  id          bigint        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service     text          NOT NULL,
  status      text          NOT NULL CHECK (status IN ('ok', 'degraded', 'down')),
  latency_ms  integer,
  detail      text,
  pinged_at   timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS health_pings_service_time_idx
  ON health_pings (service, pinged_at DESC);

CREATE INDEX IF NOT EXISTS health_pings_recent_idx
  ON health_pings (pinged_at DESC);

ALTER TABLE health_pings ENABLE ROW LEVEL SECURITY;
-- No policies → anon denied. Service-role writes from /api/health and
-- the cron probe; reads from /admin/health.

-- Cron run log. Each cron handler upserts on entry so /admin/health
-- shows last-run + status without going to Vercel logs.
CREATE TABLE IF NOT EXISTS cron_runs (
  job_path     text          PRIMARY KEY,
  last_run_at  timestamptz   NOT NULL DEFAULT now(),
  status       text          NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'error')),
  detail       text,
  duration_ms  integer
);

ALTER TABLE cron_runs ENABLE ROW LEVEL SECURITY;
