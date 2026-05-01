# Content & Media TODO — Founder-driven

**Date:** 2026-05-02
**Owner:** Akash (founder)
**Done in:** Sanity Studio (`/studio`) and Vercel env panel
**Tracks:** `DIRECTOR_AUDIT.md` Sections 6 + 8

This is the work that requires brand judgement and original content — engineering can prep the rails, only the founder can fill them in. Tick items as completed.

---

## Priority 1 — Trust + conversion blockers

### 1.1 Replace Unsplash hero imagery (6 base destinations)
For each, upload **one hero (1920×1080 WebP, ≤ 400 KB)** to the destination doc in Sanity:

- [ ] Bali → currently `images.unsplash.com/photo-1518548419970...`
- [ ] Maldives → currently `images.unsplash.com/photo-1573843981267...`
- [ ] Switzerland → currently `images.unsplash.com/photo-1530122037265...`
- [ ] Santorini → currently `images.unsplash.com/photo-1613395877344...`
- [ ] Dubai → currently `images.unsplash.com/photo-1546412414...`
- [ ] Kerala → currently `images.unsplash.com/photo-1580889272861...`

Source: customer trip albums (with permission), founder's own photo library, or licensed stock from Twenty20 / Stocksy. Avoid Unsplash on production — too generic.

### 1.2 Per-package gallery (top 6 packages)
Currently galleries fall back to destination galleries. Upload **6 photos each (1600×1067 WebP, ≤ 300 KB)** to the package doc:

- [ ] `bali-4n5d-honeymoon`
- [ ] `maldives-5n6d-overwater`
- [ ] `switzerland-7n8d-alps`
- [ ] `santorini-5n6d-caldera`
- [ ] `dubai-4n5d-skyline`
- [ ] `kerala-6n7d-backwaters`

Mix: 1 hero, 2 hotel/villa, 2 activity, 1 food/sunset frame. Always set the alt text.

### 1.3 Real `departures[]` for top 6
Schema already defined. For each package, add 4–8 upcoming departure batches in Sanity:

- date (e.g., "2026-06-12")
- batchLabel (e.g., "June Honeymoon batch")
- slotsLeft (real number — drives urgency)
- priceOverride (optional, for peak/off-peak variance)

This kills the false `limitedSlots: true` flag without supporting data.

### 1.4 `bookedThisMonth` real numbers
Sanity field exists but is empty. Update once per week (Monday) for the 6 base packages with the actual count of bookings created in the prior 30 days. Pull from `/admin/bookings`.

---

## Priority 2 — Wire phase-2/3 schema fields

These fields exist in Sanity schema but are **not queried** in `src/lib/sanity-queries.ts`. Engineering will wire the queries; founder fills the content.

| Field | Component | Min content per package |
| --- | --- | --- |
| `whyThisPackage` | `PackageWhyThis` | 3 short reasons (≤ 18 words each) |
| `comparePrice` | `PackageVsAggregator` | 2 competitor refs (MMT / Yatra typical) |
| `bestFor` | hero ribbon | 1 sentence (e.g., "Couples chasing sunsets, not crowds") |
| `hotels[]` | `PackageHotels` | per night: hotel name, category, image, 1-line note |
| `faqs[]` | `PackageFaqs` | 5 FAQs minimum |
| `youtubeUrl` | `PackageVideo` | 1 video per package (where available) |
| `bestMonths` | `BestMonthsStrip` | 4–8 month entries with peak/off-peak flag |
| `packingList[]` | `PackingList` | 6 categories × ~5 items each |
| `mapCoords` | `PackageMap` | lat/long for each city stop |
| `brochureFile` | `/api/brochure/[slug]` | 1 PDF per package (optional but lifts trust) |

Founder fills top 10 packages first (the top 6 destinations + 4 from `data-extra.ts` based on traffic).

---

## Priority 3 — Trust + recognition

### 3.1 Press logos
`partnerLogo` schema exists. Upload 6+ logos (320×120, transparent PNG, ≤ 30 KB each):

- [ ] Times of India travel
- [ ] Outlook Traveller
- [ ] Lonely Planet India
- [ ] Conde Nast Traveller India
- [ ] Travel + Leisure India
- [ ] Forbes India

### 3.2 Press quotes
`pressQuote` schema exists. Upload 3–5 quotes from real coverage with publication name + date.

### 3.3 UGC posts
`ugcPost` schema exists, no content yet. Upload 12+ approved customer photos with captions (city/date/package). Drives "real travelers" social proof.

### 3.4 Founder's note
Already wired (`/about` and `homepage-v2/FounderNote`). Refresh once per quarter with a current-season message.

---

## Priority 4 — Blog refresh

Currently 8 fallback posts in `data.ts`. Sanity is canonical. Target cadence: **2 new posts/month**.

