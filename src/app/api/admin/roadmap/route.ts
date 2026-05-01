import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";

const VALID_STATUS = new Set(["todo", "doing", "blocked", "done"]);
const HASH_RE = /^[0-9a-f]{16}$/;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Roadmap status writer. Admin-only — middleware Basic Auth gates
 * `/api/admin/*`. Body: { hash, status?, owner?, notes? }. Upserts
 * roadmap_tasks keyed by hash. No partial-update validation beyond shape
 * checks because admin is single-tenant; the audit trail is updated_at.
 */
export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const hash = typeof body.hash === "string" ? body.hash : "";
  if (!HASH_RE.test(hash)) {
    return NextResponse.json({ error: "Invalid hash." }, { status: 400 });
  }

  const update: Record<string, unknown> = { hash };

  if ("status" in body) {
    const s = body.status;
    if (typeof s !== "string" || !VALID_STATUS.has(s)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    update.status = s;
  }
  if ("owner" in body) {
    const o = body.owner;
    if (o !== null && (typeof o !== "string" || o.length > 80)) {
      return NextResponse.json({ error: "Invalid owner." }, { status: 400 });
    }
    update.owner = o;
  }
  if ("notes" in body) {
    const n = body.notes;
    if (n !== null && (typeof n !== "string" || n.length > 4000)) {
      return NextResponse.json({ error: "Invalid notes." }, { status: 400 });
    }
    update.notes = n;
  }

  if (Object.keys(update).length === 1) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await supabase
    .from("roadmap_tasks")
    .upsert(update, { onConflict: "hash" });

  if (error) {
    console.error("[roadmap] upsert error:", error);
    return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
