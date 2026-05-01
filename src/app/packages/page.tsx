export const revalidate = 300;

import { Suspense } from "react";
import { getPackages, getDestinations } from "@/lib/sanity-queries";
import PackagesClient from "./PackagesClient";
import PackageCardSkeleton from "@/components/PackageCardSkeleton";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";

export const metadata = {
  title: "Tour Packages — India + 30 Countries · Essentials, Signature, Private",
  description: "250+ founder-signed tour packages across India and 30+ countries. Three tiers — Essentials from ₹15k, Signature, and Private — with pickup from your city. Built by Akash and his planning team, not a marketplace.",
  alternates: { canonical: "https://trustandtrip.com/packages" },
  openGraph: {
    title: "Trust and Trip — Tour Packages",
    description: "250+ packages across 50+ destinations. Three tiers (Essentials/Signature/Private). Founder-signed itineraries.",
  },
};

// Reading `searchParams` server-side forces the route into dynamic
// rendering, which kills ISR + edge cache. Filters are seeded inside
// PackagesClient via `useSearchParams()` (post-hydration on the client),
// so the page stays statically renderable and Meta-ad cold-clicks hit
// the cached HTML instead of a fresh function invocation.
async function PackagesGrid() {
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
      <PackagesClient packages={packages} destinations={destinations} />
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

export default function PackagesPage() {
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
        <PackagesGrid />
      </Suspense>

      <CTASection />
    </>
  );
}
