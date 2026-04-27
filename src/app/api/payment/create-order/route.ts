import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { pushBookingAsDeal } from "@/lib/bitrix24";
import { REF_COOKIE, isValidRefCode } from "@/lib/creator-attribution";
import { rateLimit, clientIp } from "@/lib/redis";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Rate limit — 10 payment orders / minute / IP
    const { allowed } = await rateLimit(`payorder:${clientIp(req)}`, { limit: 10, windowSeconds: 60 });
    if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    const body = await req.json();
    const { package_slug, package_title, package_price,
            customer_name, customer_email, customer_phone,
            travel_date, num_travellers, special_requests,
            coupon_code } = body;

    if (!customer_name || !customer_email || !customer_phone || !package_slug) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Validate coupon (optional). Reject if expired, redeemed, or under min order.
    let discountAmount = 0;
    let validatedCoupon: string | null = null;
    if (coupon_code) {
      const code = String(coupon_code).toUpperCase().trim();
      const { data: coupon } = await supabase
        .from("coupons")
        .select("code, amount_off, min_order_value, expires_at, redeemed_at")
        .eq("code", code)
        .maybeSingle();

      if (!coupon) {
        return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
      }
      if (coupon.redeemed_at) {
        return NextResponse.json({ error: "This coupon has already been used." }, { status: 400 });
      }
      if (new Date(coupon.expires_at).getTime() < Date.now()) {
        return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
      }
      if (package_price < coupon.min_order_value) {
        return NextResponse.json({
          error: `Coupon needs a minimum trip value of ₹${coupon.min_order_value.toLocaleString("en-IN")}.`,
        }, { status: 400 });
      }
      discountAmount = coupon.amount_off;
      validatedCoupon = coupon.code;
    }

    const finalPrice = Math.max(0, package_price - discountAmount);

    // 30% of post-discount package price, minimum ₹5,000, rounded to nearest ₹100
    const depositRupees = Math.max(5000, Math.round((finalPrice * 0.30) / 100) * 100);
    const DEPOSIT_AMOUNT = depositRupees * 100; // convert to paise

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

    // Capture creator referral from cookie (set by middleware on ?ref= visit)
    const cookieRef = cookies().get(REF_COOKIE)?.value;
    const refCode = isValidRefCode(cookieRef) ? cookieRef : null;

    // Save booking as "created"
    const { data: bookingRow, error: dbErr } = await supabase.from("bookings").insert({
      razorpay_order_id: order.id,
      package_slug, package_title, package_price,
      deposit_amount: DEPOSIT_AMOUNT / 100,
      customer_name, customer_email, customer_phone,
      travel_date, num_travellers, special_requests,
      ref_code: refCode,
      coupon_code: validatedCoupon,
      discount_amount: discountAmount,
      status: "created",
    }).select("id").single();

    if (dbErr) console.error("Booking insert error:", dbErr);
    // Coupon is NOT redeemed here — only locked to the booking. The verify
    // route flips redeemed_at on successful payment so abandoned checkouts
    // don't burn the user's code.

    // Fire-and-forget Bitrix24 sync: opens a Deal in the Sales pipeline
    pushBookingAsDeal({
      customerName: customer_name,
      customerEmail: customer_email,
      customerPhone: customer_phone,
      packageTitle: package_title,
      packageSlug: package_slug,
      packagePrice: package_price,
      depositAmount: DEPOSIT_AMOUNT / 100,
      travelDate: travel_date,
      numTravellers: num_travellers,
      specialRequests: special_requests,
      razorpayOrderId: order.id,
      refCode: refCode ?? undefined,
    }).catch((e) => console.error("Bitrix24 pushBookingAsDeal error:", e));

    return NextResponse.json({
      order_id: order.id,
      amount: DEPOSIT_AMOUNT,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      coupon: validatedCoupon ? { code: validatedCoupon, amount_off: discountAmount } : null,
      final_price: finalPrice,
      original_price: package_price,
    });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
