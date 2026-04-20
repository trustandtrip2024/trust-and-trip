import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    // Update booking to verified
    const { data: booking, error } = await supabase
      .from("bookings")
      .update({ razorpay_payment_id, razorpay_signature, status: "verified" })
      .eq("razorpay_order_id", razorpay_order_id)
      .select()
      .single();

    if (error) throw error;

    // Save to leads CRM too
    if (booking) {
      await supabase.from("leads").insert({
        name: booking.customer_name,
        email: booking.customer_email,
        phone: booking.customer_phone,
        package_title: booking.package_title,
        package_slug: booking.package_slug,
        travel_date: booking.travel_date,
        num_travellers: String(booking.num_travellers),
        message: `DEPOSIT PAID ₹5,000 | ${booking.special_requests ?? ""}`,
        source: "package_enquiry",
        status: "booked",
      });
    }

    return NextResponse.json({ success: true, booking_id: booking?.id });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
