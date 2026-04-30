export const revalidate = 30;

import Image from "next/image";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import { getDestinations, getPackages } from "@/lib/sanity-queries";
import DestinationsBrowser from "@/components/destinations/DestinationsBrowser";

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
const INDIA_SLUGS = [
  "kerala", "goa", "kashmir", "ladakh", "rajasthan", "andaman",
  "manali", "shimla", "himachal-pradesh", "coorg", "varanasi",
  "agra", "rishikesh", "uttarakhand", "spiti-valley",
  "andaman-and-nicobar", "munnar", "ooty",
];

// Visa-free for Indian passports — drives the "Visa-free" filter chip
// and the badge on each card. Mirrors the home page list so both stay
// in sync; can move to Sanity later.
const VISA_FREE_SLUGS = [
  "bali", "thailand", "sri-lanka", "maldives", "nepal", "bhutan",
  "vietnam", "mauritius", "kenya", "jordan", "indonesia", "fiji",
];

export default async function DestinationsPage() {
  const [destinations, packages] = await Promise.all([
    getDestinations(),
    getPackages().catch(() => []),
  ]);

  // Pre-compute package count per destination slug so cards can show "12 trips"
  // without each card refetching.
  const packageCountBySlug: Record<string, number> = {};
  for (const p of packages) {
    packageCountBySlug[p.destinationSlug] = (packageCountBySlug[p.destinationSlug] ?? 0) + 1;
  }

  const indiaSet = new Set(INDIA_SLUGS);
  const isIndia = (slug: string, country: string) => country === "India" || indiaSet.has(slug);
  const indiaCount = destinations.filter((d) => isIndia(d.slug, d.country)).length;
  const intlCount = destinations.length - indiaCount;

  // ItemList JSON-LD seeds search engines with the canonical destination
  // catalog regardless of how the page is split into India / International.
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
      {/* Hero */}
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
              { n: indiaCount || "15+", label: "India destinations" },
              { n: intlCount || "20+", label: "International" },
              { n: packages.length || "130+", label: "Trips ready" },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-2xl md:text-3xl text-tat-gold font-medium">{n}</p>
                <p className="text-[11px] text-tat-paper/40 uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DestinationsBrowser
        destinations={destinations}
        packageCountBySlug={packageCountBySlug}
        indiaSlugs={INDIA_SLUGS}
        visaFreeSlugs={VISA_FREE_SLUGS}
      />

      <CTASection />
    </>
  );
}
