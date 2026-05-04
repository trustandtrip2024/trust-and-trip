import { cache } from "react";
import { sanityClient, urlFor } from "./sanity";
import type { Destination, GalleryPhoto, Package } from "./data";

// React.cache() handles per-render dedup. Cross-request caching is
// delegated to Next.js's data cache + ISR (`export const revalidate = N`
// on the consuming page), which is more correct than the Redis layer we
// used to wrap around these queries.
//
// Why we dropped Redis here: @upstash/redis's REST client defaults its
// underlying fetch to `cache: "no-store"`. Calling it from inside a
// Server Component render path tripped Next 14's dynamic-rendering
// opt-in, which forced /, /destinations, /packages and friends to
// re-execute on every request and emitted `Cache-Control: private,
// no-cache, no-store` — turning every Meta-ad cold-click into a fresh
// function invocation. Removing the Redis layer here lets Vercel serve
// the prerendered ISR HTML from the edge cache (X-Vercel-Cache:
// PRERENDER → HIT). Redis stays in place for rate limiting and other
// non-render hot paths.

const TTL = {
  short: 2 * 60,
  medium: 5 * 60,
  long: 10 * 60,
};

async function cached<T>(_key: string, _ttl: number, fn: () => Promise<T>): Promise<T> {
  return fn();
}

// ─── Blog post type ────────────────────────────────────────────────────────

export type SanityBlogPost = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  featured: boolean;
  tags: string[];
};

// ─── Destination queries ───────────────────────────────────────────────────

// Gallery projection — flatten Sanity image refs to direct asset URLs +
// preserve alt/caption for lightbox UI. `width=2400&q=85` keeps the
// large-screen render sharp without blowing the cdn.sanity.io budget.
const GALLERY_PROJ = `gallery[]{
  "url": asset->url + "?w=2400&q=85&auto=format&fit=max",
  alt,
  caption
}`;

const DESTINATIONS_QUERY = `*[_type == "destination"] | order(name asc) {
  "name": name,
  "slug": slug.current,
  "country": countryRef->name,
  "countrySlug": countryRef->slug.current,
  "region": coalesce(countryRef->region, region),
  "priceFrom": priceFrom,
  "tagline": tagline,
  "image": image,
  "heroImage": heroImage,
  "overview": overview,
  "bestTimeToVisit": bestTimeToVisit,
  "idealDuration": idealDuration,
  "thingsToDo": thingsToDo,
  "highlights": highlights,
  "whisper": whisper,
  "_updatedAt": _updatedAt,
  ${GALLERY_PROJ}
}`;

const DESTINATION_BY_SLUG_QUERY = `*[_type == "destination" && slug.current == $slug][0] {
  "name": name,
  "slug": slug.current,
  "country": countryRef->name,
  "countrySlug": countryRef->slug.current,
  "region": coalesce(countryRef->region, region),
  "priceFrom": priceFrom,
  "tagline": tagline,
  "image": image,
  "heroImage": heroImage,
  "overview": overview,
  "bestTimeToVisit": bestTimeToVisit,
  "idealDuration": idealDuration,
  "thingsToDo": thingsToDo,
  "highlights": highlights,
  "whisper": whisper,
  "_updatedAt": _updatedAt,
  ${GALLERY_PROJ}
}`;

type SanityDestination = Omit<Destination, "image" | "heroImage"> & {
  image: any;
  heroImage: any;
  _updatedAt?: string;
};

// Append a doc-version cache-buster to image URLs so swapping a Sanity image
// (or repositioning its hotspot) actually changes the URL the browser sees.
// Without this, edits that reuse the same asset id render no visible change
// because Vercel image-optimizer + browser keep the prior bytes.
function bust(url: string, ts?: string): string {
  if (!ts) return url;
  const v = ts.replace(/\D/g, "").slice(0, 14);
  return url + (url.includes("?") ? "&" : "?") + "v=" + v;
}

