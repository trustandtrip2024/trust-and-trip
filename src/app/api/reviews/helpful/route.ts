import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.rpc("increment_helpful", { review_id: id });
  if (error) {
    // Fallback if RPC doesn't exist yet
    await supabase
      .from("reviews")
      .update({ helpful_count: supabase.rpc("helpful_count") })
      .eq("id", id);
  }

  return NextResponse.json({ success: true });
}
