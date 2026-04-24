import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin: stamp the manually-verified Instagram audience size on a creator.
// Used today via /admin/creators inline editor (admin opens the IG profile,
// reads the follower count, types it in). When we ship Instagram OAuth
// later, the same column is filled by /api/instagram/sync — same shape.
//
// Body: { count: number }   (0 to clear)
// Protected by middleware Basic Auth.

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let body: { count?: unknown } = {};
  try { body = await req.json(); } catch { /* empty body OK */ }

  const raw = body.count;
  const count = typeof raw === "number" ? Math.round(raw) : Number(raw);
  if (!Number.isFinite(count) || count < 0) {
    return NextResponse.json({ error: "count must be a non-negative number" }, { status: 400 });
  }

  const update = count === 0
    ? { audience_size_verified: null, audience_verified_at: null, audience_source: null }
    : {
        audience_size_verified: count,
        audience_verified_at: new Date().toISOString(),
        audience_source: "manual" as const,
      };

  const { error } = await admin.from("creators").update(update).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, audience_size_verified: count === 0 ? null : count });
}
