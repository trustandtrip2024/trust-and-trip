# Trust and Trip — Director Audit

**Date:** 2026-05-02
**Branch:** main · last commit `d90ddb6`
**Author:** Internal review

This is a snapshot of where the product stands today, what is shipped well, and what blocks scale. Read alongside `OPERATOR_HANDBOOK.md` (how to maintain it) and `CONTENT_MEDIA_TODO.md` (what to put into Sanity).

---

## 1. State of the system

| Surface | Count |
| --- | --- |
| App Router routes | 78 |
| React components | ~150 |
| Sanity schema types | 11 |
| API endpoints | 62 |
| Supabase tables | 9 (leads, bookings, reviews, referrals, newsletter, creator_applications, coupons, itineraries, push_subscriptions) |
| Static destinations | 36 (6 base + 30 in `data-extra.ts`) |
| Static packages | ~155 (5 base + 150 extras) |
| Lighthouse run on file | `lighthouse-report.report.json` (2026-04-25) |

**Three content tiers** are live and isolated correctly:
1. **Sanity** — destinations, packages, blog, homepage shelves, offer banners (canonical)
2. **`src/lib/data.ts`** — fallback content + extras (no CMS roundtrip, fast)
3. **Supabase** — transactional only (leads, bookings, reviews, referrals)

**Stack snapshot:** Next.js 14.2.31 (App Router), React 18.3, TypeScript 5.5, Sanity 3.99, Supabase JS 2.104, Razorpay 2.9, Anthropic SDK 0.91 (Aria chat), Resend 6.12, Sentry 10.50, Tailwind 3.4, Framer Motion 11.3, Embla, Zustand 4.5, React Email, React-PDF.

---

## 2. What is solid

- **Data isolation** — service-role key only on server, anon key client-side, RLS hardened in `023_rls_hardening.sql` and `025_rls_tighten.sql`.
- **Payments** — Razorpay amount fetched from Sanity (not request body), HMAC verified with `timingSafeEqualStrings()`, race condition guarded by atomic UPDATE on `status IN ('created','pending')` and unique coupon index.
- **Admin protection** — Basic Auth in `src/middleware.ts` covers `/admin/*` and `/api/admin/*`, timing-safe compare, fails closed if `ADMIN_SECRET` missing.
- **Rate limiting** — 23 routes call `rateLimit()`. /api/leads 5/min, /api/payment 10/min, /api/chat 20/min.
- **Sentry** — server + edge configs present, PII scrubbed (`sentry-scrub.ts`).
- **Brand tokens** — `tailwind.config.ts` is locked (2026-04-29). Grep across `src/` shows every raw hex maps to a token (teal, cream, gold, orange, charcoal). No drift.
- **Typography** — fluid clamps, two-family system (Fraunces display + Inter body), self-hosted via `next/font`.
- **SEO** — `generateMetadata()` on every dynamic route, JSON-LD on package + destination pages, `robots.ts` + `sitemap.ts` correct.
- **Graceful degradation** — Redis, Resend, Bitrix24, Google Reviews all silently no-op when env absent.

---

## 3. P1 blockers (fix before next push)

### 3.1 Pricing opacity
- Only `maldives-5n6d-overwater` (`src/lib/data.ts:391`) carries `priceBreakdown`. Other 5 base packages list aggregate price only.
- Customer cannot tell if `₹55,000` is per person or per couple. Quote calls take longer; bounce on price page.
- **Fix:** populate `priceBreakdown` with `doubleSharing`, `singleSupplement`, `tripleSharing`, `childWithBed`, `childWithoutBed` for bali, switzerland, santorini, dubai, kerala. (Phase 2e.)

### 3.2 Trust stat unsourced
- Homepage stats array (`src/lib/data.ts:940`) shows `15K+ Travelers`. No Supabase or Sanity source.
- Risk: investor or partner asks for proof, founder cannot produce it.
- **Fix:** either back with `count(*)` from `bookings` (where status = 'verified') or restate as truthful number. (Phase 2c.)

### 3.3 Forms have zero anti-spam
- `LeadForm`, `CallbackForm`, `ReviewForm` — no honeypot, no captcha, no client debounce.
- Bot submissions hit Supabase + Bitrix24 + Resend. Pollutes lead pipeline and burns email quota.
- **Fix:** hidden honeypot field + Zod schema in `/api/leads` and `/api/reviews`. (Phase 2d.)

