import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { computeTier, pointsForRupees } from "@/lib/points";
import { markDealPaid } from "@/lib/bitrix24";
import { findActiveCreator } from "@/lib/creator-attribution";
import { sendBookingConfirmationEmail } from "@/lib/emails/send-booking-confirmation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function awardPointsForBooking(userId: string, bookingId: string, depositAmount: number) {
  const earned = pointsForRupees(depositAmount);
  if (earned <= 0) return;

  // Fetch current
  const { data: existing } = await supabase
    .from("user_points")
    .select("total_points, lifetime_points")
    .eq("user_id", userId)
    .single();

  const newTotal = (existing?.total_points ?? 0) + earned;
  const newLifetime = (existing?.lifetime_points ?? 0) + earned;
  const tier = computeTier(newLifetime);

  await supabase
    .from("user_points")
    .upsert({
      user_id: userId,
      total_points: newTotal,
      lifetime_points: newLifetime,
      tier,
      updated_at: new Date().toISOString(),
    });

  await supabase.from("points_log").insert({
    user_id: userId,
    delta: earned,
    reason: "booking_verified",
    ref_id: bookingId,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
    }

    // Verify signature — use crypto.timingSafeEqual on equal-length buffers
    // to avoid leaking the comparison position via timing.
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    const expectedBuf = Buffer.from(expected, "utf8");
    const givenBuf = Buffer.from(String(razorpay_signature), "utf8");
    const sigOk =
      expectedBuf.length === givenBuf.length &&
      crypto.timingSafeEqual(expectedBuf, givenBuf);
    if (!sigOk) {
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

    // Find user by email — used for cart clearing + points award
    let matchedUserId: string | null = null;
    if (firstBooking.customer_email) {
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const matchedUser = users?.find((u) => u.email === firstBooking.customer_email);
      matchedUserId = matchedUser?.id ?? null;

      if (isGroup && matchedUserId) {
        await supabase.from("user_cart").delete().eq("user_id", matchedUserId);
      }
    }

    // Award loyalty points (1 per ₹100 of deposit, summed across all bookings in this order)
    if (matchedUserId) {
      const totalDeposit = bookings.reduce((sum, b) => sum + (b.deposit_amount ?? 0), 0);
      await awardPointsForBooking(matchedUserId, firstBooking.id, totalDeposit);
    }

    // Creator earnings: if any booking has a ref_code, create earnings rows
    for (const b of bookings) {
      if (!b.ref_code) continue;
      try {
        const creator = await findActiveCreator(b.ref_code);
        if (!creator) continue;
        const grossPaise = (b.package_price ?? 0) * (b.num_travellers ?? 1) * 100;
        const commissionPaise = Math.round(grossPaise * (Number(creator.commission_pct) / 100));
        await supabase.from("creator_earnings").upsert({
          creator_id: creator.id,
          booking_id: b.id,
          gross_amount_paise: grossPaise,
          commission_pct: creator.commission_pct,
          commission_amount_paise: commissionPaise,
          status: "pending",
        }, { onConflict: "booking_id" });
      } catch (e) {
        console.error("Creator earning insert error:", e);
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

    // Fire-and-forget Bitrix24 sync: advance the Deal(s) created at order time to Won.
    // If the deal wasn't pushed earlier (e.g. webhook missing at that time), this no-ops.
    markDealPaid(razorpay_order_id, razorpay_payment_id).catch((e) =>
      console.error("Bitrix24 markDealPaid error:", e)
    );

    // Fire-and-forget booking confirmation email per booking
    for (const b of bookings) {
      sendBookingConfirmationEmail(b).catch((e) =>
        console.error("Booking confirmation email error:", e)
      );
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
