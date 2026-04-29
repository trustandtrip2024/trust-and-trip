"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Loader2, TrendingUp, Gift, Sparkles, ArrowRight, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";
import { TIER_PERKS, TIER_THRESHOLDS, pointsToNextTier, type Tier } from "@/lib/points";

interface PointsRow {
  user_id: string;
  total_points: number;
  lifetime_points: number;
  tier: Tier;
  updated_at: string;
}

interface LogRow {
  id: string;
  delta: number;
  reason: string;
  ref_id: string | null;
  created_at: string;
}

const REASON_LABEL: Record<string, string> = {
  booking_verified: "Booking confirmed",
  referral_conversion: "Referral success",
  manual_adjust: "Adjustment",
  redeemed: "Redeemed",
};

export default function RewardsPage() {
  const { user } = useUserStore();
  const [points, setPoints] = useState<PointsRow | null>(null);
  const [log, setLog] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const sess = await supabase.auth.getSession();
      const token = sess.data.session?.access_token;
      if (!token) { setLoading(false); return; }
      const res = await fetch("/api/user/points", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setPoints(d.points);
        setLog(d.log ?? []);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-tat-charcoal/30" />
      </div>
    );
  }

  const row = points ?? { total_points: 0, lifetime_points: 0, tier: "silver" as Tier };
  const tierConfig = TIER_PERKS[row.tier];
  const { next: nextT, needed } = pointsToNextTier(row.lifetime_points);
  const nextConfig = nextT ? TIER_PERKS[nextT] : null;
  const progressPct = nextT
    ? Math.min(100, Math.round((row.lifetime_points / TIER_THRESHOLDS[nextT]) * 100))
    : 100;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-tat-charcoal/40 mb-1">Dashboard</p>
        <h1 className="font-display text-h2 font-medium text-tat-charcoal">Trust Points & Rewards</h1>
        <p className="text-sm text-tat-charcoal/55 mt-1">Earn 1 point for every ₹100 you book. Tiers stack forever.</p>
      </div>

      {/* Tier hero card */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-tat-charcoal via-tat-charcoal to-tat-charcoal/90 text-tat-paper p-6 md:p-8 mb-5">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-tat-gold/15 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${row.tier === "platinum" ? "bg-tat-gold/20" : row.tier === "gold" ? "bg-tat-gold/25" : "bg-tat-paper/15"}`}>
                <Crown className={`h-6 w-6 ${row.tier === "platinum" ? "text-tat-gold/85" : row.tier === "gold" ? "text-tat-gold" : "text-tat-paper/80"}`} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-tat-paper/55">Current tier</p>
                <p className="font-display text-h2 font-medium">{tierConfig.label}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-tat-paper/50">Points balance</p>
              <p className="font-display text-h2 font-medium">{row.total_points.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-tat-paper/40 mt-0.5">Lifetime: {row.lifetime_points.toLocaleString("en-IN")}</p>
            </div>
          </div>

          {nextT ? (
            <>
              <div className="flex items-center justify-between text-xs text-tat-paper/70 mb-2">
                <span>Progress to {TIER_PERKS[nextT].label}</span>
                <span className="font-medium text-tat-gold">{needed.toLocaleString("en-IN")} pts to go</span>
              </div>
              <div className="h-2 bg-tat-paper/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-tat-gold to-amber-400 transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[11px] text-tat-paper/55 mt-3">
                Book a trip worth <strong className="text-tat-paper">₹{(needed * 100).toLocaleString("en-IN")}</strong> (deposit) to unlock {TIER_PERKS[nextT].label}.
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 bg-tat-gold/15 border border-tat-gold/30 rounded-xl px-3 py-2">
              <Trophy className="h-4 w-4 text-tat-gold" />
              <p className="text-xs text-tat-paper/90">You&apos;re at our top tier — enjoy every perk below.</p>
            </div>
          )}
        </div>
      </div>

      {/* Current tier perks */}
      <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-5 md:p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className={`h-4 w-4 ${tierConfig.accent}`} />
          <p className="text-sm font-semibold text-tat-charcoal">Your {tierConfig.label} perks</p>
        </div>
        <ul className="space-y-2.5">
          {tierConfig.perks.map((p, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-tat-charcoal/75">
              <span className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${tierConfig.color.split(" ")[0]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${tierConfig.accent.replace("text-", "bg-")}`} />
              </span>
              {p}
            </li>
          ))}
        </ul>
        <p className={`mt-5 text-xs ${tierConfig.accent} font-medium`}>
          {tierConfig.discount}
        </p>
      </div>

      {/* Next tier preview */}
      {nextConfig && (
        <div className="bg-tat-cream/40 rounded-2xl border border-tat-charcoal/8 p-5 md:p-6 mb-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-tat-gold" />
              <p className="text-sm font-semibold text-tat-charcoal">Unlock {nextConfig.label}</p>
            </div>
            <span className="text-[11px] text-tat-charcoal/50">at {TIER_THRESHOLDS[nextT!].toLocaleString("en-IN")} lifetime points</span>
          </div>
          <p className={`text-xs ${nextConfig.accent} font-medium mb-3`}>{nextConfig.discount}</p>
          <ul className="space-y-1.5">
            {nextConfig.perks.slice(0, 4).map((p, i) => (
              <li key={i} className="text-xs text-tat-charcoal/60 flex items-start gap-2">
                <span className="text-tat-charcoal/35">+</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="bg-tat-gold/10 border border-tat-gold/25 rounded-2xl p-5 md:p-6 mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-tat-charcoal">Ready to earn more?</p>
          <p className="text-xs text-tat-charcoal/60 mt-0.5">Every booking adds to your lifetime total.</p>
        </div>
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group"
        >
          Browse experiences
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-tat-charcoal/8">
        <div className="p-5 border-b border-tat-charcoal/8 flex items-center gap-2">
          <Gift className="h-4 w-4 text-tat-charcoal/55" />
          <p className="text-sm font-semibold text-tat-charcoal">Recent activity</p>
        </div>
        {log.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-tat-charcoal/50">No points activity yet. Book a trip to earn your first points.</p>
          </div>
        ) : (
          <ul className="divide-y divide-tat-charcoal/8">
            {log.map((row) => (
              <li key={row.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-tat-charcoal">{REASON_LABEL[row.reason] ?? row.reason}</p>
                  <p className="text-[11px] text-tat-charcoal/45 mt-0.5">
                    {new Date(row.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {row.ref_id && <span className="font-mono ml-2">· {row.ref_id.slice(0, 8).toUpperCase()}</span>}
                  </p>
                </div>
                <span className={`font-display text-base font-medium ${row.delta > 0 ? "text-tat-success-fg" : "text-tat-danger-fg"}`}>
                  {row.delta > 0 ? "+" : ""}{row.delta.toLocaleString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
