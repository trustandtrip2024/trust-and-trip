import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error: authErr } = await adminClient.auth.getUser(token);
    if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [pointsRes, logRes] = await Promise.all([
      adminClient.from("user_points").select("*").eq("user_id", user.id).maybeSingle(),
      adminClient.from("points_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);

    const points = pointsRes.data ?? {
      user_id: user.id,
      total_points: 0,
      lifetime_points: 0,
      tier: "silver" as const,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ points, log: logRes.data ?? [] });
  } catch (err) {
    console.error("[user/points] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
