# Security policy

## How auth/authz works in this repo

- **Public pages** (homepage, destinations, packages, blog, etc.) are
  served as Server Components and only read public Sanity content. No
  client-side auth required.
- **Dashboard / Creator dashboard** are server-rendered with a
  server-side guard in their `layout.tsx` — `getServerUser()` is read
  from request cookies via `@supabase/ssr` and unauthed visitors are
  redirected before any client JS runs. The client-side
  `useUserStore` redirect inside the navigation components remains for
  fast in-app transitions but is *not* the security boundary.
- **Admin** (`/admin/*` and `/api/admin/*`) is gated by HTTP Basic
  Auth in `src/middleware.ts`, **and** every `/api/admin/*` route
  re-checks via `requireAdmin` from `src/lib/auth-server.ts` —
  defence-in-depth so a misconfigured matcher never silently opens
  admin. Compares are timing-safe.
- **API routes** that read or mutate private data require a Bearer
  token. The token is resolved via `requireUser` / `requireCreator`
  helpers in `src/lib/auth-server.ts`. Routes return 401 on missing
  session and 403 on role mismatch (e.g. non-creator hitting a creator
  route, or a creator hitting another creator's URL).

## Database access

- Every server route uses the Supabase service-role client — RLS
  policies still apply when reaching from the anon client (e.g.
  user-side reads of their own bookings) but are bypassed for service
  workflows.
- We never build SQL or GROQ filters via string concatenation.
  Parameters go through `$param` placeholders (Sanity) or the
  supabase-js builder (`.from().eq().filter()`), which prepares
  statements internally.

## Razorpay HMAC

- `/api/payment/verify` and `/api/payment/webhook` both use
  `crypto.timingSafeEqual` on equal-length buffers to compare
  signatures. Never use `===` or `!==` to compare HMAC output —
  string compare leaks the first-difference position via timing.

## Secret hygiene

### Where secrets live
- **Production / Preview / Development**: Vercel Project → Settings →
  Environment Variables. Pull locally with `vercel env pull
  .env.local`. The output file is gitignored.
- **Onboarding new contributors**: share the master env list via
  1Password (or another vault). Never DM secrets, never paste them
  into chat or commit messages.

### Variables we keep secret
- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS; **rotate every 30 days**.
- `SUPABASE_JWT_SECRET` — signs auth tokens; rotate every 30 days.
- `ADMIN_SECRET` — Basic Auth for /admin and /api/admin; rotate every
  30 days.
- `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` — payment flow
  HMAC keys; rotate every 30 days.
- `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `BITRIX24_WEBHOOK_URL`,
  `UPSTASH_REDIS_REST_TOKEN`, `GOOGLE_PLACES_API_KEY` — third-party
  service credentials; rotate every 90 days.

### How we rotate
1. Generate the new secret in the provider dashboard (Supabase /
   Razorpay / Resend etc.) — never reuse old values.
2. Update Vercel env (Production / Preview / Development as needed).
3. Trigger a redeploy so running serverless functions pick up the new
   value.
4. Revoke the old secret on the provider side.
5. Log the rotation date in `docs/rotation-log.md` (or wherever the
   ops team keeps the audit trail).

### What's already verified
- `git log -p --all -- .env*` returns no committed env files.
- `git grep` for `eyJhbG` (JWT prefix), `sk_live`, `whsec_`,
  `rzp_live_` finds no hard-coded production secrets in source.
- `.gitignore` covers every `.env` variant we use.

## Reporting a vulnerability

Please email plan@trustandtrip.com with details. Do not file a public
GitHub issue for security reports.
