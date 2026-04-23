"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Heart, ShoppingCart, Tag, CalendarCheck, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupaUser } from "@supabase/supabase-js";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/bookings", label: "My Bookings", icon: CalendarCheck },
  { href: "/dashboard/saved", label: "Saved Trips", icon: Heart },
  { href: "/dashboard/cart", label: "My Cart", icon: ShoppingCart },
  { href: "/dashboard/offers", label: "Offers for You", icon: Tag },
];

interface Props {
  user: SupaUser;
}

export default function DashboardNav({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Traveller";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-ink/8 min-h-screen sticky top-0 h-screen">
        {/* User */}
        <div className="px-5 py-6 border-b border-ink/8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-ink">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{displayName}</p>
              <p className="text-[11px] text-ink/45 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-gold/12 text-ink"
                    : "text-ink/55 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-gold" : "text-ink/40"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-ink/8">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink/50 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/10 flex items-stretch h-14">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium transition-colors ${
                active ? "text-gold" : "text-ink/40"
              }`}
            >
              <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              <span className="leading-none">{label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