export const getDestinations = cache(async (): Promise<Destination[]> => {
  return cached("sanity:destinations", TTL.long, async () => {
    const raw = await sanityClient.fetch<SanityDestination[]>(DESTINATIONS_QUERY);
    return raw.map((d) => ({
      ...d,
      image: d.image
        ? bust(urlFor(d.image).width(1200).quality(80).url(), d._updatedAt)
        : FALLBACK_DEST_IMAGE,
      heroImage: d.heroImage
        ? bust(urlFor(d.heroImage).width(2400).quality(85).url(), d._updatedAt)
        : (d.image
            ? bust(urlFor(d.image).width(2400).quality(85).url(), d._updatedAt)
            : FALLBACK_DEST_IMAGE),
    }));
  });
});

export const getDestinationBySlug = cache(async (slug: string): Promise<Destination | null> => {
  return cached(`sanity:destination:${slug}`, TTL.medium, async () => {
    const raw = await sanityClient.fetch<SanityDestination | null>(DESTINATION_BY_SLUG_QUERY, { slug });
    if (!raw) return null;
    return {
      ...raw,
      image: raw.image
        ? bust(urlFor(raw.image).width(2400).quality(85).url(), raw._updatedAt)
        : FALLBACK_DEST_IMAGE,
      heroImage: raw.heroImage
        ? bust(urlFor(raw.heroImage).width(2400).quality(85).url(), raw._updatedAt)
        : (raw.image
            ? bust(urlFor(raw.image).width(2400).quality(85).url(), raw._updatedAt)
            : FALLBACK_DEST_IMAGE),
    };
  });
});

export const getAllDestinationSlugs = cache(async (): Promise<string[]> => {
  return sanityClient.fetch<string[]>(`*[_type == "destination"].slug.current`);
});

// ─── Package queries ───────────────────────────────────────────────────────

const PACKAGE_FIELDS = `
  "title": title,
  "slug": slug.current,
  "destinationSlug": destination->slug.current,
  "destinationName": destination->name,
  "price": price,
  "duration": duration,
  "nights": nights,
  "days": days,
  "travelType": travelType,
  "image": image,
  "heroImage": heroImage,
  "rating": rating,
  "reviews": reviews,
  "description": description,
  "highlights": highlights,
  "inclusions": inclusions,
  "exclusions": exclusions,
  "hotel": hotel,
  "itinerary": itinerary[]{
    day, title, description,
    "meals": meals,
    "images": images[].asset->url
  },
  "activities": activities,
  "categories": categoryRefs[]->label,
  "tags": tagRefs[]->label,
  "categorySlugs": categoryRefs[]->slug.current,
  "tagSlugs": tagRefs[]->slug.current,
  "trending": coalesce(trending, false),
  "featured": coalesce(featured, false),
  "limitedSlots": coalesce(limitedSlots, false),
  "whyThisPackage": whyThisPackage,
  "comparePrice": comparePrice,
  "bestFor": bestFor,
  "bookedThisMonth": bookedThisMonth,
  "hotels": hotels[]{
    city, nights, name, stars, description,
    "image": image.asset->url
  },
  "faqs": faqs[]{ q, a },
  "youtubeUrl": youtubeUrl,
  "_updatedAt": _updatedAt,
  "destUpdatedAt": destination->_updatedAt,
  "destImage": destination->image,
  "destHeroImage": destination->heroImage,
  "departures": departures[]{ date, batchLabel, slotsLeft, priceOverride },
  "priceBreakdown": priceBreakdown,
  "bestMonths": bestMonths[]{ month, tag, note },
  "groupSize": groupSize,
  "difficulty": difficulty,
  "visaInfo": visaInfo,
  "packingList": packingList[]{ category, items },
  "mapCoords": mapCoords,
  "mapImage": mapImage.asset->url,
  "brochureFile": brochureFile.asset->url,
  ${GALLERY_PROJ},
  "destinationGallery": destination->gallery[]{
    "url": asset->url + "?w=2400&q=85&auto=format&fit=max",
    alt,
    caption
  }
`;

const PACKAGES_QUERY = `*[_type == "package"] | order(featured desc, rating desc) { ${PACKAGE_FIELDS} }`;
const PACKAGE_BY_SLUG_QUERY = `*[_type == "package" && slug.current == $slug][0] { ${PACKAGE_FIELDS} }`;
const TRENDING_PACKAGES_QUERY = `*[_type == "package" && trending == true] | order(rating desc) [0...6] { ${PACKAGE_FIELDS} }`;
const FEATURED_PACKAGES_QUERY = `*[_type == "package" && featured == true] | order(rating desc) [0...6] { ${PACKAGE_FIELDS} }`;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80&auto=format&fit=crop";
const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=2400&q=85&auto=format&fit=crop";
const FALLBACK_DEST_IMAGE =
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80&auto=format&fit=crop";

