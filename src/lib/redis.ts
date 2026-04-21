import { Redis } from "@upstash/redis";

// Initialized lazily — safe to import in any route/component
// Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel env vars
// Get them at: console.upstash.com → your database → REST API

let _redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

/** Get a cached value. Returns null if miss or Redis not configured. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;
    return await redis.get<T>(key);
  } catch {
    return null;
  }
}

/** Set a cached value with TTL in seconds. Silently fails if Redis not configured. */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    // Redis unavailable — app continues without cache
  }
}

/** Delete a cached key. */
export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.del(key);
  } catch {}
}

/**
 * Simple sliding-window rate limiter.
 * Returns { allowed, remaining, resetIn } — never throws.
 */
export async function rateLimit(
  identifier: string,
  { limit = 10, windowSeconds = 60 }: { limit?: number; windowSeconds?: number } = {}
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  try {
    const redis = getRedis();
    if (!redis) return { allowed: true, remaining: limit, resetIn: windowSeconds };

    const key = `rl:${identifier}`;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    const pipe = redis.pipeline();
    pipe.zremrangebyscore(key, 0, now - windowMs);
    pipe.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    pipe.zcard(key);
    pipe.expire(key, windowSeconds);
    const results = await pipe.exec();

    const count = (results[2] as number) ?? 0;
    const allowed = count <= limit;
    return {
      allowed,
      remaining: Math.max(0, limit - count),
      resetIn: windowSeconds,
    };
  } catch {
    return { allowed: true, remaining: limit, resetIn: windowSeconds };
  }
}
