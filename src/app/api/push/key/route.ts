// Public endpoint that returns the VAPID public key. The client-side
// pushManager.subscribe() call needs this to register the device.
//
// Key rotates rarely (env-redeploy event); cache aggressively at the edge
// so the SW registration round-trip doesn't hit our origin every time.

import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  if (!key) {
    return NextResponse.json({ error: "VAPID not configured" }, { status: 503 });
  }
  return NextResponse.json(
    { publicKey: key },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
  );
}
