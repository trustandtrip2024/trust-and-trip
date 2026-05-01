-- Roadmap dashboard backing store. The MD files at repo root
-- (DIRECTOR_AUDIT.md, OPERATOR_HANDBOOK.md, CONTENT_MEDIA_TODO.md) are the
-- source of truth for *what* needs doing. This table only tracks status,
-- owner, and notes per task — keyed by a stable hash of the source line so
-- doc edits that don't touch the line preserve status across deploys.
CREATE TABLE IF NOT EXISTS roadmap_tasks (
  hash         text         PRIMARY KEY,
  status       text         NOT NULL DEFAULT 'todo'
                            CHECK (status IN ('todo', 'doing', 'blocked', 'done')),
  owner        text,
  notes        text,
  updated_at   timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS roadmap_tasks_status_idx
  ON roadmap_tasks (status);

ALTER TABLE roadmap_tasks ENABLE ROW LEVEL SECURITY;
-- No policies declared → anon role denied. Service-role bypasses RLS for
-- /admin reads + /api/admin/roadmap writes (admin route protected by
-- middleware Basic Auth — see src/middleware.ts).

CREATE OR REPLACE FUNCTION touch_roadmap_tasks_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS roadmap_tasks_touch ON roadmap_tasks;
CREATE TRIGGER roadmap_tasks_touch
  BEFORE UPDATE ON roadmap_tasks
  FOR EACH ROW
  EXECUTE FUNCTION touch_roadmap_tasks_updated_at();
