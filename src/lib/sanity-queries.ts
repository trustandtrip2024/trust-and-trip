import { sanityClient, urlFor } from "./sanity";
import type { Destination } from "./data";

// GROQ query — Sanity's query language. Fetches all published destinations.
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

// Raw Sanity destination (image fields are references, not URLs)
type SanityDestination = Omit<Destination, "image" | "heroImage"> & {
  image: any;
  heroImage: any;
};

// Fetch and transform — this is what the rest of the site imports
export async function getDestinations(): Promise<Destination[]> {
  const raw = await sanityClient.fetch<SanityDestination[]>(DESTINATIONS_QUERY);

  return raw.map((d) => ({
    ...d,
    // Convert Sanity image refs into CDN URLs our components expect
    image: d.image ? urlFor(d.image).width(1200).quality(80).url() : "",
    heroImage: d.heroImage ? urlFor(d.heroImage).width(2400).quality(85).url() : "",
  }));
}