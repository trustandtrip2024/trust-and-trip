import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";

export const runtime = "nodejs";
export const revalidate = 300;

interface MiniPackage {
  slug: string;
  title: string;
  image: string;
  price: number;
  duration: string;
  destinationName: string;
  rating?: number;
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80&auto=format&fit=crop";

/**
 * Lightweight batch fetch for recently-viewed / wishlist rails. Returns
 * a small card payload per slug — image, title, price, duration,
 * destination, rating — so the client can render mini cards without
 * pulling each package's full doc.
 *
 * Capped at 8 slugs per request to keep the GROQ query bounded.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("slugs") ?? "";
  const slugs = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (slugs.length === 0) return NextResponse.json({ packages: [] });

  const results = await sanityClient.fetch<
    Array<{
      slug: string;
      title: string;
      image?: { asset?: { url?: string } };
      price?: number;
      duration?: string;
      destinationName?: string;
      rating?: number;
    }>
  >(
    `*[_type == "package" && slug.current in $slugs] {
      "slug": slug.current,
      title,
      "image": image{ asset->{ url } },
      price,
      duration,
      "destinationName": destination->name,
      rating
    }`,
    { slugs },
  );

  // Preserve the input ordering (most-recent-first) — Sanity returns
  // arbitrary order, so re-sort by the request slug list.
  const bySlug = new Map(results.map((r) => [r.slug, r]));
  const ordered: MiniPackage[] = slugs
    .map((s) => bySlug.get(s))
    .filter((r): r is NonNullable<typeof r> => !!r)
    .map((r) => ({
      slug: r.slug,
      title: r.title ?? "Curated journey",
      image: r.image?.asset?.url
        ? `${r.image.asset.url}?w=600&q=75&auto=format&fit=crop`
        : FALLBACK_IMG,
      price: r.price ?? 0,
      duration: r.duration ?? "",
      destinationName: r.destinationName ?? "",
      rating: typeof r.rating === "number" ? r.rating : undefined,
    }));

  return NextResponse.json(
    { packages: ordered },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
