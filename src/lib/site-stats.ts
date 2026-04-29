import "server-only";

import { createClient } from "@supabase/supabase-js";
import { cacheGet, cacheSet } from "./redis";

const CACHE_KEY = "site:stats:v1";
const TTL_SECONDS = 60 * 60; // 1 hour

// Baseline seeds — keep our copy honest when Supabase counts are small early
// in the lifecycle. The displayed number is `Math.max(seed, live)` so we
// never under-claim what's already public on the site.
const SEED_TOTAL_TRAVELERS = 8000;
const SEED_GOOGLE_REVIEW_COUNT = 200;
const SEED_TRIPS_THIS_WEEK = 143;
const SEED_GOOGLE_RATING = 4.9;
const DESTINATION_COUNT = 60;

export interface SiteStats {
  totalTravelers: number;
  tripsThisWeek: number;
  googleRating: number;
  googleReviewCount: number;
  destinationCount: number;
  /** Pre-formatted line for the hero trust strip. */
  trustStripLine: string;
}

function fmt(n: number): string {
  return n.toLocaleString("en-IN");
}

function buildStripLine(s: Omit<SiteStats, "trustStripLine">): string {
  return [
    `${fmt(s.tripsThisWeek)}+ trips planned this week`,
    `${s.googleRating.toFixed(1)}★ from ${fmt(s.googleReviewCount)}+ travelers`,
    `${s.destinationCount}+ destinations`,
  ].join(" · ");
}

function fallback(): SiteStats {
  const base = {
    totalTravelers: SEED_TOTAL_TRAVELERS,
    tripsThisWeek: SEED_TRIPS_THIS_WEEK,
    googleRating: SEED_GOOGLE_RATING,
    googleReviewCount: SEED_GOOGLE_REVIEW_COUNT,
    destinationCount: DESTINATION_COUNT,
  };
  return { ...base, trustStripLine: buildStripLine(base) };
}

export async function getSiteStats(): Promise<SiteStats> {
  const cached = await cacheGet<SiteStats>(CACHE_KEY);
  if (cached) return cached;

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return fallback();

    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [leadsTotalRes, leadsWeekRes, reviewsRes] = await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved"),
    ]);

    const liveTravelers = leadsTotalRes.count ?? 0;
    const liveWeekTrips = leadsWeekRes.count ?? 0;
    const liveReviewCount = reviewsRes.count ?? 0;

    const stats: Omit<SiteStats, "trustStripLine"> = {
      totalTravelers: Math.max(SEED_TOTAL_TRAVELERS, liveTravelers),
      tripsThisWeek: Math.max(SEED_TRIPS_THIS_WEEK, liveWeekTrips),
      googleRating: SEED_GOOGLE_RATING,
      googleReviewCount: Math.max(SEED_GOOGLE_REVIEW_COUNT, liveReviewCount),
      destinationCount: DESTINATION_COUNT,
    };

    const out: SiteStats = { ...stats, trustStripLine: buildStripLine(stats) };
    await cacheSet(CACHE_KEY, out, TTL_SECONDS);
    return out;
  } catch {
    return fallback();
  }
}
