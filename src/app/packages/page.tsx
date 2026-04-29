export const revalidate = 30;

import { getPackages, getDestinations } from "@/lib/sanity-queries";
import PackagesClient from "./PackagesClient";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";

export const metadata = {
  title: "Tour Packages — Handcrafted Trips for Every Traveller",
  description: "Browse 130+ handcrafted tour packages across India and the world — honeymoon, family, group and solo trips starting from ₹10,000.",
  alternates: { canonical: "https://trustandtrip.com/packages" },
  openGraph: {
    title: "Tour Packages — Trust and Trip",
    description: "130+ handcrafted packages across 23 destinations. Couples, families, groups and solo.",
  },
};

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }> | { [key: string]: string | undefined };
}) {
  const [packages, destinations, params] = await Promise.all([
    getPackages(),
    getDestinations(),
    Promise.resolve(searchParams),
  ]);

  // ItemList JSON-LD so search engines see the catalog structure
  // independent of client-side filter state. Caps at 50 entries to keep
  // payload reasonable.
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trust and Trip — Tour Packages",
    numberOfItems: packages.length,
    itemListElement: packages.slice(0, 50).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://trustandtrip.com/packages/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <>
      <JsonLd data={listLd} />

      <section className="pt-28 md:pt-36 pb-12 md:pb-16 bg-tat-paper border-b border-tat-charcoal/5">
        <div className="container-custom">
          <span className="eyebrow">Our Packages</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] max-w-4xl text-balance">
            Signature journeys.
            <span className="italic text-tat-gold font-light"> Ready to live.</span>
          </h1>
          <p className="mt-6 text-tat-charcoal/60 max-w-xl leading-relaxed">
            Every package here was designed by a planner who&apos;s been there. Filter by what
            matters, or let us build one from scratch.
          </p>
        </div>
      </section>

      <PackagesClient
        packages={packages}
        destinations={destinations}
        initialDestination={params.destination ?? ""}
        initialTravelType={params.type ?? ""}
        initialDuration={params.duration ?? ""}
        initialBudget={params.budget ?? ""}
        initialRegion={params.region ?? ""}
        initialCategory={params.category ?? ""}
      />

      <CTASection />
    </>
  );
}
