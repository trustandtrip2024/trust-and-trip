# Trust and Trip — Operator Handbook

**Owner:** Akash Mishra (founder)
**Updated:** 2026-05-02
**Read this when:** onboarding, returning after a break, before a release, or after an incident.

This is the single source of truth for keeping Trust and Trip alive and on-brand. Everything else (`README.md`, `CLAUDE.md`, `SECURITY.md`, `ROLLBACK.md`) is a reference. This is the routine.

---

## 0. Mental model

Three systems run the product:

```
            ┌─────────────────┐
            │  SANITY (CMS)   │  ← canonical content (destinations, packages, blog)
            │  ncxbf32w       │
            └────────┬────────┘
                     │  GROQ + Redis cache (2–10 min TTL)
                     ▼
            ┌─────────────────┐       ┌─────────────────┐
            │  NEXT.JS APP    │ ────► │  SUPABASE       │  ← transactional
            │  (Vercel)       │       │  leads,bookings │
            └────────┬────────┘       └─────────────────┘
                     │
       ┌─────────────┼─────────────┬───────────────┬──────────────┐
       ▼             ▼             ▼               ▼              ▼
   Razorpay      Anthropic      Resend         Bitrix24       Upstash
   (payments)    (Aria chat)    (emails)       (CRM)          (cache+rate)
```

Rule: **never** make Sanity write to Supabase, **never** make Supabase write to Sanity, **never** put Razorpay or Bitrix24 on the client.

---

## 1. Daily / weekly / monthly checklist

### Daily (5 min)
- [ ] Open `/admin/leads` — clear yesterday's leads (assign to planner or close as junk).
- [ ] Open `/admin/bookings` — confirm any new `verified` rows; flag any stuck on `created` over 30 min.
- [ ] Skim `/admin/reviews` — approve or reject pending.
- [ ] Bitrix24 → check yesterday's deals match `/admin/bookings`. Mismatch = sync issue.

### Weekly (30 min)
- [ ] **Upstash verify** — log into Upstash dashboard, check token age. If rotated since last week, re-paste into Vercel env (rate limits silently fail-open otherwise — see memory `project_upstash_creds_drift.md`).
- [ ] **Health probe** — `curl https://trustandtrip.com/api/health`. All five services should be `ok`.
- [ ] Skim Sentry — top 5 errors of the week, fix or silence.
- [ ] `npm outdated` — note any major version jumps for monthly review.
- [ ] Run `npx tsc --noEmit` — type-check passes (no test suite).

### Monthly (2 hr)
- [ ] **Supabase backup verify** — confirm PITR (point-in-time recovery) is on. Test restore on a dev project from a 7-day-old snapshot.
- [ ] **Sanity export** — `npx sanity dataset export production sanity-backups/$(date +%Y-%m-%d).tar.gz`. Store in private cloud (GDrive Trust and Trip / backups).
- [ ] **Dependency review** — `npm outdated`, bump patch + minor versions only. Major versions → schedule a separate window.
- [ ] **Lighthouse re-run** — `npm run build && npx lighthouse https://trustandtrip.com --output html --output-path lighthouse-$(date +%Y-%m-%d).html`. Compare to `lighthouse-report.report.html` baseline. Investigate any score drop > 5.
- [ ] **Brand audit** — grep `src/` for raw hex `#[0-9a-fA-F]{6}` outside `tailwind.config.ts` and `brand-colors.ts`. Should return nothing.
- [ ] **Content audit** — run `node scripts/audit-content.js` (if not present, see Phase 3 todo).

---

## 2. Database protection (Supabase)

### Service-role vs anon
- **`SUPABASE_SERVICE_ROLE_KEY`** — server only. Lives in `.env.local` and Vercel env. Never put in a `NEXT_PUBLIC_*` var. Never import into a `"use client"` file.
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — client-safe. Read-only on RLS-protected tables.
- The only file that should `import { createClient }` for server-side use is `src/lib/supabase-server.ts`. The only one for client is `src/lib/supabase.ts`.

### Row Level Security
RLS is on for every operational table. Migrations `023_rls_hardening.sql` and `025_rls_tighten.sql` are the canonical state.

Rules:
- `bookings`, `itineraries`, `push_subscriptions` → anon **denied**.
- `coupons`, `referrals` → anon **denied** (read goes through API route with service role).
- `reviews` → anon read **allowed** when `status = 'approved'`.
- `leads` → anon **denied** (writes through `/api/leads` only).
- `newsletter` → anon **denied**.

