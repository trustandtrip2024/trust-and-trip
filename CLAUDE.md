# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at localhost:3000
npm run build      # Production build (runs next build)
npm run start      # Start production server
npm run lint       # ESLint via next lint
npx tsc --noEmit   # Type-check without emitting (no test suite exists)
```

There are no automated tests. Validate changes with `npx tsc --noEmit` before committing.

## Architecture Overview

**Next.js 14 App Router** travel agency site. Three content tiers coexist:

1. **Sanity CMS** — canonical source for destinations, packages, and blog posts. All content queries live in `src/lib/sanity-queries.ts`. Every query is wrapped with a Redis cache layer (`cached()` helper, TTL 2–10 min). When Sanity returns an image reference, pass it through `urlFor()` from `src/lib/sanity.ts`; never store raw Sanity image objects.

2. **`src/lib/data.ts`** — static fallback data (destinations, packages, testimonials, experiences, stats). Used when Sanity has no content and directly on pages that don't need CMS flexibility. The `Destination` and `Package` types defined here are the canonical TypeScript interfaces shared with Sanity query mappers.

3. **Supabase** — operational database for everything transactional. Tables: `leads`, `reviews`, `bookings`, `referrals`, `newsletter`. API routes use the service-role client (server only); the anon client in `src/lib/supabase.ts` is client-safe. Database schema lives in `supabase/migrations/`.

## Key Data Flows

**Lead capture:** Any form (contact, package enquiry, trip planner, exit intent) calls `submitLead()` from `src/lib/submit-lead.ts` → `POST /api/leads` → Supabase `leads` table + fire-and-forget Resend emails (notify business + confirm to user) + fire-and-forget Bitrix24 push (`pushLead` from `src/lib/bitrix24.ts`). Lead templates are React Email components in `src/lib/emails/`.

**Payment:** `POST /api/payment/create-order` creates a Razorpay order (30% deposit, min ₹5,000), inserts a `bookings` row with status `created`, and pushes a Deal into Bitrix24 Sales pipeline (`pushBookingAsDeal`). `POST /api/payment/verify` validates the Razorpay HMAC signature, updates status to `verified`, and advances the Bitrix24 Deal to Won (`markDealPaid`).

**Bitrix24 CRM:** `src/lib/bitrix24.ts` wraps a Bitrix24 incoming webhook (env: `BITRIX24_WEBHOOK_URL`). All calls are fire-and-forget — CRM failures never break primary flows. If the webhook env var is absent, the functions silently no-op (same graceful pattern as Resend). Functions: `pushLead`, `pushBookingAsDeal`, `markDealPaid`, `pushNewsletterSubscriber`. Custom field codes (`UF_CRM_*`) at the top of the file must match fields created in the Bitrix24 portal — missing custom fields are silently ignored by Bitrix24.

**Aria chat:** `POST /api/chat` calls Claude Haiku via `@anthropic-ai/sdk`. Rate-limited to 20 msg/IP/min via Redis. The system prompt is hardcoded in the route file.

**Google Reviews:** `src/lib/google-reviews.ts` fetches from Google Places API using `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID`. Falls back to static reviews if env vars are absent. Cached 6 hours via Next.js `fetch` cache.

## Infrastructure & Environment

**Required env vars** (`.env.local`):
- `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` — powers Aria chat
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — payment
- `ADMIN_SECRET` — Basic Auth password for `/admin` and `/api/admin/*`

**Optional env vars** (features degrade gracefully when absent):
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Redis cache + rate limiting; if absent, caching is skipped and rate limiting allows all requests
- `RESEND_API_KEY` — email notifications; silently skipped if absent
- `BITRIX24_WEBHOOK_URL` — Bitrix24 CRM sync for leads, bookings, newsletter. Format: `https://<portal>.bitrix24.in/rest/<userId>/<token>/`. If absent, Bitrix24 functions no-op. Setup docs: `../TAT bitrix/trustandtrip-bitrix-integration/01-setup-webhook.md`.
- `GOOGLE_PLACES_API_KEY` / `GOOGLE_PLACE_ID` — live Google reviews
- `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_PHONE_ID` / `WHATSAPP_VERIFY_TOKEN`

## Admin Panel

Protected by HTTP Basic Auth via `src/middleware.ts`. Matcher covers both `/admin/:path*` and `/api/admin/:path*`. Password = `ADMIN_SECRET` env var; username is ignored. Admin pages: `/admin/leads`, `/admin/reviews`, `/admin/referrals`.

## Caching Architecture

Two-layer cache:
1. **Upstash Redis** (optional) — explicit `cacheGet/cacheSet` in `src/lib/redis.ts`, used by Sanity queries (2–10 min TTL).
2. **Next.js `fetch` cache** — used by Google Reviews route (`revalidate: 21600`).

If Redis is unavailable, Sanity queries hit the CDN directly on every request. This is safe but slower.

## Cookie Consent & Analytics

`CookieConsentProvider` (wraps entire app in `layout.tsx`) gates both GA4 and Meta Pixel. Neither script loads until the user clicks "Accept all". Preference stored in `localStorage` under key `trustandtrip_cookie_consent`. `GoogleAnalytics` and `MetaPixel` components check `consent.analytics` / `consent.marketing` before mounting their `<Script>` tags.

Fire GA4 events via `analytics.*` helpers in `src/lib/analytics.ts`. Fire Meta Pixel events via `pixel.*` helpers exported from `src/components/MetaPixel.tsx`.

## Dynamic Pricing

`src/lib/dynamic-pricing.ts` applies a deterministic price multiplier per package based on current month (peak/off-peak) and a hash of the package slug. Peak months: May, Jun, Oct, Nov, Dec (+12%). Not connected to real inventory — purely cosmetic urgency.

## Styling Conventions

Tailwind with custom tokens defined in `tailwind.config.ts`:
- `bg-cream` / `text-ink` — primary background / text
- `text-gold` / `bg-gold` — accent (warm gold)
- `bg-sand` — secondary background
- `container-custom` — max-width container with responsive padding
- `heading-section` — standard section `<h2>` size
- `eyebrow` — small uppercase label above headings
- `shadow-soft` — standard card shadow
- `animate-marquee` — auto-scrolling horizontal strip (used in testimonials, Google reviews)
- `no-scrollbar` — hide scrollbar on overflow-x containers

## API Route Patterns

Admin routes use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS). Public routes use the anon client or service-role depending on whether they write to protected tables. All admin API routes are protected by middleware — do not add new `/api/admin/*` routes without confirming the middleware matcher covers them.

Rate limiting: call `rateLimit(identifier, { limit, windowSeconds })` from `src/lib/redis.ts`. Returns `{ allowed, remaining }`. Gracefully allows all requests if Redis is unconfigured.
