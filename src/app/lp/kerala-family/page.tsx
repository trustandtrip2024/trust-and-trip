import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star, Check, ShieldCheck, Clock, MessageCircle, Users } from "lucide-react";
import Price from "@/components/Price";
import LeadFormCompact from "../_components/LeadFormCompact";
import StreamItineraryWidget from "../_components/StreamItineraryWidget";
import LpFaq, { type LpFaqItem } from "../_components/LpFaq";
import LpJsonLd from "../_components/LpJsonLd";

const PAGE_URL = "https://trustandtrip.com/lp/kerala-family";

const FAQ_ITEMS: LpFaqItem[] = [
  {
    q: "Is Kerala safe and easy with kids and grandparents?",
    a: "Yes — it is one of the most family-friendly states in India. We pick hotels with interconnecting rooms or family suites, plan short driving legs (no transfer over 4 hours), and brief every property on stroller / wheelchair access ahead of arrival. Houseboats are private (not shared) so families travel as one unit.",
  },
  {
    q: "When is the best time for a Kerala family tour?",
    a: "October to March is peak — clear skies, comfortable temperatures, and full visibility on the backwaters. April–May is hot and humid but cheaper. June–September is the monsoon season — beautiful but not ideal with very young children.",
  },
  {
    q: "Will the food be vegetarian / kid-friendly?",
    a: "Daily breakfasts are vegetarian by default and houseboats serve a full-board veg / Jain spread on request. We also flag hotels with kids menus, North Indian options, and high chairs — useful if your toddler is a picky eater.",
  },
  {
    q: "What does the houseboat night look like?",
    a: "You board your private deluxe Kettuvalam at noon in Alleppey, cruise the backwaters all afternoon (with onboard lunch + tea), anchor near a quiet bend by sunset, and have dinner + breakfast on board before disembarking next morning. Air-conditioned bedrooms, en-suite bathrooms, full crew.",
  },
  {
    q: "How do hill stations work with elderly parents?",
    a: "Munnar is the gentlest — winding but well-paved roads, hotel altitudes around 5,000 ft, and most viewpoints walk-up only. We avoid Periyar trekking unless you ask, and book a wildlife cruise instead. Oxygen issues are rare in Kerala.",
  },
  {
    q: "How early should we plan a Kerala family trip?",
    a: "3–4 weeks is enough for off-season. Christmas + New Year (20 Dec – 5 Jan) and Onam (early September) book out 8–10 weeks ahead. Houseboats are the bottleneck on long weekends — book early.",
  },
];

const SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=75&auto=format&fit=crop";

export const metadata: Metadata = {
  title: "Kerala Family Tour Packages 2026 — Trust and Trip",
  description:
    "Backwaters, hill stations, wildlife — Kerala family tour packages from India. Toddler-to-grandparent friendly, starting from ₹28,000/person.",
  alternates: { canonical: "https://trustandtrip.com/lp/kerala-family" },
  openGraph: {
    title: "Kerala Family Tour — Free Draft in 60 Seconds",
    description: "Backwaters + Munnar + Periyar. Real planner builds your family draft in 60s.",
    images: [
      {
        url: "/api/og?title=Kerala+family+trips%2C+for+every+age.&dest=Kerala&eyebrow=Family&price=28000&rating=4.9&reviews=156",
        width: 1200,
        height: 630,
      },
    ],
  },
  robots: { index: true, follow: true },
};

const HERO_IMG =
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=68&auto=format&fit=crop";

const PROOF = [
  { icon: Clock, label: "Draft in 60 sec", sub: "Real planner reviews" },
  { icon: ShieldCheck, label: "₹0 to start", sub: "Pay only when sure" },
  { icon: Star, label: "4.9 / 5 Google", sub: "200+ verified reviews" },
];

const WHATS_INCLUDED = [
  "Private deluxe houseboat (not shared) on Alleppey backwaters",
  "Tea-trail homestay in Munnar with mountain views",
  "Periyar wildlife cruise + spice plantation tour",
  "Hotels with interconnecting rooms + kid menus",
  "Daily breakfast (vegetarian) + houseboat full-board",
  "All taxes, GST, transfers — no hidden fees",
];

const PRICE_TIERS = [
  {
    name: "Backwaters Family",
    nights: "5N / 6D",
    price: 28000,
    resort: "3★ + houseboat · Alleppey + Kochi",
    highlights: ["Private houseboat", "Fort Kochi walking tour", "Cherai beach evening"],
  },
  {
    name: "Backwaters + Munnar",
    nights: "6N / 7D",
    price: 42000,
    resort: "3★ · Munnar + Alleppey + Kochi",
    highlights: ["Tea trail in Munnar", "Eravikulam wildlife park", "Houseboat overnight"],
    featured: true,
  },
  {
    name: "Kerala Grand Tour",
    nights: "8N / 9D",
    price: 65000,
    resort: "4★ · Munnar + Thekkady + Alleppey + Kochi",
    highlights: ["Periyar wildlife cruise", "Spice plantation visit", "Premium houseboat"],
  },
];

