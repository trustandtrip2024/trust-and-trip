import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { pushBookingAsDeal } from "@/lib/bitrix24";
import { REF_COOKIE, isValidRefCode } from "@/lib/creator-attribution";
import { rateLimit, clientIp } from "@/lib/redis";
import { getPackageBySlug } from "@/lib/sanity-queries";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { allowed } = await rateLimit(`cartorder:${clientIp(req)}`, { limit: 10, windowSeconds: 60 });
    if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error: authErr } = await adminClient.auth.getUser(token);
    if (authErr || !user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const customerName: string = body.customer_name ?? user.user_metadata?.full_name ?? user.email.split("@")[0];
    const customerPhone: string = body.customer_phone ?? user.user_metadata?.phone ?? "";
    const specialRequests: string = body.special_requests ?? "";

    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Payment not configured." }, { status: 503 });
    }

    // Fetch cart items (using service role, filter by user_id)
    const { data: cartItems, error: cartErr } = await adminClient
      .from("user_cart")
      .select("*")
      .eq("user_id", user.id);

    if (cartErr) return NextResponse.json({ error: cartErr.message }, { status: 500 });
    if (!cartItems?.length) return NextResponse.json({ error: "Cart is empty." }, { status: 400 });

    // Authoritative price + title come from Sanity per cart row, not from
    // the user_cart values (those are populated client-side under RLS and
    // can be tampered with). We refuse to checkout if any cart row points
    // at a slug Sanity does not know -- safer than silently dropping the
    // line item. Resolve all slugs in parallel; getPackageBySlug is cached
    // via the Sanity query layer so this is cheap.
    const resolved = await Promise.all(
      cartItems.map(async (item) => {
        const pkg = await getPackageBySlug(String(item.package_slug)).catch(() => null);
        return pkg ? { item, pkg } : null;
      }),
    );
    const missing = resolved
      .map((r, i) => (r ? null : cartItems[i].package_slug))
      .filter(Boolean) as string[];
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Some cart items are no longer available: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    // Compute total deposit in paise using server-derived prices only.
    let totalDepositPaise = 0;
    const lineItems = resolved.map((r) => {
      const { item, pkg } = r!;
      const num = Math.max(1, Math.min(20, Number(item.num_travelers) || 1));
      const tripTotal = pkg.price * num;
      const depositTotal = Math.max(5000, Math.round((tripTotal * 0.30) / 100) * 100);
      totalDepositPaise += depositTotal * 100;
      return { item, pkg, num, depositTotal };
    });

    // Generate group id upfront (shared across bookings)
    const orderGroupId = crypto.randomUUID();

    // Create Razorpay order
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: totalDepositPaise,
        currency: "INR",
        receipt: `cart_${Date.now()}_${orderGroupId.slice(0, 8)}`,
        notes: {
          user_id: user.id,
          customer_email: user.email,
          order_group_id: orderGroupId,
          item_count: String(cartItems.length),
        },
      }),
    });

    if (!rzpRes.ok) {
      const err = await rzpRes.json();
      console.error("Razorpay cart order error:", err);
      return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
    }

    const order = await rzpRes.json();

    // Capture creator ref from cookie
    const cookieRef = cookies().get(REF_COOKIE)?.value;
    const refCode = isValidRefCode(cookieRef) ? cookieRef : null;

    // Insert one bookings row per cart item, all sharing order_group_id + razorpay_order_id.
    // package_title and package_price come from Sanity (pkg), not the cart row.
    const bookingRows = lineItems.map(({ item, pkg, num, depositTotal }) => ({
      razorpay_order_id: order.id,
      order_group_id: orderGroupId,
      package_slug: item.package_slug,
      package_title: pkg.title,
      package_price: pkg.price,
      deposit_amount: depositTotal,
      customer_name: customerName,
      customer_email: user.email,
      customer_phone: customerPhone,
      travel_date: item.travel_date,
      num_travellers: num,
      special_requests: specialRequests || null,
      ref_code: refCode,
      status: "created" as const,
    }));

    const { error: insertErr } = await adminClient.from("bookings").insert(bookingRows);
    if (insertErr) {
      console.error("Booking insert error:", insertErr);
      return NextResponse.json({ error: "Failed to record bookings." }, { status: 500 });
    }

    // Fire-and-forget Bitrix24 sync: one Deal per cart line (all tagged as cart group)
    for (const row of bookingRows) {
      pushBookingAsDeal({
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone,
        packageTitle: row.package_title,
        packageSlug: row.package_slug,
        packagePrice: row.package_price,
        depositAmount: row.deposit_amount,
        travelDate: row.travel_date,
        numTravellers: row.num_travellers,
        specialRequests: row.special_requests ?? undefined,
        razorpayOrderId: row.razorpay_order_id,
        isGroup: true,
        refCode: row.ref_code ?? undefined,
      }).catch((e) => console.error("Bitrix24 pushBookingAsDeal (cart) error:", e));
    }

    return NextResponse.json({
      order_id: order.id,
      amount: totalDepositPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      order_group_id: orderGroupId,
      item_count: cartItems.length,
    });
  } catch (err) {
    console.error("Create cart order error:", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
