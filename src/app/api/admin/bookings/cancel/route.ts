// Cancel a booking — admin endpoint.
//
// Body: { id: string, reason?: string, refundAmount?: number, refundRef?: string }
// Sets status='cancelled' (or 'refunded' if refundAmount > 0), stamps
// cancelled_at + reason. Refund itself happens in Razorpay dashboard or via
// a separate endpoint — this just records that it happened.
//
// Auth: protected by /api/admin/* middleware.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const id = String(body.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const reason = body.reason ? String(body.reason).slice(0, 500) : null;
  const refundAmount = body.refundAmount ? Number(body.refundAmount) : 0;
  const refundRef = body.refundRef ? String(body.refundRef) : null;

  const update: Record<string, unknown> = {
    status: refundAmount > 0 ? "refunded" : "cancelled",
    cancelled_at: new Date().toISOString(),
    cancel_reason: reason,
  };
  if (refundAmount > 0) {
    update.refunded_at = new Date().toISOString();
    update.refund_amount = refundAmount;
    update.refund_ref = refundRef;
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(update)
    .eq("id", id)
    .select("id, status, cancelled_at, refund_amount")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, booking: data });
}