export default function KeralaFamilyLanding() {
  return (
    <>
      <LpJsonLd
        pageUrl={PAGE_URL}
        serviceName="Kerala Family Tour Packages"
        serviceDescription="Backwaters + Munnar + Periyar — Kerala family tour packages from India. Toddler-to-grandparent friendly. Real planner reviews; pay only when sure."
        serviceImage={SERVICE_IMAGE}
        areaServed="Kerala, India"
        aggregateRating={{ value: 4.9, count: 156 }}
        faqItems={FAQ_ITEMS}
        offers={PRICE_TIERS.map((t) => ({
          name: t.name,
          description: t.resort,
          priceInr: t.price,
          nights: t.nights,
        }))}
      />
      <section className="relative min-h-[88vh] flex items-end overflow-hidden bg-tat-charcoal">
        <Image
          src={HERO_IMG}
          alt="Kerala backwaters and houseboat"
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
              Kerala · Family
            </span>
            <h1 className="mt-4 font-display text-display-lg leading-[1.02] text-balance">
              Kerala family trips,
              <span className="italic text-tat-orange-soft"> for every age.</span>
            </h1>
            <p className="mt-5 text-white/80 text-lg max-w-xl leading-relaxed">
              Backwaters, tea hills, wildlife. Toddler to grandparent — every itinerary built around how
              your family travels. Free draft in 60 seconds.
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
              destination="Kerala"
              packageLabel="Kerala Family — landing page"
              travelType="Family"
              eyebrow="Free family draft"
              headline="60-second Kerala draft."
              monthLabel="Travel month + family size (optional)"
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
            <p className="tt-eyebrow">Three ways to do Kerala</p>
            <h2 className="mt-2 font-display text-display-md leading-tight text-tat-charcoal">
              From a quick backwaters break to grand tour —
              <span className="italic text-tat-gold"> we plan it your way.</span>
            </h2>
            <p className="mt-4 text-tat-charcoal/75 leading-relaxed">
              Every itinerary is fully customisable. Tell us your dates and family size — we&rsquo;ll
              quote within the hour, including flights, in INR, no hidden taxes.
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
        destination="Kerala"
        travelType="Family"
        defaultDays={6}
        headline="Or watch our planner build your Kerala draft, live."
        subline="Backwaters, Munnar tea trails, kid-friendly hotels — sequenced into a 6-day plan in under a minute."
      />

      <section className="py-16 md:py-20 bg-tat-cream-warm/30 border-y border-tat-orange/20">
        <div className="container-custom max-w-6xl grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <p className="tt-eyebrow flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Built for families</p>
            <h2 className="mt-2 font-display text-display-md text-tat-charcoal leading-tight">
              Interconnecting rooms.
              <span className="italic text-tat-gold"> Kid menus. Real planner.</span>
            </h2>
            <p className="mt-4 text-tat-charcoal/75 leading-relaxed">
              No long drives, no rushed mornings. We sequence Kerala so kids and grandparents both have
              an easy time. Indian-vegetarian on every menu.
            </p>
            <Link
              href="#lead-form"
              className="mt-6 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-pill bg-tat-charcoal text-tat-paper font-medium hover:bg-tat-charcoal/90 transition"
            >
              Plan our Kerala trip
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
          <p className="tt-eyebrow">Families who trusted us</p>
          <h2 className="mt-2 font-display text-display-md text-tat-charcoal leading-tight">
            4.9 on Google.
            <span className="italic text-tat-gold"> Real Kerala family trips since 2019.</span>
          </h2>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <blockquote className="tt-card tt-card-p">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-tat-gold text-tat-gold" />
                ))}
              </div>
              <p className="text-tat-charcoal/85 leading-relaxed">
                &ldquo;Honestly the best backwaters trip I&rsquo;ve taken. They put us on a private deluxe
                houseboat and the chef cooked Kerala-style fish curry I still think about. Munnar tea
                trail was a slow, lovely day. Will book again.&rdquo;
              </p>
              <p className="mt-3 text-meta text-tat-slate">Nikhil Reddy · Kolkata</p>
            </blockquote>
            <blockquote className="tt-card tt-card-p">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-tat-gold text-tat-gold" />
                ))}
              </div>
              <p className="text-tat-charcoal/85 leading-relaxed">
                &ldquo;Took my parents (70+) and our 6-year-old to Kerala. The pacing was perfect — never
                more than 2 hours of driving in a day. Hotels had ground-floor rooms close to lifts.
                Felt taken care of throughout.&rdquo;
              </p>
              <p className="mt-3 text-meta text-tat-slate">Meera · Pune</p>
            </blockquote>
          </div>
        </div>
      </section>

      <LpFaq
        eyebrow="Family questions"
        titleStart="Kerala with the family,"
        titleItalic="answered."
        items={FAQ_ITEMS}
      />

      <section className="py-16 md:py-20 bg-tat-charcoal text-white">
        <div className="container-custom max-w-3xl text-center">
          <p className="tt-eyebrow text-tat-orange-soft/90">Ready when you are</p>
          <h2 className="mt-3 font-display text-display-md leading-tight">
            Tell us your dates.
            <span className="italic text-tat-orange-soft"> We&rsquo;ll plan the rest.</span>
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Free family draft in 60 seconds. Real planner finalises it. Pay only when sure.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="#lead-form"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-pill bg-tat-orange text-white font-medium hover:bg-tat-orange/90 transition"
            >
              Get my free draft
            </Link>
            <Link
              href="/api/wa/click?src=lp_kerala_cta&dest=Kerala"
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
        href="/api/wa/click?src=lp_kerala_sticky&dest=Kerala"
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