type SanityPackage = Omit<Package, "image" | "heroImage"> & {
  image: any;
  heroImage: any;
  destImage?: any;
  destHeroImage?: any;
  destinationGallery?: GalleryPhoto[];
  _updatedAt?: string;
  destUpdatedAt?: string;
};

// Deterministic shuffle keyed by a string. Same package slug always
// yields the same shuffled order, which keeps ISR HTML stable across
// builds while still giving each package a different sample of the
// destination's gallery. FNV-1a hash + multiply-with-carry mix.
function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1597334677);
    const j = (h >>> 0) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build the lightbox gallery for a package detail page.
//
// Override-or-fallback semantics (NOT a merge):
//   - If the package has its OWN gallery uploaded in Sanity → use only
//     those photos. Destination photos are ignored entirely so the
//     editor's per-package selection is authoritative.
//   - Otherwise → pull 5 deterministic-random photos from the parent
//     destination's gallery (Sanity-managed first, curated Unsplash
//     set as final fallback).
//
// Deterministic-random keeps ISR HTML stable while still giving each
// package a different sample of the destination pool.
function composePackageGallery(
  pkgGallery: GalleryPhoto[] | undefined,
  destGallery: GalleryPhoto[] | undefined,
  destinationSlug: string,
  packageSlug: string,
): GalleryPhoto[] {
  const own = (pkgGallery ?? []).filter((g): g is GalleryPhoto => !!g?.url);
  if (own.length > 0) return own;

  const destSanity = (destGallery ?? []).filter((g): g is GalleryPhoto => !!g?.url);
  if (destSanity.length === 0) return [];
  return seededShuffle(destSanity, packageSlug || destinationSlug).slice(0, 5);
}

function mapPackage(p: SanityPackage): Package {
  const composedGallery = composePackageGallery(
    p.gallery,
    p.destinationGallery,
    p.destinationSlug ?? "",
    p.slug ?? "",
  );

  // Image priority — strictly Sanity-driven now:
  //   1. Package's own image (editor uploaded it on the package doc)
  //   2. Parent destination's image (covers most packages)
  //   3. FALLBACK_IMAGE constant (last resort, never the local
  //      DESTINATION_GALLERY map)
  const pkgImg = p.image
    ? bust(urlFor(p.image).width(1200).quality(80).url(), p._updatedAt)
    : null;
  const pkgHero = p.heroImage
    ? bust(urlFor(p.heroImage).width(2400).quality(85).url(), p._updatedAt)
    : null;
  const destImg = p.destImage
    ? bust(urlFor(p.destImage).width(1200).quality(80).url(), p.destUpdatedAt)
    : null;
  const destHero = p.destHeroImage
    ? bust(urlFor(p.destHeroImage).width(2400).quality(85).url(), p.destUpdatedAt)
    : (p.destImage ? bust(urlFor(p.destImage).width(2400).quality(85).url(), p.destUpdatedAt) : null);

  return {
    ...p,
    gallery: composedGallery,
    title: p.title ?? "Curated journey",
    slug: p.slug,
    destinationSlug: p.destinationSlug ?? "",
    destinationName: p.destinationName ?? "India",
    price: p.price ?? 0,
    duration: p.duration ?? "Multi-day",
    nights: p.nights ?? 0,
    days: p.days ?? 0,
    travelType: (p.travelType as Package["travelType"]) ?? "Couple",
    rating: p.rating ?? 4.8,
    reviews: p.reviews ?? 0,
    description: p.description ?? "A handpicked journey — full itinerary available on request.",
    highlights: Array.isArray(p.highlights) ? p.highlights : [],
    inclusions: Array.isArray(p.inclusions) ? p.inclusions : [],
    exclusions: Array.isArray(p.exclusions) ? p.exclusions : [],
    activities: Array.isArray(p.activities) ? p.activities : [],
    categories: Array.isArray(p.categories) ? p.categories : [],
    tags: Array.isArray(p.tags) ? p.tags : [],
    itinerary: Array.isArray(p.itinerary)
      ? p.itinerary.map((d) => ({
          day: d?.day,
          title: d?.title ?? "",
          description: d?.description ?? "",
          meals: d?.meals,
          images: Array.isArray(d?.images) ? d.images.filter(Boolean) : undefined,
        }))
      : [],
    hotel: p.hotel
      ? {
          name: p.hotel.name ?? "Handpicked stay",
          stars: p.hotel.stars,
          description: p.hotel.description ?? "Comfortable accommodation selected for this journey.",
        }
      : {
          name: "Handpicked stay",
          description: "Comfortable accommodation selected for this journey.",
        },
    trending: p.trending ?? false,
    featured: p.featured ?? false,
    limitedSlots: p.limitedSlots ?? false,
    image: pkgImg ?? destImg ?? FALLBACK_IMAGE,
    heroImage: pkgHero ?? destHero ?? FALLBACK_HERO,
  };
}

