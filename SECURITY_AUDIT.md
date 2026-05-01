# Security Audit — 2026-05-01

Full sweep across the Next.js 14 + Supabase stack. Six commits in one
session covering fail-closed gates, timing-safe compares, IDOR / RLS
leaks, payment race conditions, Sentry PII scrubbing, and additional
rate limits.

## Stack

- Next.js 14 App Router (61 route files under `src/app/api/**/route.ts`)
- Supabase (Postgres + Auth + Storage)
- Razorpay (payments) · Bitrix24 (CRM) · Resend (email) · Sentry · Upstash Redis
- Hosted on Vercel

The audit was originally framed as Express-shaped. Adapted to App Router:
"middleware" = `src/middleware.ts` (one Edge function); "rate limiting" =
per-route `rateLimit()` helper from `src/lib/redis.ts` (no global mount
point); "ownership middleware" = `requireUser()` helper from
`src/lib/require-user.ts`.

## Findings & resolutions

### Fail-closed gates (commit `ca58ce1`)

| ID | Severity | Component | Issue | Fix |
|----|---|---|---|---|
| F0a | P0 | `/api/leads/status` | No auth — lead totals public. | Bearer + Basic admin gate; 503 in prod when ADMIN_SECRET unset. |
| F0b | P1 | `src/middleware.ts` | Admin gate skipped Basic-Auth when ADMIN_SECRET missing. | 503 in prod when env unset. |
| F0c | P1 | `/api/whatsapp` GET | Empty supplied token matched empty config token. | 503 when VERIFY_TOKEN empty. |
| F0d | P2 | 6× `/api/cron/*` | Routes ran for anyone when CRON_SECRET unset. | New `assertCronAuth()` helper; 503 in prod. |

### Timing-safe + privacy (commit `0b4d32c`)

| ID | Severity | Component | Issue | Fix |
|----|---|---|---|---|
| F1a | P1 | `/api/payment/verify` | Razorpay HMAC compared with `!==`. | `timingSafeEqualStrings`. |
| F1b | P1 | `/api/payment/verify` | `process.env.RAZORPAY_KEY_SECRET!` non-null assertion. | Explicit guard, 503 if missing. |
| F1c | P1 | `src/middleware.ts` | Admin Basic-Auth `===` compare; raw `atob()` could throw. | Constant-time compare; base64 wrapped in try/catch. |
| F1d | P1 | `src/instrumentation-client.ts` | Sentry Replay shipped form text (name/phone/email/travel-date). | `maskAllText: true`, `blockAllMedia: true`. |
| F1e | P1 | `/api/leads` | Returned full Supabase error + stack to clients. | Generic error in prod; verbose in dev only. |

### IDOR + RLS (commit `791e1d2`, migration `025_rls_tighten.sql`)

| ID | Severity | Component | Issue | Fix |
|----|---|---|---|---|
| F2a | CRITICAL | `/api/booking-status` GET | `?id=<uuid>` returned booking PII to anyone; `?phone=<10digits>` was a phone→PII harvester. | Bearer required; filtered by `customer_email = jwt.email`; 30/60s rate limit. |
| F2b | HIGH | `/api/referral` GET | `?email=<addr>` returned referral row to any caller. | Bearer required; reads by JWT email. |
| F2c | HIGH | `/api/referral` POST | Trusted body.email — could mint referrals attributed to victim. | Bearer required; persisted email is the JWT email. |
| F2d | MEDIUM | `/api/referral` PATCH | Public click counter could be inflated unboundedly. | 10/3600s per `IP+code`. |
| F2e | HIGH | RLS `coupons` | `Public read by code USING (true)` exposed every code, amount_off, expiry, redemption status to anon JWT. | Migration 025 drops the public policy; service role still reads via `/api/payment/*`. |
| F2f | HIGH | RLS `referrals` | `Anyone can read by code USING (true)` exposed referrer_email/phone. | Migration 025 drops public read+update; adds JWT-email-scoped read for the dashboard. |
| F2g | MEDIUM | `/api/quiz/responses` PATCH | UUID-only attribution rewrite without ownership. | Rate-limited; freshness-guarded (<5 min, lead_id null); UPDATE pinned to `is("lead_id", null)`. |
| F2h | MEDIUM | `/api/reviews/helpful` POST | No rate limit — counter inflatable unboundedly. | 3 votes per IP per review per hour. |
| F2i | MEDIUM | `/api/brochure/[slug]` GET | Heavy PDF render with no rate limit; trivial DoS / cost spike. | 10/60s per IP. |
| F2j | LOW | `/api/health/launch` | Admin-key compare used `===` (timing leak). | `timingSafeEqualStrings`. |

