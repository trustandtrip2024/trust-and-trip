import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star, Check, ShieldCheck, Clock, MessageCircle, Train } from "lucide-react";
import Price from "@/components/Price";
import LeadFormCompact from "../_components/LeadFormCompact";
import StreamItineraryWidget from "../_components/StreamItineraryWidget";

export const metadata: Metadata = {
  title: "Switzerland Honeymoon Packages from India 2026 — Trust and Trip",
  description:
    "Glacier Express, Jungfrau, Lucerne, Interlaken — Switzerland honeymoons hand-built for Indian couples. Free draft itinerary in 60 seconds. Pay only when sure.",
  alternates: { canonical: "https://trustandtrip.com/lp/switzerland-honeymoon" },
  openGraph: {
    title: "Switzerland Honeymoon — Free Draft in 60 Seconds",
    description: "Alps. Trains. Romance. Real planner builds your itinerary in 60s.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const HERO_IMG =
  "https://images.unsplash.com/photo-1530841344095-502e9bb29024?w=1600&q=68&auto=format&fit=crop";

const PROOF = [
  { icon: Clock, label: "Draft in 60 sec", sub: "Real planner reviews" },
  { icon: ShieldCheck, label: "₹0 to start", sub: "Pay only when sure" },
  { icon: Star, label: "4.9 / 5 Google", sub: "200+ verified reviews" },
];

const WHATS_INCLUDED = [
  "Boutique alpine hotels (Interlaken / Lucerne / Zermatt)",
  "Swiss Travel Pass — unlimited trains, boats, cable cars",
  "Glacier Express + Bernina Express scenic train rides",
  "Jungfraujoch / Mt Titlis cable car included",
  "Daily breakfast (vegetarian) + 2 dinners",
  "Visa assistance + GST + TCS — all transparent",
];

const PRICE_TIERS = [
  {
    name: "Alps Romance",
    nights: "6N / 7D",
    price: 145000,
    resort: "4★ · Interlaken + Lucerne",
    highlights: ["Swiss Travel Pass", "Mount Titlis cable car", "Lake Lucerne cruise"],
  },
  {
    name: "Glacier Express",
    nights: "8N / 9D",
    price: 195000,
    resort: "4★ · Zermatt + Interlaken + Lucerne",
    highlights: ["Glacier Express scenic train", "Jungfraujoch — Top of Europe", "Matterhorn views from Zermatt"],
    featured: true,
  },
  {
    name: "Premium Alps",
    nights: "10N / 11D",
    price: 285000,
    resort: "5★ · Zermatt + Lucerne + Geneva",
    highlights: ["Premium 5★ alpine hotels", "Bernina Express add-on", "Private candlelit dinner in Zermatt"],
  },
];

export default function SwitzerlandHoneymoonLanding() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden bg-tat-charcoal">
        <Image
          src={HERO_IMG}
          alt="Swiss alps and Lake Lucerne at dusk"
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
              Switzerland · Honeymoon
            </span>
            <h1 className="mt-4 font-display text-display-lg leading-[1.02] text-balance">
              Swiss honeymoons,
              <span className="italic text-tat-orange-soft"> by train and lake.</span>
            </h1>
            <p className="mt-5 text-white/80 text-lg max-w-xl leading-relaxed">
              Glacier Express, Jungfraujoch, Lucerne lakeside dinners. A real planner builds your alpine
              itinerary in 60 seconds — free until you&rsquo;re sure.
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
              destination="Switzerland"
              packageLabel="Switzerland Honeymoon — landing page"
              travelType="Couple"
              eyebrow="Free alpine draft"
              headline="60-second Swiss draft."
            />
          </div>
        </div>
      </section>

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

      <section className="py-16 md:py-20">
        <div className="container-custom max-w-6xl">
          <div className="max-w-2xl">
            <p className="tt-eyebrow">Three ways to honeymoon</p>
            <h2 className="mt-2 font-display text-display-md leading-tight text-tat-charcoal">
              From mid-range to grand alpine —
              <span className="italic text-tat-gold"> all built around you.</span>
            </h2>
            <p className="mt-4 text-tat-charcoal/75 leading-relaxed">
              Tell us your dates and we&rsquo;ll quote within the hour, including flights from your city,
              in INR, no hidden taxes.
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

      <StreamItineraryWidget
        destination="Switzerland"
        travelType="Couple"
        defaultDays={7}
        headline="Or watch our planner build your alpine draft, live."
        subline="Glacier Express, Jungfrau, lakeside dinners — sequenced into a 7-day Swiss honeymoon in under a minute."
      />

      <section className="py-16 md:py-20 bg-tat-cream-warm/30 border-y border-tat-orange/20">
        <div className="container-custom max-w-6xl grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <p className="tt-eyebrow flex items-center gap-2"><Train className="h-3.5 w-3.5" /> Travel by train</p>
            <h2 className="mt-2 font-display text-display-md text-tat-charcoal leading-tight">
              Swiss Travel Pass included.
              <span className="italic text-tat-gold"> Glacier Express seat reserved.</span>
            </h2>
            <p className="mt-4 text-tat-charcoal/75 leading-relaxed">
              Visa, GST, TCS, train passes, transfers, taxes — everything is in the quote. The price you
              see is the price you pay.
            </p>
            <Link
              href="#lead-form"
              className="mt-6 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-pill bg-tat-charcoal text-tat-paper font-medium hover:bg-tat-charcoal/90 transition"
            >
              Get my Swiss draft
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

      <section className="py-16 md:py-20">
        <div className="container-custom max-w-5xl">
          <p className="tt-eyebrow">Couples who trusted us</p>
          <h2 className="mt-2 font-display text-display-md text-tat-charcoal leading-tight">
            4.9 on Google.
            <span className="italic text-tat-gold"> Real Swiss honeymoons since 2019.</span>
          </h2>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <blockquote className="tt-card tt-card-p">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-tat-gold text-tat-gold" />
                ))}
              </div>
              <p className="text-tat-charcoal/85 leading-relaxed">
                &ldquo;Took our two kids (8 and 11) to Switzerland for nine days. Glacier Express, Jungfrau,
                Lucerne — every leg was on time and the hotels were genuinely family-friendly. The
                customised itinerary saved us at least two days vs canned packages.&rdquo;
              </p>
              <p className="mt-3 text-meta text-tat-slate">Megha Pillai · Chennai</p>
            </blockquote>
            <blockquote className="tt-card tt-card-p">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-tat-gold text-tat-gold" />
                ))}
              </div>
              <p className="text-tat-charcoal/85 leading-relaxed">
                &ldquo;Honeymoon in Switzerland was a dream. Our planner reserved Jungfraujoch tickets two
                months ahead, suggested an Indian-vegetarian cafe in Zermatt, and arranged surprise
                anniversary champagne. Prompt WhatsApp support throughout.&rdquo;
              </p>
              <p className="mt-3 text-meta text-tat-slate">Aanya & Karan · Mumbai</p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-tat-charcoal text-white">
        <div className="container-custom max-w-3xl text-center">
          <p className="tt-eyebrow text-tat-orange-soft/90">Ready when you are</p>
          <h2 className="mt-3 font-display text-display-md leading-tight">
            Tell us your dates.
            <span className="italic text-tat-orange-soft"> We&rsquo;ll do the rest.</span>
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Free Swiss draft in 60 seconds. Real planner finalises it. Pay only when sure.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="#lead-form"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-pill bg-tat-orange text-white font-medium hover:bg-tat-orange/90 transition"
            >
              Get my free draft
            </Link>
            <Link
              href="/api/wa/click?src=lp_switzerland_cta&dest=Switzerland"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-pill bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </Link>
          </div>
        </div>
      </section>

      <Link
        href="/api/wa/click?src=lp_switzerland_sticky&dest=Switzerland"
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 h-12 px-5 rounded-pill bg-emerald-600 text-white text-sm font-medium shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Link>
    </>
  );
}
