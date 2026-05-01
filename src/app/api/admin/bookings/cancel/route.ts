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
  const refundAmountRaw = body.refundAmount ? Number(body.refundAmount) : 0;
  const refundRef = body.refundRef ? String(body.refundRef) : null;

  // Look up the booking first so we can clamp refund to the actual deposit.
  // Earlier this route accepted ANY refundAmount the admin typed and
  // recorded it verbatim — a slipped finger or a compromised admin session
  // could push a refund line item that exceeds the original deposit and
  // either overdrew the Razorpay payout buffer or quietly corrupted the
  // ledger when the figure was later reconciled.
  const { data: existing, error: lookupErr } = await supabase
    .from("bookings")
    .select("id, deposit_amount, status, refund_amount")
    .eq("id", id)
    .maybeSingle();
  if (lookupErr) return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const deposit = Number(existing.deposit_amount ?? 0);
  if (!Number.isFinite(refundAmountRaw) || refundAmountRaw < 0) {
    return NextResponse.json({ error: "refundAmount must be ≥ 0." }, { status: 400 });
  }
  if (refundAmountRaw > deposit) {
    return NextResponse.json({
      error: `Refund cannot exceed the captured deposit (₹${deposit.toLocaleString("en-IN")}).`,
    }, { status: 400 });
  }
  // Reject re-refunds — once refunded, the row should not be re-stamped from
  // this endpoint. Use a fresh booking record if a customer is owed more.
  if (existing.status === "refunded" && refundAmountRaw > 0) {
    return NextResponse.json({
      error: "Booking already refunded. Issue a separate adjustment.",
    }, { status: 409 });
  }
  const refundAmount = Math.round(refundAmountRaw);

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

  if (error) return NextResponse.json({ error: "Update failed." }, { status: 500 });
  return NextResponse.json({ ok: true, booking: data });
}
