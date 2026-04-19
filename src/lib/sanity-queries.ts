import { sanityClient, urlFor } from "./sanity";
import type { Destination, Package } from "./data";

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
  "highlights": highlights
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
  "highlights": highlights
}`;

type SanityDestination = Omit<Destination, "image" | "heroImage"> & {
  image: any;
  heroImage: any;
};

export async function getDestinations(): Promise<Destination[]> {
  const raw = await sanityClient.fetch<SanityDestination[]>(DESTINATIONS_QUERY);
  return raw.map((d) => ({
    ...d,
    image: d.image ? urlFor(d.image).width(1200).quality(80).url() : "",
    heroImage: d.heroImage ? urlFor(d.heroImage).width(2400).quality(85).url() : "",
  }));
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const raw = await sanityClient.fetch<SanityDestination | null>(
    DESTINATION_BY_SLUG_QUERY,
    { slug }
  );
  if (!raw) return null;
  return {
    ...raw,
    image: raw.image ? urlFor(raw.image).width(2400).quality(85).url() : "",
    heroImage: raw.heroImage ? urlFor(raw.heroImage).width(2400).quality(85).url() : "",
  };
}

export async function getAllDestinationSlugs(): Promise<string[]> {
  return sanityClient.fetch<string[]>(`*[_type == "destination"].slug.current`);
}

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
  "itinerary": itinerary,
  "activities": activities,
  "trending": coalesce(trending, false),
  "featured": coalesce(featured, false),
  "limitedSlots": coalesce(limitedSlots, false)
`;

const PACKAGES_QUERY = `*[_type == "package"] | order(featured desc, rating desc) { ${PACKAGE_FIELDS} }`;
const PACKAGE_BY_SLUG_QUERY = `*[_type == "package" && slug.current == $slug][0] { ${PACKAGE_FIELDS} }`;
const TRENDING_PACKAGES_QUERY = `*[_type == "package" && trending == true] | order(rating desc) [0...6] { ${PACKAGE_FIELDS} }`;
const FEATURED_PACKAGES_QUERY = `*[_type == "package" && featured == true] | order(rating desc) [0...6] { ${PACKAGE_FIELDS} }`;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80&auto=format&fit=crop";
const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=2400&q=85&auto=format&fit=crop";

type SanityPackage = Omit<Package, "image" | "heroImage"> & {
  image: any;
  heroImage: any;
};

function mapPackage(p: SanityPackage): Package {
  return {
    ...p,
    image: p.image ? urlFor(p.image).width(1200).quality(80).url() : FALLBACK_IMAGE,
    heroImage: p.heroImage ? urlFor(p.heroImage).width(2400).quality(85).url() : FALLBACK_HERO,
  };
}

export async function getPackages(): Promise<Package[]> {
  const raw = await sanityClient.fetch<SanityPackage[]>(PACKAGES_QUERY);
  return raw.map(mapPackage);
}

export async function getPackageBySlug(slug: string): Promise<Package | null> {
  const raw = await sanityClient.fetch<SanityPackage | null>(PACKAGE_BY_SLUG_QUERY, { slug });
  if (!raw) return null;
  return mapPackage(raw);
}

export async function getAllPackageSlugs(): Promise<string[]> {
  return sanityClient.fetch<string[]>(`*[_type == "package"].slug.current`);
}

export async function getTrendingPackages(): Promise<Package[]> {
  const raw = await sanityClient.fetch<SanityPackage[]>(TRENDING_PACKAGES_QUERY);
  return raw.map(mapPackage);
}

export async function getFeaturedPackages(): Promise<Package[]> {
  const raw = await sanityClient.fetch<SanityPackage[]>(FEATURED_PACKAGES_QUERY);
  return raw.map(mapPackage);
}
