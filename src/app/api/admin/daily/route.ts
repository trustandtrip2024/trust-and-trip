import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { DAILY_CHECK_ITEMS } from "@/lib/daily-checks";

const VALID_KEYS = new Set(DAILY_CHECK_ITEMS.map((i) => i.key));
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const date = typeof body.date === "string" ? body.date : "";
  const key = typeof body.item_key === "string" ? body.item_key : "";
  if (!DATE_RE.test(date)) return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  if (!VALID_KEYS.has(key)) return NextResponse.json({ error: "Invalid item key." }, { status: 400 });

  const update: Record<string, unknown> = {
    check_date: date,
    item_key: key,
  };

  if ("completed" in body) {
    if (typeof body.completed !== "boolean") {
      return NextResponse.json({ error: "Invalid completed flag." }, { status: 400 });
    }
    update.completed = body.completed;
    update.completed_at = body.completed ? new Date().toISOString() : null;
  }
  if ("notes" in body) {
    const n = body.notes;
    if (n !== null && (typeof n !== "string" || n.length > 2000)) {
      return NextResponse.json({ error: "Invalid notes." }, { status: 400 });
    }
    update.notes = n;
  }

  const { error } = await supabase
    .from("daily_checks")
    .upsert(update, { onConflict: "check_date,item_key" });

  if (error) {
    console.error("[daily-checks] upsert error:", error);
    return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
