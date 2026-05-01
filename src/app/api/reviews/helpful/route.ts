import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, clientIp } from "@/lib/redis";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Increment a review's helpful count. Stays unauth (the button is on a
 * public reviews list and we don't ask visitors to sign in to vote) but is
 * rate-limited per IP + review id so a bot can't run the count to 1M.
 *
 * 3 votes per IP per review per hour is enough to cover misclick + family
 * sharing the device, and low enough that running up a counter at scale
 * needs distributed infrastructure.
 */
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const ip = clientIp(req);
    const { allowed } = await rateLimit(`helpful:${ip}:${id}`, { limit: 3, windowSeconds: 3600 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many votes." }, { status: 429 });
    }

    const { error } = await supabase.rpc("increment_helpful", { review_id: id });
    if (error) {
      await supabase
        .from("reviews")
        .update({ helpful_count: supabase.rpc("helpful_count") })
        .eq("id", id);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[reviews/helpful] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
