import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: creator } = await admin.from("creators").select("id").eq("user_id", user.id).single();
    if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

    const [earningsRes, payoutsRes] = await Promise.all([
      admin
        .from("creator_earnings")
        .select("id, gross_amount_paise, commission_pct, commission_amount_paise, status, created_at, booking_id, bookings(package_title, customer_name, num_travellers, travel_date)")
        .eq("creator_id", creator.id)
        .order("created_at", { ascending: false })
        .limit(200),
      admin
        .from("creator_payouts")
        .select("id, amount_paise, status, paid_at, period_start, period_end, txn_ref, notes")
        .eq("creator_id", creator.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    return NextResponse.json({
      earnings: earningsRes.data ?? [],
      payouts: payoutsRes.data ?? [],
    });
  } catch (err) {
    console.error("[creator/earnings] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