If you add a new table:
1. Write migration in `supabase/migrations/<n>_<name>.sql`.
2. Enable RLS: `ALTER TABLE x ENABLE ROW LEVEL SECURITY;`.
3. Add explicit policy. Default = deny.
4. Document it here.

### Backups
Supabase paid plan has PITR (7 days free, longer on Pro). To restore:
1. Supabase dashboard → Project → Database → Backups.
2. Pick recovery point.
3. Confirm restore (creates new project; promote when ready).
4. Update `SUPABASE_URL`/keys in Vercel env. Redeploy.

**Manual export every Sunday** (script TBD in `scripts/backup-supabase.sh`):
```bash
pg_dump "$SUPABASE_DB_URL" -F c -f "supabase-$(date +%Y-%m-%d).dump"
```
Store in private GDrive `Trust and Trip / backups / supabase`. Keep last 12 weeks.

### PII handling
- Email, phone, name in `leads`, `bookings`, `referrals`, `newsletter`, `creator_applications`.
- **Never** log PII to Sentry — `sentry-scrub.ts` already redacts `email`, `phone`, `Authorization`, `Cookie`, `x-razorpay-signature`. Don't add new PII keys without adding scrubs.
- DSAR (data subject access request) flow: founder runs `select * from leads where email = $1`, exports to user, then `delete from leads where email = $1`. Same for `bookings`.

### Migrations discipline
- Migrations in `supabase/migrations/` are append-only.
- Never edit a migration after it's applied to production. Write a new one.
- Test on a Supabase branch first (Supabase dashboard → Branches).

---

## 3. Sanity guidelines

Project: `ncxbf32w`. Dataset: `production`. Studio: `/studio` route, gated by Basic Auth via middleware.

### When to edit Studio vs code

| Change | Where |
| --- | --- |
| Destination price, blurb, image | Sanity Studio |
| Package itinerary, hotel, inclusions | Sanity Studio |
| New package field (e.g., `carbonOffset`) | Code (schema in `src/sanity/schemaTypes/packageType.ts`) → query in `src/lib/sanity-queries.ts` → render in component |
| Blog post | Sanity Studio |
| Homepage shelf order | Sanity Studio (homepageContent type) |
| Press logo | Sanity Studio (partnerLogo type) |
| Brand color, typography token | Code only (`tailwind.config.ts`) |

### Tokens
- `SANITY_API_READ_TOKEN` — used by ISR + cache layer (`src/lib/sanity.ts`).
- `SANITY_API_WRITE_TOKEN` — used by build scripts only. Never invoked at runtime.
- `SANITY_REVALIDATE_SECRET` — when set, Sanity webhook hits `/api/revalidate` to bust ISR cache on publish. Currently empty; setting it is a quick win.

### Image specs (for every Sanity upload)

| Field | Min size | Format | Max KB |
| --- | --- | --- | --- |
| Hero image (destination, package detail) | 1920×1080 | JPG/WebP, sRGB | 400 KB |
| Card image (listing) | 800×600 | JPG/WebP | 150 KB |
| Gallery (destination/package) | 1600×1067 | JPG/WebP | 300 KB |
| Author avatar (blog) | 200×200 | JPG/WebP | 40 KB |
| Press logo | 320×120 transparent | PNG/SVG | 30 KB |

**Always** fill the `alt` field. Empty alt = WCAG fail.

Sanity URL transforms (apply on read, never store transformed URL):
```ts
urlFor(image).width(1600).height(1067).quality(75).auto('format').url()
```

### Editorial workflow
1. Founder drafts content in Studio.
2. Use Sanity's draft + publish flow (don't publish dirty drafts).
3. After publish, ISR revalidates within 2–10 min (Redis TTL).
4. Hard refresh: hit `/api/revalidate?secret=$SANITY_REVALIDATE_SECRET&path=/packages/[slug]`.

### Adding a new schema type
1. Define in `src/sanity/schemaTypes/<name>Type.ts`.
2. Register in `src/sanity/schemaTypes/index.ts`.
3. Add GROQ query in `src/lib/sanity-queries.ts` wrapped with `cached()`.
4. Add TypeScript type matching the GROQ projection.
5. Use the query in a route or component.
6. Deploy: `npx sanity deploy` (Studio), `git push` (app).

---

## 4. Tech maintenance

### Env var sync
- **Source of truth:** `.env.local` (local dev).
- **Production:** Vercel project → Settings → Environment Variables.
- After any rotation: update Vercel **first**, then redeploy, then update local.
- Lockfile: only `package-lock.json`. `pnpm-lock.yaml` removed (Phase 2a).

