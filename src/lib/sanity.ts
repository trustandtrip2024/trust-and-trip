import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

// Connection settings — values from .env.local
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: true, // faster, uses Sanity's CDN
});

// Helper to turn Sanity image references into actual URLs
const builder = imageUrlBuilder(sanityClient);
export function urlFor(source: any) {
  return builder.image(source);
}