import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star, Check, ShieldCheck, Clock, MessageCircle } from "lucide-react";
import Price from "@/components/Price";
import LeadFormCompact from "../_components/LeadFormCompact";
import StreamItineraryWidget from "../_components/StreamItineraryWidget";
import LpFaq, { type LpFaqItem } from "../_components/LpFaq";
import LpJsonLd from "../_components/LpJsonLd";

const PAGE_URL = "https://trustandtrip.com/lp/maldives-honeymoon";

const FAQ_ITEMS: LpFaqItem[] = [
  {
    q: "Do Indians need a visa for Maldives?",
    a: "No advance visa needed. Indian passport holders get a free 30-day tourist visa on arrival at Velana International Airport. Carry your return ticket, hotel voucher, and the simple arrival form (we send it pre-trip).",
  },
  {
    q: "When is the best time for a Maldives honeymoon?",
    a: "November to April is the dry season — calm seas, sunny days, perfect for snorkelling. May to October is the wet season — cheaper rates, occasional showers, and the chance to spot whale sharks at Hanifaru Bay (June–November).",
  },
  {
    q: "Will Indian / vegetarian / Jain food be available?",
    a: "Yes, on every island we book. Most resorts have an Indian chef or rotate Indian curries on the buffet, and Jain meals are arranged with 24-hour notice. We confirm dietary needs in writing with the resort before you fly.",
  },
  {
    q: "Beach villa or overwater villa — which should we pick?",
    a: "Beach villas have a private deck on the sand and are easier on knees and small kids. Overwater villas sit over the lagoon with steps directly into the water — better for the photos and snorkelling enthusiasts. Many couples split — 2 nights beach + 2 nights overwater — and we plan it that way.",
  },
  {
    q: "What is included in the package price?",
    a: "Resort villa for the chosen tier, all return seaplane or speedboat transfers (often the priciest line item), the meal plan listed (breakfast / half-board / all-inclusive), and the activities in your tier. International flights, drinks not in your meal plan, and spa add-ons are quoted separately.",
  },
  {
    q: "How early should we book the Maldives?",
    a: "8–10 weeks ahead in peak season (Dec–Feb, May honeymoon, July–August school break). 4 weeks is fine for shoulder months. Seaplane slots and overwater inventory tighten fastest — that is usually what locks the booking.",
  },
];

const SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=75&auto=format&fit=crop";

export const metadata: Metadata = {
  title: "Maldives Honeymoon Packages from India 2026 — Trust and Trip",
  description:
    "Overwater villa honeymoons to the Maldives, hand-built for Indian couples. Free draft itinerary in 60 seconds. Pay only when sure. 4.9★ on Google.",
  alternates: { canonical: "https://trustandtrip.com/lp/maldives-honeymoon" },
  openGraph: {
    title: "Maldives Honeymoon — Free Draft in 60 Seconds",
    description:
      "Overwater villa honeymoons to the Maldives, planned by a real human. Pay only when sure.",
    images: [
      {
        url: "/api/og?title=Maldives+honeymoons%2C+hand-built+for+two.&dest=Maldives&eyebrow=Honeymoon&price=68000&rating=4.9&reviews=198",
        width: 1200,
        height: 630,
      },
    ],
  },
  robots: { index: true, follow: true },
};

const HERO_IMG =
  "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&q=68&auto=format&fit=crop";

const PROOF = [
  { icon: Clock,        label: "Draft in 60 sec", sub: "Real planner reviews" },
  { icon: ShieldCheck,  label: "₹0 to start",     sub: "Pay only when sure" },
  { icon: Star,         label: "4.9 / 5 Google",  sub: "200+ verified reviews" },
];

const WHATS_INCLUDED = [
  "Overwater or beach villa (couple-only resorts)",
  "All return seaplane / speedboat transfers",
  "Daily breakfast (vegetarian on request) + 2 dinners",
  "Sunset dolphin cruise + private candlelit dinner",
  "24×7 in-trip planner on WhatsApp",
  "Bottled water, all taxes, GST, and TCS guidance",
];

const PRICE_TIERS = [
  {
    name: "Beach Villa Escape",
    nights: "4N / 5D",
    price: 68000,
    resort: "Adaaran Select Hudhuran Fushi · 4★",
    highlights: ["Beach villa with private deck", "All-inclusive meals + drinks", "Snorkelling reefs steps away"],
  },
  {
    name: "Overwater Romance",
    nights: "5N / 6D",
    price: 95000,
    resort: "Centara Ras Fushi · 4★ overwater",
    highlights: ["Overwater villa with glass floor", "House-reef snorkelling", "Sunset dolphin cruise included"],
    featured: true,
  },
  {
    name: "Premium Overwater",
    nights: "7N / 8D",
    price: 165000,
    resort: "OBLU Select Sangeli · 5★",
    highlights: ["Premium overwater pool villa", "Dine-anywhere meal plan", "Couple-only adults retreat"],
  },
];

