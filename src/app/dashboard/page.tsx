"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Heart, ShoppingCart, Tag, ArrowRight, MapPin, Plane, Clock, Crown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";
import { TIER_PERKS, pointsToNextTier, type Tier } from "@/lib/points";

interface Stats {
  bookings: number;
  saved: number;
  cart: number;
}

interface PointsSummary {
  total_points: number;
  lifetime_points: number;
  tier: Tier;
}

interface UpcomingTrip {
  id: string;
  package_title: string;
  package_slug: string;
  travel_date: string | null;
  status: string;
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return -1;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const { user } = useUserStore();
  const [stats, setStats] = useState<Stats>({ bookings: 0, saved: 0, cart: 0 });
  const [upcoming, setUpcoming] = useState<UpcomingTrip | null>(null);
  const [pointsSummary, setPointsSummary] = useState<PointsSummary | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Traveller";

  useEffect(() => {
    if (!user) return;

    async function fetchStats() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        const safe = <T,>(p: PromiseLike<T>, fallback: T): Promise<T> => Promise.resolve(p).then((v) => v).catch(() => fallback);

        type BookingLite = { id: string; package_title: string; package_slug: string; travel_date: string | null; status: string };

        const [savedRes, cartRes, bookingsData, pointsData] = await Promise.all([
          safe(supabase.from("user_saved_trips").select("id", { count: "exact", head: true }).then((r) => r.count ?? 0), 0),
          safe(supabase.from("user_cart").select("id", { count: "exact", head: true }).then((r) => r.count ?? 0), 0),
          token
            ? safe(
                fetch("/api/user/bookings", { headers: { Authorization: `Bearer ${token}` } })
                  .then((r) => r.ok ? r.json() : { bookings: [] })
                  .then((d): BookingLite[] => Array.isArray(d.bookings) ? d.bookings : []),
                [] as BookingLite[]
              )
            : Promise.resolve([] as BookingLite[]),
          token
            ? safe(
                fetch("/api/user/points", { headers: { Authorization: `Bearer ${token}` } })
                  .then((r) => r.ok ? r.json() : null)
                  .then((d): PointsSummary | null => d?.points ?? null),
                null as PointsSummary | null
              )
            : Promise.resolve(null),
        ]);

        setStats({ saved: savedRes, cart: cartRes, bookings: bookingsData.length });
        setPointsSummary(pointsData);

        const upcomingTrip = bookingsData
          .filter((b) => b.travel_date && ["verified", "paid"].includes(b.status) && daysUntil(b.travel_date) >= 0)
          .sort((a, b) => daysUntil(a.travel_date!) - daysUntil(b.travel_date!))[0];
        setUpcoming(upcomingTrip ?? null);
      } catch (err) {
        console.error("[dashboard] fetchStats failed:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, [user]);

  const cards = [
    {
      href: "/dashboard/bookings",
      label: "My Bookings",
      value: stats.bookings,
      icon: CalendarCheck,
      color: "bg-blue-50 text-blue-600",
      desc: "View booking history & status",
    },
    {
      href: "/dashboard/saved",
      label: "Saved Trips",
      value: stats.saved,
      icon: Heart,
      color: "bg-red-50 text-red-500",
      desc: "Your wishlist of dream experiences",
    },
    {
      href: "/dashboard/cart",
      label: "My Cart",
      value: stats.cart,
      icon: ShoppingCart,
      color: "bg-amber-50 text-amber-600",
      desc: "Experiences ready to book",
    },
    {
      href: "/dashboard/offers",
      label: "Offers for You",
      value: null,
      icon: Tag,
      color: "bg-green-50 text-green-600",
      desc: "Deals curated just for you",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-tat-charcoal/40 mb-1">Dashboard</p>
        <h1 className="font-display text-2xl md:text-3xl font-medium text-tat-charcoal">
          Welcome back, {displayName} 👋
        </h1>
        <p className="text-sm text-tat-charcoal/50 mt-1.5">Here&apos;s a summary of your travel activity.</p>
      </div>

      {/* Rewards banner */}
      {pointsSummary && (() => {
        const tierCfg = TIER_PERKS[pointsSummary.tier];
        const { next, needed } = pointsToNextTier(pointsSummary.lifetime_points);
        return (
          <Link
            href="/dashboard/rewards"
            className="group block bg-white rounded-2xl border border-tat-charcoal/8 hover:border-tat-gold/40 hover:shadow-soft p-4 md:p-5 mb-6 transition-all"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${tierCfg.color}`}>
                  <Crown className={`h-4 w-4 ${tierCfg.accent}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] uppercase tracking-widest font-semibold ${tierCfg.accent}`}>
                      {tierCfg.label} tier
                    </span>
                    <span className="text-[10px] text-tat-charcoal/35">·</span>
                    <span className="text-[11px] text-tat-charcoal/55">{tierCfg.discount}</span>
                  </div>
                  <p className="font-display text-lg font-medium text-tat-charcoal mt-0.5">
                    {pointsSummary.total_points.toLocaleString("en-IN")} points
                  </p>
                  {next && (
                    <p className="text-[11px] text-tat-charcoal/45 mt-0.5">
                      {needed.toLocaleString("en-IN")} pts to {TIER_PERKS[next].label}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs text-tat-charcoal/45 group-hover:text-tat-gold transition-colors flex items-center gap-1">
                View rewards <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        );
      })()}

      {/* Upcoming trip banner */}
      {upcoming && upcoming.travel_date && (() => {
        const days = daysUntil(upcoming.travel_date);
        const dateLabel = new Date(upcoming.travel_date).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        });
        return (
          <Link
            href="/dashboard/bookings"
            className="group relative block bg-gradient-to-br from-tat-charcoal to-tat-charcoal/90 text-tat-paper rounded-2xl p-5 md:p-6 mb-6 overflow-hidden hover:shadow-soft transition-all"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-tat-gold/15 blur-2xl" />
            <div className="relative flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="h-4 w-4 text-tat-gold" />
                  <p className="text-[10px] uppercase tracking-widest text-tat-gold/80">Upcoming Trip</p>
                </div>
                <h2 className="font-display text-lg md:text-xl font-medium leading-tight mb-1.5 line-clamp-1">
                  {upcoming.package_title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-tat-paper/70 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <CalendarCheck className="h-3 w-3" />
                    {dateLabel}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `in ${days} days`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-tat-paper/70 group-hover:text-tat-gold transition-colors shrink-0">
                View details
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        );
      })()}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {cards.map(({ href, label, value, icon: Icon, color, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl p-4 md:p-5 border border-tat-charcoal/8 hover:border-tat-charcoal/15 hover:shadow-soft transition-all group"
          >
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="h-[18px] w-[18px]" />
            </div>
            {value !== null && (
              <p className="font-display text-2xl font-medium text-tat-charcoal mb-0.5">
                {loadingStats ? "—" : value}
              </p>
            )}
            <p className="text-xs font-medium text-tat-charcoal/70">{label}</p>
            <p className="text-[11px] text-tat-charcoal/40 mt-0.5 hidden md:block">{desc}</p>
            <div className="flex items-center gap-1 mt-2 text-[11px] text-tat-charcoal/35 group-hover:text-tat-gold transition-colors">
              View <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-5 md:p-6">
        <p className="text-sm font-semibold text-tat-charcoal mb-4">Quick Actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/packages" className="flex items-center gap-3 p-3 rounded-xl hover:bg-tat-cream/40 transition-colors group">
            <div className="h-9 w-9 rounded-xl bg-tat-gold/10 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-tat-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tat-charcoal group-hover:text-tat-gold transition-colors">Browse Experiences</p>
              <p className="text-[11px] text-tat-charcoal/40">Explore 60+ destinations</p>
            </div>
          </Link>
          <Link href="/offers" className="flex items-center gap-3 p-3 rounded-xl hover:bg-tat-cream/40 transition-colors group">
            <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Tag className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-tat-charcoal group-hover:text-tat-gold transition-colors">Current Offers</p>
              <p className="text-[11px] text-tat-charcoal/40">Save up to 25%</p>
            </div>
          </Link>
          <Link href="/plan" className="flex items-center gap-3 p-3 rounded-xl hover:bg-tat-cream/40 transition-colors group">
            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <CalendarCheck className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-tat-charcoal group-hover:text-tat-gold transition-colors">Plan a Trip</p>
              <p className="text-[11px] text-tat-charcoal/40">AI itinerary builder</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
