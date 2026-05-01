import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, clientIp } from "@/lib/redis";
import { requireUser } from "@/lib/require-user";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Booking lookup. Earlier this route returned full booking PII (name, email,
 * phone, payment IDs, deposit) given just a booking UUID — anyone who guessed
 * or scraped a booking ID could harvest customer details. The phone-tail
 * lookup was even worse: 10 trailing digits returned the 10 most-recent
 * matching bookings, acting as a phone→email/name harvester.
 *
 * Now requires a Bearer JWT and only returns rows the caller owns
 * (`customer_email = jwt.email`). Returns 404 (not 403) on a foreign id so
 * we don't leak which booking IDs exist.
 */
export async function GET(req: NextRequest) {
  try {
    const { allowed } = await rateLimit(`booking-status:${clientIp(req)}`, {
      limit: 30,
      windowSeconds: 60,
    });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const auth = await requireUser(req);
    if (auth.denial) return auth.denial;
    const userEmail = auth.user.email?.toLowerCase();
    if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const phone = searchParams.get("phone");

    if (!id && !phone) {
      return NextResponse.json({ error: "Provide booking ID or phone." }, { status: 400 });
    }

    if (id) {
      const { data, error } = await supabase
        .from("bookings")
        .select("id,package_title,package_price,deposit_amount,customer_name,customer_email,customer_phone,travel_date,num_travellers,status,created_at")
        .eq("id", id)
        .ilike("customer_email", userEmail)
        .maybeSingle();
      if (error) return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
      if (!data) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
      return NextResponse.json({ bookings: [data] });
    }

    // Phone lookup — only returns the caller's own bookings, regardless of
    // which phone they punch in. The phone param survives only as an extra
    // narrowing filter so users with multiple numbers on file still work.
    const digits = phone!.replace(/\D/g, "").slice(-10);
    const { data, error } = await supabase
      .from("bookings")
      .select("id,package_title,package_price,deposit_amount,customer_name,customer_email,customer_phone,travel_date,num_travellers,status,created_at")
      .ilike("customer_email", userEmail)
      .ilike("customer_phone", `%${digits}`)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
    if (!data?.length) return NextResponse.json({ error: "No bookings found for this number." }, { status: 404 });
    return NextResponse.json({ bookings: data });
  } catch (err) {
    console.error("[booking-status] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
