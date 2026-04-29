import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star, Check, ShieldCheck, Mountain, MessageCircle, HeartHandshake } from "lucide-react";
import Price from "@/components/Price";
import LeadFormCompact from "../_components/LeadFormCompact";
import StreamItineraryWidget from "../_components/StreamItineraryWidget";
import LpFaq, { type LpFaqItem } from "../_components/LpFaq";
import LpJsonLd from "../_components/LpJsonLd";

const PAGE_URL = "https://trustandtrip.com/lp/char-dham-yatra";

const FAQ_ITEMS: LpFaqItem[] = [
  {
    q: "When does the Char Dham Yatra open in 2026?",
    a: "Yamunotri and Gangotri open on Akshay Tritiya (around 30 April 2026). Kedarnath opens around 2 May and Badrinath around 4 May. Gates close again from late October. The safest weather window is May–June and September–October; July–August see heavy monsoon and frequent helicopter delays.",
  },
  {
    q: "Is the yatra safe for senior citizens?",
    a: "Yes — we plan it that way. Helicopter shuttles cut walking to a minimum, palki / pony / pithoo services are pre-arranged at Kedarnath, hotels are booked within walking distance of every shrine, and a basic medical kit + oxygen is carried on the route. Share any health conditions and we adjust the pace.",
  },
  {
    q: "Will the food be pure vegetarian?",
    a: "Yes. Sattvik vegetarian (no onion, no garlic on request) is served throughout the yatra — at hotels, on transit halts, and at the dharamshalas near each Dham. Jain meals are arranged on prior notice.",
  },
  {
    q: "Do we have to register separately for the yatra?",
    a: "Uttarakhand mandates online registration + biometric capture for every yatri. We complete the registration on your behalf, send the QR pass, and brief you on the biometric kiosks at Haridwar / Sonprayag. No queue at the shrine end.",
  },
  {
    q: "What happens if a helicopter shuttle is cancelled due to weather?",
    a: "If a shuttle is grounded, we switch you to the next available slot (same day or next morning) at no extra cost. If the full route is shut for the day, you get a refund for the unused leg or a road alternative — whichever you prefer. This is in writing on your itinerary.",
  },
  {
    q: "How early should we book the Char Dham Yatra?",
    a: "Helicopter slots for May–June sell out by February. Road yatra is more flexible — 4–6 weeks ahead is usually fine. For Do Dham (Kedarnath + Badrinath) by helicopter, book at least 8 weeks before your preferred dates.",
  },
];

const SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1200&q=75&auto=format&fit=crop";

