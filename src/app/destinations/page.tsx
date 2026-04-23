export const revalidate = 30;

import Link from "next/link";
import Image from "next/image";
import CTASection from "@/components/CTASection";
import { getDestinations } from "@/lib/sanity-queries";
import type { Destination } from "@/lib/data";
import { ArrowUpRight, MapPin, IndianRupee } from "lucide-react";

export const metadata = {
  title: "Destinations — Explore Incredible India & the World",
  description:
    "From Kerala backwaters to Maldives overwater villas — browse handpicked destinations across India and the world with Trust and Trip.",
  alternates: { canonical: "https://trustandtrip.com/destinations" },
  openGraph: {
    title: "Destinations — Trust and Trip",
    description: "Handpicked destinations across India and the world.",
  },
};

// Known India slugs as safety net when Sanity country field is missing
const INDIA_SLUGS = new Set([
  "kerala", "goa", "kashmir", "ladakh", "rajasthan", "andaman",
  "manali", "shimla", "himachal-pradesh", "coorg", "varanasi",
  "agra", "rishikesh", "uttarakhand", "spiti-valley",
  "andaman-and-nicobar", "munnar", "ooty",
]);

function isIndia(d: Destination) {
  return d.country === "India" || INDIA_SLUGS.has(d.slug);
}

// Compact card for India destinations
function IndiaCard({ d, priority }: { d: Destination; priority?: boolean }) {
  return (
    <Link
      href={`/destinations/${d.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-ink/8 hover:border-ink/20 hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        <Image
          src={d.image}
          alt={d.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority={priority}
        />
        {/* Region pill */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-ink/70">
            {d.region}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-medium text-ink group-hover:text-gold transition-colors leading-tight">
              {d.name}
            </h3>
            {d.tagline && (
              <p className="text-xs text-ink/50 mt-0.5 leading-snug">{d.tagline}</p>
            )}
          </div>
          <div className="h-7 w-7 rounded-full border border-ink/12 flex items-center justify-center shrink-0 group-hover:bg-gold group-hover:border-gold transition-all duration-300 mt-0.5">
            <ArrowUpRight className="h-3.5 w-3.5 text-ink/50 group-hover:text-ink transition-colors" />
          </div>
        </div>
        {d.priceFrom > 0 && (
          <p className="mt-3 text-xs text-ink/40 flex items-center gap-1">
            <IndianRupee className="h-3 w-3" />
            from <span className="font-semibold text-ink/70 ml-0.5">₹{d.priceFrom.toLocaleString("en-IN")}</span>
            <span className="text-ink/30">/person</span>
          </p>
        )}
      </div>
    </Link>
  );
}

// Wider card for International destinations
function IntlCard({ d, priority }: { d: Destination; priority?: boolean }) {
  return (
    <Link
      href={`/destinations/${d.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-ink/8 hover:border-ink/20 hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-sand">
        <Image
          src={d.image}
          alt={d.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority={priority}
        />
        {/* Country badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <MapPin className="h-3 w-3 text-gold" />
          <span className="text-[10px] font-medium text-ink uppercase tracking-wider">{d.country}</span>
        </div>
        {/* Arrow overlay on hover */}
        <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300">
          <ArrowUpRight className="h-4 w-4 text-ink opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Details */}
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-medium text-ink group-hover:text-gold transition-colors leading-tight truncate">
            {d.name}
          </h3>
          {d.tagline && (
            <p className="text-xs text-ink/50 mt-0.5 truncate">{d.tagline}</p>
          )}
        </div>
        {d.priceFrom > 0 && (
          <div className="text-right shrink-0">
            <p className="text-[10px] text-ink/35 uppercase tracking-wider">From</p>
            <p className="text-sm font-semibold text-ink">₹{d.priceFrom.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-ink/35">/person</p>
          </div>
        )}
      </div>
    </Link>
  );
}

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  const india = destinations.filter(isIndia);
  const international = destinations.filter((d) => !isIndia(d));

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 bg-ink overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=2400&q=80&auto=format&fit=crop"
            alt=""
            fill
            className="object-cover opacity-25"
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/80 to-ink" />
        <div className="container-custom relative text-center">
          <span className="eyebrow text-gold">Explore</span>
          <h1 className="mt-4 font-display text-display-lg text-cream font-medium max-w-3xl mx-auto text-balance leading-[1.02]">
            Every coordinate,
            <span className="italic text-gold font-light"> considered.</span>
          </h1>
          <p className="mt-5 text-cream/60 max-w-md mx-auto text-sm leading-relaxed">
            From Himalayan peaks to Maldivian reefs — destinations our planners know by heart.
          </p>
          {/* Stats strip */}
          <div className="mt-10 flex items-center justify-center gap-8 md:gap-12">
            {[
              { n: india.length || "15+", label: "India destinations" },
              { n: international.length || "20+", label: "International" },
              { n: "130+", label: "Experiences" },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-2xl md:text-3xl text-gold font-medium">{n}</p>
                <p className="text-[11px] text-cream/40 uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Incredible India ───────────────────────────────────────── */}
      {india.length > 0 && (
        <section className="py-14 md:py-20 bg-cream">
          <div className="container-custom">
            {/* Section header */}
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div>
                <span className="eyebrow">Domestic</span>
                <h2 className="heading-section mt-2">
                  Incredible
                  <span className="italic text-gold font-light"> India</span>
                </h2>
                <p className="mt-2 text-ink/50 text-sm max-w-sm">
                  {india.length} destinations across mountains, backwaters, deserts and coastlines.
                </p>
              </div>
              <Link
                href="/packages?region=india"
                className="hidden md:flex items-center gap-1.5 text-sm text-ink/50 hover:text-gold transition-colors shrink-0"
              >
                View India experiences <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {/* 4-col compact grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {india.map((d, i) => (
                <IndiaCard key={d.slug} d={d} priority={i < 4} />
              ))}
            </div>

            <div className="mt-6 md:hidden">
              <Link
                href="/packages?region=india"
                className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-gold transition-colors"
              >
                View India experiences <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="bg-sand h-px mx-8 md:mx-16" />

      {/* ── International ─────────────────────────────────────────── */}
      {international.length > 0 && (
        <section className="py-14 md:py-20 bg-cream">
          <div className="container-custom">
            {/* Section header */}
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div>
                <span className="eyebrow">International</span>
                <h2 className="heading-section mt-2">
                  Around
                  <span className="italic text-gold font-light"> the World</span>
                </h2>
                <p className="mt-2 text-ink/50 text-sm max-w-sm">
                  {international.length} destinations across Asia, Europe, the Middle East and beyond.
                </p>
              </div>
              <Link
                href="/packages?region=international"
                className="hidden md:flex items-center gap-1.5 text-sm text-ink/50 hover:text-gold transition-colors shrink-0"
              >
                View international experiences <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {/* 3-col wider grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {international.map((d, i) => (
                <IntlCard key={d.slug} d={d} priority={i < 3} />
              ))}
            </div>

            <div className="mt-6 md:hidden">
              <Link
                href="/packages?region=international"
                className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-gold transition-colors"
              >
                View international experiences <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Fallback — if Sanity has no split data yet */}
      {india.length === 0 && international.length === 0 && (
        <section className="py-16 md:py-20 bg-cream">
          <div className="container-custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {destinations.map((d, i) => (
                <IntlCard key={d.slug} d={d} priority={i < 3} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </>
  );
}
