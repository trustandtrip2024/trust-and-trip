// Save a push subscription for the signed-in user.
//
// Client side: requestPermission → registration.pushManager.subscribe()
// → POST { subscription, topics? } here.
//
// VAPID public key is exposed at /api/push/key.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

interface PushSubscriptionShape {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const ssr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: () => undefined,
        remove: () => undefined,
      },
    }
  );
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { subscription?: PushSubscriptionShape; topics?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const sub = body.subscription;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const topics = Array.isArray(body.topics) && body.topics.length
    ? body.topics.filter((t) => typeof t === "string").slice(0, 8)
    : ["booking", "planner_reply"];

  // Upsert by endpoint so reconnects don't duplicate rows.
  const { error } = await admin
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth_secret: sub.keys.auth,
        user_agent: req.headers.get("user-agent") ?? null,
        topics,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
