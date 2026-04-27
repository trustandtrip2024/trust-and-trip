// Daily founder digest — yesterday's KPIs, delivered 8 AM IST.
//
// Computes lead/booking/revenue counts for the last 24h, the previous 24h
// for comparison, and the top UTM sources. Highlights any unresponded
// tier-A leads as an action item. Email goes to FOUNDER_EMAIL via Resend.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LeadRow {
  id: string;
  created_at: string;
  status: string | null;
  tier: string | null;
  utm_source: string | null;
  email: string | null;
  phone: string | null;
}
interface BookingRow {
  id: string;
  created_at: string;
  status: string | null;
  deposit_amount: number | null;
  customer_email: string | null;
  customer_phone: string | null;
  utm_source: string | null;
  lead_id: string | null;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const day0 = new Date(now - 24 * 3600 * 1000).toISOString();
  const day1 = new Date(now - 48 * 3600 * 1000).toISOString();

  const [leadsRes, bookingsRes] = await Promise.all([
    supabase
      .from("leads")
      .select("id, created_at, status, tier, utm_source, email, phone")
      .gte("created_at", day1)
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("bookings")
      .select("id, created_at, status, deposit_amount, customer_email, customer_phone, utm_source, lead_id")
      .gte("created_at", day1)
      .order("created_at", { ascending: false })
      .limit(5000),
  ]);

  if (leadsRes.error) return NextResponse.json({ error: leadsRes.error.message }, { status: 500 });
  if (bookingsRes.error) return NextResponse.json({ error: bookingsRes.error.message }, { status: 500 });

  const allLeads = (leadsRes.data ?? []) as LeadRow[];
  const allBookings = (bookingsRes.data ?? []) as BookingRow[];

  const inWindow = (iso: string, start: string, end: string) =>
    iso >= start && iso < end;

  const leads24      = allLeads.filter((l) => l.created_at >= day0);
  const leadsPrev24  = allLeads.filter((l) => inWindow(l.created_at, day1, day0));
  const bookings24   = allBookings.filter((b) => b.created_at >= day0 && b.status === "verified");
  const bookingsPrev = allBookings.filter((b) => inWindow(b.created_at, day1, day0) && b.status === "verified");

  const tierA24      = leads24.filter((l) => l.tier === "A").length;
  const tierAPrev    = leadsPrev24.filter((l) => l.tier === "A").length;
  const grossDeposit = bookings24.reduce((s, b) => s + (b.deposit_amount ?? 0), 0);
  const grossPrev    = bookingsPrev.reduce((s, b) => s + (b.deposit_amount ?? 0), 0);

  // Action items
  const unrespondedTierA = leads24.filter((l) => l.tier === "A" && l.status === "new").length;
  const alerts: string[] = [];
  if (unrespondedTierA > 0) {
    alerts.push(`${unrespondedTierA} tier-A lead${unrespondedTierA === 1 ? "" : "s"} from yesterday still status=new — call now.`);
  }
  const cancelled24 = allBookings.filter(
    (b) => b.created_at >= day0 && (b.status === "cancelled" || b.status === "refunded")
  ).length;
  if (cancelled24 > 2) {
    alerts.push(`${cancelled24} cancellations yesterday — check ops queue.`);
  }

  // Top sources
  type Src = { src: string; leads: number; tierA: number; bookings: number };
  const map = new Map<string, Src>();
  for (const l of leads24) {
    const k = l.utm_source ?? "direct/organic";
    const e = map.get(k) ?? { src: k, leads: 0, tierA: 0, bookings: 0 };
    e.leads++;
    if (l.tier === "A") e.tierA++;
    map.set(k, e);
  }
  // Match yesterday's verified bookings → source
  const leadById = new Map(allLeads.map((l) => [l.id, l]));
  for (const b of bookings24) {
    let src: string | null = b.utm_source ?? null;
    if (!src && b.lead_id) {
      const lead = leadById.get(b.lead_id);
      src = lead?.utm_source ?? null;
    }
    const k = src ?? "direct/organic";
    const e = map.get(k) ?? { src: k, leads: 0, tierA: 0, bookings: 0 };
    e.bookings++;
    map.set(k, e);
  }
  const topSources = Array.from(map.values())
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 6);

  // Send via Resend
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, reason: "RESEND_API_KEY missing", computed: true });
  }
  const recipient = process.env.FOUNDER_EMAIL ?? process.env.BUSINESS_EMAIL ?? "hello@trustandtrip.com";
  const FROM = process.env.RESEND_FROM ?? "Trust and Trip <noreply@trustandtrip.com>";

  try {
    const { Resend } = await import("resend");
    const { FounderDigestEmail } = await import("@/lib/emails/founder-digest");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const dateLabel = new Date(now - 12 * 3600 * 1000).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    await resend.emails.send({
      from: FROM,
      to: recipient.split(",").map((s) => s.trim()),
      subject: `T&T daily · ${leads24.length} leads · ${bookings24.length} bookings · ${dateLabel}`,
      react: FounderDigestEmail({
        date: dateLabel,
        windowLabel: "Last 24 hours",
        totalLeads: leads24.length,
        prevLeads: leadsPrev24.length,
        tierA: tierA24,
        prevTierA: tierAPrev,
        bookings: bookings24.length,
        prevBookings: bookingsPrev.length,
        grossDeposit,
        prevGrossDeposit: grossPrev,
        unrespondedTierA,
        topSources,
        alerts,
      }),
    });
  } catch (e) {
    console.error("[founder-digest] send failed", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "send failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    leads24: leads24.length,
    bookings24: bookings24.length,
    grossDeposit,
    unrespondedTierA,
    alerts: alerts.length,
  });
}
