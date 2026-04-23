import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function depositFor(pricePerPerson: number): number {
  return Math.max(5000, Math.round((pricePerPerson * 0.30) / 100) * 100);
}

export async function POST(req: NextRequest) {
  try {
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

    // Compute total deposit in paise
    let totalDepositPaise = 0;
    const lineItems = cartItems.map((item) => {
      const num = item.num_travelers || 1;
      const depositPerPerson = depositFor(item.package_price);
      const depositTotal = depositPerPerson * num;
      totalDepositPaise += depositTotal * 100;
      return { item, num, depositTotal };
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

    // Insert one bookings row per cart item, all sharing order_group_id + razorpay_order_id
    const bookingRows = lineItems.map(({ item, num, depositTotal }) => ({
      razorpay_order_id: order.id,
      order_group_id: orderGroupId,
      package_slug: item.package_slug,
      package_title: item.package_title,
      package_price: item.package_price,
      deposit_amount: depositTotal,
      customer_name: customerName,
      customer_email: user.email,
      customer_phone: customerPhone,
      travel_date: item.travel_date,
      num_travellers: num,
      special_requests: specialRequests || null,
      status: "created" as const,
    }));

    const { error: insertErr } = await adminClient.from("bookings").insert(bookingRows);
    if (insertErr) {
      console.error("Booking insert error:", insertErr);
      return NextResponse.json({ error: "Failed to record bookings." }, { status: 500 });
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
