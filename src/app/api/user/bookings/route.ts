import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error } = await adminClient.auth.getUser(token);
    if (error || !user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error: dbError } = await adminClient
      .from("bookings")
      .select("id, package_slug, package_title, package_price, deposit_amount, customer_name, customer_email, customer_phone, travel_date, num_travellers, special_requests, status, created_at, razorpay_order_id")
      .eq("customer_email", user.email)
      .order("created_at", { ascending: false });

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    return NextResponse.json({ bookings: data ?? [] });
  } catch (err) {
    console.error("[user/bookings] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
