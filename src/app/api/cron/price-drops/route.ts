import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { getDynamicPrice } from "@/lib/dynamic-pricing";

// Runs daily via Vercel Cron — see vercel.json
// Scans user_saved_trips, emails users when dynamic price drops >= MIN_DROP_PCT
// Respects re-alert cooldown ALERT_COOLDOWN_DAYS

const MIN_DROP_PCT = 5;
const ALERT_COOLDOWN_DAYS = 7;

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SavedTrip {
  id: string;
  user_id: string;
  package_slug: string;
  package_title: string;
  package_image: string | null;
  package_price: number;
  price_at_save: number | null;
  duration: string | null;
  destination_name: string | null;
  last_alerted_at: string | null;
  last_alerted_price: number | null;
}

import { assertCronAuth } from "@/lib/cron-auth";

export async function GET(req: NextRequest) {
  const denial = assertCronAuth(req);
  if (denial) return denial;

  const { data: trips, error } = await admin
    .from("user_saved_trips")
    .select("id, user_id, package_slug, package_title, package_image, package_price, price_at_save, duration, destination_name, last_alerted_at, last_alerted_price")
    .not("price_at_save", "is", null);

  if (error) {
    console.error("[cron:price-drops] fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!trips?.length) return NextResponse.json({ ok: true, scanned: 0, alerted: 0 });

  const cooldownMs = ALERT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // Batch-load user emails once
  const uniqueUserIds = Array.from(new Set(trips.map((t) => t.user_id)));
  const { data: { users: allUsers } } = await admin.auth.admin.listUsers();
  const userMap = new Map<string, { email: string; name: string }>();
  for (const u of allUsers ?? []) {
    if (uniqueUserIds.includes(u.id) && u.email) {
      userMap.set(u.id, {
        email: u.email,
        name: (u.user_metadata?.full_name as string) || u.email.split("@")[0],
      });
    }
  }

  let alerted = 0;
  const resendKey = process.env.RESEND_API_KEY;

  for (const trip of trips as SavedTrip[]) {
    if (!trip.price_at_save) continue;
    const user = userMap.get(trip.user_id);
    if (!user) continue;

    const { price: currentPrice } = getDynamicPrice(trip.package_price, trip.package_slug);
    const dropPct = Math.round(((trip.price_at_save - currentPrice) / trip.price_at_save) * 100);

    if (dropPct < MIN_DROP_PCT) continue;

    // Cooldown: skip if alerted recently at the same or lower price
    if (trip.last_alerted_at) {
      const elapsed = now - new Date(trip.last_alerted_at).getTime();
      if (elapsed < cooldownMs) continue;
      if (trip.last_alerted_price !== null && currentPrice >= trip.last_alerted_price) continue;
    }

    // Send email (if Resend configured)
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const { PriceDropEmail } = await import("@/lib/emails/price-drop");
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: process.env.RESEND_DEALS_FROM ?? process.env.RESEND_FROM ?? "Trust and Trip <deals@trustandtrip.com>",
          to: [user.email],
          subject: `${dropPct}% off ${trip.package_title} — your saved trip just dropped`,
          react: PriceDropEmail({
            name: user.name,
            packageTitle: trip.package_title,
            packageSlug: trip.package_slug,
            oldPrice: trip.price_at_save,
            newPrice: currentPrice,
            percentOff: dropPct,
            destinationName: trip.destination_name ?? undefined,
            duration: trip.duration ?? undefined,
            image: trip.package_image ?? undefined,
          }),
        });
      } catch (err) {
        console.error("[cron:price-drops] email send failed:", err);
        continue;
      }
    }

    // Always stamp so we don't re-alert even when Resend is absent
    await admin
      .from("user_saved_trips")
      .update({
        last_alerted_at: new Date().toISOString(),
        last_alerted_price: currentPrice,
      })
      .eq("id", trip.id);

    alerted++;
  }

  return NextResponse.json({
    ok: true,
    scanned: trips.length,
    alerted,
    resend_configured: !!resendKey,
  });
}
