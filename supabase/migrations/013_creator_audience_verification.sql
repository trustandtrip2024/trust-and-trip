-- Creator audience verification.
--
-- audience_size = self-reported by the creator on the apply form (bucket lower bound).
-- audience_size_verified = manually verified by admin (or future Instagram Graph API).
-- audience_verified_at = timestamp of last verification.
-- audience_source = how it was verified: 'manual' (admin) or 'instagram_api' (future).
--
-- Until we ship Instagram OAuth (Meta App review pending), admin sets these
-- fields via /admin/creators using the Instagram link to manually inspect.

alter table creators
  add column if not exists audience_size_verified integer,
  add column if not exists audience_verified_at timestamptz,
  add column if not exists audience_source text
    check (audience_source is null or audience_source in ('manual', 'instagram_api'));

create index if not exists creators_audience_verified_idx
  on creators (audience_size_verified)
  where audience_size_verified is not null;
