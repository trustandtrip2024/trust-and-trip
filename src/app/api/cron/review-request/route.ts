import { NextRequest, NextResponse } from "next/server";
import { withCronLog } from "@/lib/cron-log";
import { createClient } from "@supabase/supabase-js";

// Runs daily. Sends a post-trip review request 3 days after the traveller's
// trip end, once per booking. Uses travel_date (text, ISO-preferred) when it
// parses; falls back to created_at + 30 days for legacy rows with non-ISO
// travel_date strings.
//
// Auth: Vercel Cron Bearer <CRON_SECRET>.

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustandtrip.com";

// Google "write a review" URL format. Falls back to search-based URL if no place ID.
function googleReviewUrl(): string {
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (placeId) return `https://search.google.com/local/writereview?placeid=${placeId}`;
  return "https://www.google.com/search?q=trust+and+trip+noida+reviews";
}

interface BookingRow {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  package_title: string | null;
  package_slug: string | null;
  destination: string | null;
  travel_date: string | null;
  created_at: string;
  status: string;
  review_request_sent_at: string | null;
}

// Returns the best-effort trip end date. If travel_date is ISO-8601 parseable,
// use it. Otherwise fall back to created_at + 30d (most packages are short-dated).
function tripEndDate(row: BookingRow): Date {
  if (row.travel_date) {
    const m = row.travel_date.match(/^\d{4}-\d{2}-\d{2}/);
    if (m) {
      const d = new Date(row.travel_date);
      if (!isNaN(d.getTime())) return d;
    }
  }
  const created = new Date(row.created_at);
  return new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
}

export const dynamic = "force-dynamic";

import { assertCronAuth } from "@/lib/cron-auth";

async function _runCron(req: NextRequest) {
  const denial = assertCronAuth(req);
  if (denial) return denial;

  // Only verified bookings eligible.
  const { data: rows, error } = await admin
    .from("bookings")
    .select("id, customer_name, customer_email, package_title, package_slug, destination, travel_date, created_at, status, review_request_sent_at")
    .eq("status", "verified")
    .is("review_request_sent_at", null)
    .limit(500);

  if (error) {
    console.error("[cron:review-request] fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!rows?.length) return NextResponse.json({ ok: true, scanned: 0, sent: 0 });

  const now = Date.now();
  const eligible = (rows as BookingRow[]).filter((b) => {
    if (!b.customer_email) return false;
    const end = tripEndDate(b);
    const ageDays = (now - end.getTime()) / (1000 * 60 * 60 * 24);
    return ageDays >= 3 && ageDays <= 60; // 3–60 days after trip end
  });

  if (!eligible.length) return NextResponse.json({ ok: true, scanned: rows.length, sent: 0 });

  const resendKey = process.env.RESEND_API_KEY;
  let Resend: typeof import("resend").Resend | null = null;
  let ReviewRequestEmail: typeof import("@/lib/emails/review-request").ReviewRequestEmail | null = null;
  if (resendKey) {
    try {
      Resend = (await import("resend")).Resend;
      ReviewRequestEmail = (await import("@/lib/emails/review-request")).ReviewRequestEmail;
    } catch (e) {
      console.error("[cron:review-request] resend import failed:", e);
    }
  }
  const resend = resendKey && Resend ? new Resend(resendKey) : null;
  const FROM = process.env.RESEND_FROM ?? "Trust and Trip <noreply@trustandtrip.com>";
  const gUrl = googleReviewUrl();

  let sent = 0;
  for (const b of eligible) {
    if (!b.customer_email) continue;
    if (resend && ReviewRequestEmail) {
      try {
        await resend.emails.send({
          from: FROM,
          to: [b.customer_email],
          subject: `How was ${b.package_title ?? "your trip"}? A quick review would mean the world.`,
          react: ReviewRequestEmail({
            name: b.customer_name ?? "Traveller",
            packageTitle: b.package_title ?? "your trip",
            destinationName: b.destination ?? undefined,
            reviewUrl: `${SITE_URL}/dashboard/reviews?new=1&booking=${b.id}`,
            googleReviewUrl: gUrl,
          }),
        });
        sent++;
      } catch (e) {
        console.error(`[cron:review-request] send failed for ${b.customer_email}:`, e);
        continue; // don't stamp so we retry
      }
    }
    await admin
      .from("bookings")
      .update({ review_request_sent_at: new Date().toISOString() })
      .eq("id", b.id);
  }

  return NextResponse.json({
    ok: true,
    scanned: rows.length,
    eligible: eligible.length,
    sent,
    resend_configured: !!resend,
  });
}

export async function GET(req: NextRequest) {
  return withCronLog("/api/cron/review-request", () => _runCron(req));
}
