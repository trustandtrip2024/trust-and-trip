import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_STATUSES = ["new", "contacted", "qualified", "booked", "lost"];

export async function PATCH(req: NextRequest) {
  try {
    // Admin gate. Earlier this route was open to the public web -- anyone
    // who guessed a lead UUID could PATCH it to "lost". The middleware
    // matcher only covers /admin/* and /api/admin/*, so /api/leads/status
    // had no auth. Now we require a Bearer ADMIN_SECRET; if the secret
    // is unset (botched env rollout), fail closed in production rather
    // than open up the route again.
    const adminSecret = process.env.ADMIN_SECRET;
    const isProduction = process.env.NODE_ENV === "production";
    if (!adminSecret) {
      if (isProduction) {
        return NextResponse.json({ error: "Admin gate misconfigured." }, { status: 503 });
      }
    } else {
      // Accept either Bearer ADMIN_SECRET (server-to-server callers) or
      // Basic auth with the same secret as the password (browsers auto-
      // forward Basic creds from the admin Realm once the user has
      // authenticated through middleware). Username is ignored, as it
      // is in middleware.ts.
      const authHeader = req.headers.get("authorization") ?? "";
      let ok = false;
      if (authHeader === `Bearer ${adminSecret}`) ok = true;
      else if (authHeader.startsWith("Basic ")) {
        try {
          const decoded = atob(authHeader.slice(6));
          const [, pass] = decoded.split(":");
          if (pass === adminSecret) ok = true;
        } catch { /* malformed Basic — fall through */ }
      }
      if (!ok) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { id, status } = await req.json();
    if (!id || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // First transition out of "new" → stamp first_responded_at so the
    // tier-A escalation cron leaves the row alone.
    const update: Record<string, unknown> = { status };
    if (status !== "new") {
      const { data: existing } = await supabase
        .from("leads")
        .select("first_responded_at")
        .eq("id", id)
        .single();
      if (existing && !existing.first_responded_at) {
        update.first_responded_at = new Date().toISOString();
      }
    }

    const { error } = await supabase.from("leads").update(update).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[leads/status] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
