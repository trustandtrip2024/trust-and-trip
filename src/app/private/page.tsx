export const revalidate = 600;

import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Crown, MapPin, Sparkles, Phone, ShieldCheck, Plane } from "lucide-react";
import { getPackages } from "@/lib/sanity-queries";
import PackageCard, { type PackageCardProps } from "@/components/PackageCard";
import PackageCardSkeleton from "@/components/PackageCardSkeleton";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import type { Package } from "@/lib/data";

export const metadata = {
  title: "Private Tier — Bespoke Luxury Travel · Trust and Trip",
  description: "Private-tier journeys for travellers who want a dedicated planner, premium hotels, private guides, and a phone that picks up at 2am. Founder-signed itineraries from ₹1.5L per person.",
  alternates: { canonical: "https://trustandtrip.com/private" },
  openGraph: {
    title: "Trust and Trip — Private Tier",
    description: "Bespoke luxury travel. Premium hotels, private guides, founder-signed itineraries.",
  },
};

const PRIVATE_FLOOR = 150000;

function toCardProps(p: Package): PackageCardProps {
  return {
    title: p.title,
    slug: p.slug,
    image: p.image,
    duration: p.duration,
    price: p.price,
    rating: p.rating,
    reviews: p.reviews,
    destinationName: p.destinationName,
    travelType: p.travelType,
    trending: p.trending,
    limitedSlots: p.limitedSlots,
    highlights: p.highlights,
    inclusions: p.inclusions,
    categories: p.categories,
  };
}

const VALUE_PROPS = [
  {
    icon: Crown,
    title: "Premium hotels only",
    body: "5-star city anchors, suites in remote stays. We negotiate club-level upgrades, late checkouts, and private dining direct with the GM — not via an OTA wrapper.",
  },
  {
    icon: ShieldCheck,
    title: "Dedicated trip director",
    body: "One named planner from quote to homecoming. The same person who designs your route is on WhatsApp at 2am if a flight cancels — no call-centre handover.",
  },
  {
    icon: Plane,
    title: "Private guides & transfers",
    body: "Black-plate vehicles, hand-picked English-speaking guides, no shared coaches. Arrival meet-and-greet from kerb to lobby on every leg.",
  },
  {
    icon: Sparkles,
    title: "Founder-signed itinerary",
    body: "Every Private trip touches Akash's desk before it ships. If something feels off, we'll know it before you do — and you'll get the call, not the surprise.",
  },
];

const PRIVATE_FAQS = [
  {
    q: "What's the minimum spend?",
    a: "Private-tier trips start at ₹1.5 lakh per person and scale up — most are between ₹2.5L and ₹6L for 7–10 nights. The floor isn't a price filter; it's the threshold where dedicated planning, premium inventory, and 24/7 trip-director coverage make sense.",
  },
  {
    q: "Why not just book it myself with a luxury OTA?",
    a: "OTAs sell the room, not the trip. They can't negotiate suite upgrades for you, they don't know which villa at Soneva to put a honeymoon couple in, and their concierge is a ticket queue. We do this 30+ times a year for the same hotels — chains return our calls.",
  },
  {
    q: "How is this different from Veena World's premium tours?",
    a: "Their premium is a fixed-departure coach trip with a tour leader. Ours is your group only — your dates, your pace, your guide. No 35-person bus, no buffet schedule, no Instagram queue at every photo stop.",
  },
  {
    q: "Do you handle multi-country itineraries?",
    a: "Yes — Switzerland + Italy, Japan + Korea, Tanzania + Zanzibar are common combos. Visas, internal flights, ground partners in both countries are all on us.",
  },
  {
    q: "What if I need to cancel?",
    a: "Private bookings get our most flexible cancellation ladder — typically 100% refund (less hotel deposits) up to 21 days out, 50% to 7 days, then per-supplier. We document the ladder per-trip in the quote.",
  },
];

