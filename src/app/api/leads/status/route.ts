import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_STATUSES = ["new", "contacted", "qualified", "booked", "lost"];

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[leads/status] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
