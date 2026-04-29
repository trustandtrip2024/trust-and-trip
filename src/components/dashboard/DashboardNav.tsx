"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Heart, ShoppingCart, Tag, CalendarCheck,
  LogOut, Settings, Star, Gift, MoreHorizontal, X, Users, Crown, Home,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupaUser } from "@supabase/supabase-js";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/bookings", label: "My Bookings", icon: CalendarCheck },
  { href: "/dashboard/saved", label: "Saved Trips", icon: Heart },
  { href: "/dashboard/cart", label: "My Cart", icon: ShoppingCart },
  { href: "/dashboard/rewards", label: "Rewards", icon: Crown },
  { href: "/dashboard/travellers", label: "Travellers", icon: Users },
  { href: "/dashboard/offers", label: "Offers for You", icon: Tag },
  { href: "/dashboard/reviews", label: "My Reviews", icon: Star },
  { href: "/dashboard/referral", label: "Refer & Earn", icon: Gift },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
];

const MOBILE_PRIMARY = NAV.slice(0, 4);
const MOBILE_MORE = NAV.slice(4);

interface Props {
  user: SupaUser;
}

export default function DashboardNav({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Traveller";
  const initials = displayName.slice(0, 2).toUpperCase();
  const moreActive = MOBILE_MORE.some((n) => pathname.startsWith(n.href));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-tat-charcoal/8 min-h-screen sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-tat-charcoal/8">
          {/* Brand / home link */}
          <Link
            href="/"
            className="flex items-center gap-2 mb-4 text-tat-charcoal hover:text-tat-gold transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="font-display text-base font-semibold tracking-tight">Trust&amp;Trip</span>
            <span className="ml-auto text-[10px] uppercase tracking-widest text-tat-charcoal/40">Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-tat-gold/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-tat-charcoal">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-tat-charcoal truncate">{displayName}</p>
              <p className="text-[11px] text-tat-charcoal/45 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-tat-gold/12 text-tat-charcoal"
                    : "text-tat-charcoal/55 hover:bg-tat-charcoal/5 hover:text-tat-charcoal"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-tat-gold" : "text-tat-charcoal/40"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-tat-charcoal/8">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-tat-charcoal/50 hover:bg-tat-danger-bg hover:text-tat-danger-fg transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar (5 items: 4 primary + More) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-tat-charcoal/10 flex items-stretch h-14 pb-[env(safe-area-inset-bottom)]">
        {MOBILE_PRIMARY.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                active ? "text-tat-gold" : "text-tat-charcoal/45"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="leading-none">{label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
            moreActive ? "text-tat-gold" : "text-tat-charcoal/45"
          }`}
        >
          <MoreHorizontal className="h-[18px] w-[18px]" />
          <span className="leading-none">More</span>
        </button>
      </nav>

      {/* Mobile "More" drawer */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-tat-charcoal/40 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-5 pb-8 shadow-[0_-8px_32px_rgba(42,42,42,0.15)] animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-tat-gold/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-tat-charcoal">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-tat-charcoal truncate">{displayName}</p>
                  <p className="text-[11px] text-tat-charcoal/45 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="h-9 w-9 rounded-full bg-tat-charcoal/5 flex items-center justify-center text-tat-charcoal/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 py-1">
              <Link
                href="/"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-tat-charcoal/80 hover:bg-tat-charcoal/5 hover:text-tat-charcoal"
              >
                <Home className="h-4 w-4 text-tat-charcoal/45" />
                Back to Home
              </Link>
              {MOBILE_MORE.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      active ? "bg-tat-gold/12 text-tat-charcoal" : "text-tat-charcoal/70 hover:bg-tat-charcoal/5"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-tat-gold" : "text-tat-charcoal/40"}`} />
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-tat-charcoal/8 mt-2 pt-3">
              <button
                onClick={() => { setMoreOpen(false); signOut(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-tat-danger-fg hover:bg-tat-danger-bg transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