- [ ] May 2026 — "Bali in monsoon: who it suits, who it doesn't"
- [ ] May 2026 — "Char Dham Yatra 2026 — what's changed since 2024"
- [ ] Jun 2026 — TBD
- [ ] Jun 2026 — TBD

Each post: 1600×900 cover, 800-1500 words, 3-5 internal links, 1 CTA (package or destination).

---

## Priority 5 — Operational env vars (Vercel panel)

These env vars exist in `.env.local` (or are documented in CLAUDE.md) but are **empty in production**. Set them so features stop silently degrading:

- [ ] `RESEND_API_KEY` — currently empty. Lead notification emails are not sending.
- [ ] `RESEND_FROM` — set to `Trust and Trip <hello@trustandtrip.com>` after domain verified.
- [ ] `SANITY_REVALIDATE_SECRET` — set, then configure Sanity webhook → `/api/revalidate?secret=...&path=...`. Cuts publish-to-live time from 10 min to instant.
- [ ] `WHATSAPP_ACCESS_TOKEN` — Meta WhatsApp Business API token.
- [ ] `WHATSAPP_PHONE_ID` — phone number ID from Meta.
- [ ] `WHATSAPP_VERIFY_TOKEN` — your own random string for webhook verification.
- [ ] `META_PIXEL_ID` (if not already) — verify in `/admin` and Meta Events Manager.
- [ ] `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID` — switches Google Reviews from static fallback to live.

---

## Priority 6 — Sanity housekeeping

- [ ] Remove any test/draft documents from production dataset.
- [ ] Backup: monthly export → `npx sanity dataset export production sanity-backup-YYYY-MM-DD.tar.gz` → upload to GDrive `Trust and Trip / backups / sanity`.
- [ ] Rotate `SANITY_API_WRITE_TOKEN` annually.
- [ ] Audit alt text on every uploaded image (Sanity Studio → Media → review).

---

## Priority 7 — Brand asset library (one-time setup)

Build a single source of brand visuals:

- [ ] OG share image template (1200×630) — hero gradient + logo + dynamic title slot.
- [ ] WhatsApp share thumbnail (400×400) for each top destination.
- [ ] Founder portrait — 1 high-res, used in `FounderNote`, `/about`, blog author cards.
- [ ] Brand pattern (cream + gold + teal abstract) — used as a fallback hero on lesser destinations.
- [ ] Email header banner (600×200) for `LeadNotifyEmail` and `LeadConfirmEmail`.
- [ ] Print PDF cover for `/api/brochure/[slug]`.

Store all source files in GDrive `Trust and Trip / brand / 2026 Q2`.

---

## Priority 8 — Per-record content QA before publishing

Before any new package or destination publishes, the founder confirms:

**Destination checklist**
- [ ] Hero image uploaded (1920×1080, alt text set)
- [ ] Card image uploaded (800×600, alt text set)
- [ ] Gallery has ≥ 6 images, all with alt text
- [ ] `tagline` ≤ 12 words, no "best/cheapest/guaranteed"
- [ ] `priceFrom` (INR) set
- [ ] `bestTimeToVisit` filled
- [ ] `idealDuration` filled
- [ ] `highlights[]` ≥ 5
- [ ] `thingsToDo[]` ≥ 6
- [ ] `whisper` (insider tip) 1 line set

**Package checklist**
- [ ] Title format: `Destination Nights/Days Theme` (e.g., "Bali 4N/5D Honeymoon Escape")
- [ ] `slug` is `destination-NnNd-theme` (lowercase, hyphenated)
- [ ] `destination` ref set
- [ ] `priceBreakdown` filled (doubleSharing min, others where applicable)
- [ ] `duration`, `nights`, `days` consistent (`days = nights + 1`)
- [ ] Hero + card + gallery (≥ 5) uploaded
- [ ] `description` ≥ 80 words, no clichés
- [ ] `highlights[]` ≥ 5
- [ ] `inclusions[]`, `exclusions[]` filled
- [ ] `itinerary[]` length = `days`
- [ ] `hotel` filled (name, category, description)
- [ ] `activities[]` filled
- [ ] `faqs[]` ≥ 5
- [ ] `bestMonths[]` filled
- [ ] `departures[]` filled (or `limitedSlots: false`)
- [ ] `whyThisPackage`, `bestFor` filled

---

## Priority 9 — Cadence (founder runs this monthly)

Last day of every month, 30 minutes:
1. Review top-3 traffic packages in Vercel Analytics.
2. Pull Google Reviews count and avg — confirm `stats[]` array still defensible.
3. Approve / reject pending Supabase reviews.
4. Sanity export → GDrive backup.
5. `npm outdated` → notify engineering for next sprint.

---

End. Anything not on this list belongs in a code change, not a content change.
