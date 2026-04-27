import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST /api/package-views — record a view for the given slug.
export async function POST(req: NextRequest) {
  const { slug, sessionId } = await req.json().catch(() => ({}));
  if (!slug || !sessionId) {
    return NextResponse.json({ error: "slug + sessionId required" }, { status: 400 });
  }
  await supabase.from("package_views").insert({
    package_slug: String(slug).slice(0, 120),
    session_id: String(sessionId).slice(0, 64),
  });
  return NextResponse.json({ ok: true });
}

// GET /api/package-views?slug=xxx — return live counts for a single package
//   { live: <last 5 min>, week: <last 7 days> }
//
// GET /api/package-views?slugs=a,b,c — batch counts for many packages.
//   { counts: { a: { live, week }, b: { live, week } } }
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const slugs = searchParams.get("slugs")?.split(",").filter(Boolean) ?? [];

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  if (slug) {
    const [{ count: live }, { count: week }] = await Promise.all([
      supabase.from("package_views").select("*", { count: "exact", head: true })
        .eq("package_slug", slug).gte("viewed_at", fiveMinAgo),
      supabase.from("package_views").select("*", { count: "exact", head: true })
        .eq("package_slug", slug).gte("viewed_at", weekAgo),
    ]);
    return NextResponse.json({ live: live ?? 0, week: week ?? 0 });
  }

  if (slugs.length) {
    const { data } = await supabase
      .from("package_views")
      .select("package_slug, viewed_at")
      .in("package_slug", slugs)
      .gte("viewed_at", weekAgo);
    const counts: Record<string, { live: number; week: number }> = {};
    for (const s of slugs) counts[s] = { live: 0, week: 0 };
    const cutoffLive = Date.now() - 5 * 60 * 1000;
    for (const row of data ?? []) {
      const c = counts[row.package_slug];
      if (!c) continue;
      c.week += 1;
      if (new Date(row.viewed_at).getTime() >= cutoffLive) c.live += 1;
    }
    return NextResponse.json({ counts });
  }

  return NextResponse.json({ error: "slug or slugs required" }, { status: 400 });
}
