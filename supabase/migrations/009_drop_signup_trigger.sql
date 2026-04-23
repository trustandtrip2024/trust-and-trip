-- Drop the on_auth_user_created trigger introduced in 008_day21.sql.
--
-- The trigger was intended to auto-create a user_points row on signup. In
-- practice it caused "Database error saving new user" when Supabase Auth
-- tried to insert into auth.users — likely because SECURITY DEFINER + search
-- path lookup failed in some environments, or an RLS race.
--
-- user_points is already lazily created:
--   - /api/user/points returns a zero-init default via maybeSingle()
--   - /api/payment/verify upserts user_points when awarding points
--
-- So the trigger is redundant. Dropping it unblocks signup.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists init_user_points();
