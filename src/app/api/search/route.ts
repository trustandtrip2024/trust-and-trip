import { NextRequest, NextResponse } from "next/server";
import { sanityClient, urlFor } from "@/lib/sanity";
import { rateLimit, clientIp } from "@/lib/redis";

export async function GET(req: NextRequest) {
  // Rate limit per IP. Each call hits Sanity's API. The 5-min CDN cache
  // shields hot queries but long-tail queries each cost a Sanity request,
  // and an attacker can rotate the q param to defeat caching.
  const { allowed } = await rateLimit(`search:${clientIp(req)}`, {
    limit: 60,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const query = `{
    "packages": *[_type == "package" && (
      title match $q || destination->name match $q || travelType match $q
    )] | order(rating desc) [0...5] {
      "type": "package",
      "title": title,
      "slug": slug.current,
      "sub": destination->name + " · " + duration + " · ₹" + string(price),
      "image": image
    },
    "destinations": *[_type == "destination" && (
      name match $q || country match $q || region match $q
    )] | order(name asc) [0...4] {
      "type": "destination",
      "title": name,
      "slug": slug.current,
      "sub": country + " · From ₹" + string(priceFrom),
      "image": image
    },
    "posts": *[_type == "blogPost" && (
      title match $q || category match $q
    )] | order(date desc) [0...3] {
      "type": "post",
      "title": title,
      "slug": slug.current,
      "sub": category + " · " + readTime,
      "image": image.asset->url
    }
  }`;

  try {
    const data = await sanityClient.fetch(query, { q: `${q}*` });
    const results = [
      ...data.packages.map((r: any) => ({
        ...r,
        image: r.image ? urlFor(r.image).width(80).quality(70).url() : null,
        href: `/packages/${r.slug}`,
      })),
      ...data.destinations.map((r: any) => ({
        ...r,
        image: r.image ? urlFor(r.image).width(80).quality(70).url() : null,
        href: `/destinations/${r.slug}`,
      })),
      ...data.posts.map((r: any) => ({ ...r, href: `/blog/${r.slug}` })),
    ];
    // CDN-cache by full URL (including ?q=). Hot queries land at the edge;
    // long-tail queries refresh in 5 minutes. swr=1d keeps a stale answer
    // alive while a background refresh runs.
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" } },
    );
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ results: [] });
  }
}
