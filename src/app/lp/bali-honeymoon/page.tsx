import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star, Check, ShieldCheck, Clock, MessageCircle } from "lucide-react";
import Price from "@/components/Price";
import LeadFormCompact from "../_components/LeadFormCompact";
import StreamItineraryWidget from "../_components/StreamItineraryWidget";

export const metadata: Metadata = {
  title: "Bali Honeymoon Packages from India 2026 — Trust and Trip",
  description:
    "Private-pool villas, sunrise on Mount Batur, candlelit dinners in Seminyak. Bali honeymoons hand-built for Indian couples. Free draft in 60 seconds.",
  alternates: { canonical: "https://trustandtrip.com/lp/bali-honeymoon" },
  openGraph: {
    title: "Bali Honeymoon — Free Draft in 60 Seconds",
    description: "Private villa Bali honeymoons, planned by a real human. Pay only when sure.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const HERO_IMG =
  "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1600&q=68&auto=format&fit=crop";

const PROOF = [
  { icon: Clock, label: "Draft in 60 sec", sub: "Real planner reviews" },
  { icon: ShieldCheck, label: "₹0 to start", sub: "Pay only when sure" },
  { icon: Star, label: "4.9 / 5 Google", sub: "200+ verified reviews" },
];

const WHATS_INCLUDED = [
  "Private-pool villa in Seminyak / Ubud / Uluwatu",
  "All return airport + inter-region transfers",
  "Daily breakfast (vegetarian on request) + 1 candlelit dinner",
  "Mount Batur sunrise trek + Tegalalang rice terraces",
  "24×7 in-trip planner on WhatsApp",
  "All taxes, GST, and TCS guidance — no hidden fees",
];

const PRICE_TIERS = [
  {
    name: "Bali Beach Escape",
    nights: "4N / 5D",
    price: 55000,
    resort: "4★ private-pool villa, Seminyak",
    highlights: ["Private-pool villa", "Seminyak beach + cafés", "Sunset Tanah Lot tour"],
  },
  {
    name: "Bali Romance",
    nights: "5N / 6D",
    price: 72000,
    resort: "4★ Ubud + Seminyak split",
    highlights: ["Jungle villa with rice-paddy view", "Mount Batur sunrise trek", "Beach + culture combo"],
    featured: true,
  },
  {
    name: "Bali Luxe",
    nights: "7N / 8D",
    price: 125000,
    resort: "5★ Uluwatu cliffside",
    highlights: ["Cliff-edge infinity-pool villa", "Private candlelit dinner", "Helicopter tour add-on"],
  },
];

export default function BaliHoneymoonLanding() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden bg-tat-charcoal">
        <Image
          src={HERO_IMG}
          alt="Bali jungle and rice paddies at sunrise"
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
              Bali · Honeymoon
            </span>
            <h1 className="mt-4 font-display text-display-lg leading-[1.02] text-balance">
              Bali honeymoons,
              <span className="italic text-tat-orange-soft"> the slow kind.</span>
            </h1>
            <p className="mt-5 text-white/80 text-lg max-w-xl leading-relaxed">
              Private-pool villas, sunrise on Mount Batur, candlelit dinners in Seminyak. A real planner
              builds your itinerary in 60 seconds — free until you&rsquo;re sure.
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
              destination="Bali"
              packageLabel="Bali Honeymoon — landing page"
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
              From beach to jungle to clifftop —
              <span className="italic text-tat-gold"> we&rsquo;ll match your taste.</span>
            </h2>
            <p className="mt-4 text-tat-charcoal/75 leading-relaxed">
              Every package is fully customisable. Tell us your dates and we&rsquo;ll quote within the
              hour, including flights from your city, in INR, no hidden taxes.
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
        destination="Bali"
        travelType="Couple"
        defaultDays={5}
        headline="Or watch our planner build your Bali draft, live."
        subline="Tap below — our AI planner pulls live Bali package data, drafts a 5-day villa-and-rice-paddy honeymoon, and shows you 3 ready-to-book matches."
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
              Get my Bali draft
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
            <span className="italic text-tat-gold"> Real Bali honeymoons since 2019.</span>
          </h2>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <blockquote className="tt-card tt-card-p">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-tat-gold text-tat-gold" />
                ))}
              </div>
              <p className="text-tat-charcoal/85 leading-relaxed">
                &ldquo;Trust and Trip planned every detail of our Bali honeymoon — private villa with a pool,
                candlelit dinners, sunrise on Mount Batur. Our planner was on WhatsApp the whole trip;
                even helped reschedule a snorkel after rain. Worth every rupee.&rdquo;
              </p>
              <p className="mt-3 text-meta text-tat-slate">Riya Sharma · Mumbai</p>
            </blockquote>
            <blockquote className="tt-card tt-card-p">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-tat-gold text-tat-gold" />
                ))}
              </div>
              <p className="text-tat-charcoal/85 leading-relaxed">
                &ldquo;Honestly the best Bali trip we&rsquo;ve taken. The Ubud villa, the rice-paddy
                breakfast, the surprise anniversary cake — every small detail was thought through. Indian
                vegetarian food everywhere we went.&rdquo;
              </p>
              <p className="mt-3 text-meta text-tat-slate">Aanya & Karan · Pune</p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-tat-charcoal text-white">
        <div className="container-custom max-w-3xl text-center">
          <p className="tt-eyebrow text-tat-orange-soft/90">Ready when you are</p>
          <h2 className="mt-3 font-display text-display-md leading-tight">
            Tell us your dates.
            <span className="italic text-tat-orange-soft"> We&rsquo;ll do the rest.</span>
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Free draft itinerary in 60 seconds. Real planner finalises it. Pay only when sure.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="#lead-form"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-pill bg-tat-orange text-white font-medium hover:bg-tat-orange/90 transition"
            >
              Get my free draft
            </Link>
            <Link
              href="/api/wa/click?src=lp_bali_cta&msg=Hi%20Trust%20and%20Trip%2C%20I%27m%20interested%20in%20a%20Bali%20honeymoon."
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
        href="/api/wa/click?src=lp_bali_cta&msg=Hi%20Trust%20and%20Trip%2C%20I%27m%20interested%20in%20a%20Bali%20honeymoon."
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
