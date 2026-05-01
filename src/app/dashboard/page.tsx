"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck, Heart, ShoppingCart, Tag, ArrowRight, MapPin, Plane, Clock,
  Crown, Sparkles, Gift, Compass, Users as UsersIcon, Coffee, Sun, Moon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";
import { TIER_PERKS, pointsToNextTier, TIER_THRESHOLDS, type Tier } from "@/lib/points";

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

interface BookingLite {
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

function timeOfDayGreeting(): { greeting: string; Icon: typeof Sun } {
  const istHour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getHours();
  if (istHour < 5)  return { greeting: "Late night",     Icon: Moon };
  if (istHour < 12) return { greeting: "Good morning",   Icon: Coffee };
  if (istHour < 17) return { greeting: "Good afternoon", Icon: Sun };
  if (istHour < 21) return { greeting: "Good evening",   Icon: Sun };
  return { greeting: "Good night", Icon: Moon };
}

export default function DashboardPage() {
  const { user } = useUserStore();
  const [stats, setStats] = useState<Stats>({ bookings: 0, saved: 0, cart: 0 });
  const [upcoming, setUpcoming] = useState<BookingLite | null>(null);
  const [allBookings, setAllBookings] = useState<BookingLite[]>([]);
  const [pointsSummary, setPointsSummary] = useState<PointsSummary | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const displayName = user?.user_metadata?.full_name?.split(" ")[0]
    || user?.email?.split("@")[0]
    || "Traveller";
  const { greeting, Icon: GreetIcon } = timeOfDayGreeting();

  useEffect(() => {
    if (!user) return;

    async function fetchStats() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        const safe = <T,>(p: PromiseLike<T>, fallback: T): Promise<T> =>
          Promise.resolve(p).then((v) => v).catch(() => fallback);

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
        setAllBookings(bookingsData);

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

  // Travel story
  const verifiedBookings = allBookings.filter((b) => ["verified", "paid"].includes(b.status));
  const uniqueDestinations = new Set(verifiedBookings.map((b) => b.package_slug)).size;
  const tripsCompleted = allBookings.filter((b) =>
    ["verified", "paid"].includes(b.status) && b.travel_date && daysUntil(b.travel_date) < -1
  ).length;
  const isNewTraveller = !loadingStats && verifiedBookings.length === 0;

  const cards = [
    {
      href: "/dashboard/bookings",
      label: "My bookings",
      value: stats.bookings,
      icon: CalendarCheck,
      tone: "teal",
      desc: "Booking history & trip status",
    },
    {
      href: "/dashboard/saved",
      label: "Saved trips",
      value: stats.saved,
      icon: Heart,
      tone: "orange",
      desc: "Your wishlist of dream experiences",
    },
    {
      href: "/dashboard/cart",
      label: "My cart",
      value: stats.cart,
      icon: ShoppingCart,
      tone: "gold",
      desc: stats.cart > 0 ? "Ready to book — finish checkout" : "Experiences ready to book",
    },
    {
      href: "/dashboard/offers",
      label: "Offers for you",
      value: null,
      icon: Tag,
      tone: "teal-soft",
      desc: "Curated deals — refresh weekly",
    },
  ];

  return (
    <div>
      {/* ─── Greeting ─────────────────────────────────────────────────── */}
      <div className="mb-7">
        <p className="text-[11px] uppercase tracking-[0.18em] text-tat-charcoal/45 font-semibold mb-1 inline-flex items-center gap-1.5">
          <GreetIcon className="h-3 w-3 text-tat-gold" />
          {greeting}
        </p>
        <h1 className="font-display text-h2 font-medium text-tat-charcoal">
          {displayName}
        </h1>
        <p className="text-sm text-tat-charcoal/55 mt-1.5">
          {isNewTraveller
            ? "Welcome aboard. Let's plan something unforgettable."
            : upcoming
              ? "Your adventure draws closer."
              : "Where are we going next?"}
        </p>
      </div>

      {/* ─── Trip Countdown — hero when upcoming ─────────────────────── */}
      {upcoming && upcoming.travel_date && (() => {
        const days = daysUntil(upcoming.travel_date);
        const dateLabel = new Date(upcoming.travel_date).toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        });
        const weekday = new Date(upcoming.travel_date).toLocaleDateString("en-IN", { weekday: "long" });
        // Progress: assume booking-to-travel window of 90 days max for visualization
        const totalWindow = 90;
        const elapsed = Math.max(0, totalWindow - Math.min(days, totalWindow));
        const progress = (elapsed / totalWindow) * 100;
        return (
          <Link
            href={`/dashboard/bookings/${upcoming.id}`}
            className="group relative block rounded-3xl mb-6 overflow-hidden text-tat-paper hover:shadow-soft transition-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-tat-charcoal via-tat-charcoal to-tat-teal-deep" />
            <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-tat-gold/20 blur-3xl" />
            <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-tat-orange/15 blur-3xl" />

            <div className="relative p-6 md:p-7">
              <div className="flex items-center gap-2 mb-3">
                <Plane className="h-4 w-4 text-tat-gold" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-tat-gold font-semibold">
                  Your next trip
                </p>
              </div>

              <h2 className="font-display text-2xl md:text-3xl font-medium leading-tight mb-3 line-clamp-2">
                {upcoming.package_title}
              </h2>

              {/* Big countdown */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-display text-5xl md:text-6xl text-tat-gold tabular-nums leading-none">
                  {days < 0 ? 0 : days}
                </span>
                <span className="text-sm text-tat-paper/70">
                  {days <= 0 ? "today!" : days === 1 ? "day to go" : "days to go"}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-tat-paper/15 rounded-full overflow-hidden mb-4 max-w-md">
                <div
                  className="h-full bg-gradient-to-r from-tat-gold to-tat-orange rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 text-xs text-tat-paper/75 flex-wrap">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    {dateLabel}
                  </span>
                  <span className="text-tat-paper/40">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {weekday}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-tat-gold group-hover:translate-x-0.5 transition-transform">
                  Trip details
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </Link>
        );
      })()}

      {/* ─── New traveller onboarding (replaces countdown when no booking) */}
      {isNewTraveller && !upcoming && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-tat-cream-warm to-tat-cream p-6 md:p-7 mb-6 border border-tat-gold/20">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-tat-gold/15 blur-3xl" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-tat-gold font-semibold mb-1">
                <Sparkles className="h-3 w-3 inline mr-1" />
                First trip together
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-medium text-tat-charcoal leading-tight">
                Pick a destination — we&apos;ll handle the rest.
              </h2>
              <p className="text-sm text-tat-charcoal/65 mt-2 max-w-md">
                Browse 60+ handcrafted itineraries, or tell us where you want to go and we&apos;ll build one in 24 hours.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                href="/destinations"
                className="inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-xs font-semibold bg-tat-charcoal text-tat-paper hover:opacity-90 transition"
              >
                Browse destinations
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/build-trip"
                className="inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-xs font-semibold bg-tat-gold text-tat-charcoal hover:bg-tat-gold/90 transition"
              >
                Plan with AI
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── Travel Story (only after first trip) ─────────────────────── */}
      {!isNewTraveller && verifiedBookings.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Stat label="Trips" value={verifiedBookings.length} sub="booked" />
          <Stat label="Destinations" value={uniqueDestinations} sub="explored" />
          <Stat label="Completed" value={tripsCompleted} sub="memories made" />
        </div>
      )}

      {/* ─── Rewards / Tier ───────────────────────────────────────────── */}
      {pointsSummary && (() => {
        const tierCfg = TIER_PERKS[pointsSummary.tier];
        const { next, needed } = pointsToNextTier(pointsSummary.lifetime_points);
        const tierProgress = next
          ? Math.min(100, (pointsSummary.lifetime_points / TIER_THRESHOLDS[next]) * 100)
          : 100;
        return (
          <Link
            href="/dashboard/rewards"
            className="group block bg-white rounded-2xl border border-tat-charcoal/8 hover:border-tat-gold/40 hover:shadow-soft p-5 mb-6 transition-all"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${tierCfg.color}`}>
                  <Crown className={`h-4 w-4 ${tierCfg.accent}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] uppercase tracking-widest font-semibold ${tierCfg.accent}`}>
                      {tierCfg.label} member
                    </span>
                    <span className="text-[10px] text-tat-charcoal/35">·</span>
                    <span className="text-[11px] text-tat-charcoal/55">{tierCfg.discount}</span>
                  </div>
                  <p className="font-display text-lg font-medium text-tat-charcoal mt-0.5">
                    {pointsSummary.total_points.toLocaleString("en-IN")} points
                  </p>
                </div>
              </div>
              <span className="text-xs text-tat-charcoal/45 group-hover:text-tat-gold transition-colors flex items-center gap-1">
                View perks <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>

            {next && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] text-tat-charcoal/55">
                    {needed.toLocaleString("en-IN")} pts to <strong className="text-tat-charcoal">{TIER_PERKS[next].label}</strong>
                  </p>
                  <p className="text-[10px] text-tat-charcoal/40 tabular-nums">
                    {pointsSummary.lifetime_points.toLocaleString("en-IN")} / {TIER_THRESHOLDS[next].toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="h-1.5 bg-tat-paper rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-tat-gold to-tat-orange rounded-full"
                    style={{ width: `${tierProgress}%` }}
                  />
                </div>
              </div>
            )}
          </Link>
        );
      })()}

      {/* ─── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {cards.map(({ href, label, value, icon: Icon, tone, desc }) => {
          const toneCls = {
            teal:        "bg-tat-teal-mist/30 text-tat-teal-deep",
            orange:      "bg-tat-orange-soft/30 text-tat-orange",
            gold:        "bg-tat-gold/15 text-tat-gold",
            "teal-soft": "bg-tat-success-bg text-tat-success-fg",
          }[tone];
          return (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-2xl p-4 md:p-5 border border-tat-charcoal/8 hover:border-tat-charcoal/15 hover:shadow-soft transition-all group"
            >
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${toneCls}`}>
                <Icon className="h-[18px] w-[18px]" />
              </div>
              {value !== null && (
                <p className="font-display text-h2 font-medium text-tat-charcoal mb-0.5 tabular-nums">
                  {loadingStats ? "—" : value}
                </p>
              )}
              <p className="text-xs font-medium text-tat-charcoal/70">{label}</p>
              <p className="text-[11px] text-tat-charcoal/40 mt-0.5 hidden md:block line-clamp-1">{desc}</p>
              <div className="flex items-center gap-1 mt-2 text-[11px] text-tat-charcoal/35 group-hover:text-tat-gold transition-colors">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ─── Refer + earn promo ───────────────────────────────────────── */}
      <Link
        href="/dashboard/referral"
        className="group block relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-tat-teal-deep to-tat-teal text-tat-paper p-5 hover:shadow-soft transition-shadow"
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-tat-gold/15 blur-2xl" />
        <div className="relative flex items-center gap-4 flex-wrap">
          <div className="h-10 w-10 rounded-xl bg-tat-paper/15 backdrop-blur flex items-center justify-center shrink-0">
            <Gift className="h-5 w-5 text-tat-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-tat-gold/90 font-semibold">Refer a friend</p>
            <p className="font-display text-lg leading-tight">
              Share Trust and Trip — earn ₹500 when they book.
            </p>
            <p className="text-[11px] text-tat-paper/70 mt-0.5">Friend gets ₹500 off their first trip too.</p>
          </div>
          <span className="text-xs font-semibold text-tat-gold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
            Get my link <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>

      {/* ─── Quick actions ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-5 md:p-6">
        <p className="text-sm font-semibold text-tat-charcoal mb-4">Quick actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickLink href="/destinations" icon={MapPin} label="Browse destinations" desc="60+ handcrafted journeys" tone="gold" />
          <QuickLink href="/build-trip"   icon={Compass} label="Plan with AI"        desc="Get an itinerary in 60s" tone="teal" />
          <QuickLink href="/group-trips"  icon={UsersIcon} label="Group trips"        desc="Travel with kindred souls" tone="orange" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-tat-charcoal/8 px-4 py-3 text-center">
      <p className="font-display text-2xl text-tat-charcoal tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-tat-charcoal/55 font-semibold mt-0.5">{label}</p>
      <p className="text-[10px] text-tat-charcoal/40 mt-0.5">{sub}</p>
    </div>
  );
}

function QuickLink({
  href, icon: Icon, label, desc, tone,
}: {
  href: string;
  icon: typeof MapPin;
  label: string;
  desc: string;
  tone: "gold" | "teal" | "orange";
}) {
  const cls = {
    gold:   "bg-tat-gold/15 text-tat-gold",
    teal:   "bg-tat-teal-mist/40 text-tat-teal-deep",
    orange: "bg-tat-orange-soft/30 text-tat-orange",
  }[tone];
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-tat-cream/40 transition-colors group">
      <div className={`h-9 w-9 rounded-xl ${cls} flex items-center justify-center shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-tat-charcoal group-hover:text-tat-gold transition-colors">{label}</p>
        <p className="text-[11px] text-tat-charcoal/45 truncate">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-tat-charcoal/35 group-hover:text-tat-gold transition-colors ml-auto shrink-0" />
    </Link>
  );
}
