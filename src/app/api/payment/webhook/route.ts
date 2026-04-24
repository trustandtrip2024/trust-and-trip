import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { computeTier, pointsForRupees } from "@/lib/points";
import { markDealPaid } from "@/lib/bitrix24";
import { findActiveCreator } from "@/lib/creator-attribution";

// Razorpay server-to-server webhook. Fires independently of client-side
// /verify call, so payments complete even if the user closes the tab.
//
// Required env: RAZORPAY_WEBHOOK_SECRET (shared with the Razorpay dashboard).
//
// Subscribed events (configured in Razorpay dashboard):
//   payment.captured, order.paid, payment.failed, refund.processed
//
// Must read raw bytes (not req.json()) to verify HMAC signature.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

interface RazorpayEvent {
  event: string;
  payload: {
    payment?: { entity: RazorpayPayment };
    order?: { entity: { id: string; amount: number; status: string } };
    refund?: { entity: { payment_id: string; amount: number; id: string } };
  };
}

interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  error_description?: string;
}

async function awardPointsForBooking(userId: string, bookingId: string, depositAmount: number) {
  const earned = pointsForRupees(depositAmount);
  if (earned <= 0) return;
  const { data: existing } = await supabase
    .from("user_points")
    .select("total_points, lifetime_points")
    .eq("user_id", userId)
    .single();
  const newTotal = (existing?.total_points ?? 0) + earned;
  const newLifetime = (existing?.lifetime_points ?? 0) + earned;
  await supabase.from("user_points").upsert({
    user_id: userId,
    total_points: newTotal,
    lifetime_points: newLifetime,
    tier: computeTier(newLifetime),
    updated_at: new Date().toISOString(),
  });
  await supabase.from("points_log").insert({
    user_id: userId,
    delta: earned,
    reason: "booking_verified",
    ref_id: bookingId,
  });
}

async function finalizeOrder(orderId: string, paymentId: string) {
  // Only update bookings still in 'created' state — idempotent vs client-side /verify.
  const { data: bookings, error } = await supabase
    .from("bookings")
    .update({ razorpay_payment_id: paymentId, status: "verified" })
    .eq("razorpay_order_id", orderId)
    .in("status", ["created", "pending"])
    .select();

  if (error) {
    console.error("[webhook] finalizeOrder update error:", error);
    return;
  }
  if (!bookings || bookings.length === 0) {
    // Already verified by client-side /verify — nothing to do.
    return;
  }

  const firstBooking = bookings[0];
  const isGroup = bookings.length > 1 || !!firstBooking.order_group_id;

  let matchedUserId: string | null = null;
  if (firstBooking.customer_email) {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const matchedUser = users?.find((u) => u.email === firstBooking.customer_email);
    matchedUserId = matchedUser?.id ?? null;
    if (isGroup && matchedUserId) {
      await supabase.from("user_cart").delete().eq("user_id", matchedUserId);
    }
  }

  if (matchedUserId) {
    const totalDeposit = bookings.reduce((sum, b) => sum + (b.deposit_amount ?? 0), 0);
    await awardPointsForBooking(matchedUserId, firstBooking.id, totalDeposit);
  }

  // Creator earnings
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
      console.error("[webhook] creator earning error:", e);
    }
  }

  // Lead CRM row per booking
  for (const b of bookings) {
    await supabase.from("leads").insert({
      name: b.customer_name,
      email: b.customer_email,
      phone: b.customer_phone,
      package_title: b.package_title,
      package_slug: b.package_slug,
      travel_date: b.travel_date,
      num_travellers: String(b.num_travellers),
      message: `DEPOSIT PAID ₹${b.deposit_amount.toLocaleString("en-IN")}${isGroup ? " [cart]" : ""} [via webhook] | ${b.special_requests ?? ""}`,
      source: "package_enquiry",
      status: "booked",
    });
  }

  markDealPaid(orderId, paymentId).catch((e) =>
    console.error("[webhook] Bitrix24 markDealPaid error:", e)
  );
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[webhook] RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const raw = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    const sigBuf = Buffer.from(signature, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.warn("[webhook] signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const evt = JSON.parse(raw) as RazorpayEvent;

    switch (evt.event) {
      case "payment.captured":
      case "order.paid": {
        const payment = evt.payload.payment?.entity;
        const order = evt.payload.order?.entity;
        const orderId = payment?.order_id ?? order?.id;
        const paymentId = payment?.id ?? "";
        if (orderId) await finalizeOrder(orderId, paymentId);
        break;
      }

      case "payment.failed": {
        const payment = evt.payload.payment?.entity;
        if (payment?.order_id) {
          await supabase
            .from("bookings")
            .update({
              status: "failed",
              razorpay_payment_id: payment.id,
              notes: payment.error_description ?? null,
            })
            .eq("razorpay_order_id", payment.order_id)
            .in("status", ["created", "pending"]);
        }
        break;
      }

      case "refund.processed":
      case "refund.created": {
        const refund = evt.payload.refund?.entity;
        if (refund?.payment_id) {
          await supabase
            .from("bookings")
            .update({ status: "refunded" })
            .eq("razorpay_payment_id", refund.payment_id);
        }
        break;
      }

      default:
        // Unknown event — ack so Razorpay stops retrying.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] error:", err);
    // Return 500 so Razorpay retries.
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