export const getPackages = cache(async (): Promise<Package[]> => {
  return cached("sanity:packages", TTL.medium, async () => {
    const raw = await sanityClient.fetch<SanityPackage[]>(PACKAGES_QUERY);
    return raw.map(mapPackage);
  });
});

export const getPackageBySlug = cache(async (slug: string): Promise<Package | null> => {
  return cached(`sanity:package:${slug}`, TTL.short, async () => {
    const raw = await sanityClient.fetch<SanityPackage | null>(PACKAGE_BY_SLUG_QUERY, { slug });
    if (!raw) return null;
    return mapPackage(raw);
  });
});

export const getAllPackageSlugs = cache(async (): Promise<string[]> => {
  return cached("sanity:package-slugs", TTL.long, () =>
    sanityClient.fetch<string[]>(`*[_type == "package"].slug.current`)
  );
});

// Return only trending/featured/highly-rated package slugs — used by
// generateStaticParams to cap build-time pre-rendering. Anything not in
// this list still works via ISR thanks to `dynamicParams = true`.
export const getPriorityPackageSlugs = cache(async (limit = 30): Promise<string[]> => {
  return cached(`sanity:package-slugs:priority:${limit}`, TTL.long, () =>
    sanityClient.fetch<string[]>(
      `*[_type == "package" && (trending == true || featured == true)] | order(rating desc, reviews desc) [0...$limit].slug.current`,
      { limit },
    )
  );
});

// Same idea for destinations — pre-render the most popular ones, ISR
// covers the long tail.
export const getPriorityDestinationSlugs = cache(async (limit = 20): Promise<string[]> => {
  return cached(`sanity:dest-slugs:priority:${limit}`, TTL.long, () =>
    sanityClient.fetch<string[]>(
      `*[_type == "destination"] | order(priceFrom asc) [0...$limit].slug.current`,
      { limit },
    )
  );
});

export const getTrendingPackages = cache(async (): Promise<Package[]> => {
  return cached("sanity:packages:trending", TTL.medium, async () => {
    const raw = await sanityClient.fetch<SanityPackage[]>(TRENDING_PACKAGES_QUERY);
    return raw.map(mapPackage);
  });
});

export const getFeaturedPackages = cache(async (): Promise<Package[]> => {
  return cached("sanity:packages:featured", TTL.medium, async () => {
    const raw = await sanityClient.fetch<SanityPackage[]>(FEATURED_PACKAGES_QUERY);
    return raw.map(mapPackage);
  });
});

export async function getBudgetPackages(): Promise<Package[]> {
  const raw = await sanityClient.fetch<SanityPackage[]>(
    `*[_type == "package" && price <= 35000] | order(price asc) [0...8] { ${PACKAGE_FIELDS} }`
  );
  return raw.map(mapPackage);
}

export async function getNewlyAddedPackages(): Promise<Package[]> {
  const raw = await sanityClient.fetch<SanityPackage[]>(
    `*[_type == "package"] | order(_createdAt desc) [0...8] { ${PACKAGE_FIELDS} }`
  );
  return raw.map(mapPackage);
}

