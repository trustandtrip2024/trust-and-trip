// Admin-only fan-out send. Behind /api/admin/* middleware? — actually
// /api/push/send isn't under /api/admin so we add an auth check here.
//
// Body: { userId?, topic?, title, body, url? }
//   - If userId provided, only sends to that user's subscriptions.
//   - If topic provided, filters to subscriptions opted into that topic.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPush } from "@/lib/push";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(req: NextRequest) {
  // Simple bearer check — same secret used by Basic Auth middleware.
  const auth = req.headers.get("authorization");
  if (ADMIN_SECRET && auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    userId?: string;
    topic?: string;
    title?: string;
    body?: string;
    url?: string;
  };
  if (!body.title || !body.body) {
    return NextResponse.json({ error: "title + body required" }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let q = sb.from("push_subscriptions").select("id, endpoint, p256dh, auth_secret, topics").limit(500);
  if (body.userId) q = q.eq("user_id", body.userId);
  if (body.topic) q = q.contains("topics", [body.topic]);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.length) return NextResponse.json({ ok: true, sent: 0 });

  const expired: string[] = [];
  let sent = 0;
  for (const r of data) {
    const res = await sendPush(
      { endpoint: r.endpoint, p256dh: r.p256dh, auth: r.auth_secret },
      { title: body.title, body: body.body, url: body.url, tag: body.topic }
    );
    if (res.expired) expired.push(r.id as string);
    if (res.ok) sent++;
  }
  if (expired.length) {
    await sb.from("push_subscriptions").delete().in("id", expired);
  }

  return NextResponse.json({ ok: true, sent, expired: expired.length });
}