### 3.4 Mobile typography unreadable
- `AriaChatWidget.tsx:490` AI badge `text-[9px]`.
- `ReviewForm.tsx:76` and `CallbackForm.tsx:90` form labels at `text-[10px]`/`text-[11px]` with no breakpoint.
- Fails WCAG AA on small phones.
- **Fix:** lift to `text-[11px] sm:text-xs` floor. (Phase 2b.)

### 3.5 Hero CTA hidden on mobile
- `src/components/home-v3/Hero.tsx:102` form is `hidden md:block`. Mobile sees the headline but no enquiry box.
- Mobile traffic share = majority. This is the single biggest conversion leak.
- **Fix:** keep form on mobile, compact variant. (Phase 2b same edit batch.)

---

## 4. P2 issues

| # | Issue | Where | Note |
| --- | --- | --- | --- |
| 4.1 | Lockfile drift | `package-lock.json` + `pnpm-lock.yaml` both present | Vercel may pick wrong manager. Delete pnpm. (Phase 2a.) |
| 4.2 | No Zod on API routes | `src/app/api/**` | Manual `body.x?.trim()` will throw on non-string. |
| 4.3 | Bitrix24 no retry | `src/lib/bitrix24.ts` | Single-shot fire-and-forget; orphaned deals on transient 5xx. |
| 4.4 | Sanity phase-2/3 fields stale | `packageType` schema | `whyThisPackage`, `hotels`, `faqs`, `packingList`, `departures`, `priceBreakdown`, `bestMonths`, `groupSize`, `mapCoords` defined but not all queried. |
| 4.5 | `bookedThisMonth` always empty | `src/lib/data.ts:69` type defined; never populated | Falls back to `stats.enquiredCount` masking missing data. |
| 4.6 | `gallery[]` missing on packages | base 6 packages | Falls back to destination gallery — not curated per package. |
| 4.7 | `departures[]` missing | All packages | `limitedSlots: true` shown without slot count or date. False urgency. |
| 4.8 | `AriaChatWidget` is heavy client component | ~600 lines, `"use client"` | Should be `dynamic(..., { ssr: false })` like other below-fold widgets. |
| 4.9 | Sanity URLs lack transform params | Image fields read as raw `cdn.sanity.io/...` | No `?w=&q=` — Next/Image fetches full res. |
| 4.10 | Reviews page client-side anon read | `src/app/reviews/page.tsx:48` | Read-only, safe, but inconsistent with rest of repo. |

---

## 5. P3 polish

- 9px / 10px labels exist on multiple forms (see 3.4).
- `ExitIntentPopup.tsx:164` — `inset-x-4` on 320px phones leaves only 288px popup width; text wraps aggressively.
- `Footer.tsx:196` newsletter input lacks mobile min-width.
- `RecognitionStrip.tsx` Unsplash URLs without `quality=70` parameter.
- `GoogleReviewsSection.tsx` uses raw `<img>` tag, not Next/Image.
- 110 `"use client"` files of ~400. Several below-fold widgets that should be dynamic-imported.

---

## 6. Sanity schema vs queries

`packageType` defines fields that `src/lib/sanity-queries.ts` never selects:

| Field | Used? | Action |
| --- | --- | --- |
| `whyThisPackage` | ❌ | Wire to `PackageWhyThis` component |
| `comparePrice` | ❌ | Wire to `PackageVsAggregator` |
| `bestFor` | ❌ | Surface on hero ribbon |
| `hotels[]` | ❌ | Wire to `PackageHotels` |
| `faqs[]` | ❌ | Wire to `PackageFaqs` (currently hardcoded) |
| `youtubeUrl` | ❌ | Wire to `PackageVideo` |
| `departures[]` | ❌ | Wire to `DeparturesGrid` |
| `priceBreakdown` | ❌ | Wire to `PriceBreakdown` |
| `bestMonths` | ❌ | Wire to `BestMonthsStrip` |
| `packingList[]` | ❌ | Wire to `PackingList` |
| `mapCoords` | ❌ | Wire to `PackageMap` |
| `brochureFile` | ❌ | Wire to `/api/brochure/[slug]` |

The components exist. The schema fields exist. The queries are the missing link.

---

## 7. Operational risks

