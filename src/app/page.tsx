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
import ContentShelf from "@/components/home-v3/ContentShelf";
import EditorialBand from "@/components/home-v3/EditorialBand";
import PersonalRails from "@/components/home-v3/PersonalRails";
import HomepageSchema from "@/components/home-v3/HomepageSchema";
import SeoContent from "@/components/home-v3/SeoContent";
import type { PackageCardProps } from "@/components/ui/PackageCard";
import type { Package } from "@/lib/data";
import {
  getDestinations,
  getPackagesByType,
  getPilgrimPackages,
} from "@/lib/sanity-queries";
import { getSiteStats } from "@/lib/site-stats";

const VISA_FREE_SLUGS = new Set([
  "bali", "thailand", "sri-lanka", "maldives", "nepal", "bhutan",
  "vietnam", "mauritius", "kenya", "jordan", "indonesia", "fiji",
]);

const MAY_FRIENDLY_SLUGS = new Set([
  "switzerland", "iceland", "uk", "england", "scotland", "greece",
  "kashmir", "ladakh", "spiti", "himachal", "bali", "vietnam",
  "japan", "europe", "italy", "france", "norway",
]);

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

  const allPackages: Package[] = [...couple, ...family, ...solo, ...group, ...pilgrimPackages];

  const packagesBySlug: Record<string, PackageCardProps> = {};
  for (const p of allPackages) {
    if (!packagesBySlug[p.slug]) packagesBySlug[p.slug] = toCardProps(p);
  }

  const seenSlugs = new Set<string>();
  const dedupe = (list: Package[]) =>
    list.filter((p) => {
      if (seenSlugs.has(p.slug)) return false;
      seenSlugs.add(p.slug);
      return true;
    });

  const under50k = allPackages
    .filter((p) => p.price < 50000)
    .sort((a, b) => a.price - b.price)
    .slice(0, 10)
    .map(toCardProps);
  const visaFree = allPackages
    .filter((p) => VISA_FREE_SLUGS.has(p.destinationSlug))
    .slice(0, 10)
    .map(toCardProps);
  const mayPicks = dedupe(
    allPackages.filter((p) => MAY_FRIENDLY_SLUGS.has(p.destinationSlug))
  )
    .slice(0, 10)
    .map(toCardProps);

  return (
    <>
      <HomepageSchema
        rating={siteStats.googleRating}
        reviewCount={siteStats.googleReviewCount}
        totalTravelers={siteStats.totalTravelers}
      />
      <HomeDealRibbon />
      <Hero trustStrip={siteStats.trustStripLine} />
      <StickySubnav destinations={destinations} />
      <TrustRibbon
        totalTravelers={siteStats.totalTravelers}
        reviewCount={siteStats.googleReviewCount}
        rating={siteStats.googleRating}
      />

      <PersonalRails packagesBySlug={packagesBySlug} />
      <TrendingDestinations destinations={destinations} />
      <FeaturedPackages packages={featured} />
      <ContentShelf
        eyebrow="Easy on the wallet"
        title="Trips under"
        italicTail="₹50,000."
        lede="Real itineraries, real hotels — the full experience without the upgrade."
        ctaHref="/packages?budget=under-50k"
        ctaLabel="All budget trips"
        packages={under50k}
        bg="cream"
      />
      <BrowseByStyle packagesByStyle={packagesByStyle} />
      <ContentShelf
        eyebrow="Skip the visa queue"
        title="Visa-free escapes"
        italicTail="for Indian passports."
        lede="Land, smile, get stamped. No embassy appointment, no paperwork in advance."
        ctaHref="/packages?theme=visa-free"
        ctaLabel="All visa-free trips"
        packages={visaFree}
      />
      <LiveDeals />
      <ContentShelf
        eyebrow="Perfect for next month"
        title="Trending in"
        italicTail="May."
        lede="Pre-monsoon clear skies, post-winter peaks, shoulder-season prices. The window we love most."
        ctaHref="/packages?month=may"
        ctaLabel="All May trips"
        packages={mayPicks}
        bg="cream"
      />
      <PilgrimSpotlight />
      <EditorialBand />
      <WhyTrustAndTrip />
      <SocialProof />
      <FaqAndCTA />
      <SeoContent destinations={destinations} />
    </>
  );
}
