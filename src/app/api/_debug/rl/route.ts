// Admin-only diagnostic endpoint for rate-limit debugging.
//
// /api/_debug/rl?key=<ADMIN_SECRET>
//
// Hits rateLimit() against a fixed test key + reports the resolved client
// IP from each header source. Use to confirm the per-IP key is stable
// across requests (rotating IPs == no rate-limit enforcement).
//
// Remove once the prod rate-limit gap is closed.

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp, getRedis } from "@/lib/redis";
import { timingSafeEqualStrings } from "@/lib/timing-safe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const expected = process.env.ADMIN_SECRET;
  if (!key || !expected || !timingSafeEqualStrings(key, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const xff = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  const vercel = req.headers.get("x-vercel-forwarded-for");
  const ip = clientIp(req);

  const redisInstance = getRedis();
  const hasRedis = !!redisInstance;

  // Fire 5 hits in one request against a fresh per-call key. With limit=3
  // and a stable key, hits 1-3 = allowed, hits 4-5 = blocked. Anything else
  // means the limiter logic, pipeline, or Redis connection is broken.
  const debugKey = `debug:burst:${ip}:${Date.now()}`;
  const rlBurst: Array<{ allowed: boolean; remaining: number }> = [];
  for (let i = 0; i < 5; i++) {
    const r = await rateLimit(debugKey, { limit: 3, windowSeconds: 60 });
    rlBurst.push({ allowed: r.allowed, remaining: r.remaining });
  }
  const rl = await rateLimit(`debug:${ip}`, { limit: 3, windowSeconds: 60 });

  // Direct ping — confirms whether @upstash/redis is reachable at all.
  let pingResult: unknown = null;
  let pingError: string | null = null;
  if (redisInstance) {
    try {
      pingResult = await redisInstance.ping();
    } catch (e) {
      pingError = e instanceof Error ? e.message : String(e);
    }
  }

  return NextResponse.json({
    headers: {
      "x-forwarded-for": xff,
      "x-real-ip": real,
      "x-vercel-forwarded-for": vercel,
    },
    resolvedIp: ip,
    redis: {
      configured: hasRedis,
      url_present: !!process.env.UPSTASH_REDIS_REST_URL,
      token_present: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      ping: pingResult,
      pingError,
    },
    rateLimit: rl,
    rateLimitBurst: rlBurst,
  });
}
