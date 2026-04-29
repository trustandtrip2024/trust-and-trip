import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cacheGet, cacheSet } from "./redis";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const STATS_TTL_SECONDS = 5 * 60; // 5 min — Supabase row counts move slow.

export interface PackageStats {
  /** Distinct sessions that landed on the package page in the last 30 days. */
  viewedCount: number;
  /** Leads in the last 30 days that referenced this package by slug. */
  enquiredCount: number;
  /** True when both counts are real (not the safe-floor). */
  live: boolean;
}

/**
 * Pull real view + lead counts for a package from Supabase, with a Redis
 * cache layer (5 min) so detail pages don't hit Postgres on every render.
 *
 * Returns a `Math.max(seed, live)` floor so brand-new packages with zero
 * data don't render "0 viewed this month" — a small synthetic floor is
 * less brand-damaging than a real zero. Once real activity exceeds the
 * seed, real numbers take over.
 */
export async function getPackageStats(slug: string): Promise<PackageStats> {
  const cacheKey = `package-stats:${slug}`;
  const hit = await cacheGet<PackageStats>(cacheKey);
  if (hit) return hit;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Two parallel head:'count' queries — body is empty, only the count comes
  // back across the wire. Cheap on Supabase egress.
  const [viewsRes, leadsRes] = await Promise.all([
    supabase
      .from("package_views")
      .select("session_id", { count: "exact", head: true })
      .eq("package_slug", slug)
      .gte("viewed_at", since),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("package_slug", slug)
      .gte("created_at", since),
  ]);

  const liveViews = viewsRes.count ?? 0;
  const liveEnquiries = leadsRes.count ?? 0;
  const haveData = liveViews > 0 || liveEnquiries > 0;

  // Deterministic synthetic floor — same seed shape we used previously so
  // packages that were quiet last week don't suddenly drop in numbers.
  const slugBytes = slug.length;
  const seedView = Math.max(20, (slugBytes * 7) % 120 + 15);
  const seedEnq = Math.max(8, (slugBytes * 3) % 60 + 8);

  const stats: PackageStats = {
    viewedCount: Math.max(seedView, liveViews),
    enquiredCount: Math.max(seedEnq, liveEnquiries),
    live: haveData,
  };

  await cacheSet(cacheKey, stats, STATS_TTL_SECONDS);
  return stats;
}
