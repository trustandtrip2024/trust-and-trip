import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";

const VALID_AREAS = new Set(["marketing", "product", "ops", "hire", "money", "brand", "tech", "other"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const area      = typeof body.area      === "string" ? body.area.trim()      : "";
  const decision  = typeof body.decision  === "string" ? body.decision.trim()  : "";
  const rationale = typeof body.rationale === "string" ? body.rationale.trim() : "";
  const expected  = typeof body.expected  === "string" ? body.expected.trim()  : "";
  const reviewOn  = typeof body.review_on === "string" ? body.review_on.trim() : "";

  if (!VALID_AREAS.has(area))                 return NextResponse.json({ error: "Invalid area." }, { status: 400 });
  if (!decision || decision.length > 280)     return NextResponse.json({ error: "Decision must be 1–280 chars." }, { status: 400 });
  if (rationale.length > 2000)                return NextResponse.json({ error: "Rationale too long." }, { status: 400 });
  if (expected.length > 1000)                 return NextResponse.json({ error: "Expected too long." }, { status: 400 });
  if (reviewOn && !DATE_RE.test(reviewOn))    return NextResponse.json({ error: "Invalid review_on." }, { status: 400 });

  const { error } = await client().from("decisions").insert({
    area,
    decision,
    rationale: rationale || null,
    expected:  expected  || null,
    review_on: reviewOn  || null,
  });

  if (error) {
    console.error("[decisions] insert error:", error);
    return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const id = typeof body.id === "number" ? body.id : null;
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const outcome = typeof body.outcome === "string" ? body.outcome.trim() : "";
  if (!outcome || outcome.length > 2000) {
    return NextResponse.json({ error: "Outcome must be 1–2000 chars." }, { status: 400 });
  }

  const { error } = await client()
    .from("decisions")
    .update({ outcome, outcome_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[decisions] update error:", error);
    return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
