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
import BudgetChipShelf from "@/components/home-v3/BudgetChipShelf";
import VisaFreeShelf from "@/components/home-v3/VisaFreeShelf";
import MayMixedChipShelf from "@/components/home-v3/MayMixedChipShelf";
import type { PackageCardProps } from "@/components/ui/PackageCard";
import type { Package } from "@/lib/data";
import {
  getDestinations,
  getHomeShelves,
  getPackagesByType,
  getPilgrimPackages,
  type HomeShelf,
} from "@/lib/sanity-queries";
import { getSiteStats } from "@/lib/site-stats";
import { resolveShelfPackages } from "@/lib/home-shelves";

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

// Slugs treated as visa-free for Indian passports — drives the dedicated
// VisaFreeShelf chip filter.
const VISA_FREE_SLUGS = new Set([
  "bali", "thailand", "sri-lanka", "maldives", "nepal", "bhutan",
  "vietnam", "mauritius", "kenya", "jordan", "indonesia", "fiji",
]);

// Slugs that work well in May (pre-monsoon shoulder season).
const MAY_FRIENDLY_SLUGS = new Set([
  "switzerland", "iceland", "uk", "england", "scotland", "greece",
  "kashmir", "ladakh", "spiti", "himachal", "bali", "vietnam",
  "japan", "europe", "italy", "france", "norway",
]);

export default async function HomePage() {
  const [siteStats, destinations, couple, family, solo, group, pilgrimPackages, sanityShelves] = await Promise.all([
    getSiteStats(),
    getDestinations(),
    getPackagesByType("Couple"),
    getPackagesByType("Family"),
    getPackagesByType("Solo"),
    getPackagesByType("Group"),
    getPilgrimPackages(),
    getHomeShelves().catch(() => [] as HomeShelf[]),
  ]);

  const packagesByStyle: Partial<Record<StyleId, PackageCardProps[]>> = {
    Honeymoon: couple.map(toCardProps),
    Family:    family.map(toCardProps),
    Solo:      solo.map(toCardProps),
    Group:     group.map(toCardProps),
    Pilgrim:   pilgrimPackages.map(toCardProps),
  };

  const featuredByType = {
    Couple: couple.map(toCardProps),
    Family: family.map(toCardProps),
    Solo:   solo.map(toCardProps),
    Group:  group.map(toCardProps),
  };

  const allPackages: Package[] = [...couple, ...family, ...solo, ...group, ...pilgrimPackages];

  const packagesBySlug: Record<string, PackageCardProps> = {};
  for (const p of allPackages) {
    if (!packagesBySlug[p.slug]) packagesBySlug[p.slug] = toCardProps(p);
  }

  // Pre-filter package pools for chip-driven shelves so the client
  // components stay deduped and small.
  const allCardPropsDeduped = Object.values(packagesBySlug);
  const visaFreePool = allCardPropsDeduped.filter((p) => {
    const slug = p.href.replace(/^\/packages\//, "").split("/")[0];
    const dest = (p.destination ?? "").toLowerCase();
    return [...VISA_FREE_SLUGS].some((s) => slug.includes(s) || dest.includes(s));
  });
  const mayPool = allCardPropsDeduped.filter((p) => {
    const slug = p.href.replace(/^\/packages\//, "").split("/")[0];
    const dest = (p.destination ?? "").toLowerCase();
    return [...MAY_FRIENDLY_SLUGS].some((s) => slug.includes(s) || dest.includes(s));
  });

  // Sanity-driven shelves still take precedence when present. Otherwise we
  // render the three new chip-driven sections inline below.
  const shelves: HomeShelf[] = sanityShelves;
  const renderedShelves = shelves.map((shelf) => ({
    shelf,
    packages: resolveShelfPackages(shelf, allPackages).map(toCardProps),
  }));
  const renderShelfAt = (i: number) => {
    const slot = renderedShelves[i];
    if (!slot || !slot.packages.length) return null;
    const { shelf, packages } = slot;
    return (
      <ContentShelf
        key={shelf._id}
        eyebrow={shelf.eyebrow}
        title={shelf.title}
        italicTail={shelf.italicTail}
        ctaHref={shelf.ctaHref}
        ctaLabel={shelf.ctaLabel}
        packages={packages}
        bg={shelf.bg}
      />
    );
  };
  const overflowShelves = renderedShelves.slice(3);

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
      <FeaturedPackages packagesByType={featuredByType} />
      {sanityShelves.length ? renderShelfAt(0) : <BudgetChipShelf packages={allCardPropsDeduped} />}
      <BrowseByStyle packagesByStyle={packagesByStyle} />
      {sanityShelves.length ? renderShelfAt(1) : <VisaFreeShelf packages={visaFreePool} />}
      <LiveDeals />
      {sanityShelves.length ? renderShelfAt(2) : <MayMixedChipShelf packages={mayPool} />}
      <PilgrimSpotlight />
      {overflowShelves.map(({ shelf, packages }) =>
        packages.length ? (
          <ContentShelf
            key={shelf._id}
            eyebrow={shelf.eyebrow}
            title={shelf.title}
            italicTail={shelf.italicTail}
            ctaHref={shelf.ctaHref}
            ctaLabel={shelf.ctaLabel}
            packages={packages}
            bg={shelf.bg}
          />
        ) : null
      )}
      <EditorialBand />
      <WhyTrustAndTrip />
      <SocialProof />
      <FaqAndCTA />
      <SeoContent destinations={destinations} />
    </>
  );
}
