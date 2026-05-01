# Security Audit — 2026-05-01

Scope: rate limiting, Supabase RLS, IDOR. Stack is **Next.js 14 App Router +
Supabase**, not Express — the Express-shaped audit instructions were re-aimed
at the equivalent App Router constructs (per-route guards instead of
`app.use()`, `requireUser()` helper instead of Express middleware tree).

## Findings

| ID | Severity | Component | Issue |
|----|---|---|---|
| F1 | CRITICAL | `/api/booking-status` | No auth. `?id=<uuid>` returned booking PII (name, email, phone, deposit). `?phone=<10digits>` acted as phone→PII harvester. |
| F2 | HIGH | `/api/referral` | `GET ?email=<addr>` returned referral row to anyone. `POST` trusted body.email — could mint referrals attributed to a victim. |
| F3 | HIGH | `coupons` RLS | `Public read by code USING (true)` — anon JWT could `select * from coupons` and dump every code, amount_off, expiry, redemption status. |
| F4 | HIGH | `referrals` RLS | `Anyone can read referral by code USING (true)` exposed `referrer_email`, `referrer_phone` to anon. |
| F5 | MEDIUM | `/api/quiz/responses` PATCH | Accepted `{id, lead_id}` UUIDs from any caller, rewriting attribution. |
| F6 | MEDIUM | `/api/reviews/helpful` | No rate limit — counter could be inflated unboundedly. |
| F7 | MEDIUM | `/api/brochure/[slug]` | Heavy PDF render with no rate limit; trivial DoS / cost-spike. |
| F8 | LOW | `/api/health/launch` | Admin-key compare used `===` (timing leak). |

RLS audit also confirmed **all 21 user-data tables already have
`ENABLE ROW LEVEL SECURITY`** (most via migration `023_rls_hardening.sql`
done earlier). Bookings, itineraries, push_subscriptions are correctly
locked to service-role + owner-scoped reads.

## Fixes shipped

### Code

- `src/lib/require-user.ts` — new helper. Validates `Authorization: Bearer <jwt>`
  against Supabase Auth, returns either `{user}` or a `denial` NextResponse so
  every route handles missing/expired tokens identically. Replaces the
  ad-hoc copy-paste of `req.headers.get("authorization")?.replace("Bearer ", "")`
  on the 4 routes that already had auth and adds the same gate to 2 that
  did not.
- `src/lib/timing-safe.ts` — pure-JS constant-time string compare (Edge
  runtime safe). Already used by middleware Basic-Auth and Razorpay HMAC;
  now also used by `/api/health/launch` admin-key compare.
- `src/app/api/booking-status/route.ts` — Bearer required; lookups are now
  filtered by `customer_email = jwt.email`. Foreign IDs return 404
  (existence-leak preserved as 404, not 403). 30/60s rate limit per IP.
- `src/app/api/referral/route.ts`
  - `GET`: Bearer required; reads referral by `jwt.email`.
  - `POST`: Bearer required; persisted email is the JWT email, body field
    is ignored.
  - `PATCH`: Stays unauth (it's the click counter fired by `?ref=` redirect
    on a public landing) but rate-limited 10/3600s per `IP+code` so an
    attacker can't inflate counters.
- `src/app/api/reviews/helpful/route.ts` — 3 votes per IP per review per
  hour.
- `src/app/api/quiz/responses/route.ts` PATCH — rate-limited; rejects when
  the row is older than 5 min OR `lead_id` is already set; final `UPDATE`
  also adds `is("lead_id", null)` so two concurrent PATCHes can't both win.
- `src/app/api/brochure/[slug]/route.ts` — 10/60s rate limit per IP.
- `src/app/api/health/launch/route.ts` — admin-key compare uses
  `timingSafeEqualStrings`.
- `src/app/my-booking/page.tsx`, `src/app/dashboard/referral/page.tsx`,
  `src/app/refer/page.tsx` — caller updates to send the Bearer token from
  the supabase-js session.

### Database

`supabase/migrations/025_rls_tighten.sql` (additive, drops only the two
over-permissive policies):

- `coupons` — drops `Public read by code USING (true)`. Service role still
  reads (used by `/api/payment/create-order` + `/api/payment/verify`).
- `referrals` — drops public SELECT and public UPDATE policies. Adds
  `Users read own referral via email` for authenticated users to see their
  own row in the dashboard. Insert-as-anon kept so the legacy public
  `/refer` flow path doesn't break for the cookie-set-by-middleware case.

To apply:

```pwsh
# Run via the Supabase CLI from the repo root
supabase db push
```

## Verification

`scripts/security-tests.ps1` is a PowerShell + `Invoke-WebRequest` script
that probes the API surface for the regressions above. It works against
local dev or production:

```pwsh
pwsh ./scripts/security-tests.ps1 -BaseUrl http://localhost:3000
pwsh ./scripts/security-tests.ps1 -BaseUrl https://trustandtrip.com
```

Optional User A/B test (cross-tenant IDOR):

```pwsh
pwsh ./scripts/security-tests.ps1 `
  -BaseUrl http://localhost:3000 `
  -UserAJwt "<eyJhbGciOi…access_token of user A>" `
  -UserBBookingId "<uuid of a booking belonging to user B>"
```

User A should get **404** (not the booking) — proves the JWT-scoped filter.

Type-check:

```pwsh
npx tsc --noEmit
```

Returns 0 with no output as of 2026-05-01.

## Outstanding items (not in this batch)

These were identified in earlier audits and remain open. None are fresh
regressions from this work.

- Refund webhook idempotency on `/api/payment/webhook`.
- Verify-route lead-dedupe + points-award race (concurrent verifies can
  award points twice).
- Coupon redemption race — second concurrent verify could re-use a code.
- Admin `bookings/cancel` `refundAmount` is unbounded — any value the
  admin types is sent to Razorpay refund API.
- 12 P2 items from the earlier audit (CSP `unsafe-inline` fallback
  scoping, Sentry server-side scrubbing of PII, etc.) — tracked but not
  in this commit.
- `/refer` public page UX: now requires sign-in to generate. Email field
  on the form is decorative (server ignores it). Either remove the field
  or pre-fill from the session in a follow-up UX pass.