### Required env (system breaks if missing)
- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `ADMIN_SECRET`

### Optional env (graceful degrade)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — caching + rate limit
- `RESEND_API_KEY`, `RESEND_FROM` — emails
- `BITRIX24_WEBHOOK_URL` — CRM
- `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` — live reviews
- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_VERIFY_TOKEN`
- `SANITY_REVALIDATE_SECRET`
- `SENTRY_DSN`

### Deployment
- `git push origin main` → Vercel auto-deploys to production.
- Preview deploys for branches.
- Always run `npx tsc --noEmit && npm run build` locally before push.
- Rollback: Vercel dashboard → Deployments → pick last good → Promote to Production. (Or follow `ROLLBACK.md`.)

### Dependency policy
- Patch + minor versions monthly.
- Majors only with a dedicated window and `tsc --noEmit + npm run build` + manual smoke test of: home, package detail, /admin, payment flow.
- Deprecated/abandoned: never use without justification. Currently clean.

---

## 5. Brand rules (non-negotiable)

### Tokens
Defined in `tailwind.config.ts`. Use these — nothing else.

| Token | Hex | Use |
| --- | --- | --- |
| `tat-teal` | `#0E7C7B` | primary brand |
| `tat-teal-deep` | `#094948` | hover, dark surfaces |
| `tat-teal-mist` | `#B5D4D4` | highlights |
| `tat-cream` | `#F5E6D3` | canvas, hero base |
| `tat-cream-warm` | `#EFD9BD` | secondary canvas |
| `tat-paper` | `#FBF7F1` | card background |
| `tat-gold` | `#C8932A` | price tags, accents |
| `tat-orange` | `#E87B3D` | urgency, flash deals |
| `tat-orange-soft` | `#F4A876` | softer urgency |
| `tat-charcoal` | `#2A2A2A` | body text |
| `tat-slate` | `#6B7280` | meta text |

### Type
- **Display / serif:** Fraunces (`var(--font-display)`)
- **Body / sans:** Inter (`var(--font-sans)`)
- No third family. Ever.
- Mobile floor: **12px**. Anything below fails review.

### Imagery
- Aspect ratios: 16:9 hero, 4:3 card, 3:2 gallery, 1:1 avatar.
- Photos: warm, golden hour, human in frame for emotional shelves; clean architectural for destination heros.
- Never use Unsplash on a production page after the brand asset migration completes (Phase 3).

### Copy voice
- "We" not "I". Founder note is the one exception.
- "Crafted journeys", "handpicked", "honest pricing" — keep.
- Avoid: "best", "cheapest", "guaranteed" (legal).
- Numbers must be verifiable. No "1000+ happy customers" without a source field.

---

## 6. Media specs (operational table)

| Asset | Path / Source | Size | Format | Max KB |
| --- | --- | --- | --- | --- |
| Hero (destination) | Sanity → destination.heroImage | 1920×1080 | WebP | 400 |
| Card (destination listing) | Sanity → destination.image | 800×600 | WebP | 150 |
| Hero (package detail) | Sanity → package.heroImage | 1920×1080 | WebP | 400 |
| Card (package listing) | Sanity → package.image | 800×600 | WebP | 150 |
| Gallery slot | Sanity → gallery[] | 1600×1067 | WebP | 300 |
| Blog cover | Sanity → blogPost.image | 1600×900 | WebP | 250 |
| Author avatar | Sanity → blogPost.author.image | 200×200 | WebP | 40 |
| Press logo | Sanity → partnerLogo.image | 320×120 | PNG/SVG transparent | 30 |
| OG / share image | `public/og/` | 1200×630 | PNG | 200 |
| Favicon | `public/` | 512×512 | PNG | 50 |

