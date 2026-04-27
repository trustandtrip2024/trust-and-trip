-- Planner assignment.
--
-- assigned_planner is a free-text identifier (slack handle, email prefix,
-- whatever ops uses). Kept loose so we don't have to model a full planners
-- table until we need per-planner OAuth login.
--
-- assigned_at is auto-stamped on first set so the per-planner dashboard
-- can compute "average time to first contact" once the perf board ships.

alter table leads
  add column if not exists assigned_planner text,
  add column if not exists assigned_at      timestamptz;

create index if not exists idx_leads_assigned_planner
  on leads(assigned_planner, status, created_at desc)
  where assigned_planner is not null;
