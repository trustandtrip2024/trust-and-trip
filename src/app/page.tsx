export const revalidate = 300;

export const metadata = {
  title: "Trust and Trip — Trips that feel made just for you",
  description:
    "A real planner builds your itinerary in 24 hours. Free until you're sure. 4.9 on Google · 8,000+ travelers since 2019.",
  alternates: { canonical: "https://trustandtrip.com" },
};

import { Suspense } from "react";
import Hero from "@/components/home-v3/Hero";
import TrustRibbon from "@/components/home-v3/TrustRibbon";
import HomepageSchema from "@/components/home-v3/HomepageSchema";
import HomeContinuePlanning from "@/components/home-v3/HomeContinuePlanning";
import HomeFacetedBrowse from "@/components/home-v4/HomeFacetedBrowse";
import HomeEditorialMosaic from "@/components/home-v4/HomeEditorialMosaic";
import HomeOpenTrips from "@/components/home-v4/HomeOpenTrips";
import HomeProof from "@/components/home-v4/HomeProof";
import HomePlannerCTA from "@/components/home-v4/HomePlannerCTA";
import { getDestinations, getHomepageContent } from "@/lib/sanity-queries";
import { getSiteStats } from "@/lib/site-stats";

export default async function HomePage() {
  // Above-the-fold needs siteStats + destinations + homepage content.
  // The mosaic uses destinations directly. Open-trips streams its own
  // Sanity query inside a Suspense boundary so the hero ships first.
  const [siteStats, destinations, homepageContent] = await Promise.all([
    getSiteStats(),
    getDestinations(),
    getHomepageContent().catch(() => null),
  ]);

  // Mosaic seed — top six by lowest priceFrom (cheapest first reads as
  // "accessible boutique" without an algorithm). Editors can override
  // later via a Sanity featuredHomeMosaic document.
  const mosaicDestinations = [...destinations]
    .filter((d) => d.image && d.priceFrom)
    .sort((a, b) => (a.priceFrom ?? 0) - (b.priceFrom ?? 0))
    .slice(0, 6);

  return (
    <>
      <HomepageSchema
        rating={siteStats.googleRating}
        reviewCount={siteStats.googleReviewCount}
        totalTravelers={siteStats.totalTravelers}
      />
      <Hero
        trustStrip={siteStats.trustStripLine}
        heroImage={homepageContent?.hero?.heroImage}
        videoMp4Url={homepageContent?.hero?.videoMp4Url}
        videoPosterUrl={homepageContent?.hero?.videoPosterUrl}
      />
      <TrustRibbon
        totalTravelers={siteStats.totalTravelers}
        reviewCount={siteStats.googleReviewCount}
        rating={siteStats.googleRating}
      />

      {/* Single faceted-browse form — replaces the four chip-rail shelves
          (budget, visa-free, May-mixed, live deals) with one canonical
          "where? when? who? budget?" submit-to-/packages flow. */}
      <HomeFacetedBrowse destinations={destinations} />

      {/* Editorial mosaic — six destinations, varied tile sizes, manual
          curation. Replaces the trending-destinations grid + most rails
          with a magazine-style spread. */}
      {mosaicDestinations.length === 6 && (
        <HomeEditorialMosaic destinations={mosaicDestinations} />
      )}

      {/* Returning-visitor rail — pulls slugs from the persisted wishlist
          store. Self-hides on first-time visits. */}
      <HomeContinuePlanning />

      {/* Real fixed-departure trips. Streams its own Sanity query so the
          hero + mosaic ship before the departure data resolves. */}
      <Suspense fallback={null}>
        <HomeOpenTrips />
      </Suspense>

      {/* Three trust pillars + matched Google reviews. Replaces the
          marquee, polaroids, and why-us tile grid. */}
      <HomeProof />

      {/* Founder + WhatsApp/Call/Email + 3 FAQs. Replaces the FAQ-heavy
          closer. */}
      <HomePlannerCTA />
    </>
  );
}