Conversion: use [squoosh.app](https://squoosh.app) or `cwebp`. Always strip EXIF.

Always pass through `next/image`. Never use raw `<img>` for above-fold imagery (currently violated in `GoogleReviewsSection.tsx`).

---

## 7. Content specs (per record)

### Destination — must have
- `name`, `slug`, `country`, `region`
- `tagline` (≤ 12 words)
- `image` (card), `heroImage` (1920×1080)
- `gallery[]` ≥ 6 photos
- `priceFrom` (INR)
- `bestTimeToVisit` (months)
- `idealDuration` (e.g., "5–7 days")
- `highlights[]` ≥ 5
- `thingsToDo[]` ≥ 6
- `whisper` (insider tip, 1 line)

### Package — must have
- `title`, `slug`, `destination` ref
- `price` + `priceBreakdown` (doubleSharing, singleSupplement, tripleSharing, childWithBed, childWithoutBed)
- `duration`, `nights`, `days` (consistent — `days = nights + 1`)
- `travelType` (honeymoon / family / adventure / pilgrimage / group)
- `heroImage` + `image` + `gallery[]` ≥ 5
- `description` (≥ 80 words)
- `highlights[]` ≥ 5
- `inclusions[]`, `exclusions[]`
- `itinerary[]` length must equal `days`
- `hotel` (object: name, rating, type)
- `activities[]`
- `faqs[]` ≥ 5
- `bestMonths[]`
- `priceBreakdown`, `departures[]`, `bookedThisMonth` for urgency components

### Blog post — must have
- `title`, `slug`, `category`, `excerpt` (≤ 240 chars)
- `image`, `author` (with image), `date`, `readTime`
- `content` (Sanity blocks)
- `tags[]`

---

## 8. Incident playbook

### Site down
1. Vercel dashboard → recent deploys. Last green? Promote.
2. `curl /api/health` — which service is failing?
3. If Sanity: status.sanity.io. Frontend will fall back to `data.ts` for destinations/packages.
4. If Supabase: status.supabase.com. Forms fail; show banner.
5. If unknown: Sentry → top error of last 30 min.

### Payment failing
1. Razorpay dashboard → recent transactions.
2. `/api/payment/verify` logs in Vercel.
3. HMAC mismatch → check `RAZORPAY_KEY_SECRET` env in Vercel matches the dashboard key.
4. Webhook missed → Razorpay dashboard → Webhooks → re-deliver.
5. Manually advance booking: `update bookings set status='verified' where order_id=$1` after confirming in Razorpay dashboard. Then push deal to Bitrix24 manually.

### Bitrix24 sync down
- Non-blocking by design. Lead/booking still works.
- Backlog accumulates in Supabase but not in Bitrix.
- Replay endpoint: `POST /api/admin/replay` (Basic Auth). Specify lead/booking ID, it pushes to Bitrix24.
- See `../TAT bitrix/trustandtrip-bitrix-integration/` for setup docs.

### Sanity down
- Cached content serves from Redis (2–10 min).
- After cache expires, `data.ts` fallback covers core destinations + packages.
- Studio inaccessible: founder can't publish. Wait it out.

### Redis (Upstash) stale or down
- Rate limits silently fail-open (allowed = true).
- Caching skipped, Sanity hit on every request (slower, costlier).
- Fix: log into Upstash → DB → reset token → paste into Vercel env → redeploy.

### Aria chat down
- Anthropic API status: status.anthropic.com.
- Chat widget shows fallback message ("our team is offline, leave WhatsApp number").
- No user-facing error.

### Email (Resend) silently not sending
- Check `RESEND_API_KEY` set in Vercel.
- Resend dashboard → recent sends. If 0, key invalid.
- Lead capture still works (Bitrix push + DB insert). Only notification email broken.

### Spam flood on forms
- Phase 2d adds honeypot + Zod. If still flooded:
  - Tighten rate limit on `/api/leads` from 5/min/IP to 3/min/IP.
  - Add Cloudflare Turnstile (free, GDPR-friendly) to `LeadForm`.
  - Quarantine leads where honeypot field non-empty (already silent-drop in handler).

---

## 9. Settings best practices

### Vercel
- Production branch = `main`.
- Preview deploys on every PR.
- Env vars scoped: most "All Environments". Razorpay live keys = production only.
- Cron jobs configured in `vercel.json` (review monthly).

### Supabase
- One project, one production DB. No staging right now (acceptable for stage of business; revisit at 100 bookings/month).
- RLS on every table.
- Service role key = single global secret. Rotate yearly or on suspected leak.
- Backups: PITR enabled. Monthly manual export to GDrive.

### Sanity
- One dataset (`production`). No `development` dataset (small team, low-risk content).
- API CDN enabled (cheaper, CDN-cached).
- Read token + Write token separated. Write token only at build time — currently both available, so be deliberate.
- Studio access via Basic Auth on `/studio` (middleware).

### Razorpay
- Capture mode: automatic.
- Webhook URL: `https://trustandtrip.com/api/payment/webhook`.
- Webhook secret in `RAZORPAY_WEBHOOK_SECRET`.
- Subscriptions / recurring: not used.

### Anthropic (Aria)
- Model: Claude Haiku (cheapest, sufficient for chat).
- System prompt hardcoded in `/api/chat/route.ts`. Edit there, not in env.
- Rate limit: 20 msg/IP/min.
- Cost ceiling: monitor spend monthly. Cut off if > ₹2,000/month without a corresponding lead lift.

### Sentry
- Project: trust-and-trip.
- Quota: free tier (5K errors/month). If we exceed, fix the noisiest error first.
- PII scrubbing: see `src/lib/sentry-scrub.ts`. Add new scrub keys on every PII field migration.

### Bitrix24
- Webhook URL stored in `BITRIX24_WEBHOOK_URL`.
- Custom field codes (`UF_CRM_*`) at top of `src/lib/bitrix24.ts` must match portal exactly. Mismatch = silent ignore.
- 18 custom fields currently configured. See memory `reference_bitrix24.md`.

### Upstash
- One Redis DB.
- Used for: Sanity cache, rate limits, Aria session memory.
- Token rotation: checked weekly (see Section 1). Stale token = silent rate-limit failure.

### Cookie consent
- Default state: nothing fires until user clicks "Accept all".
- GA4, Meta Pixel both gated by `consent.analytics` / `consent.marketing` flags.
- Consent stored in `localStorage` under `trustandtrip_cookie_consent`.

---

## 10. Rotation routine

| What | When | Who |
| --- | --- | --- |
| `ADMIN_SECRET` | Every 90 days | Founder |
| Supabase `service_role_key` | Yearly or on leak | Founder |
| Sanity `WRITE_TOKEN` | Yearly | Founder |
| Razorpay keys | When required by Razorpay | Founder |
| Anthropic key | Yearly | Founder |
| Resend key | Yearly | Founder |
| Bitrix24 webhook | When team changes | Founder |
| Upstash token | When auto-rotated by dashboard | Founder (manual re-paste) |
| WhatsApp tokens | Per Meta policy (60 days) | Founder |

After every rotation: update Vercel env first, redeploy, smoke test, then update `.env.local`.

---

## 11. Where to look for what

| Need | File |
| --- | --- |
| Tailwind tokens | `tailwind.config.ts` |
| Brand colors for non-Tailwind | `src/lib/brand-colors.ts` |
| Content fallback | `src/lib/data.ts`, `src/lib/data-extra.ts` |
| Sanity queries | `src/lib/sanity-queries.ts` |
| Sanity schemas | `src/sanity/schemaTypes/` |
| Supabase migrations | `supabase/migrations/` |
| API routes | `src/app/api/` |
| Admin pages | `src/app/admin/` |
| Lead submission | `src/lib/submit-lead.ts` → `/api/leads` |
| Bitrix24 wrapper | `src/lib/bitrix24.ts` |
| Sentry scrubbing | `src/lib/sentry-scrub.ts` |
| Email templates | `src/lib/emails/` |
| Auth (admin) | `src/middleware.ts` |
| Aria chat | `src/components/AriaChatWidget.tsx`, `/api/chat/route.ts` |
| Image gallery defaults | `src/lib/gallery-images.ts` |
| Dynamic pricing | `src/lib/dynamic-pricing.ts` |
| Type definitions | `src/lib/data.ts` (`Destination`, `Package`) |

---

## 12. The "do not" list

- Do not commit `.env.local`.
- Do not put `SUPABASE_SERVICE_ROLE_KEY` in a `NEXT_PUBLIC_*` var.
- Do not import server-only modules into `"use client"` files.
- Do not edit a Supabase migration after it has run in production. Write a new migration.
- Do not store transformed Sanity image URLs (always run through `urlFor()`).
- Do not skip Husky pre-commit hooks (`--no-verify`).
- Do not push directly to `main` without a local build.
- Do not delete a lead row from `/admin`. Mark it junk via status field. Audit trail matters.
- Do not change a brand token without grepping every component first.
- Do not publish a Sanity package missing `priceBreakdown`, `gallery[]`, or `faqs[]`. (Add a publish-time validator, see Phase 3 todo.)

---

## 13. Glossary

- **PII** — personally identifiable info. Email, phone, name, address.
- **PITR** — point-in-time recovery (Supabase feature).
- **RLS** — row-level security (Postgres feature, enforced by Supabase).
- **GROQ** — Sanity's query language.
- **ISR** — incremental static regeneration (Next.js).
- **HMAC** — message signature, used to verify Razorpay payment authenticity.
- **TTL** — time-to-live, used for cache expiry.
- **OG image** — Open Graph share image (when link is pasted into WhatsApp / FB / etc.).
- **DSAR** — data subject access request (GDPR-style request to access or delete personal data).

---

End of handbook. Update this file before changing routine. The handbook is the law — code that violates the handbook is wrong, even if it works.
