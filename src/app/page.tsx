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
  getHomeShelves,
  getPackagesByType,
  getPilgrimPackages,
  type HomeShelf,
} from "@/lib/sanity-queries";
import { getSiteStats } from "@/lib/site-stats";
import {
  FALLBACK_HOME_SHELVES,
  resolveShelfPackages,
} from "@/lib/home-shelves";

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

  const shelves: HomeShelf[] = sanityShelves.length ? sanityShelves : FALLBACK_HOME_SHELVES;
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
        lede={shelf.lede}
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
      <FeaturedPackages packages={featured} />
      {renderShelfAt(0)}
      <BrowseByStyle packagesByStyle={packagesByStyle} />
      {renderShelfAt(1)}
      <LiveDeals />
      {renderShelfAt(2)}
      <PilgrimSpotlight />
      {overflowShelves.map(({ shelf, packages }) =>
        packages.length ? (
          <ContentShelf
            key={shelf._id}
            eyebrow={shelf.eyebrow}
            title={shelf.title}
            italicTail={shelf.italicTail}
            lede={shelf.lede}
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
