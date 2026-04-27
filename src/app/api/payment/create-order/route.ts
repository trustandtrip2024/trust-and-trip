import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { pushBookingAsDeal } from "@/lib/bitrix24";
import { REF_COOKIE, isValidRefCode } from "@/lib/creator-attribution";
import { rateLimit, clientIp } from "@/lib/redis";
import { sendCapiEvents, ipFromRequest } from "@/lib/meta-capi";
import { ga4InitiateCheckout, clientIdFromCookie } from "@/lib/ga4-mp";

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

    // Attribute booking to the most recent matching Lead so funnel reporting
    // is exact (not best-effort email/phone match at query time).
    const phoneDigits = String(customer_phone ?? "").replace(/\D/g, "");
    const phoneTail = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : null;
    let attributedLead: {
      id: string;
      score: number | null;
      tier: string | null;
      utm_source: string | null;
      utm_medium: string | null;
      utm_campaign: string | null;
      utm_content: string | null;
      utm_term: string | null;
    } | null = null;
    {
      const { data: matches } = await supabase
        .from("leads")
        .select("id, score, tier, utm_source, utm_medium, utm_campaign, utm_content, utm_term, email, phone, created_at")
        .or(
          [
            customer_email ? `email.eq.${customer_email}` : "",
            phoneTail ? `phone.ilike.%${phoneTail}` : "",
          ].filter(Boolean).join(",")
        )
        .order("created_at", { ascending: false })
        .limit(1);
      if (matches && matches.length > 0) {
        const m = matches[0];
        attributedLead = {
          id: m.id,
          score: (m.score as number | null) ?? null,
          tier: (m.tier as string | null) ?? null,
          utm_source: m.utm_source as string | null,
          utm_medium: m.utm_medium as string | null,
          utm_campaign: m.utm_campaign as string | null,
          utm_content: m.utm_content as string | null,
          utm_term: m.utm_term as string | null,
        };
      }
    }

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
      lead_id:      attributedLead?.id ?? null,
      lead_score:   attributedLead?.score ?? null,
      lead_tier:    attributedLead?.tier ?? null,
      utm_source:   attributedLead?.utm_source ?? null,
      utm_medium:   attributedLead?.utm_medium ?? null,
      utm_campaign: attributedLead?.utm_campaign ?? null,
      utm_content:  attributedLead?.utm_content ?? null,
      utm_term:     attributedLead?.utm_term ?? null,
      status: "created",
    }).select("id").single();

    if (dbErr) console.error("Booking insert error:", dbErr);
    // Coupon is NOT redeemed here — only locked to the booking. The verify
    // route flips redeemed_at on successful payment so abandoned checkouts
    // don't burn the user's code.

    // CAPI InitiateCheckout — paired with browser-side fbq fire on Razorpay open.
    // event_id = razorpay order_id so any browser-side IC dedupes naturally.
    const fbp = cookies().get("_fbp")?.value;
    const fbc = cookies().get("_fbc")?.value;
    sendCapiEvents([
      {
        name: "InitiateCheckout",
        eventId: order.id,
        actionSource: "website",
        user: {
          email: customer_email,
          phone: customer_phone,
          firstName: String(customer_name).split(/\s+/)[0],
          country: "in",
          externalId: bookingRow?.id ? String(bookingRow.id) : undefined,
          fbp,
          fbc,
          clientIp: ipFromRequest(req),
          clientUserAgent: req.headers.get("user-agent") ?? undefined,
        },
        customData: {
          currency: "INR",
          value: DEPOSIT_AMOUNT / 100,
          contentName: package_title,
          contentIds: package_slug ? [package_slug] : undefined,
          contentType: "product",
          numItems: 1,
        },
      },
    ]).catch((e) => console.error("[capi] InitiateCheckout failed", e));

    // GA4 begin_checkout mirror.
    const gaClientId = clientIdFromCookie(cookies().get("_ga")?.value);
    if (gaClientId) {
      void ga4InitiateCheckout({
        clientId: gaClientId,
        value: DEPOSIT_AMOUNT / 100,
        packageSlug: package_slug,
        packageTitle: package_title,
        ipOverride: ipFromRequest(req),
        userAgent: req.headers.get("user-agent") ?? undefined,
        externalId: bookingRow?.id ? String(bookingRow.id) : undefined,
      }).catch((e) => console.error("[ga4-mp] IC failed", e));
    }

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
