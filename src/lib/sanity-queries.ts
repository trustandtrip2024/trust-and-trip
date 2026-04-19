import { sanityClient, urlFor } from "./sanity";
import type { Destination } from "./data";

// GROQ query — fetch all destinations
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

// GROQ query — fetch ONE destination by slug
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

// Raw Sanity destination (image fields are references, not URLs)
type SanityDestination = Omit<Destination, "image" | "heroImage"> & {
  image: any;
  heroImage: any;
};

// Fetch all destinations
export async function getDestinations(): Promise<Destination[]> {
  const raw = await sanityClient.fetch<SanityDestination[]>(DESTINATIONS_QUERY);
  return raw.map((d) => ({
    ...d,
    image: d.image ? urlFor(d.image).width(1200).quality(80).url() : "",
    heroImage: d.heroImage ? urlFor(d.heroImage).width(2400).quality(85).url() : "",
  }));
}

// Fetch one destination by slug
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

// Fetch all destination slugs — used by generateStaticParams
export async function getAllDestinationSlugs(): Promise<string[]> {
  const slugs = await sanityClient.fetch<string[]>(
    `*[_type == "destination"].slug.current`
  );
  return slugs;
}
