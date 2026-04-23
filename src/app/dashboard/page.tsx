"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Heart, ShoppingCart, Tag, ArrowRight, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

interface Stats {
  bookings: number;
  saved: number;
  cart: number;
}

export default function DashboardPage() {
  const { user } = useUserStore();
  const [stats, setStats] = useState<Stats>({ bookings: 0, saved: 0, cart: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Traveller";

  useEffect(() => {
    if (!user) return;

    async function fetchStats() {
      const [saved, cart, bookings] = await Promise.all([
        supabase.from("user_saved_trips").select("id", { count: "exact", head: true }),
        supabase.from("user_cart").select("id", { count: "exact", head: true }),
        fetch("/api/user/bookings", {
          headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
        }).then((r) => r.json()).then((d) => d.bookings?.length ?? 0).catch(() => 0),
      ]);
      setStats({
        saved: saved.count ?? 0,
        cart: cart.count ?? 0,
        bookings: typeof bookings === "number" ? bookings : 0,
      });
      setLoadingStats(false);
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
      desc: "Your wishlist of dream packages",
    },
    {
      href: "/dashboard/cart",
      label: "My Cart",
      value: stats.cart,
      icon: ShoppingCart,
      color: "bg-amber-50 text-amber-600",
      desc: "Packages ready to book",
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
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Dashboard</p>
        <h1 className="font-display text-2xl md:text-3xl font-medium text-ink">
          Welcome back, {displayName} 👋
        </h1>
        <p className="text-sm text-ink/50 mt-1.5">Here&apos;s a summary of your travel activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {cards.map(({ href, label, value, icon: Icon, color, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl p-4 md:p-5 border border-ink/8 hover:border-ink/15 hover:shadow-soft transition-all group"
          >
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            </div>
            {value !== null && (
              <p className="font-display text-2xl font-medium text-ink mb-0.5">
                {loadingStats ? "—" : value}
              </p>
            )}
            <p className="text-xs font-medium text-ink/70">{label}</p>
            <p className="text-[11px] text-ink/40 mt-0.5 hidden md:block">{desc}</p>
            <div className="flex items-center gap-1 mt-2 text-[11px] text-ink/35 group-hover:text-gold transition-colors">
              View <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-ink/8 p-5 md:p-6">
        <p className="text-sm font-semibold text-ink mb-4">Quick Actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/packages" className="flex items-center gap-3 p-3 rounded-xl hover:bg-sand/40 transition-colors group">
            <div className="h-9 w-9 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink group-hover:text-gold transition-colors">Browse Packages</p>
              <p className="text-[11px] text-ink/40">Explore 60+ destinations</p>
            </div>
          </Link>
          <Link href="/offers" className="flex items-center gap-3 p-3 rounded-xl hover:bg-sand/40 transition-colors group">
            <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Tag className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink group-hover:text-gold transition-colors">Current Offers</p>
              <p className="text-[11px] text-ink/40">Save up to 25%</p>
            </div>
          </Link>
          <Link href="/plan" className="flex items-center gap-3 p-3 rounded-xl hover:bg-sand/40 transition-colors group">
            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <CalendarCheck className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink group-hover:text-gold transition-colors">Plan a Trip</p>
              <p className="text-[11px] text-ink/40">AI itinerary builder</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
