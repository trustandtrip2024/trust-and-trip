import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const phone = searchParams.get("phone");

  if (!id && !phone) {
    return NextResponse.json({ error: "Provide booking ID or phone." }, { status: 400 });
  }

  if (id) {
    const { data, error } = await supabase
      .from("bookings")
      .select("id,package_title,package_price,deposit_amount,customer_name,customer_email,customer_phone,travel_date,num_travellers,status,created_at")
      .eq("id", id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    return NextResponse.json({ bookings: [data] });
  }

  // Phone lookup — sanitize to digits only
  const digits = phone!.replace(/\D/g, "").slice(-10);
  const { data, error } = await supabase
    .from("bookings")
    .select("id,package_title,package_price,deposit_amount,customer_name,customer_email,customer_phone,travel_date,num_travellers,status,created_at")
    .ilike("customer_phone", `%${digits}`)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "No bookings found for this number." }, { status: 404 });
  return NextResponse.json({ bookings: data });
}
