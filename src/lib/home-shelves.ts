import type { Package } from "./data";
import type { HomeShelf } from "./sanity-queries";

const VISA_FREE_SLUGS = [
  "bali", "thailand", "sri-lanka", "maldives", "nepal", "bhutan",
  "vietnam", "mauritius", "kenya", "jordan", "indonesia", "fiji",
];

const MAY_FRIENDLY_SLUGS = [
  "switzerland", "iceland", "uk", "england", "scotland", "greece",
  "kashmir", "ladakh", "spiti", "himachal", "bali", "vietnam",
  "japan", "europe", "italy", "france", "norway",
];

// Fallback shelves used when no active homeShelf docs exist in Sanity.
// Same shape as a Sanity-fetched HomeShelf, so the page-level renderer
// has a single code path.
export const FALLBACK_HOME_SHELVES: HomeShelf[] = [
  {
    _id: "fallback-under-50k",
    eyebrow: "Easy on the wallet",
    title: "Trips under",
    italicTail: "₹50,000.",
    lede: "Real itineraries, real hotels — the full experience without the upgrade.",
    ctaHref: "/packages?budget=under-50k",
    ctaLabel: "All budget trips",
    bg: "cream",
    filterType: "priceRange",
    priceMin: 0,
    priceMax: 50000,
    maxItems: 10,
    order: 10,
  },
  {
    _id: "fallback-visa-free",
    eyebrow: "Skip the visa queue",
    title: "Visa-free escapes",
    italicTail: "for Indian passports.",
    lede: "Land, smile, get stamped. No embassy appointment, no paperwork in advance.",
    ctaHref: "/packages?theme=visa-free",
    ctaLabel: "All visa-free trips",
    bg: "paper",
    filterType: "destinationSlugs",
    destinationSlugs: VISA_FREE_SLUGS,
    maxItems: 10,
    order: 20,
  },
  {
    _id: "fallback-may-trending",
    eyebrow: "Perfect for next month",
    title: "Trending in",
    italicTail: "May.",
    lede: "Pre-monsoon clear skies, post-winter peaks, shoulder-season prices. The window we love most.",
    ctaHref: "/packages?month=may",
    ctaLabel: "All May trips",
    bg: "cream",
    filterType: "destinationSlugs",
    destinationSlugs: MAY_FRIENDLY_SLUGS,
    maxItems: 10,
    order: 30,
  },
];

export function resolveShelfPackages(
  shelf: HomeShelf,
  allPackages: Package[],
): Package[] {
  const cap = Math.max(1, Math.min(20, shelf.maxItems ?? 10));
  switch (shelf.filterType) {
    case "priceRange": {
      const min = shelf.priceMin ?? 0;
      const max = shelf.priceMax ?? Infinity;
      return allPackages
        .filter((p) => p.price >= min && p.price < max)
        .sort((a, b) => a.price - b.price)
        .slice(0, cap);
    }
    case "destinationSlugs": {
      const set = new Set((shelf.destinationSlugs ?? []).map((s) => s.toLowerCase()));
      const seen = new Set<string>();
      return allPackages
        .filter((p) => set.has(p.destinationSlug.toLowerCase()))
        .filter((p) => {
          if (seen.has(p.slug)) return false;
          seen.add(p.slug);
          return true;
        })
        .slice(0, cap);
    }
    case "travelType": {
      if (!shelf.travelType) return [];
      return allPackages
        .filter((p) => p.travelType === shelf.travelType)
        .slice(0, cap);
    }
    case "manual": {
      const ordered = shelf.manualSlugs ?? [];
      const map = new Map(allPackages.map((p) => [p.slug, p]));
      return ordered.map((s) => map.get(s)).filter((p): p is Package => Boolean(p)).slice(0, cap);
    }
    default:
      return [];
  }
}
