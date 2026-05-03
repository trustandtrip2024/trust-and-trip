export const revalidate = 300;

import Image from "next/image";
import { Suspense } from "react";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import { getDestinations, getPackages } from "@/lib/sanity-queries";
import DestinationsBrowser from "@/components/destinations/DestinationsBrowser";
import DestinationTileSkeleton from "@/components/DestinationTileSkeleton";

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

// Safety-net India slugs used when a Sanity destination doc is missing the
// `country` field. Trimmed (2026-05) to match the slugs that actually
// exist in production — stale entries (himachal-pradesh, agra, rishikesh,
// andaman-and-nicobar, munnar, ooty, hampi, meghalaya, tawang) were
// silently flagging non-existent destinations as Indian and slipping past
// the chip filters.
const INDIA_SLUGS = [
  "kerala", "goa", "kashmir", "ladakh", "rajasthan", "andaman",
  "manali", "shimla", "coorg", "varanasi", "uttarakhand",
  "spiti-valley", "zanskar-valley", "sikkim", "char-dham",
  "tirupati", "lakshadweep", "pondicherry", "mahabaleshwar",
  "lonavala", "mount-abu", "kanha", "ranthambore", "pushkar",
  "darjeeling", "north-east", "puri",
];

// Visa-free for Indian passports — drives the "Visa-free" filter chip
// and the badge on each card. Mirrors the home page list so both stay
// in sync; can move to Sanity later.
const VISA_FREE_SLUGS = [
  "bali", "thailand", "sri-lanka", "maldives", "nepal", "bhutan",
  "vietnam", "mauritius", "kenya", "jordan", "indonesia", "fiji",
];

// Pulls the heavy Sanity data + JSON-LD + browser grid. Lifted into its
// own async component so the hero can stream sync at TTFB while this
// suspends behind a skeleton — turns a 1 s blank screen into "real
// content + grid placeholder" for Meta-ad cold clicks.
async function DestinationsBody() {
  const [destinations, packages] = await Promise.all([
    getDestinations(),
    getPackages().catch(() => []),
  ]);

  const packageCountBySlug: Record<string, number> = {};
  for (const p of packages) {
    packageCountBySlug[p.destinationSlug] = (packageCountBySlug[p.destinationSlug] ?? 0) + 1;
  }

  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trust and Trip — Destinations",
    numberOfItems: destinations.length,
    itemListElement: destinations.slice(0, 60).map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://trustandtrip.com/destinations/${d.slug}`,
      name: d.name,
    })),
  };

  return (
    <>
      <JsonLd data={listLd} />
      <DestinationsBrowser
        destinations={destinations}
        packageCountBySlug={packageCountBySlug}
        indiaSlugs={INDIA_SLUGS}
        visaFreeSlugs={VISA_FREE_SLUGS}
      />
    </>
  );
}

function DestinationsBodySkeleton() {
  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <DestinationTileSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function DestinationsPage() {
  return (
    <>
      {/* Hero — sync, ships in TTFB. Stat counters fall back to fixed
          strings while the real numbers stream in below. */}
      <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 bg-tat-charcoal overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-b from-tat-charcoal/60 via-tat-charcoal/80 to-tat-charcoal" />
        <div className="container-custom relative text-center">
          <span className="eyebrow text-tat-gold">Explore</span>
          <h1 className="mt-3 font-display text-display-lg text-tat-paper font-medium max-w-3xl mx-auto text-balance leading-[1.02]">
            Every coordinate,
            <span className="italic text-tat-gold font-light"> considered.</span>
          </h1>
          <p className="mt-4 text-tat-paper/60 max-w-md mx-auto text-sm leading-relaxed">
            From Himalayan peaks to Maldivian reefs — destinations our planners know by heart.
          </p>
          <div className="mt-8 flex items-center justify-center gap-8 md:gap-12">
            {[
              { n: "15+", label: "India destinations" },
              { n: "20+", label: "International" },
              { n: "130+", label: "Trips ready" },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-2xl md:text-3xl text-tat-gold font-medium">{n}</p>
                <p className="text-[11px] text-tat-paper/40 uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Suspense fallback={<DestinationsBodySkeleton />}>
        <DestinationsBody />
      </Suspense>

      <CTASection />
    </>
  );
}
