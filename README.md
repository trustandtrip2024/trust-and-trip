# Trust and Trip — Travel Website

> **Travel beyond packages. Experience trust.**
>
> A production-ready, editorial-luxury travel website built with Next.js 14 (App Router), Tailwind CSS, and Framer Motion.

---

## ✨ Design Direction

An **editorial luxury travel** aesthetic inspired by Condé Nast Traveler and Cereal magazine — warm, refined, and cinematic rather than generic. Fraunces serif display paired with DM Sans body, deep navy (`#0B1C2C`) and warm gold (`#F59E0B`) on a cream background (`#FAF7F2`), with slow-zoom hero imagery, asymmetric layouts, and subtle grain overlays.

---

## 🧱 Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS 3.4 |
| Animations | Framer Motion 11 |
| Forms | React Hook Form |
| Icons | Lucide React |
| State | React hooks (Zustand available) |
| Images | `next/image` with remote patterns |
| Language | TypeScript (strict) |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm, pnpm, or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open http://localhost:3000
```

### Production Build

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
trust-and-trip/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with fonts + Navbar/Footer
│   │   ├── page.tsx                # Homepage (all sections)
│   │   ├── not-found.tsx           # 404 page
│   │   ├── destinations/
│   │   │   ├── page.tsx            # Listing
│   │   │   └── [slug]/page.tsx     # Detail
│   │   ├── packages/
│   │   │   ├── page.tsx            # Listing + filters
│   │   │   └── [slug]/page.tsx     # Detail w/ itinerary + sticky CTA
│   │   ├── experiences/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── customize-trip/page.tsx
│   │   └── offers/page.tsx
│   ├── components/
│   │   ├── Navbar.tsx              # Sticky, scroll-aware
│   │   ├── Footer.tsx              # Newsletter + links + decorative type
│   │   ├── Hero.tsx                # Cinematic slow-zoom hero
│   │   ├── SearchBar.tsx           # Destination / Type / Duration
│   │   ├── DestinationCard.tsx
│   │   ├── PackageCard.tsx
│   │   ├── TestimonialCard.tsx
│   │   ├── VideoSection.tsx
│   │   ├── WhyChooseUs.tsx
│   │   ├── CTASection.tsx
│   │   ├── Accordion.tsx           # Used for itineraries
│   │   ├── LeadForm.tsx            # React Hook Form — popup / full
│   │   └── FloatingWhatsApp.tsx    # Desktop + mobile sticky CTA
│   ├── lib/
│   │   └── data.ts                 # Typed mock data
│   └── styles/
│       └── globals.css             # Design tokens + utilities
├── public/
│   └── images/                     # Empty; using Unsplash remote images
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── postcss.config.js
└── package.json
```

---

## 🎨 Design System

### Colors
| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#0B1C2C` | Primary text, dark surfaces |
| `gold` | `#F59E0B` | Accent, CTAs, highlights |
| `cream` | `#FAF7F2` | Base background |
| `sand` | `#EDE4D3` | Section alternations |

### Typography
- **Display**: Fraunces (serif, variable — used for headlines in italic accents)
- **Body**: DM Sans (clean sans)
- Fluid type scale — `display-xl`, `display-lg`, `display-md` via `clamp()`

### Key Utilities
- `.btn-primary` / `.btn-gold` / `.btn-outline` — consistent pill buttons
- `.eyebrow` — small uppercase tracked labels
- `.heading-section` — section headings
- `.grain-overlay` — subtle noise texture
- `.container-custom` — max-width + responsive padding

---

## 🧩 Sections on the Homepage

In order: `Hero` → marquee strip → `CategoryTiles` (experiences) → stats band → `TopDestinations` → `TrendingPackages` → `WhyChooseUs` → `VideoSection` → `Testimonials` → `CTASection` → `Footer`.

---

## 🔌 Integrations — Where to Hook Them

Stubs and clear integration points are already in place:

### WhatsApp API
- `src/components/FloatingWhatsApp.tsx` → replace `WHATSAPP_NUMBER` and message template.
- `src/components/LeadForm.tsx` → `onSubmit` is where you POST to your CRM / webhook / WhatsApp Business API.

### Google Analytics & Meta Pixel
Add to `src/app/layout.tsx` inside `<body>`:
```tsx
import Script from "next/script";

<Script
  src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX`}
  strategy="afterInteractive"
/>
<Script id="ga" strategy="afterInteractive">
  {`window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXX');`}
</Script>
```

### CRM (Bitrix / HubSpot)
In `LeadForm.tsx`, replace the mock `onSubmit` with:
```tsx
await fetch("/api/lead", { method: "POST", body: JSON.stringify(data) });
```
Then add `src/app/api/lead/route.ts` that forwards to your CRM's API.

---

## ⚡ Performance Notes

- ✅ All images use `next/image` with `sizes` and lazy loading
- ✅ Above-the-fold hero image uses `priority`
- ✅ Google Fonts loaded via `next/font` with `display: swap`
- ✅ Components that need state are marked `"use client"`; the rest stay server components
- ✅ `generateStaticParams` on dynamic routes for static generation
- ✅ No heavy libraries — Framer Motion + Lucide are the only runtime deps

Target Lighthouse: **90+ on all four axes**.

---

## 🚢 Deployment to Vercel

```bash
# 1. Push to GitHub/GitLab/Bitbucket
git init && git add . && git commit -m "Initial commit"

# 2. Import on vercel.com — it auto-detects Next.js
# 3. Add env vars (when you integrate CRM/Analytics)
# 4. Deploy
```

No special config required — the `next.config.js` already whitelists Unsplash/Pixabay/Pexels image hosts.

---

## 📊 Mock Data

All content lives in `src/lib/data.ts` and is strictly typed. Swap with a real CMS later (Sanity / Strapi / Contentful) by replacing the exports with fetchers.

The mock data includes:
- 6 destinations (Bali, Maldives, Switzerland, Santorini, Dubai, Kerala)
- 6 detailed packages with day-by-day itineraries
- 6 experience categories
- 4 testimonials
- 4 blog posts
- 4 why-choose-us blocks + 4 stats

---

## 🗺️ Roadmap (Future Enhancements)

- [ ] User authentication & saved itineraries dashboard
- [ ] Online booking flow with Razorpay / Stripe
- [ ] Dynamic pricing API
- [ ] Sanity / Strapi CMS integration
- [ ] Exit-intent popup with offer
- [ ] Blog MDX rendering with syntax highlighting
- [ ] Multi-language support (i18n)

---

## 📝 License

All code is provided as-is for the Trust and Trip project. Images used in mocks are from Unsplash under their [free license](https://unsplash.com/license).

---

**Crafted with intention.** 🧭
