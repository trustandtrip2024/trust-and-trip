import { MetadataRoute } from "next";
import { getAllPackageSlugs, getAllDestinationSlugs } from "@/lib/sanity-queries";

const BASE = "https://trustandtrip.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [packageSlugs, destinationSlugs] = await Promise.all([
    getAllPackageSlugs(),
    getAllDestinationSlugs(),
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE}/packages`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
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

  return [...staticPages, ...packagePages, ...destinationPages];
}
