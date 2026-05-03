export const revalidate = 60;

export const metadata = {
  title: "Trust and Trip — Trips that feel made just for you",
  description:
    "A real planner builds your itinerary in 24 hours. Free until you're sure. 4.9 on Google · 8,000+ travelers since 2019.",
  alternates: { canonical: "https://trustandtrip.com" },
};

import { Suspense } from "react";
import HomeDealRibbon from "@/components/home/HomeDealRibbon";
import Hero from "@/components/home-v3/Hero";
import TrustRibbon from "@/components/home-v3/TrustRibbon";
import StickySubnav from "@/components/home-v3/StickySubnav";
import TrendingDestinations from "@/components/home-v3/TrendingDestinations";
import HomepageSchema from "@/components/home-v3/HomepageSchema";
import HomeShelves from "@/components/home-v3/HomeShelves";
import HomeShelvesSkeleton from "@/components/home-v3/HomeShelvesSkeleton";
import HomeContinuePlanning from "@/components/home-v3/HomeContinuePlanning";
import HomeQuickStyleChips from "@/components/home-v3/HomeQuickStyleChips";
import HomePickupCity from "@/components/home-v3/HomePickupCity";
import RecognitionStrip from "@/components/home-v3/RecognitionStrip";
import {
  getDestinations,
  getHomepageContent,
} from "@/lib/sanity-queries";
import { getSiteStats } from "@/lib/site-stats";

export default async function HomePage() {
  // Above-the-fold needs only siteStats + destinations + homepage content.
  // Everything else (5 travel-type package pools, Sanity shelves) was
  // moved into HomeShelves and runs inside a Suspense boundary so the
  // hero ships as the first byte instead of waiting for the slowest
  // Sanity call to resolve.
  const [siteStats, destinations, homepageContent] = await Promise.all([
    getSiteStats(),
    getDestinations(),
    getHomepageContent().catch(() => null),
  ]);

  return (
    <>
      <HomepageSchema
        rating={siteStats.googleRating}
        reviewCount={siteStats.googleReviewCount}
        totalTravelers={siteStats.totalTravelers}
      />
      <HomeDealRibbon />
      <Hero
        trustStrip={siteStats.trustStripLine}
        heroImage={homepageContent?.hero?.heroImage}
        videoMp4Url={homepageContent?.hero?.videoMp4Url}
        videoPosterUrl={homepageContent?.hero?.videoPosterUrl}
      />
      <StickySubnav destinations={destinations} />
      <TrustRibbon
        totalTravelers={siteStats.totalTravelers}
        reviewCount={siteStats.googleReviewCount}
        rating={siteStats.googleRating}
      />

      {/* Pickup-city memory chip — persists the visitor's preferred
          start city to localStorage so package pricing + flight context
          can adapt downstream. Default is "New Delhi" but stays
          unacknowledged (and prompts) until the visitor confirms. */}
      <HomePickupCity />

      {/* Quick browse-by-style chips — single-tap path into the
          /packages catalogue pre-filtered by category. Helps known-vibe
          visitors skip the discovery scroll. */}
      <HomeQuickStyleChips />

      <TrendingDestinations destinations={destinations} />

      {/* Returning-visitor rail — pulls slugs from the persisted wishlist
          store and renders mini cards. Self-hides on first-time visits.
          Sits early in the page so known users land on their own state. */}
      <HomeContinuePlanning />

      <RecognitionStrip />

      {/* Stream the heavy below-fold sections. The hero/trust above ships
          immediately; this Suspense flush waits on the package fetches but
          shows a skeleton instead of blocking the whole document. */}
      <Suspense fallback={<HomeShelvesSkeleton />}>
        <HomeShelves />
      </Suspense>
    </>
  );
}
