-- Founder decision journal. Solo founders forget *why* they chose X
-- three weeks later — this table is the receipt. /admin/decisions reads
-- + writes here. Optional outcome closes the loop.
CREATE TABLE IF NOT EXISTS decisions (
  id          bigint        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  decided_at  timestamptz   NOT NULL DEFAULT now(),
  area        text          NOT NULL,           -- e.g. marketing | product | ops | hire | money
  decision    text          NOT NULL,           -- one-line decision
  rationale   text,                             -- why
  expected    text,                             -- what success looks like
  review_on   date,                             -- when to revisit
  outcome     text,                             -- filled in retro
  outcome_at  timestamptz                       -- when outcome was logged
);

CREATE INDEX IF NOT EXISTS decisions_recent_idx ON decisions (decided_at DESC);
CREATE INDEX IF NOT EXISTS decisions_review_idx ON decisions (review_on) WHERE review_on IS NOT NULL AND outcome IS NULL;

ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
-- No policies → anon denied. Only service-role (admin routes) reads/writes.
