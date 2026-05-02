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
import HomeFilterShelf from "@/components/home-v3/HomeFilterShelf";
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

const VISA_FREE_SLUGS = [
  "bali", "thailand", "sri-lanka", "maldives", "nepal", "bhutan",
  "vietnam", "mauritius", "kenya", "jordan", "indonesia", "fiji",
];

const MAY_FRIENDLY_SLUGS = [
  "switzerland", "iceland", "uk", "england", "scotland", "greece",
  "kashmir", "ladakh", "spiti", "himachal", "bali", "vietnam",
  "japan", "europe", "italy", "france", "norway",
];

// Vibe → slug fragments used for href/destination matching inside
// HomeFilterShelf. Pilgrim + adventure are sourced from category data
// downstream; the slug list here is a fallback for legacy docs.
const VIBE_SLUGS = {
  beach:     ["bali", "maldives", "kerala", "goa", "mauritius", "fiji", "santorini", "vietnam", "phuket", "andaman"],
  mountain:  ["switzerland", "iceland", "norway", "kashmir", "ladakh", "spiti", "himachal", "nepal", "bhutan", "japan"],
  cultural:  ["rajasthan", "jaipur", "italy", "france", "greece", "europe", "japan", "uk", "england", "scotland"],
  pilgrim:   ["varanasi", "tirupati", "char-dham", "kedarnath", "badrinath", "amarnath", "vaishno", "rishikesh", "haridwar"],
  adventure: ["ladakh", "spiti", "iceland", "nepal", "manali", "rishikesh", "uttarakhand", "andaman", "sikkim"],
};

function matchPool(packages: PackageCardProps[], hints: string[]): PackageCardProps[] {
  return packages.filter((p) => {
    const slug = p.href.replace(/^\/packages\//, "").split("/")[0];
    const dest = (p.destination ?? "").toLowerCase();
    return hints.some((h) => slug.includes(h) || dest.includes(h));
  });
}

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

  // Pre-compute href sets for HomeFilterShelf. Keeping the heavy slug
  // matching on the server avoids re-running it on every chip click.
  const visaFreeHrefs    = matchPool(allCardPropsDeduped, VISA_FREE_SLUGS).map((p) => p.href);
  const mayFriendlyHrefs = matchPool(allCardPropsDeduped, MAY_FRIENDLY_SLUGS).map((p) => p.href);

  // Pilgrim + adventure: union slug-match with category-match so legacy
  // docs without categories still surface, and category-only docs still
  // surface even if the destination slug is unfamiliar.
  const pilgrimHrefs = Array.from(new Set([
    ...matchPool(allCardPropsDeduped, VIBE_SLUGS.pilgrim).map((p) => p.href),
    ...pilgrimPackages.map((p) => `/packages/${p.slug}`),
  ]));
  const adventureHrefs = Array.from(new Set([
    ...matchPool(allCardPropsDeduped, VIBE_SLUGS.adventure).map((p) => p.href),
    ...adventurePool.map((p) => `/packages/${p.slug}`),
  ]));

  const renderedShelves = sanityShelves.map((shelf) => ({
    shelf,
    packages: resolveShelfPackages(shelf, allPackages).map(toCardProps),
  }));

  return (
    <>
      <PersonalRails packagesBySlug={packagesBySlug} />
      <FeaturedPackages packagesByType={featuredByType} />

      {/* Multi-dim filter shelf. Replaces three separate chip rails
          (budget / month / visa-free) — visitors used to scroll past
          near-identical lists cut on different axes. Now: one rail,
          four chip groups, URL-hash state. */}
      <HomeFilterShelf
        packages={allCardPropsDeduped}
        visaFreeHrefs={visaFreeHrefs}
        mayFriendlyHrefs={mayFriendlyHrefs}
        vibeHrefs={{
          beach:     VIBE_SLUGS.beach,
          mountain:  VIBE_SLUGS.mountain,
          cultural:  VIBE_SLUGS.cultural,
          pilgrim:   pilgrimHrefs,
          adventure: adventureHrefs,
        }}
      />

      <BrowseByStyle packagesByStyle={packagesByStyle} />
      <LiveDeals />
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

      {/* Sanity-authored shelves render after the curated layout. Editors
          can add additional shelves without us touching code. */}
      {renderedShelves.map(({ shelf, packages }) =>
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
