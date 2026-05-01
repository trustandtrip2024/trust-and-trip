import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { timingSafeEqualStrings } from "@/lib/timing-safe";
import { computeTier, pointsForRupees } from "@/lib/points";
import { markDealPaid } from "@/lib/bitrix24";
import { findActiveCreator } from "@/lib/creator-attribution";
import { sendBookingConfirmationEmail } from "@/lib/emails/send-booking-confirmation";
import { sendCapiEvents, ipFromRequest } from "@/lib/meta-capi";
import { ga4Purchase, clientIdFromCookie } from "@/lib/ga4-mp";
import { cookies } from "next/headers";

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

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("[verify] RAZORPAY_KEY_SECRET not configured");
      return NextResponse.json({ error: "Payment not configured." }, { status: 503 });
    }
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    if (typeof razorpay_signature !== "string" || !timingSafeEqualStrings(expected, razorpay_signature)) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    // Idempotency: if every booking on this order is already 'verified', skip
    // all side effects (points, leads.insert, CAPI, GA4, emails, deal advance)
    // and return the same shape so the client treats the second call as a
    // no-op rather than an error or a duplicate-write success.
    const { data: existing } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("razorpay_order_id", razorpay_order_id);
    if (existing && existing.length > 0 && existing.every((b) => b.status === "verified")) {
      return NextResponse.json({
        success: true,
        already_verified: true,
        booking_id: existing[0].id,
        booking_ids: existing.map((b) => b.id),
        is_group: existing.length > 1,
      });
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

    // Mark coupon redeemed now that payment is verified. Re-check redeemed_at
    // is null to guard against double-spend across concurrent payments.
    for (const b of bookings) {
      if (!b.coupon_code) continue;
      await supabase
        .from("coupons")
        .update({ redeemed_at: new Date().toISOString(), redeemed_booking_id: b.id })
        .eq("code", b.coupon_code)
        .is("redeemed_at", null);
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

    // Save leads CRM entries (one per booking). If a lead already exists for
    // this booking (e.g. payment retry after a network blip), update it
    // instead of inserting a duplicate row.
    for (const b of bookings) {
      const message = `DEPOSIT PAID ₹${b.deposit_amount.toLocaleString("en-IN")}${isGroup ? " [cart]" : ""} | ${b.special_requests ?? ""}`;
      const { data: prior } = await supabase
        .from("leads")
        .select("id")
        .eq("phone", b.customer_phone)
        .eq("package_slug", b.package_slug)
        .eq("status", "booked")
        .order("created_at", { ascending: false })
        .limit(1);
      if (prior && prior.length > 0) {
        await supabase
          .from("leads")
          .update({ message, status: "booked" })
          .eq("id", prior[0].id);
      } else {
        await supabase.from("leads").insert({
          name: b.customer_name,
          email: b.customer_email,
          phone: b.customer_phone,
          package_title: b.package_title,
          package_slug: b.package_slug,
          travel_date: b.travel_date,
          num_travellers: b.num_travellers,
          message,
          source: "package_enquiry",
          status: "booked",
        });
      }
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

    // Meta CAPI Purchase — highest-value optimizer signal. Use the Razorpay
    // order_id as event_id so any browser-side Purchase fire on the success
    // page de-dups naturally. Total = sum of deposits across bookings in this
    // payment (handles cart-checkout). Fire-and-forget.
    const totalDepositForCapi = bookings.reduce(
      (s, b) => s + (b.deposit_amount ?? 0),
      0
    );
    const capiTitles = bookings
      .map((b) => b.package_title)
      .filter((t): t is string => Boolean(t));
    const capiSlugs = bookings
      .map((b) => b.package_slug)
      .filter((s): s is string => Boolean(s));
    sendCapiEvents([
      {
        name: "Purchase",
        eventId: razorpay_order_id,
        actionSource: "website",
        user: {
          email: firstBooking.customer_email ?? undefined,
          phone: firstBooking.customer_phone ?? undefined,
          firstName: (firstBooking.customer_name ?? "").split(/\s+/)[0],
          country: "in",
          externalId: matchedUserId ?? firstBooking.id,
          clientIp: ipFromRequest(req),
          clientUserAgent: req.headers.get("user-agent") ?? undefined,
        },
        customData: {
          currency: "INR",
          value: totalDepositForCapi,
          contentName: capiTitles.join(" + ") || undefined,
          contentIds: capiSlugs.length ? capiSlugs : undefined,
          contentType: "product",
          numItems: bookings.length,
        },
      },
    ]).catch((e) => console.error("[capi] Purchase failed", e));

    // GA4 purchase mirror.
    const gaClientId = clientIdFromCookie(cookies().get("_ga")?.value);
    if (gaClientId) {
      void ga4Purchase({
        clientId: gaClientId,
        value: totalDepositForCapi,
        transactionId: razorpay_order_id,
        packageSlugs: capiSlugs,
        packageTitle: capiTitles[0],
        ipOverride: ipFromRequest(req),
        userAgent: req.headers.get("user-agent") ?? undefined,
        externalId: matchedUserId ?? firstBooking.id,
      }).catch((e) => console.error("[ga4-mp] Purchase failed", e));
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
