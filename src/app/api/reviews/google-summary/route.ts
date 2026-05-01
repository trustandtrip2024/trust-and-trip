import { NextResponse } from "next/server";
import { fetchGoogleReviews, GOOGLE_REVIEWS_REVALIDATE } from "@/lib/google-reviews";

// Light summary endpoint used by the header badge. Returns just the
// aggregate rating + count so the trust chip can render without
// shipping the full review payload to every page.
export const revalidate = GOOGLE_REVIEWS_REVALIDATE;

export async function GET() {
  const data = await fetchGoogleReviews();
  if (!data) {
    return NextResponse.json(
      { ok: false },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } },
    );
  }
  return NextResponse.json(
    { ok: true, rating: data.rating, count: data.user_ratings_total },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${GOOGLE_REVIEWS_REVALIDATE}, stale-while-revalidate=300`,
      },
    },
  );
}
