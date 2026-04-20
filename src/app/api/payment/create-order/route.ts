import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEPOSIT_AMOUNT = 500000; // ₹5,000 in paise

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { package_slug, package_title, package_price,
            customer_name, customer_email, customer_phone,
            travel_date, num_travellers, special_requests } = body;

    if (!customer_name || !customer_email || !customer_phone || !package_slug) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Payment not configured." }, { status: 503 });
    }

    // Create Razorpay order
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: DEPOSIT_AMOUNT,
        currency: "INR",
        receipt: `tnp_${Date.now()}`,
        notes: { package_slug, customer_email },
      }),
    });

    if (!rzpRes.ok) {
      const err = await rzpRes.json();
      console.error("Razorpay order error:", err);
      return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
    }

    const order = await rzpRes.json();

    // Save booking as "created"
    const { error: dbErr } = await supabase.from("bookings").insert({
      razorpay_order_id: order.id,
      package_slug, package_title, package_price,
      deposit_amount: DEPOSIT_AMOUNT / 100,
      customer_name, customer_email, customer_phone,
      travel_date, num_travellers, special_requests,
      status: "created",
    });

    if (dbErr) console.error("Booking insert error:", dbErr);

    return NextResponse.json({
      order_id: order.id,
      amount: DEPOSIT_AMOUNT,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