export async function getPilgrimPackages(): Promise<Package[]> {
  return cached("sanity:packages:pilgrim", TTL.medium, async () => {
    // Match by category instead of a single destination slug. The catalogue
    // grew past uttarakhand-only — Char Dham, Tirupati, Pushkar, Varanasi,
    // Mount Abu, etc. all carry "Pilgrim" or "Spiritual" categories from the
    // 2026 generator. Falls through any future pilgrim destination too,
    // without code changes.
    const raw = await sanityClient.fetch<SanityPackage[]>(
      `*[_type == "package" && (
        "pilgrim" in categoryRefs[]->slug.current ||
        "spiritual" in categoryRefs[]->slug.current
      )] | order(rating desc, price asc) [0...12] { ${PACKAGE_FIELDS} }`
    );
    return raw.map(mapPackage);
  });
}

export async function getBestChoicePackages(): Promise<Package[]> {
  const raw = await sanityClient.fetch<SanityPackage[]>(
    `*[_type == "package"] | order(rating desc, reviews desc) [0...8] { ${PACKAGE_FIELDS} }`
  );
  return raw.map(mapPackage);
}

export async function getPackagesByType(travelType: string): Promise<Package[]> {
  const raw = await sanityClient.fetch<SanityPackage[]>(
    `*[_type == "package" && travelType == $type] | order(rating desc, featured desc) { ${PACKAGE_FIELDS} }`,
    { type: travelType }
  );
  return raw.map(mapPackage);
}

export async function getPackagesByCategory(category: string): Promise<Package[]> {
  // Accepts either the slug ("honeymoon") or the label ("Honeymoon").
  const raw = await sanityClient.fetch<SanityPackage[]>(
    `*[_type == "package" && (
      $category in categoryRefs[]->slug.current ||
      $category in categoryRefs[]->label
    )] | order(rating desc, featured desc) { ${PACKAGE_FIELDS} }`,
    { category }
  );
  return raw.map(mapPackage);
}

export async function getPackagesByTag(tag: string): Promise<Package[]> {
  const raw = await sanityClient.fetch<SanityPackage[]>(
    `*[_type == "package" && (
      $tagName in tagRefs[]->slug.current ||
      $tagName in tagRefs[]->label
    )] | order(rating desc, featured desc) { ${PACKAGE_FIELDS} }`,
    { tagName: tag }
  );
  return raw.map(mapPackage);
}

export async function getPackagesByDestination(destinationSlug: string): Promise<Package[]> {
  const raw = await sanityClient.fetch<SanityPackage[]>(
    `*[_type == "package" && destination->slug.current == $slug] | order(rating desc) { ${PACKAGE_FIELDS} }`,
    { slug: destinationSlug }
  );
  return raw.map(mapPackage);
}

export async function getOfferPackages(): Promise<Package[]> {
  const raw = await sanityClient.fetch<SanityPackage[]>(
    `*[_type == "package" && (trending == true || limitedSlots == true || featured == true)] | order(rating desc) [0...8] { ${PACKAGE_FIELDS} }`
  );
  return raw.map(mapPackage);
}

// ─── Category queries (taxonomy doc) ───────────────────────────────────────

export type CategoryDoc = {
  _id: string;
  label: string;
  slug: string;
  travelTypeAffinity?: "Couple" | "Family" | "Group" | "Solo";
  tagline?: string;
  intro?: string;
  icon?: string | null;
  heroImage?: string | null;
  highlights?: string[];
  sortOrder?: number;
  showInNav?: boolean;
  packageCount?: number;
};

const CATEGORY_FIELDS = `
  _id,
  label,
  "slug": slug.current,
  travelTypeAffinity,
  tagline,
  intro,
  "icon": icon.asset->url,
  "heroImage": heroImage.asset->url,
  highlights,
  sortOrder,
  showInNav,
  "packageCount": count(*[_type == "package" && references(^._id)])
`;

export const getCategories = cache(async (): Promise<CategoryDoc[]> => {
  return cached("sanity:categories", TTL.long, async () => {
    return sanityClient.fetch<CategoryDoc[]>(
      `*[_type == "category"] | order(sortOrder asc, label asc) { ${CATEGORY_FIELDS} }`,
    );
  });
});