export const metadata: Metadata = {
  title: "Char Dham Yatra Package 2026 — By Helicopter & Road | Trust and Trip",
  description:
    "Helicopter and road Char Dham Yatra packages for Indian families. VIP darshan, vegetarian food, palki transfers, hotels close to temples. 600+ yatris this season.",
  alternates: { canonical: "https://trustandtrip.com/lp/char-dham-yatra" },
  openGraph: {
    title: "Char Dham Yatra — Walked With Quiet Care",
    description: "Helicopter or road Char Dham Yatra packages, planned by a real human.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const HERO_IMG =
  "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1600&q=68&auto=format&fit=crop";

const PROOF = [
  { icon: Mountain,       label: "600+ yatris",    sub: "this season alone" },
  { icon: HeartHandshake, label: "VIP darshan",    sub: "no long queues" },
  { icon: ShieldCheck,    label: "Senior-safe",    sub: "palki + medical" },
];

const WHATS_INCLUDED = [
  "Helicopter / road transfers between Dhams",
  "VIP darshan assistance at every shrine",
  "Pure vegetarian meals throughout (sattvik)",
  "Hotels within walking distance of temples",
  "Palki / pony service for elders pre-arranged",
  "Medical kit + 24×7 yatra desk on WhatsApp",
];

const PRICE_TIERS = [
  {
    name: "Char Dham by Road",
    nights: "10N / 11D",
    price: 48000,
    resort: "Ex-Haridwar · all transfers",
    highlights: ["All four Dhams", "Comfortable Tempo Traveller", "Pure veg meals throughout"],
  },
  {
    name: "Char Dham Helicopter",
    nights: "5N / 6D",
    price: 185000,
    resort: "Ex-Dehradun · helicopter shuttle",
    highlights: ["All four Dhams in 5 days", "VIP darshan at every shrine", "Premium hotels included"],
    featured: true,
  },
  {
    name: "Do Dham Helicopter",
    nights: "2N / 3D",
    price: 75000,
    resort: "Kedarnath + Badrinath",
    highlights: ["Two Dhams in 3 days", "VIP palki transfer", "Best for short visits"],
  },
];

export default function CharDhamLanding() {
  return (
    <>
      <LpJsonLd
        pageUrl={PAGE_URL}
        serviceName="Char Dham Yatra Packages 2026"
        serviceDescription="Helicopter and road Char Dham Yatra packages for Indian families — VIP darshan, sattvik food, palki transfers, hotels close to every shrine."
        serviceImage={SERVICE_IMAGE}
        areaServed="Uttarakhand, India"
        aggregateRating={{ value: 4.9, count: 184 }}
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
          alt="Himalayan temple at dawn"
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
              Char Dham · Yatra 2026
            </span>
            <h1 className="mt-4 font-display text-display-lg leading-[1.02] text-balance">
              Char Dham Yatra,
              <span className="italic text-tat-orange-soft"> walked with quiet care.</span>
            </h1>
            <p className="mt-5 text-white/80 text-lg max-w-xl leading-relaxed">
              Helicopter or road. VIP darshans, palki transfers, vegetarian planning, and hotels close to
              every shrine. Our planners have shepherded 600+ yatris this season.
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

          <div id="lead-form" className="lg:justify-self-end w-full max-w-md">
            <LeadFormCompact
              destination="Char Dham"
              packageLabel="Char Dham Yatra — landing page"
              travelType="Pilgrim"
              eyebrow="Free yatra plan"
              headline="60-second yatra draft."
              subline="A senior planner reviews it. Pay only when sure."
              ctaLabel="Get my yatra draft"
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
            <p className="tt-eyebrow">Three ways to yatra</p>
            <h2 className="mt-2 font-display text-display-md leading-tight text-tat-charcoal">
              By road, by helicopter, or just two Dhams —
              <span className="italic text-tat-gold"> we plan it your way.</span>
            </h2>
            <p className="mt-4 text-tat-charcoal/75 leading-relaxed">
              Every yatra is fully customisable. Tell us your dates and travelers and we&rsquo;ll quote
              within the hour, including registrations, GST, and palki / pony arrangements.
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
                    Get plan →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <StreamItineraryWidget
        destination="Char Dham"
        travelType="Pilgrim"
        defaultDays={5}
        headline="Or watch our planner build your yatra draft, live."
        subline="Helicopter shuttle, VIP darshan, palki transfers — all sequenced into a 5-day plan in under a minute."
      />

      {/* What's included */}
      <section className="py-16 md:py-20 bg-tat-cream-warm/30 border-y border-tat-orange/20">
        <div className="container-custom max-w-6xl grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <p className="tt-eyebrow">Everything is included</p>
            <h2 className="mt-2 font-display text-display-md text-tat-charcoal leading-tight">
              Calm transfers.
              <span className="italic text-tat-gold"> Vegetarian food.</span>
            </h2>
            <p className="mt-4 text-tat-charcoal/75 leading-relaxed">
              Visa, GST, registrations, palki, medical kit — everything is in the quote. We know which
              queue moves fastest at Kedarnath.
            </p>
            <Link
              href="#lead-form"
              className="mt-6 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-pill bg-tat-charcoal text-tat-paper font-medium hover:bg-tat-charcoal/90 transition"
            >
              Plan my yatra
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
          <p className="tt-eyebrow">Yatris who trusted us</p>
          <h2 className="mt-2 font-display text-display-md text-tat-charcoal leading-tight">
            4.9 on Google.
            <span className="italic text-tat-gold"> 600+ yatris this season.</span>
          </h2>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <blockquote className="tt-card tt-card-p">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-tat-gold text-tat-gold" />
                ))}
              </div>
              <p className="text-tat-charcoal/85 leading-relaxed">
                &ldquo;The Char Dham helicopter yatra was flawless. Hotels close to each shrine, vegetarian
                meals throughout, and VIP darshans arranged for my parents (75 and 72). The team thought
                of every small thing — my mother had a knee issue and they pre-booked palki transfers
                without us asking.&rdquo;
              </p>
              <p className="mt-3 text-meta text-tat-slate">Akhil Menon · Bengaluru</p>
            </blockquote>
            <blockquote className="tt-card tt-card-p">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-tat-gold text-tat-gold" />
                ))}
              </div>
              <p className="text-tat-charcoal/85 leading-relaxed">
                &ldquo;Took my parents on the road yatra. Comfortable Tempo Traveller, sattvik food
                everywhere, hotels close to temples — everything felt looked after. The planner was on
                WhatsApp the whole trip.&rdquo;
              </p>
              <p className="mt-3 text-meta text-tat-slate">Sneha · Delhi</p>
            </blockquote>
          </div>
        </div>
      </section>

      <LpFaq
        eyebrow="Yatra questions"
        titleStart="Char Dham 2026,"
        titleItalic="answered."
        items={FAQ_ITEMS}
      />

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-tat-charcoal text-white">
        <div className="container-custom max-w-3xl text-center">
          <p className="tt-eyebrow text-tat-orange-soft/90">Yatra 2026 dates open</p>
          <h2 className="mt-3 font-display text-display-md leading-tight">
            Tell us your dates.
            <span className="italic text-tat-orange-soft"> We&rsquo;ll plan the rest.</span>
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Free yatra plan in 60 seconds. Senior planner finalises it. Pay only when sure.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="#lead-form"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-pill bg-tat-orange text-white font-medium hover:bg-tat-orange/90 transition"
            >
              Get my yatra plan
            </Link>
            <Link
              href="/api/wa/click?src=lp_chardham_cta&msg=Hi%20Trust%20and%20Trip%2C%20I%27m%20interested%20in%20Char%20Dham%20Yatra%202026."
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

      <Link
        href="/api/wa/click?src=lp_chardham_cta&msg=Hi%20Trust%20and%20Trip%2C%20I%27m%20interested%20in%20Char%20Dham%20Yatra%202026."
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
