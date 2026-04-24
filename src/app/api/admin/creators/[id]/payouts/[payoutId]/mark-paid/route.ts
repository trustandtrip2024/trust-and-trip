import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin: mark a payout as paid after the manual UPI / bank / PayPal transfer
// has settled. Marks the linked earnings as paid, bumps creators.total_paid,
// and sends a payout-confirmation email (fire-and-forget).
//
// Body (optional): { txn_ref: string, notes: string }
// Protected by middleware Basic Auth.

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustandtrip.com";

async function sendPayoutEmail(args: {
  email: string;
  name: string;
  amountPaise: number;
  txnRef: string | null;
  periodStart: string | null;
  periodEnd: string | null;
}) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const { Resend } = await import("resend");
    const { CreatorPayoutEmail } = await import("@/lib/emails/creator-payout");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM = process.env.RESEND_FROM ?? "Trust and Trip <noreply@trustandtrip.com>";
    await resend.emails.send({
      from: FROM,
      to: [args.email],
      subject: `₹${(args.amountPaise / 100).toLocaleString("en-IN")} sent — Trust and Trip creator payout`,
      react: CreatorPayoutEmail({
        name: args.name,
        amountPaise: args.amountPaise,
        txnRef: args.txnRef ?? undefined,
        periodStart: args.periodStart ?? undefined,
        periodEnd: args.periodEnd ?? undefined,
        dashboardUrl: `${SITE_URL}/creators/dashboard/earnings`,
      }),
    });
  } catch (e) {
    console.error("Payout email error:", e);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string; payoutId: string } }) {
  let body: { txn_ref?: string; notes?: string } = {};
  try { body = await req.json(); } catch { /* empty body OK */ }

  // Load payout + creator
  const { data: payout, error: pErr } = await admin
    .from("creator_payouts")
    .select("id, creator_id, amount_paise, status, period_start, period_end")
    .eq("id", params.payoutId)
    .eq("creator_id", params.id)
    .single();
  if (pErr || !payout) return NextResponse.json({ error: "Payout not found" }, { status: 404 });
  if (payout.status === "paid") return NextResponse.json({ already_paid: true });
  if (payout.status === "failed") return NextResponse.json({ error: "Payout is marked failed; create a new one." }, { status: 400 });

  const nowIso = new Date().toISOString();

  // Mark payout paid
  const { error: updErr } = await admin
    .from("creator_payouts")
    .update({
      status: "paid",
      paid_at: nowIso,
      txn_ref: body.txn_ref?.trim() || null,
      notes: body.notes?.trim() || null,
    })
    .eq("id", payout.id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  // Mark linked earnings paid
  const { error: eErr } = await admin
    .from("creator_earnings")
    .update({ status: "paid", updated_at: nowIso })
    .eq("payout_id", payout.id);
  if (eErr) console.error("[mark-paid] earnings update error:", eErr);

  // Bump creator's total_paid_paise + total_earned_paise (lifetime accounting)
  const { data: creator } = await admin
    .from("creators")
    .select("total_paid_paise, total_earned_paise, full_name, email")
    .eq("id", payout.creator_id)
    .single();
  if (creator) {
    await admin
      .from("creators")
      .update({
        total_paid_paise: (creator.total_paid_paise ?? 0) + payout.amount_paise,
      })
      .eq("id", payout.creator_id);

    sendPayoutEmail({
      email: creator.email,
      name: creator.full_name,
      amountPaise: payout.amount_paise,
      txnRef: body.txn_ref?.trim() ?? null,
      periodStart: payout.period_start,
      periodEnd: payout.period_end,
    }).catch((e) => console.error("sendPayoutEmail error:", e));
  }

  return NextResponse.json({ ok: true, payout_id: payout.id, paid_at: nowIso });
}
