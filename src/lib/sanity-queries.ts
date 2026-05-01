import { cache } from "react";
import { sanityClient, urlFor } from "./sanity";
import type { Destination, Package } from "./data";
import { DESTINATION_GALLERY } from "./gallery-images";

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

const DESTINATIONS_QUERY = `*[_type == "destination"] | order(name asc) {
  "name": name,
  "slug": slug.current,
  "country": country,
  "region": region,
  "priceFrom": priceFrom,
  "tagline": tagline,
  "image": image,
  "heroImage": heroImage,
  "overview": overview,
  "bestTimeToVisit": bestTimeToVisit,
  "idealDuration": idealDuration,
  "thingsToDo": thingsToDo,
  "highlights": highlights,
  "whisper": whisper
}`;

const DESTINATION_BY_SLUG_QUERY = `*[_type == "destination" && slug.current == $slug][0] {
  "name": name,
  "slug": slug.current,
  "country": country,
  "region": region,
  "priceFrom": priceFrom,
  "tagline": tagline,
  "image": image,
  "heroImage": heroImage,
  "overview": overview,
  "bestTimeToVisit": bestTimeToVisit,
  "idealDuration": idealDuration,
  "thingsToDo": thingsToDo,
  "highlights": highlights,
  "whisper": whisper
}`;

type SanityDestination = Omit<Destination, "image" | "heroImage"> & {
  image: any;
  heroImage: any;
};

export const getDestinations = cache(async (): Promise<Destination[]> => {
  return cached("sanity:destinations", TTL.long, async () => {
    const raw = await sanityClient.fetch<SanityDestination[]>(DESTINATIONS_QUERY);
    return raw.map((d) => {
      const fallback = galleryImage(d.slug) ?? FALLBACK_DEST_IMAGE;
      return {
        ...d,
        image: d.image ? urlFor(d.image).width(1200).quality(80).url() : fallback,
        heroImage: d.heroImage ? urlFor(d.heroImage).width(2400).quality(85).url() : fallback,
      };
    });
  });
});

export const getDestinationBySlug = cache(async (slug: string): Promise<Destination | null> => {
  return cached(`sanity:destination:${slug}`, TTL.medium, async () => {
    const raw = await sanityClient.fetch<SanityDestination | null>(DESTINATION_BY_SLUG_QUERY, { slug });
    if (!raw) return null;
    const fallback = galleryImage(raw.slug) ?? FALLBACK_DEST_IMAGE;
    return {
      ...raw,
      image: raw.image ? urlFor(raw.image).width(2400).quality(85).url() : fallback,
      heroImage: raw.heroImage ? urlFor(raw.heroImage).width(2400).quality(85).url() : fallback,
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
  "categories": categories,
  "tags": tags,
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
  "departures": departures[]{ date, batchLabel, slotsLeft, priceOverride },
  "priceBreakdown": priceBreakdown,
  "bestMonths": bestMonths[]{ month, tag, note },
  "groupSize": groupSize,
  "difficulty": difficulty,
  "visaInfo": visaInfo,
  "packingList": packingList[]{ category, items },
  "mapCoords": mapCoords,
  "mapImage": mapImage.asset->url,
  "brochureFile": brochureFile.asset->url
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

// Some Sanity slugs differ from gallery keys — map them here
const SLUG_ALIASES: Record<string, string> = {
  "himachal-pradesh": "himachal-pradesh",
  himachal: "himachal-pradesh",
  manali: "himachal-pradesh",
  shimla: "himachal-pradesh",
  "spiti-valley": "spiti-valley",
  spiti: "spiti-valley",
  uttarakhand: "uttarakhand",
  rishikesh: "rishikesh",
  "andaman-and-nicobar": "andaman",
  "andaman-nicobar": "andaman",
};

function galleryImage(slug: string): string | null {
  const key = SLUG_ALIASES[slug] ?? slug;
  return DESTINATION_GALLERY[key]?.[0] ?? null;
}

type SanityPackage = Omit<Package, "image" | "heroImage"> & {
  image: any;
  heroImage: any;
};

function mapPackage(p: SanityPackage): Package {
  const destImage = galleryImage(p.destinationSlug ?? "");

  return {
    ...p,
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
    image: destImage ?? (p.image ? urlFor(p.image).width(1200).quality(80).url() : FALLBACK_IMAGE),
    heroImage: destImage
      ? destImage.replace("w=1600", "w=2400")
      : (p.heroImage ? urlFor(p.heroImage).width(2400).quality(85).url() : FALLBACK_HERO),
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
      `*[_type == "package" && ("Pilgrim" in categories || "Spiritual" in categories)] | order(rating desc, price asc) [0...12] { ${PACKAGE_FIELDS} }`
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
  const raw = await sanityClient.fetch<SanityPackage[]>(
    `*[_type == "package" && $category in categories] | order(rating desc, featured desc) { ${PACKAGE_FIELDS} }`,
    { category }
  );
  return raw.map(mapPackage);
}

export async function getPackagesByTag(tag: string): Promise<Package[]> {
  const raw = await sanityClient.fetch<SanityPackage[]>(
    `*[_type == "package" && $tagName in tags] | order(rating desc, featured desc) { ${PACKAGE_FIELDS} }`,
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
  author,
  date,
  readTime,
  featured,
  tags
`;

export async function getBlogPosts(category?: string): Promise<SanityBlogPost[]> {
  const key = category ? `sanity:blog:${category}` : "sanity:blog:all";
  return cached(key, TTL.long, async () => {
    const filter = category
      ? `*[_type == "blogPost" && category == $category] | order(date desc)`
      : `*[_type == "blogPost"] | order(date desc)`;
    return sanityClient.fetch<SanityBlogPost[]>(`${filter} { ${BLOG_FIELDS} }`, category ? { category } : {});
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
