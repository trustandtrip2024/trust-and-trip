import { NextRequest, NextResponse } from "next/server";

/**
 * Validate the Vercel Cron `Authorization: Bearer <CRON_SECRET>` header.
 *
 * Earlier each cron route had its own `if (expected && auth !== Bearer …)`
 * check, which silently failed open when CRON_SECRET was unset. That
 * meant a botched env-var rollout in production turned every cron route
 * into a public endpoint that could be hammered to send WhatsApp blasts,
 * trigger escalation Bitrix pushes, or generate the founder digest on
 * demand. This helper centralises the gate and fails closed in prod.
 *
 * Returns a NextResponse to short-circuit the route, or null when the
 * caller is authorised (or running in dev without a secret set).
 */
export function assertCronAuth(req: NextRequest): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  const isProduction = process.env.NODE_ENV === "production";
  if (!expected) {
    if (isProduction) {
      return NextResponse.json(
        { error: "Cron secret not configured." },
        { status: 503 },
      );
    }
    return null;
  }
  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