export const getCategoryBySlug = cache(async (slug: string): Promise<CategoryDoc | null> => {
  return cached(`sanity:category:${slug}`, TTL.medium, () =>
    sanityClient.fetch<CategoryDoc | null>(
      `*[_type == "category" && slug.current == $slug][0] { ${CATEGORY_FIELDS} }`,
      { slug },
    ),
  );
});

export const getAllCategorySlugs = cache(async (): Promise<string[]> => {
  return sanityClient.fetch<string[]>(`*[_type == "category"].slug.current`);
});

// ─── Homepage content (singleton) ─────────────────────────────────────────

export type SectionCopy = {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
};

export type HomepageContent = {
  hero?: SectionCopy & {
    searchPlaceholder?: string;
    ctaLabel?: string;
    trustStrip?: string;
    /** Resolved hero background image URL — Sanity image takes precedence,
     *  then imageUrl override, otherwise undefined (caller falls back). */
    heroImage?: string;
    /** Direct .mp4 / .webm URL. When set, the hero plays it as native
     *  autoplay-loop-muted background — no play button, no third-party chrome. */
    videoMp4Url?: string;
    /** YouTube / Vimeo URL. Legacy click-to-play overlay; ignored when
     *  videoMp4Url is set. */
    videoUrl?: string;
    /** Optional poster URL for the video pre-play state. */
    videoPosterUrl?: string;
  };
  recentlyCrafted?: SectionCopy;
  threeSteps?: SectionCopy & {
    closingLine?: string;
    steps?: { n: string; title: string; body: string }[];
  };
  byHowYouTravel?: SectionCopy;
  pilgrimFeature?: SectionCopy;
  packagesByDuration?: SectionCopy;
  destinations?: SectionCopy;
  reviews?: SectionCopy;
  ugc?: SectionCopy;
  pillars?: SectionCopy & {
    closingLine?: string;
    pillars?: { icon: string; title: string; headline: string; body: string }[];
  };
  press?: SectionCopy;
  finalCta?: SectionCopy & { ctaLabel?: string; microcopy?: string };
  newsletter?: SectionCopy & { placeholder?: string; buttonLabel?: string; footerMicrocopy?: string };
};

export const getHomepageContent = cache(async (): Promise<HomepageContent | null> => {
  return cached("sanity:homepageContent", TTL.medium, async () => {
    // Project the hero block explicitly so we can resolve the Sanity image
    // asset URL server-side. Everything else flows through unchanged.
    const raw = await sanityClient.fetch<
      (Omit<HomepageContent, "hero"> & {
        hero?: HomepageContent["hero"] & {
          image?: { asset?: { url?: string } };
          imageUrl?: string;
          videoFile?: { asset?: { url?: string } };
        };
      }) | null
    >(`*[_id == "homepageContent"][0]{
      ...,
      hero{
        ...,
        "image": image{ asset->{ url } },
        imageUrl,
        "videoFile": videoFile{ asset->{ url } },
        videoMp4Url,
        videoUrl,
        videoPosterUrl
      }
    }`);

    if (!raw) return null;
    if (raw.hero) {
      const sanityImg = raw.hero.image?.asset?.url;
      // Resolve hero video — prefer the uploaded Sanity asset (served via
      // cdn.sanity.io), fall back to the external CDN override URL.
      const uploadedVideo = raw.hero.videoFile?.asset?.url;
      raw.hero = {
        ...raw.hero,
        heroImage: sanityImg || raw.hero.imageUrl || undefined,
        videoMp4Url: uploadedVideo || raw.hero.videoMp4Url || undefined,
      };
    }
    return raw as HomepageContent;
  });
});

// ─── Partner logos / press / UGC ──────────────────────────────────────────

export type PartnerLogo = {
  name: string;
  kind: "tourism" | "press" | "accreditation" | "booking";
  logo: string | null;
  href?: string;
  flag?: string;
  accentColor?: string;
};

export async function getPartnerLogos(kind?: PartnerLogo["kind"]): Promise<PartnerLogo[]> {
  return cached(`sanity:partnerLogos:${kind ?? "all"}`, TTL.long, async () => {
    const filter = kind ? ` && kind == "${kind}"` : "";
    const raw = await sanityClient.fetch<(Omit<PartnerLogo, "logo"> & { logo: any })[]>(
      `*[_type == "partnerLogo" && active == true${filter}] | order(order asc, name asc) {
        name, kind, logo, href, flag, accentColor
      }`
    );
    return raw.map((p) => ({
      ...p,
      logo: p.logo ? urlFor(p.logo).width(240).quality(80).url() : null,
    }));
  });
}

