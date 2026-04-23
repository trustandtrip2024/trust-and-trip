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

    // Update all bookings tied to this order (supports cart checkout → 1 order, N bookings)
    const { data: bookings, error } = await supabase
      .from("bookings")
      .update({ razorpay_payment_id, razorpay_signature, status: "verified" })
      .eq("razorpay_order_id", razorpay_order_id)
      .select();

    if (error) throw error;
    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    // Fire leads + clear cart for cart checkout
    const firstBooking = bookings[0];
    const isGroup = bookings.length > 1 || !!firstBooking.order_group_id;

    // Find user by email to clear cart (only if logged-in group checkout)
    if (isGroup && firstBooking.customer_email) {
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const matchedUser = users?.find((u) => u.email === firstBooking.customer_email);
      if (matchedUser) {
        await supabase.from("user_cart").delete().eq("user_id", matchedUser.id);
      }
    }

    // Save leads CRM entries (one per booking)
    for (const b of bookings) {
      await supabase.from("leads").insert({
        name: b.customer_name,
        email: b.customer_email,
        phone: b.customer_phone,
        package_title: b.package_title,
        package_slug: b.package_slug,
        travel_date: b.travel_date,
        num_travellers: String(b.num_travellers),
        message: `DEPOSIT PAID ₹${b.deposit_amount.toLocaleString("en-IN")}${isGroup ? " [cart]" : ""} | ${b.special_requests ?? ""}`,
        source: "package_enquiry",
        status: "booked",
      });
    }

    return NextResponse.json({
      success: true,
      booking_id: firstBooking.id,
      booking_ids: bookings.map((b) => b.id),
      is_group: isGroup,
    });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
