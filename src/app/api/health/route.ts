import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Lightweight uptime probe — checks Supabase connectivity + reports key envs.
// Use with UptimeRobot / Better Uptime / Vercel Cron.
//
// 200 = healthy, 503 = degraded.
export async function GET() {
  const checks: Record<string, "ok" | "missing" | "error"> = {};

  // Env presence
  checks.supabase_env = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? "ok" : "missing";
  checks.razorpay_env = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? "ok" : "missing";
  checks.bitrix_env = process.env.BITRIX24_WEBHOOK_URL ? "ok" : "missing";
  checks.sanity_env = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_DATASET ? "ok" : "missing";

  // Supabase reachability — 1 cheap query
  if (checks.supabase_env === "ok") {
    try {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      const { error } = await sb.from("leads").select("id", { count: "exact", head: true }).limit(1);
      checks.supabase_db = error ? "error" : "ok";
    } catch {
      checks.supabase_db = "error";
    }
  }

  const healthy = Object.values(checks).every((v) => v === "ok" || (v === "missing" && !["supabase_env", "supabase_db"].includes(""))) &&
                  checks.supabase_env === "ok" &&
                  checks.supabase_db === "ok";

  return NextResponse.json({
    status: healthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
  }, { status: healthy ? 200 : 503 });
}