1. **No restore runbook.** Supabase PITR is on the paid plan but no documented procedure to restore. Sanity exports never run.
2. **Upstash creds drift.** Documented in memory (2026-05-01): rate limits silently fail-open when token rotates. Need a weekly verify ping.
3. **WhatsApp env vars missing in Vercel.** Code complete; 4 Meta keys never set in production. WhatsApp inbound webhook dead.
4. **Resend not connected.** `RESEND_API_KEY` empty in `.env.local`. Lead notification emails do not send.
5. **Instagram API not connected.** Creator audience verification cannot run.
6. **No staging Supabase.** Production DB is the only DB. Migrations test in prod.

---

## 8. Content debt (handed to founder)

This is what only the founder can fill in via Sanity Studio. Detailed list in `CONTENT_MEDIA_TODO.md`:

- Hero & gallery imagery for 6 base destinations (currently Unsplash URLs).
- Per-package gallery (currently inherits destination gallery).
- Real `departures[]` and `bookedThisMonth` numbers.
- Phase-2 / phase-3 schema fields for top 10 packages (faqs, hotels, packingList, etc.).
- Press logos and pressQuotes (schema exists, content thin).
- UGC posts (schema exists, no content).

---

## 8a. Action items — P1

These mirror Section 3. Drives `/admin/roadmap` cards.

- [x] P1.1 Pricing opacity — populate `priceBreakdown` for bali, switzerland, santorini, dubai, kerala, maldives base packages (`src/lib/data.ts`)
- [x] P1.2 Replace unsourced "15K+" stat in `src/lib/data.ts:940` with defensible number
- [x] P1.3 Add honeypot + Zod-equivalent validation to `LeadForm`, `CallbackForm`, `ReviewForm` and `/api/leads`, `/api/reviews`
- [x] P1.4 Lift mobile typography ≥ 11px on `AriaChatWidget`, `CallbackForm`, `ReviewForm`
- [x] P1.5 Add mobile-only CTA to homepage hero (form is desktop-only)

## 8b. Action items — P2

- [x] P2.1 Delete `pnpm-lock.yaml` (lockfile drift)
- [ ] P2.2 Adopt Zod across all `/api/*` routes (replace manual `body.x?.trim()` checks)
- [ ] P2.3 Add Bitrix24 retry with exponential backoff in `src/lib/bitrix24.ts`
- [ ] P2.4 Wire phase-2/3 Sanity package fields into `sanity-queries.ts` (whyThisPackage, hotels, faqs, packingList, departures, priceBreakdown, bestMonths, groupSize, mapCoords, brochureFile, youtubeUrl)
- [ ] P2.5 Move `AriaChatWidget` to `dynamic(..., { ssr: false })` import
- [ ] P2.6 Add Sanity image transform params (`?w=&q=&auto=format`) to all package + destination image reads
- [ ] P2.7 Resolve hero video Sanity flow — add `defaultMuted`, `type="video/mp4"`, `preload="auto"` to `Hero.tsx`
- [ ] P2.8 Migrate `src/app/reviews/page.tsx` from anon-key client read to `/api/reviews` server route

## 8c. Action items — P3

- [ ] P3.1 Replace raw `<img>` with `next/image` in `GoogleReviewsSection.tsx`
- [ ] P3.2 Add `quality=70` parameter to Unsplash URLs in `RecognitionStrip.tsx`
- [ ] P3.3 Fix `ExitIntentPopup.tsx` mobile width (`inset-x-4` cramps 320px phones)
- [ ] P3.4 Add mobile min-width on Footer newsletter input (`Footer.tsx:196`)
- [ ] P3.5 Audit 110 `"use client"` files — promote below-fold widgets to `dynamic(..., { ssr: false })`

## 9. What "best result" means going forward

Three guard rails kept in `OPERATOR_HANDBOOK.md`:

1. **Brand discipline** — only the 6 brand tokens (teal, cream, gold, orange, charcoal, paper). No raw hex outside `tailwind.config.ts` and `brand-colors.ts`.
2. **Content discipline** — every package needs gallery, faqs, departures, priceBreakdown before publish. Every destination needs hero + 6+ gallery images. No Unsplash on production after migration.
3. **Data discipline** — Supabase service-role key only on server. Sanity write token only at build time. Admin Basic Auth is the only gate; if `ADMIN_SECRET` rotates, Vercel env must update first.

---
