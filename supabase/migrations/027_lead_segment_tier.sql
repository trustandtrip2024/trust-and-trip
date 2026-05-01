-- Lead segment tier (essentials | signature | private). Drives Bitrix24
-- pipeline routing — Private leads land in the senior-planner stage so
-- the top-tier customer doesn't queue behind a budget enquiry.
--
-- Distinct from the score-derived `tier` column (A/B/C/D) which captures
-- lead quality, not customer segment.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS segment_tier text
    CHECK (segment_tier IN ('essentials', 'signature', 'private'));

CREATE INDEX IF NOT EXISTS leads_segment_tier_idx
  ON leads (segment_tier)
  WHERE segment_tier IS NOT NULL;
