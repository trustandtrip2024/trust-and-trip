// Admin CSV export — leads or bookings, optional date window.
//
//   GET /api/admin/export?type=leads&days=30
//   GET /api/admin/export?type=bookings&days=90
//
// Streamed as text/csv with Content-Disposition: attachment so the browser
// triggers a download. Behind /api/admin/* middleware Basic Auth.

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LEAD_COLUMNS = [
  "id", "created_at", "name", "email", "phone",
  "destination", "travel_type", "travel_date", "num_travellers", "budget",
  "package_title", "package_slug",
  "source", "status", "tier", "score",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "wa_variant", "email_subject_variant",
  "first_responded_at", "escalated_at",
  "ref_code", "page_url", "message",
];

const BOOKING_COLUMNS = [
  "id", "created_at", "razorpay_order_id", "razorpay_payment_id",
  "customer_name", "customer_email", "customer_phone",
  "package_slug", "package_title", "package_price", "deposit_amount",
  "travel_date", "num_travellers",
  "status", "coupon_code", "discount_amount",
  "lead_id", "lead_score", "lead_tier",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "cancelled_at", "cancel_reason", "refunded_at", "refund_amount", "refund_ref",
];

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildCsv(rows: Record<string, unknown>[], cols: string[]): string {
  const head = cols.join(",");
  const body = rows.map((r) => cols.map((c) => csvEscape(r[c])).join(",")).join("\n");
  return head + "\n" + body + "\n";
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const type = (url.searchParams.get("type") ?? "leads").toLowerCase();
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days") ?? 30)));
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

  if (type !== "leads" && type !== "bookings") {
    return new Response(JSON.stringify({ error: "type must be leads or bookings" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cols = type === "leads" ? LEAD_COLUMNS : BOOKING_COLUMNS;
  const select = cols.join(", ");

  const { data, error } = await supabase
    .from(type)
    .select(select)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(50_000);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const csv = buildCsv((data ?? []) as unknown as Record<string, unknown>[], cols);
  const filename = `tt-${type}-${days}d-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
