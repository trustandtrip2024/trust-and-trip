export const revalidate = 300;

import { Suspense } from "react";
import { getPackages, getDestinations } from "@/lib/sanity-queries";
import PackagesClient from "./PackagesClient";
import PackageCardSkeleton from "@/components/PackageCardSkeleton";
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

interface SP {
  destination?: string;
  type?: string;
  duration?: string;
  budget?: string;
  region?: string;
  category?: string;
}

// Heavy data + grid moved into its own async component so it can stream
// inside a Suspense boundary. Without this the page blocks for the full
// `getPackages()` round-trip (250+ docs from Sanity, ~3 MB of HTML once
// rendered) before ANY byte ships, which on a Meta-ad cold click gives
// the visitor a blank screen for ~2 s. Now the header section + skeleton
// fallback ship as the first byte and the grid streams in behind it.
async function PackagesGrid({ params }: { params: SP }) {
  const [packages, destinations] = await Promise.all([
    getPackages(),
    getDestinations(),
  ]);

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
    </>
  );
}

function PackagesGridSkeleton() {
  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <PackageCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<SP> | SP;
}) {
  // Resolve searchParams up-front so Suspense doesn't re-suspend on it.
  // Header section ships sync — visitor sees real content within TTFB.
  const params = await Promise.resolve(searchParams);

  return (
    <>
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

      <Suspense fallback={<PackagesGridSkeleton />}>
        <PackagesGrid params={params} />
      </Suspense>

      <CTASection />
    </>
  );
}