Helpers added: `src/lib/require-user.ts` (Bearer→User helper, single
denial shape).

Caller updates (send Bearer token from supabase-js session):
`src/app/my-booking/page.tsx`, `src/app/dashboard/referral/page.tsx`,
`src/app/refer/page.tsx`.

### Payment race conditions (commit `ee8b33d`, migration `026_payment_race_guards.sql`)

| ID | Severity | Component | Issue | Fix |
|----|---|---|---|---|
| F3a | HIGH | `/api/payment/verify` | Two parallel verifies (browser /verify + webhook) both ran UPDATE without status filter; both awarded points; both inserted "DEPOSIT PAID" leads. | UPDATE pinned to `IN (created, pending)`; loser falls into `already_verified` short-circuit. |
| F3b | HIGH | `/api/payment/webhook` | Razorpay retries re-stamped refund_amount and re-fired Slack/Telegram dispute alerts. | New `processed_webhook_events(event_id PK)`. INSERT-on-conflict short-circuits the second delivery and returns 200. |
| F3c | HIGH | `/api/payment/create-order` | Two carts redeeming same coupon both passed validation; only one /verify marked redeemed; company ate the second discount. | Migration 026 adds `coupons.claimed_at`, `claimed_by_booking_id`, partial unique index `claimed_at IS NOT NULL AND redeemed_at IS NULL`. Create-order claims atomically; second concurrent claim returns 409. `release_stale_coupon_claims(stale_minutes)` GCs abandoned claims. |
| F3d | P1 | `/api/admin/bookings/cancel` | `refundAmount` accepted any number — typo or compromised admin could refund > deposit. | Clamped to `[0, deposit_amount]`; rejects re-refund on already-refunded rows. |

### Sentry + extra hardening (commit `3c12ebd`)

| ID | Severity | Component | Issue | Fix |
|----|---|---|---|---|
| F4a | P1 | All Sentry runtimes | `sendDefaultPii: true` shipped Authorization, Cookie, x-razorpay-signature headers, `?key=ADMIN_SECRET` in URLs, raw email/phone fields. | New `src/lib/sentry-scrub.ts` redacts sensitive headers, sanitises sensitive query params, walks request body / extra / contexts / tags for PII keys, drops literal user.email / username / ip_address. Wired into all 3 runtime configs. |
| F4b | P1 | `/api/bitrix24/webhook` | `if (REVERSE_TOKEN && body.token !== REVERSE_TOKEN)` left route open to anonymous POST when env unset; `!==` compare. | 503 in prod when env unset; `timingSafeEqualStrings` compare. |
| F4c | P2 | `/api/newsletter` POST | No rate limit — burns Resend daily quota; pollutes Bitrix. | 5/3600s per IP. |
| F4d | P2 | `/api/reviews` POST | Per-package DB guard; IP could flood across slugs. | 10/3600s IP-level. |
| F4e | P2 | `/api/wa/click` GET | Each call inserts a lead row + fires Meta CAPI Contact event. | 60/60s per IP; still redirects on throttle, just skips lead/CAPI write. |
| F4f | P2 | `/api/search` GET | 5-min CDN cache defeated by rotating `q` param. | 60/60s per IP. |
| F4g | P2 | `/api/package-views` POST | Social-proof "X viewing now" inflatable. | 60/60s per IP. |

## RLS state — all 21 tables

All user-data tables have `ENABLE ROW LEVEL SECURITY`. Migration `023`
hardened bookings/itineraries/push_subscriptions earlier. Migration `025`
closed the two remaining over-permissive policies (coupons, referrals).

| Table | Anon read | Anon write | Owner-scoped | Notes |
|---|---|---|---|---|
| leads | ❌ | ✅ insert | service-role read | OK |
| reviews | ✅ approved | ✅ insert | — | OK |
| review_rate_limits | ✅ | ✅ | — | OK |
| bookings | ❌ | ❌ | jwt.email read | hardened in 023 |
| referrals | ❌ | ✅ insert | jwt.email read | tightened in 025 |
| newsletter_subscribers | ❌ | ✅ insert | — | OK |
| user_saved_trips | — | — | uid ALL | OK |
| user_cart | — | — | uid ALL | OK |
| user_travellers | — | — | uid ALL | OK |
| user_documents | — | — | uid ALL + storage | OK |
| user_points | — | — | uid SELECT | OK |
| points_log | — | — | uid SELECT | OK |
| creators | — | — | own SELECT/UPDATE | OK |
| creator_attributions | — | — | own SELECT | OK |
| creator_earnings | — | — | own SELECT | OK |
| creator_payouts | — | — | own SELECT | OK |
| package_views | ❌ | ✅ insert | — | OK |
| coupons | ❌ | ❌ | service-role only | tightened in 025 |
| itineraries | ❌ | ❌ | service-role only | hardened in 023 |
| push_subscriptions | — | — | uid ALL | OK |
| quiz_responses | ❌ | ❌ | service-role only | OK |
| processed_webhook_events | ❌ | ❌ | service-role only | new in 026 |

