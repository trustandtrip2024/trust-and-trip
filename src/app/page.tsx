export const revalidate = 30;

export const metadata = {
  title: "Trust and Trip — Trips that feel made just for you",
  description:
    "A real planner builds your itinerary in 24 hours. Free until you're sure. 4.9 on Google · 8,000+ travelers since 2019.",
  alternates: { canonical: "https://trustandtrip.com" },
};

import HomeDealRibbon from "@/components/home/HomeDealRibbon";
import Hero from "@/components/home-v3/Hero";
import TrustRibbon from "@/components/home-v3/TrustRibbon";
import StickySubnav from "@/components/home-v3/StickySubnav";
import TrendingDestinations from "@/components/home-v3/TrendingDestinations";
import FeaturedPackages from "@/components/home-v3/FeaturedPackages";
import BrowseByStyle, { type StyleId } from "@/components/home-v3/BrowseByStyle";
import LiveDeals from "@/components/home-v3/LiveDeals";
import PilgrimSpotlight from "@/components/home-v3/PilgrimSpotlight";
import WhyTrustAndTrip from "@/components/home-v3/WhyTrustAndTrip";
import SocialProof from "@/components/home-v3/SocialProof";
import FaqAndCTA from "@/components/home-v3/FaqAndCTA";
import type { PackageCardProps } from "@/components/ui/PackageCard";
import type { Package } from "@/lib/data";
import {
  getDestinations,
  getPackagesByType,
  getPilgrimPackages,
} from "@/lib/sanity-queries";
import { getSiteStats } from "@/lib/site-stats";

function toCardProps(p: Package): PackageCardProps {
  return {
    image: p.image,
    title: p.title,
    href: `/packages/${p.slug}`,
    destination: p.destinationName,
    travelStyle: p.travelType,
    duration: p.duration,
    rating: p.rating,
    ratingCount: p.reviews,
    price: p.price,
    originalPrice: Math.round(p.price * 1.18),
    saveAmount: Math.round(p.price * 0.18),
    customizeHref: `/customize-trip?package=${p.slug}`,
    trending: p.trending,
    limitedSlots: p.limitedSlots,
  };
}

export default async function HomePage() {
  const [siteStats, destinations, couple, family, solo, group, pilgrimPackages] = await Promise.all([
    getSiteStats(),
    getDestinations(),
    getPackagesByType("Couple"),
    getPackagesByType("Family"),
    getPackagesByType("Solo"),
    getPackagesByType("Group"),
    getPilgrimPackages(),
  ]);

  const packagesByStyle: Partial<Record<StyleId, PackageCardProps[]>> = {
    Honeymoon: couple.map(toCardProps),
    Family:    family.map(toCardProps),
    Solo:      solo.map(toCardProps),
    Group:     group.map(toCardProps),
    Pilgrim:   pilgrimPackages.map(toCardProps),
  };

  const featured: PackageCardProps[] = [
    ...couple.slice(0, 2),
    ...family.slice(0, 2),
    ...solo.slice(0, 2),
    ...group.slice(0, 2),
  ].map(toCardProps);

  return (
    <>
      <HomeDealRibbon />
      <Hero trustStrip={siteStats.trustStripLine} />
      <StickySubnav />
      <TrustRibbon
        totalTravelers={siteStats.totalTravelers}
        reviewCount={siteStats.googleReviewCount}
        rating={siteStats.googleRating}
      />

      <TrendingDestinations destinations={destinations} />
      <FeaturedPackages packages={featured} />
      <BrowseByStyle packagesByStyle={packagesByStyle} />
      <LiveDeals />
      <PilgrimSpotlight />
      <WhyTrustAndTrip />
      <SocialProof />
      <FaqAndCTA />
    </>
  );
}
