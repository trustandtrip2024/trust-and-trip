import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth-server";

// Admin: create a payout that bundles all current 'payable' earnings for one
// creator into a single payout row. Earnings are linked via payout_id but
// remain 'payable' until the payout is marked paid — so that we can cancel /
// retry without losing the bundle.
//
// Protected by middleware Basic Auth AND inline requireAdmin.

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  // Confirm creator exists + is active
  const { data: creator, error: cErr } = await admin
    .from("creators")
    .select("id, full_name, email, status")
    .eq("id", params.id)
    .single();
  if (cErr || !creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  if (creator.status !== "active") {
    return NextResponse.json({ error: `Creator status is ${creator.status} — only active creators can be paid out.` }, { status: 400 });
  }

  // Fetch payable earnings for this creator
  const { data: payable, error: eErr } = await admin
    .from("creator_earnings")
    .select("id, commission_amount_paise, created_at")
    .eq("creator_id", creator.id)
    .eq("status", "payable")
    .is("payout_id", null);
  if (eErr) return NextResponse.json({ error: eErr.message }, { status: 500 });
  if (!payable?.length) return NextResponse.json({ error: "No payable earnings to bundle." }, { status: 400 });

  const totalPaise = payable.reduce((s, e) => s + (e.commission_amount_paise ?? 0), 0);
  if (totalPaise <= 0) return NextResponse.json({ error: "Total payout would be zero." }, { status: 400 });

  const periodStart = payable
    .map((e) => new Date(e.created_at))
    .sort((a, b) => a.getTime() - b.getTime())[0]
    .toISOString()
    .split("T")[0];
  const periodEnd = new Date().toISOString().split("T")[0];

  // Create payout row
  const { data: payout, error: pErr } = await admin
    .from("creator_payouts")
    .insert({
      creator_id: creator.id,
      amount_paise: totalPaise,
      period_start: periodStart,
      period_end: periodEnd,
      status: "processing",
    })
    .select("id")
    .single();
  if (pErr || !payout) return NextResponse.json({ error: pErr?.message ?? "Failed to create payout" }, { status: 500 });

  // Link earnings to payout
  const { error: linkErr } = await admin
    .from("creator_earnings")
    .update({ payout_id: payout.id, updated_at: new Date().toISOString() })
    .in("id", payable.map((e) => e.id));
  if (linkErr) {
    // Rollback the payout if linking failed
    await admin.from("creator_payouts").delete().eq("id", payout.id);
    return NextResponse.json({ error: linkErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    payout_id: payout.id,
    amount_paise: totalPaise,
    earnings_count: payable.length,
    period_start: periodStart,
    period_end: periodEnd,
  });
}