## Verification

`scripts/security-tests.ps1` — PowerShell `Invoke-WebRequest` probes for
the IDOR / rate-limit regressions. Works against dev or prod:

```pwsh
pwsh ./scripts/security-tests.ps1 -BaseUrl http://localhost:3000
pwsh ./scripts/security-tests.ps1 -BaseUrl https://trustandtrip.com
```

Cross-tenant IDOR check:

```pwsh
pwsh ./scripts/security-tests.ps1 `
  -BaseUrl http://localhost:3000 `
  -UserAJwt "<eyJhbGciOi…access_token of user A>" `
  -UserBBookingId "<uuid of a booking belonging to user B>"
```

User A → 404 on User B's booking.

Type-check:

```pwsh
npx tsc --noEmit
```

Returns 0 with no output as of 2026-05-01.

## Pending operator actions

1. **Apply both migrations in Supabase before the next deploy:**
   ```pwsh
   supabase db push
   ```
   This applies `025_rls_tighten.sql` and `026_payment_race_guards.sql`.
   The new payment route code expects `coupons.claimed_at` and
   `processed_webhook_events`; without them, create-order on a coupon and
   any webhook will 500.

2. **Set `BITRIX24_REVERSE_TOKEN` in production env** if you use the
   Bitrix outbound webhook. Without it the route now returns 503 instead
   of accepting anonymous POSTs.

3. **Run `scripts/security-tests.ps1` against prod after deploy** to
   confirm the IDOR/rate-limit fixes ship.

4. **Optional UX cleanup:** `/refer` public page now requires sign-in
   (server ignores body.email). Form still shows the email input — either
   pre-fill from session or hide when signed out.

## Commit log

| Commit | Title |
|---|---|
| `ca58ce1` | security: fail-closed gates on admin, cron, and webhook routes |
| `0b4d32c` | security: timing-safe compares, PII-masked replays, no stack-leaks |
| `791e1d2` | security: close IDOR + RLS leaks on booking, referral, coupons |
| `ee8b33d` | security: race-condition guards on payment paths |
| `3c12ebd` | security: P2 — Sentry PII scrub, webhook hardening, more rate limits |

## Files added

- `src/lib/cron-auth.ts` — `assertCronAuth()` (Bearer + 503-in-prod)
- `src/lib/timing-safe.ts` — `timingSafeEqualStrings()` (Edge-safe XOR loop)
- `src/lib/require-user.ts` — Bearer → Supabase user, single denial shape
- `src/lib/sentry-scrub.ts` — `scrubEvent()` (Sentry beforeSend)
- `supabase/migrations/025_rls_tighten.sql`
- `supabase/migrations/026_payment_race_guards.sql`
- `scripts/security-tests.ps1`
- `SECURITY_AUDIT.md` (this file)

## Outstanding

Nothing flagged in the original 25-finding audit remains open. New audits
that may be worth running later:

- CSP `'unsafe-inline' https: http:` legacy fallback in `script-src` —
  modern browsers ignore it under `'strict-dynamic'` + nonce, but a CSP
  Level-1-only browser still gets a permissive policy. Tightening means
  giving up support for very old browsers.
- Resend / Bitrix24 / Razorpay webhook **retries idempotency** — only
  Razorpay was audited; Bitrix outbound and any future Resend hooks
  should follow the same `processed_webhook_events` pattern.
- **Admin Basic-Auth password rotation** — currently a single
  `ADMIN_SECRET`; consider per-user accounts for multi-admin teams.
- **Sanity Studio CSP** — `/studio` falls back to `unsafe-inline +
  unsafe-eval`. Acceptable for an admin-only path; reconsider if Studio
  is ever exposed to non-staff.
- **Lead alerts to Slack/Telegram** include customer name + phone +
  email in plaintext. Fine internally; flag if compliance ever demands
  channel-side redaction.
