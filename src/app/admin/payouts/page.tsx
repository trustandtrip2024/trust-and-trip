import { createClient } from "@supabase/supabase-js";
import PayoutsAdminClient from "./PayoutsAdminClient";

export const dynamic = "force-dynamic";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminPayoutsPage() {
  // Pull active creators with payable + payout summaries
  const { data: creators } = await admin
    .from("creators")
    .select("id, full_name, email, ref_code, payout_method, payout_details, total_earned_paise, total_paid_paise, status")
    .in("status", ["active", "paused"])
    .order("full_name");

  const creatorIds = (creators ?? []).map((c) => c.id);

  // Sum payable per creator
  const payableMap = new Map<string, number>();
  if (creatorIds.length) {
    const { data: payable } = await admin
      .from("creator_earnings")
      .select("creator_id, commission_amount_paise")
      .in("creator_id", creatorIds)
      .eq("status", "payable")
      .is("payout_id", null);
    for (const e of payable ?? []) {
      payableMap.set(e.creator_id, (payableMap.get(e.creator_id) ?? 0) + (e.commission_amount_paise ?? 0));
    }
  }

  // Sum pending per creator (visibility only)
  const pendingMap = new Map<string, number>();
  if (creatorIds.length) {
    const { data: pending } = await admin
      .from("creator_earnings")
      .select("creator_id, commission_amount_paise")
      .in("creator_id", creatorIds)
      .eq("status", "pending");
    for (const e of pending ?? []) {
      pendingMap.set(e.creator_id, (pendingMap.get(e.creator_id) ?? 0) + (e.commission_amount_paise ?? 0));
    }
  }

  // Recent payouts per creator
  const payoutsMap = new Map<string, Payout[]>();
  if (creatorIds.length) {
    const { data: payouts } = await admin
      .from("creator_payouts")
      .select("id, creator_id, amount_paise, status, period_start, period_end, paid_at, txn_ref, created_at")
      .in("creator_id", creatorIds)
      .order("created_at", { ascending: false })
      .limit(200);
    for (const p of payouts ?? []) {
      const arr = payoutsMap.get(p.creator_id) ?? [];
      arr.push(p as Payout);
      payoutsMap.set(p.creator_id, arr);
    }
  }

  const rows: PayoutSummary[] = (creators ?? []).map((c) => ({
    id: c.id,
    full_name: c.full_name,
    email: c.email,
    ref_code: c.ref_code,
    payout_method: c.payout_method,
    payout_details_raw: (c.payout_details as { raw?: string } | null)?.raw ?? null,
    total_earned_paise: c.total_earned_paise ?? 0,
    total_paid_paise: c.total_paid_paise ?? 0,
    pending_paise: pendingMap.get(c.id) ?? 0,
    payable_paise: payableMap.get(c.id) ?? 0,
    status: c.status,
    payouts: payoutsMap.get(c.id) ?? [],
  }));

  return <PayoutsAdminClient initial={rows} />;
}

export interface Payout {
  id: string;
  creator_id: string;
  amount_paise: number;
  status: "pending" | "processing" | "paid" | "failed";
  period_start: string | null;
  period_end: string | null;
  paid_at: string | null;
  txn_ref: string | null;
  created_at: string;
}

export interface PayoutSummary {
  id: string;
  full_name: string;
  email: string;
  ref_code: string;
  payout_method: string | null;
  payout_details_raw: string | null;
  total_earned_paise: number;
  total_paid_paise: number;
  pending_paise: number;
  payable_paise: number;
  status: string;
  payouts: Payout[];
}