export default function MaldivesHoneymoonLanding() {
  return (
    <>
      <LpJsonLd
        pageUrl={PAGE_URL}
        serviceName="Maldives Honeymoon Packages"
        serviceDescription="Overwater and beach villa Maldives honeymoon packages from India — seaplane transfers, all-inclusive options, vegetarian on request."
        serviceImage={SERVICE_IMAGE}
        areaServed="Maldives"
        aggregateRating={{ value: 4.9, count: 198 }}
        faqItems={FAQ_ITEMS}
        offers={PRICE_TIERS.map((t) => ({
          name: t.name,
          description: t.resort,
          priceInr: t.price,
          nights: t.nights,
        }))}
      />
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden bg-tat-charcoal">
        <Image
          src={HERO_IMG}
          alt="Maldives overwater villas at sunrise"
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal via-tat-charcoal/45 to-transparent" />
        <div className="relative w-full container-custom max-w-6xl pb-14 md:pb-20 grid lg:grid-cols-2 gap-10 items-end">
          <div className="text-white">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-tat-orange/20 border border-tat-orange/40 backdrop-blur-sm text-tat-orange-soft text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] px-3 py-1.5">
              Maldives · Honeymoon
            </span>
            <h1 className="mt-4 font-display text-display-lg leading-[1.02] text-balance">
              Maldives honeymoons,
              <span className="italic text-tat-orange-soft"> hand-built for two.</span>
            </h1>
            <p className="mt-5 text-white/80 text-lg max-w-xl leading-relaxed">
              A real planner builds your overwater-villa itinerary in 60 seconds. Free until you&rsquo;re sure.
              Indian-vegetarian friendly. WhatsApp support the whole trip.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-white/85 text-sm">
              {PROOF.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-tat-orange-soft" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Lead form */}
          <div id="lead-form" className="lg:justify-self-end w-full max-w-md">
            <LeadFormCompact
              destination="Maldives"
              packageLabel="Maldives Honeymoon — landing page"
              travelType="Couple"
            />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-tat-paper border-y border-tat-charcoal/10">
        <div className="container-custom py-5 grid grid-cols-3 gap-4 md:gap-8">
          {PROOF.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-full bg-tat-gold/15 text-tat-gold flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-tat-charcoal leading-tight truncate">
                  {label}
                </p>
                <p className="text-[11px] text-tat-charcoal/60 leading-tight truncate">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Price tiers */}
      <section className="py-16 md:py-20">
        <div className="container-custom max-w-6xl">
          <div className="max-w-2xl">
            <p className="tt-eyebrow">Three ways to honeymoon</p>
            <h2 className="mt-2 font-display text-display-md leading-tight text-tat-charcoal">
              From beach villa to premium overwater,
              <span className="italic text-tat-gold"> we&rsquo;ll match your taste.</span>
            </h2>
            <p className="mt-4 text-tat-charcoal/75 leading-relaxed">
              Every package below is fully customisable. Tell us your dates and we&rsquo;ll quote within
              the hour — including flights from your city, in INR, with no hidden taxes.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-5 md:gap-6">
            {PRICE_TIERS.map((t) => (
              <article
                key={t.name}
                className={`tt-card tt-card-p flex flex-col gap-4 ${
                  t.featured
                    ? "ring-2 ring-tat-orange/40 shadow-[0_20px_60px_-20px_rgba(232,123,61,0.25)]"
                    : ""
                }`}
              >
                {t.featured && (
                  <span className="self-start inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-semibold px-2.5 py-1 rounded-full bg-tat-orange text-white">
                    Most popular
                  </span>
                )}
                <header>
                  <p className="text-tag uppercase text-tat-slate">{t.nights}</p>
                  <h3 className="mt-1 font-display text-h3 text-tat-charcoal leading-snug">
                    {t.name}
                  </h3>
                  <p className="mt-1 text-meta text-tat-slate">{t.resort}</p>
                </header>
                <ul className="space-y-2 mt-1">
                  {t.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-body-sm text-tat-charcoal/85">
                      <Check className="h-4 w-4 text-tat-teal shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-3 border-t border-tat-charcoal/12 flex items-end justify-between">
                  <div>
                    <Price
                      inr={t.price}
                      className="font-display text-h3 text-tat-charcoal leading-none tabular-nums"
                    />
                    <p className="text-tag uppercase text-tat-slate mt-1">/ person</p>
                  </div>
                  <Link
                    href="#lead-form"
                    className="inline-flex items-center gap-1 text-body-sm font-medium text-tat-charcoal hover:text-tat-gold"
                  >
                    Get free draft →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Live AI itinerary widget — flagship demo */}
      <StreamItineraryWidget
        destination="Maldives"
        travelType="Couple"
        defaultDays={5}
        headline="Or watch our planner build your draft, live."
        subline="Tap below — our AI planner pulls live Maldives package data, drafts a 5-day overwater honeymoon, and shows you 3 ready-to-book matches."
      />

      {/* What's included */}
      <section className="py-16 md:py-20 bg-tat-cream-warm/30 border-y border-tat-orange/20">
        <div className="container-custom max-w-6xl grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <p className="tt-eyebrow">Everything is included</p>
            <h2 className="mt-2 font-display text-display-md text-tat-charcoal leading-tight">
              No surprises at checkout.
              <span className="italic text-tat-gold"> Quoted in INR.</span>
            </h2>
            <p className="mt-4 text-tat-charcoal/75 leading-relaxed">
              Visa, GST, TCS, transfers, taxes — everything is in the quote. The price you see is the
              price you pay.
            </p>
            <Link
              href="#lead-form"
              className="mt-6 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-pill bg-tat-charcoal text-tat-paper font-medium hover:bg-tat-charcoal/90 transition"
            >
              Get my Maldives draft
            </Link>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {WHATS_INCLUDED.map((i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-card border border-tat-orange/20 bg-white px-4 py-3.5"
              >
                <Check className="h-4 w-4 text-tat-teal shrink-0 mt-0.5" />
                <span className="text-body-sm text-tat-charcoal">{i}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 md:py-20">
        <div className="container-custom max-w-5xl">
          <p className="tt-eyebrow">Couples who trusted us</p>
          <h2 className="mt-2 font-display text-display-md text-tat-charcoal leading-tight">
            4.9 on Google.
            <span className="italic text-tat-gold"> 200+ honeymoons since 2019.</span>
          </h2>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <blockquote className="tt-card tt-card-p">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-tat-gold text-tat-gold" />
                ))}
              </div>
              <p className="text-tat-charcoal/85 leading-relaxed">
                &ldquo;Booked a 5N Maldives package for our 10th anniversary. The team upgraded our overwater villa as a
                surprise and arranged a private dolphin-cruise dinner. Transparent pricing — no hidden taxes
                at checkout, which is rare in this industry.&rdquo;
              </p>
              <p className="mt-3 text-meta text-tat-slate">Yashvi Iyer · Pune</p>
            </blockquote>
            <blockquote className="tt-card tt-card-p">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-tat-gold text-tat-gold" />
                ))}
              </div>
              <p className="text-tat-charcoal/85 leading-relaxed">
                &ldquo;The planner was on WhatsApp our entire trip. When the seaplane was delayed, they had a
                speedboat arranged before we landed. Indian-vegetarian meals on every island. Worth every
                rupee.&rdquo;
              </p>
              <p className="mt-3 text-meta text-tat-slate">Aanya & Karan · Mumbai</p>
            </blockquote>
          </div>
        </div>
      </section>

      <LpFaq
        titleStart="Maldives honeymoon questions,"
        titleItalic="answered."
        items={FAQ_ITEMS}
      />

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-tat-charcoal text-white">
        <div className="container-custom max-w-3xl text-center">
          <p className="tt-eyebrow text-tat-orange-soft/90">Ready when you are</p>
          <h2 className="mt-3 font-display text-display-md leading-tight">
            Tell us your dates.
            <span className="italic text-tat-orange-soft"> We&rsquo;ll do the rest.</span>
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Free draft itinerary in 60 seconds. Real planner finalises it. Pay only when you&rsquo;re sure.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="#lead-form"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-pill bg-tat-orange text-white font-medium hover:bg-tat-orange/90 transition"
            >
              Get my free draft
            </Link>
            <Link
              href="/api/wa/click?src=lp_maldives_cta&msg=Hi%20Trust%20and%20Trip%2C%20I%27m%20interested%20in%20a%20Maldives%20honeymoon."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-pill bg-tat-teal text-white font-medium hover:bg-tat-teal-deep transition"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky WhatsApp pill (mobile) */}
      <Link
        href="/api/wa/click?src=lp_maldives_cta&msg=Hi%20Trust%20and%20Trip%2C%20I%27m%20interested%20in%20a%20Maldives%20honeymoon."
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 h-12 px-5 rounded-pill bg-tat-teal text-white text-sm font-medium shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Link>
    </>
  );
}
