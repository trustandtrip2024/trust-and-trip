import { MetadataRoute } from "next";
import { getAllPackageSlugs, getAllDestinationSlugs } from "@/lib/sanity-queries";

const BASE = "https://trustandtrip.com";

// Mirror of the popular-destination matrix in
// src/app/destinations/[slug]/[travelType]/page.tsx — kept in sync manually.
const POPULAR_DESTINATION_SLUGS = [
  "bali", "maldives", "thailand", "dubai", "singapore", "vietnam",
  "kerala", "goa", "kashmir", "rajasthan", "himachal-pradesh", "andaman",
  "ladakh", "sri-lanka", "switzerland", "santorini",
];
const TRAVEL_TYPE_SLUGS = ["honeymoon", "family", "group", "solo"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [packageSlugs, destinationSlugs] = await Promise.all([
    getAllPackageSlugs(),
    getAllDestinationSlugs(),
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE}/packages`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/private`, lastModified: now, priority: 0.85, changeFrequency: "weekly" },
    { url: `${BASE}/signature`, lastModified: now, priority: 0.85, changeFrequency: "weekly" },
    { url: `${BASE}/essentials`, lastModified: now, priority: 0.85, changeFrequency: "weekly" },
    { url: `${BASE}/destinations`, lastModified: now, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE}/customize-trip`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/offers`, lastModified: now, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/experiences`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/blog`, lastModified: now, priority: 0.6, changeFrequency: "weekly" },
    { url: `${BASE}/about`, lastModified: now, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/contact`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
  ];

  const packagePages: MetadataRoute.Sitemap = packageSlugs.map((slug) => ({
    url: `${BASE}/packages/${slug}`,
    lastModified: now,
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  const destinationPages: MetadataRoute.Sitemap = destinationSlugs.map((slug) => ({
    url: `${BASE}/destinations/${slug}`,
    lastModified: now,
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  // SEO landing pages: only emit URLs whose underlying destination exists
  const destinationSet = new Set(destinationSlugs);
  const seoLandingPages: MetadataRoute.Sitemap = [];
  for (const slug of POPULAR_DESTINATION_SLUGS) {
    if (!destinationSet.has(slug)) continue;
    for (const travelType of TRAVEL_TYPE_SLUGS) {
      seoLandingPages.push({
        url: `${BASE}/destinations/${slug}/${travelType}`,
        lastModified: now,
        priority: 0.7,
        changeFrequency: "weekly",
      });
    }
  }

  return [...staticPages, ...packagePages, ...destinationPages, ...seoLandingPages];
}