async function PrivateGrid() {
  const all = await getPackages();
  const privatePool = all
    .filter((p) => p.price >= PRIVATE_FLOOR || (p.categories ?? []).includes("Luxury"))
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  const listLd = privatePool.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trust and Trip — Private-tier journeys",
    numberOfItems: privatePool.length,
    itemListElement: privatePool.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://trustandtrip.com/packages/${p.slug}`,
      name: p.title,
    })),
  } : null;

  if (privatePool.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="container-custom max-w-2xl text-center">
          <p className="text-tat-charcoal/65 mb-4">
            Private-tier slots fill fast — every itinerary is bespoke. Tell us your dates and we&rsquo;ll build it.
          </p>
          <Link
            href="/customize-trip?tier=private"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-charcoal text-tat-paper font-semibold text-sm hover:bg-tat-charcoal/90"
          >
            Brief a planner <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {listLd && <JsonLd data={listLd} />}
      <section id="trips" className="py-12 md:py-16 scroll-mt-32">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
            <div>
              <span className="eyebrow">Private-tier journeys</span>
              <h2 className="heading-section mt-2 text-balance">
                {privatePool.length} bespoke trips,
                <span className="italic text-tat-gold font-light"> ready to tailor.</span>
              </h2>
            </div>
            <Link
              href="/packages?tier=private"
              className="text-sm font-semibold text-tat-charcoal/70 hover:text-tat-gold inline-flex items-center gap-1"
            >
              Filter all packages by Private <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {privatePool.slice(0, 24).map((p) => (
              <PackageCard key={p.slug} {...toCardProps(p)} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function GridSkeleton() {
  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {Array.from({ length: 6 }).map((_, i) => <PackageCardSkeleton key={i} />)}
        </div>
      </div>
    </section>
  );
}

export default function PrivatePage() {
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Private-tier travel — Trust and Trip",
    description: "Bespoke luxury journeys with a dedicated trip director, premium hotels, and private guides. Founder-signed itineraries.",
    url: "https://trustandtrip.com/private",
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRIVATE_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={collectionLd} />
      <JsonLd data={faqLd} />

      <section className="relative pt-28 md:pt-36 pb-14 md:pb-20 bg-tat-charcoal text-tat-paper overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-0 opacity-[0.18]"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.5) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(14,124,123,0.4) 0%, transparent 60%)",
          }}
        />
        <div className="container-custom relative">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tat-gold/15 border border-tat-gold/30 text-tat-gold text-[11px] font-semibold uppercase tracking-[0.2em]">
            <Crown className="h-3 w-3" />
            Trust and Trip · Private tier
          </p>
          <h1 className="mt-4 font-display text-display-lg md:text-display-xl font-medium leading-[1.02] max-w-4xl text-balance">
            Bespoke luxury travel,
            <span className="italic text-tat-gold font-light"> signed by Akash.</span>
          </h1>
          <p className="mt-6 text-tat-paper/75 max-w-2xl leading-relaxed text-base md:text-lg">
            Premium hotels. Private guides. One trip director from the first WhatsApp to your last
            airport pickup. Built for couples, families, and small groups who want their own version
            of a place — not a coach-tour stop.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/customize-trip?tier=private"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-sm hover:bg-tat-gold/90"
            >
              Brief a planner <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/918115999588?text=Hi%20Akash!%20I'd%20like%20to%20brief%20a%20Private-tier%20trip."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-paper/10 hover:bg-tat-paper/15 text-tat-paper border border-tat-paper/20 font-semibold text-sm"
            >
              <Phone className="h-4 w-4" />
              WhatsApp Akash
            </a>
          </div>

          <ul className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 text-[12px] md:text-[13px]">
            {[
              { k: "From", v: "₹1.5L / person" },
              { k: "Trip director", v: "1 per booking" },
              { k: "Reach", v: "India + 30 countries" },
              { k: "Lead time", v: "From 14 days" },
            ].map((s) => (
              <li key={s.k} className="rounded-2xl bg-tat-paper/5 border border-tat-paper/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-tat-paper/50 font-semibold">{s.k}</p>
                <p className="mt-1 text-tat-paper font-display text-base md:text-lg">{s.v}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-tat-paper">
        <div className="container-custom">
          <span className="eyebrow">Why Private with us</span>
          <h2 className="heading-section mt-2 mb-10 max-w-3xl text-balance">
            Four things money rarely buys{" "}
            <span className="italic text-tat-gold font-light">on a packaged tour.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {VALUE_PROPS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl bg-tat-cream-warm/40 border border-tat-charcoal/8 p-6">
                <div className="h-10 w-10 rounded-full bg-tat-gold/15 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-tat-gold" />
                </div>
                <h3 className="font-display text-lg md:text-xl font-medium text-tat-charcoal">{title}</h3>
                <p className="mt-2 text-sm text-tat-charcoal/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Suspense fallback={<GridSkeleton />}>
        <PrivateGrid />
      </Suspense>

      <section className="py-14 md:py-20 bg-tat-cream-warm/30">
        <div className="container-custom max-w-3xl">
          <span className="eyebrow">Common questions</span>
          <h2 className="heading-section mt-2 mb-6 text-balance">
            What you&rsquo;d ask{" "}
            <span className="italic text-tat-gold font-light">before briefing a planner.</span>
          </h2>
          <div className="divide-y divide-tat-charcoal/8 rounded-2xl bg-tat-paper border border-tat-charcoal/8">
            {PRIVATE_FAQS.map((f, i) => (
              <details key={i} className="group p-5 md:p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-start justify-between gap-4 cursor-pointer">
                  <h3 className="font-display text-base md:text-lg font-medium text-tat-charcoal">{f.q}</h3>
                  <span className="shrink-0 mt-1 h-6 w-6 rounded-full bg-tat-gold/15 text-tat-gold flex items-center justify-center group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-tat-charcoal/70 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-tat-charcoal text-tat-paper p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-tat-gold font-semibold">Ready to brief?</p>
              <p className="font-display text-xl md:text-2xl mt-1">A planner replies within 9 minutes.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/customize-trip?tier=private" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-sm">
                Start a brief <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/packages?tier=private" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-tat-paper/10 hover:bg-tat-paper/15 border border-tat-paper/20 font-semibold text-sm">
                <MapPin className="h-4 w-4" /> See trips
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
