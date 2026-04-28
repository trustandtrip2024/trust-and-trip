"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, MessageCircle, Heart, Sparkles } from "lucide-react";
import clsx from "clsx";
import { analytics } from "@/lib/analytics";
import { captureIntent } from "@/lib/capture-intent";
// analytics.tripPlannerOpen reserved for future telemetry hook

import { useWishlistStore } from "@/store/useWishlistStore";
import { useTripPlanner } from "@/context/TripPlannerContext";

const WHATSAPP = "https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I'd%20love%20help%20planning%20my%20next%20trip.";

const leftTabs = [
  { href: "/",             icon: Home,   label: "Home" },
  { href: "/destinations", icon: MapPin, label: "Explore" },
];

const rightTabs = [
  { href: "/wishlist", icon: Heart, label: "Saved" },
];

function Tab({ href, icon: Icon, label, active, badge }: {
  href: string; icon: React.ElementType; label: string; active: boolean; badge?: number;
}) {
  return (
    <Link href={href}
      className={clsx("flex flex-col items-center gap-1 flex-1 py-2 transition-all duration-200 min-h-[56px] justify-center relative",
        active ? "text-tat-gold" : "text-tat-charcoal/45 hover:text-tat-charcoal/70")}>
      <div className={clsx("flex items-center justify-center rounded-xl w-10 h-7 transition-all duration-200 relative", active && "bg-tat-gold/12")}>
        <Icon className={clsx("h-[18px] w-[18px] transition-transform duration-200", active && "scale-110")} />
        {!!badge && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-semibold flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className={clsx("text-[10px] uppercase tracking-[0.12em] font-medium leading-none",
        active ? "text-tat-gold" : "text-tat-charcoal/45")}>
        {label}
      </span>
    </Link>
  );
}

// Hide on dashboard/admin/auth views, paid-traffic landing pages, and any
// route where a single high-conversion CTA already owns the bottom of the
// screen. Package detail pages have their own pricing+book sticky bar so
// the generic nav must stand down to avoid stacking two bars.
const HIDDEN_ON = [
  "/dashboard",
  "/login",
  "/creators/dashboard",
  "/admin",
  "/lp/",
  "/invoice/",
  "/cart/resume",
  "/packages/", // detail pages only — bare /packages stays
];

export default function MobileBottomNav() {
  const path = usePathname();
  const wishlistCount = useWishlistStore((s) => s.wishlist.length);
  const { open: openPlanner } = useTripPlanner();
  const isActive = (href: string) => path === href || (href !== "/" && path.startsWith(href));

  if (HIDDEN_ON.some((p) => path.startsWith(p))) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-tat-charcoal/8 shadow-[0_-4px_24px_rgba(11,28,44,0.10)]">
        <div className="flex items-end justify-around h-16 px-1 max-w-lg mx-auto">
          {leftTabs.map((t) => (
            <Tab key={t.href} {...t} active={isActive(t.href)} />
          ))}

          {/* Center: Plan Trip primary CTA */}
          <button
            type="button"
            onClick={() => {
              captureIntent("enquire_click", { note: "Mobile bottom nav — Plan Trip FAB" });
              openPlanner();
            }}
            aria-label="Plan my trip"
            className="flex flex-col items-center gap-1 flex-1 -mt-6 pb-0.5"
          >
            <div className="relative h-16 w-16 rounded-full bg-tat-gold shadow-[0_6px_24px_rgba(232,169,76,0.55)] ring-4 ring-white flex items-center justify-center transition-transform active:scale-95">
              <Sparkles className="h-6 w-6 text-tat-charcoal" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-tat-charcoal leading-none mt-0.5">
              Plan Trip
            </span>
          </button>

          {/* WhatsApp */}
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            onClick={() => {
              analytics.whatsappClick("mobile_bottom_nav");
              captureIntent("whatsapp_click", { note: "Mobile bottom nav — WhatsApp" });
            }}
            className="flex flex-col items-center gap-1 flex-1 py-2 min-h-[56px] justify-center text-tat-charcoal/45 hover:text-tat-charcoal/70"
          >
            <div className="flex items-center justify-center rounded-xl w-10 h-7 bg-[#25D366]/10">
              <MessageCircle className="h-[18px] w-[18px] text-[#25D366]" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.12em] font-medium leading-none">
              Chat
            </span>
          </a>

          {rightTabs.map((t) => (
            <Tab key={t.href} {...t} active={isActive(t.href)}
              badge={t.href === "/wishlist" ? wishlistCount : undefined} />
          ))}
        </div>
      </div>
    </nav>
  );
}
