// Assign a lead to a planner. Behind /api/admin/* middleware Basic Auth.
//
//   POST /api/admin/leads/assign
//   { id: <leadId>, planner: "akash" | null }
//
// Stamps assigned_at on first set so the perf dashboard can compute
// time-to-assignment.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { id?: string; planner?: string | null };
  const id = String(body.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const planner = body.planner?.trim() || null;

  const { data: existing } = await supabase
    .from("leads")
    .select("assigned_planner, assigned_at")
    .eq("id", id)
    .single();

  const update: Record<string, unknown> = { assigned_planner: planner };
  // First-time assignment → stamp.
  if (planner && !existing?.assigned_at) {
    update.assigned_at = new Date().toISOString();
  }
  // Unassigning clears the stamp so the next planner starts fresh.
  if (!planner) update.assigned_at = null;

  const { error } = await supabase.from("leads").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, planner });
}