export type PressQuote = {
  quote: string;
  attribution?: string;
  sourceUrl?: string;
};

export async function getFeaturedPressQuote(): Promise<PressQuote | null> {
  return cached("sanity:pressQuote:featured", TTL.long, async () => {
    const raw = await sanityClient.fetch<PressQuote | null>(
      `*[_type == "pressQuote" && featured == true] | order(publishedAt desc) [0] {
        quote, attribution, sourceUrl
      }`
    );
    return raw ?? null;
  });
}

export type UgcPost = {
  firstName: string;
  destination: string;
  caption?: string;
  image: string;
  instagramHandle?: string;
};

export async function getUgcPosts(): Promise<UgcPost[]> {
  return cached("sanity:ugc", TTL.medium, async () => {
    const raw = await sanityClient.fetch<(Omit<UgcPost, "image"> & { image: any })[]>(
      `*[_type == "ugcPost" && active == true && permissionGranted == true]
        | order(order asc, _createdAt desc) [0...12] {
        firstName, destination, caption, image, instagramHandle
      }`
    );
    return raw
      .filter((p) => !!p.image)
      .map((p) => ({
        ...p,
        image: urlFor(p.image).width(600).height(750).quality(75).url(),
      }));
  });
}

// ─── Offer banner queries ─────────────────────────────────────────────────

export type OfferBanner = {
  slug: string;
  title: string;
  eyebrow?: string;
  sub?: string;
  ctaLabel?: string;
  href: string;
  badge?: string;
  gradient?: string;
  image?: string;
  expiresAt?: string;
};

/**
 * Pull active, non-expired offer banners. Sorted by `order` then by
 * `_createdAt`. Returns [] when nothing's set so HomepageStrip can fall
 * back to its built-in seed banners and never render empty.
 */
// ─── Home shelf queries ────────────────────────────────────────────────────

export type HomeShelf = {
  _id: string;
  eyebrow: string;
  title: string;
  italicTail?: string;
  lede?: string;
  ctaHref: string;
  ctaLabel: string;
  bg: "paper" | "cream";
  filterType: "priceRange" | "destinationSlugs" | "travelType" | "manual";
  priceMin?: number;
  priceMax?: number;
  destinationSlugs?: string[];
  travelType?: string;
  manualSlugs?: string[];
  maxItems: number;
  order: number;
};

export async function getHomeShelves(): Promise<HomeShelf[]> {
  return cached("sanity:homeShelves", TTL.medium, async () => {
    const raw = await sanityClient.fetch<HomeShelf[]>(
      `*[_type == "homeShelf" && active == true] | order(order asc, _createdAt desc) {
         _id, eyebrow, title, italicTail, lede, ctaHref, ctaLabel, bg,
         filterType, priceMin, priceMax, destinationSlugs, travelType,
         "manualSlugs": manualPackages[]->slug.current,
         maxItems, order
       }`,
    );
    return raw ?? [];
  });
}

export async function getOfferBanners(limit = 8): Promise<OfferBanner[]> {
  return cached(`sanity:offerBanners:${limit}`, TTL.short, async () => {
    const raw = await sanityClient.fetch<
      Array<Omit<OfferBanner, "image"> & { image?: any; _id: string }>
    >(
      `*[_type == "offerBanner" && active == true
         && (!defined(expiresAt) || expiresAt > now())]
        | order(order asc, _createdAt desc) [0...$limit] {
        _id, title, eyebrow, sub, ctaLabel, href, badge, gradient, image, expiresAt
      }`,
      { limit },
    );
    return raw.map((b) => ({
      slug: b._id,
      title: b.title,
      eyebrow: b.eyebrow,
      sub: b.sub,
      ctaLabel: b.ctaLabel,
      href: b.href,
      badge: b.badge,
      gradient: b.gradient,
      image: b.image ? urlFor(b.image).width(800).height(500).quality(80).url() : undefined,
      expiresAt: b.expiresAt,
    }));
  });
}

