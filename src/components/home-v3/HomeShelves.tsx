// Below-the-fold shelves bundle for the home page.
//
// Pulled out of src/app/page.tsx so the heavy Sanity fetches (5+ travel-type
// pools, the Sanity-driven shelf list, homepage content) can run inside a
// Suspense boundary while the hero + sticky subnav + trust ribbon ship as
// the first byte. Without this, every cold-cache homepage visit blocked
// rendering for the duration of the slowest Sanity call (~300–500ms even
// on a warm CDN), and users saw a white screen during that gap.

import ContentShelf from "@/components/home-v3/ContentShelf";
import FeaturedPackages from "@/components/home-v3/FeaturedPackages";
import BrowseByStyle, { type StyleId } from "@/components/home-v3/BrowseByStyle";
import LiveDeals from "@/components/home-v3/LiveDeals";
import PilgrimSpotlight from "@/components/home-v3/PilgrimSpotlight";
import WhyTrustAndTrip from "@/components/home-v3/WhyTrustAndTrip";
import SocialProof from "@/components/home-v3/SocialProof";
import FaqAndCTA from "@/components/home-v3/FaqAndCTA";
import EditorialBand from "@/components/home-v3/EditorialBand";
import PersonalRails from "@/components/home-v3/PersonalRails";
import BudgetChipShelf from "@/components/home-v3/BudgetChipShelf";
import VisaFreeShelf from "@/components/home-v3/VisaFreeShelf";
import MayMixedChipShelf from "@/components/home-v3/MayMixedChipShelf";
import type { PackageCardProps } from "@/components/ui/PackageCard";
import type { Package } from "@/lib/data";
import {
  getHomeShelves,
  getPackagesByType,
  getPilgrimPackages,
  type HomeShelf,
} from "@/lib/sanity-queries";
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

const VISA_FREE_SLUGS = new Set([
  "bali", "thailand", "sri-lanka", "maldives", "nepal", "bhutan",
  "vietnam", "mauritius", "kenya", "jordan", "indonesia", "fiji",
]);

const MAY_FRIENDLY_SLUGS = new Set([
  "switzerland", "iceland", "uk", "england", "scotland", "greece",
  "kashmir", "ladakh", "spiti", "himachal", "bali", "vietnam",
  "japan", "europe", "italy", "france", "norway",
]);

export default async function HomeShelves() {
  // Run inside the Suspense boundary so the slowest fetch doesn't block
  // the hero. React's automatic streaming flushes this section as soon as
  // every await resolves.
  const [couple, family, solo, group, pilgrimPackages, sanityShelves] = await Promise.all([
    getPackagesByType("Couple"),
    getPackagesByType("Family"),
    getPackagesByType("Solo"),
    getPackagesByType("Group"),
    getPilgrimPackages(),
    getHomeShelves().catch(() => [] as HomeShelf[]),
  ]);

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

  const allCardPropsDeduped = Object.values(packagesBySlug);

  // Style → relevant package pool. Earlier this map fed Honeymoon=Couple
  // (any couple trip, not specifically honeymoon-tagged) and left
  // Adventure/Wellness/Luxury empty so their tiles always read "0".
  // Now we derive each pool from the canonical category list, with
  // travelType used as a fallback for Family/Solo/Group where the
  // category column may be missing on older docs. Pilgrim still uses
  // the dedicated query (covers Pilgrim + Spiritual categories).
  // Dedupe by slug so the same package never lands in a tile twice.
  const uniqueBySlug = (list: Package[]) => {
    const seen = new Set<string>();
    return list.filter((p) => (seen.has(p.slug) ? false : (seen.add(p.slug), true)));
  };
  const byCategory = (cat: string) => {
    const lower = cat.toLowerCase();
    return allPackages.filter((p) =>
      (p.categories ?? []).some((c) => c.toLowerCase() === lower),
    );
  };

  const honeymoonPool = byCategory("Honeymoon");
  const familyPool    = uniqueBySlug([...byCategory("Family"),     ...family]);
  const soloPool      = uniqueBySlug([...byCategory("Solo"),       ...solo]);
  const groupPool     = uniqueBySlug([...byCategory("Groups"),     ...group]);
  const adventurePool = byCategory("Adventure");
  const wellnessPool  = byCategory("Wellness");
  const luxuryPool    = byCategory("Luxury");

  const packagesByStyle: Partial<Record<StyleId, PackageCardProps[]>> = {
    Honeymoon: honeymoonPool.map(toCardProps),
    Family:    familyPool.map(toCardProps),
    Solo:      soloPool.map(toCardProps),
    Group:     groupPool.map(toCardProps),
    Adventure: adventurePool.map(toCardProps),
    Wellness:  wellnessPool.map(toCardProps),
    Pilgrim:   pilgrimPackages.map(toCardProps),
    Luxury:    luxuryPool.map(toCardProps),
  };
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

  const renderedShelves = sanityShelves.map((shelf) => ({
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
      <PersonalRails packagesBySlug={packagesBySlug} />
      <FeaturedPackages packagesByType={featuredByType} />
      {sanityShelves.length ? renderShelfAt(0) : <BudgetChipShelf packages={allCardPropsDeduped} />}
      <BrowseByStyle packagesByStyle={packagesByStyle} />
      {sanityShelves.length ? renderShelfAt(1) : <VisaFreeShelf packages={visaFreePool} />}
      <LiveDeals />
      {sanityShelves.length ? renderShelfAt(2) : <MayMixedChipShelf packages={mayPool} />}
      <PilgrimSpotlight />
      {group.length > 0 && (
        <ContentShelf
          eyebrow="Group trips, your group only"
          title="Travel together,"
          italicTail="planner along."
          ctaHref="/group-trips"
          ctaLabel="Group concierge & all batches →"
          packages={group.map(toCardProps).slice(0, 8)}
          bg="cream"
        />
      )}
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
    </>
  );
}
