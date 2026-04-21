import { NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/redis";

export const dynamic = "force-dynamic";

export type InstagramPost = {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnail_url?: string;
  timestamp: string;
};

const CACHE_KEY = "instagram:posts";
const CACHE_TTL = 60 * 60; // 1 hour

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Instagram not configured." }, { status: 503 });
  }

  // Try Redis cache first
  const cached = await cacheGet<InstagramPost[]>(CACHE_KEY);
  if (cached) {
    return NextResponse.json({ posts: cached, source: "cache" });
  }

  try {
    const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=${fields}&limit=12&access_token=${token}`
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("Instagram API error:", err);
      return NextResponse.json({ error: "Failed to fetch posts." }, { status: 502 });
    }

    const data = await res.json();
    const posts: InstagramPost[] = (data.data ?? []).filter(
      (p: InstagramPost) => p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM"
    );

    // Store in Redis for 1 hour
    await cacheSet(CACHE_KEY, posts, CACHE_TTL);

    return NextResponse.json(
      { posts, source: "live" },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch (err) {
    console.error("Instagram fetch error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
