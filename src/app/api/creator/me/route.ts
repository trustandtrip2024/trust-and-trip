import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Body { /* GET */ }

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: creator, error } = await admin
    .from("creators")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !creator) return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });

  // Aggregate stats
  const [
    { count: clickCount },
    { count: leadCount },
    { data: earnings },
    { data: payouts },
  ] = await Promise.all([
    admin.from("creator_attributions").select("id", { count: "exact", head: true }).eq("creator_id", creator.id),
    admin.from("leads").select("id", { count: "exact", head: true }).eq("ref_code", creator.ref_code),
    admin.from("creator_earnings").select("commission_amount_paise, status").eq("creator_id", creator.id),
    admin.from("creator_payouts").select("amount_paise, status").eq("creator_id", creator.id),
  ]);

  const earnPaise = (earnings ?? []).reduce((s, e) => s + (e.commission_amount_paise ?? 0), 0);
  const pendingPaise = (earnings ?? []).filter((e) => e.status === "pending" || e.status === "payable")
    .reduce((s, e) => s + (e.commission_amount_paise ?? 0), 0);
  const paidPaise = (payouts ?? []).filter((p) => p.status === "paid")
    .reduce((s, p) => s + (p.amount_paise ?? 0), 0);

  return NextResponse.json({
    creator,
    stats: {
      attributions: clickCount ?? 0,
      leads: leadCount ?? 0,
      bookings: (earnings ?? []).length,
      earned_paise: earnPaise,
      pending_paise: pendingPaise,
      paid_paise: paidPaise,
    },
  });
}