/**
 * Pull UGC posts for a specific package's destination. Case-insensitive
 * match against the destination string field on the UGC document. Used by
 * the package detail page to render real travelers' photos from the same
 * destination — falls back to the broader pool when nothing matches so a
 * Bali package still gets photos even if no Sanity posts are tagged Bali.
 */
export async function getUgcPostsForDestination(
  destinationName: string,
  limit = 8,
): Promise<UgcPost[]> {
  return cached(`sanity:ugc:dest:${destinationName.toLowerCase()}`, TTL.medium, async () => {
    const raw = await sanityClient.fetch<(Omit<UgcPost, "image"> & { image: any })[]>(
      `*[_type == "ugcPost" && active == true && permissionGranted == true
         && lower(destination) match $needle]
        | order(order asc, _createdAt desc) [0...$limit] {
        firstName, destination, caption, image, instagramHandle
      }`,
      { needle: `*${destinationName.toLowerCase()}*`, limit },
    );
    return raw
      .filter((p) => !!p.image)
      .map((p) => ({
        ...p,
        image: urlFor(p.image).width(600).height(750).quality(75).url(),
      }));
  });
}

// ─── Blog queries ─────────────────────────────────────────────────────────

const BLOG_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  content,
  "image": image.asset->url,
  "_updatedAt": _updatedAt,
  author,
  date,
  readTime,
  featured,
  tags
`;

// Append the same ?v=<digits> cache-buster used on destination/package
// images so a Sanity Studio image swap on a blog post lands within the
// next ISR window instead of waiting for the asset id to change.
function bustBlogImage(url: string | undefined, ts: string | undefined): string {
  if (!url) return "";
  if (!ts) return url;
  const v = ts.replace(/\D/g, "").slice(0, 14);
  return url + (url.includes("?") ? "&" : "?") + "v=" + v;
}

export async function getBlogPosts(category?: string): Promise<SanityBlogPost[]> {
  const key = category ? `sanity:blog:${category}` : "sanity:blog:all";
  return cached(key, TTL.long, async () => {
    const filter = category
      ? `*[_type == "blogPost" && category == $category] | order(date desc)`
      : `*[_type == "blogPost"] | order(date desc)`;
    type Raw = SanityBlogPost & { _updatedAt?: string };
    const raw = await sanityClient.fetch<Raw[]>(`${filter} { ${BLOG_FIELDS} }`, category ? { category } : {});
    return raw.map((p) => ({ ...p, image: bustBlogImage(p.image, p._updatedAt) }));
  });
}

export async function getBlogPostBySlug(slug: string): Promise<SanityBlogPost | null> {
  return cached(`sanity:blog:${slug}`, TTL.medium, () =>
    sanityClient.fetch<SanityBlogPost | null>(
      `*[_type == "blogPost" && slug.current == $slug][0] { ${BLOG_FIELDS} }`,
      { slug }
    )
  );
}

export async function getAllBlogSlugs(): Promise<string[]> {
  return sanityClient.fetch<string[]>(`*[_type == "blogPost"].slug.current`);
}

export async function getFeaturedBlogPost(): Promise<SanityBlogPost | null> {
  return sanityClient.fetch<SanityBlogPost | null>(
    `*[_type == "blogPost" && featured == true] | order(date desc) [0] { ${BLOG_FIELDS} }`
  );
}

export const getRelatedPackages = cache(async (
  destinationSlug: string,
  excludeSlug: string,
  travelType: string,
): Promise<Package[]> => {
  // First try: same destination, different package
  const sameDest = await sanityClient.fetch<SanityPackage[]>(
    `*[_type == "package" && destination->slug.current == $dest && slug.current != $excl] | order(rating desc) [0...4] { ${PACKAGE_FIELDS} }`,
    { dest: destinationSlug, excl: excludeSlug }
  );
  if (sameDest.length >= 3) return sameDest.slice(0, 4).map(mapPackage);

  // Fallback: same travel type from any destination
  const sameType = await sanityClient.fetch<SanityPackage[]>(
    `*[_type == "package" && travelType == $type && slug.current != $excl] | order(rating desc) [0...4] { ${PACKAGE_FIELDS} }`,
    { type: travelType, excl: excludeSlug }
  );
  return [...sameDest, ...sameType].slice(0, 4).map(mapPackage);
});
