import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin: bulk-release creator earnings from 'pending' -> 'payable' once the
// cooling-off window has passed. The cooling-off window protects against
// refunds: an earning row only becomes payable once the underlying booking
// has been verified for COOL_OFF_DAYS without being reversed.
//
// Protected by middleware Basic Auth (matcher covers /api/admin/*).

const COOL_OFF_DAYS = 14;

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(_req: NextRequest) {
  const cutoff = new Date(Date.now() - COOL_OFF_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Find pending earnings whose booking is verified and older than cutoff
  const { data: candidates, error } = await admin
    .from("creator_earnings")
    .select("id, booking_id, bookings!inner(status, created_at)")
    .eq("status", "pending")
    .lte("bookings.created_at", cutoff)
    .eq("bookings.status", "verified");

  if (error) {
    console.error("[admin/earnings/release] fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!candidates?.length) return NextResponse.json({ ok: true, released: 0 });

  const ids = candidates.map((c) => c.id);
  const { error: updErr } = await admin
    .from("creator_earnings")
    .update({ status: "payable", updated_at: new Date().toISOString() })
    .in("id", ids);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, released: ids.length });
}
