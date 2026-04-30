import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — fetch approved reviews for a package
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const { data, error } = await supabase
    .from("reviews")
    .select("id, reviewer_name, reviewer_location, rating, title, body, travel_type, travel_date, helpful_count, created_at")
    .eq("package_slug", slug)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const avg = data?.length
    ? (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1)
    : null;

  return NextResponse.json(
    { reviews: data ?? [], avg, count: data?.length ?? 0 },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}

// POST — submit a new review (with rate limiting)
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const body = await req.json();

    const { package_slug, reviewer_name, reviewer_email, reviewer_location,
            rating, title, review_body, travel_type, travel_date, package_title } = body;

    // Validation
    if (!package_slug || !reviewer_name?.trim() || !reviewer_email?.trim() || !review_body?.trim()) {
      return NextResponse.json({ error: "Name, email, and review are required." }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1–5." }, { status: 400 });
    }
    if (review_body.trim().length < 20) {
      return NextResponse.json({ error: "Review must be at least 20 characters." }, { status: 400 });
    }

    // Rate limit check — one submission per IP per package per 7 days
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from("review_rate_limits")
      .select("submitted_at")
      .eq("ip", ip)
      .eq("package_slug", package_slug)
      .gte("submitted_at", cutoff)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You've already submitted a review for this package recently." },
        { status: 429 }
      );
    }

    // Insert review
    const { error: insertError } = await supabase.from("reviews").insert({
      package_slug,
      package_title,
      reviewer_name: reviewer_name.trim(),
      reviewer_email: reviewer_email.trim().toLowerCase(),
      reviewer_location: reviewer_location?.trim(),
      rating: Number(rating),
      title: title?.trim(),
      body: review_body.trim(),
      travel_type,
      travel_date,
      status: "pending",
    });

    if (insertError) throw insertError;

    // Record rate limit (upsert — reset timer on new submission)
    await supabase.from("review_rate_limits").upsert({
      ip,
      package_slug,
      submitted_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Review submit error:", err);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
