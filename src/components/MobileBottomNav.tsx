"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MapPin, Search, MessageCircle, Heart } from "lucide-react";
import clsx from "clsx";
import { analytics } from "@/lib/analytics";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useWishlistStore } from "@/store/useWishlistStore";

const SearchModal = dynamic(() => import("./SearchModal"), { ssr: false });

const WHATSAPP = "https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I'd%20love%20help%20planning%20my%20next%20trip.";

const leftTabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/packages", icon: Compass, label: "Packages" },
];

const rightTabs = [
  { href: "/destinations", icon: MapPin, label: "Explore" },
  { href: "/wishlist", icon: Heart, label: "Saved" },
];

function Tab({ href, icon: Icon, label, active, badge }: {
  href: string; icon: React.ElementType; label: string; active: boolean; badge?: number;
}) {
  return (
    <Link href={href}
      className={clsx("flex flex-col items-center gap-1 flex-1 py-2 transition-all duration-200 min-h-[56px] justify-center relative",
        active ? "text-gold" : "text-ink/40 hover:text-ink/70")}>
      <div className={clsx("flex items-center justify-center rounded-xl w-10 h-7 transition-all duration-200 relative", active && "bg-gold/12")}>
        <Icon className={clsx("h-[18px] w-[18px] transition-transform duration-200", active && "scale-110")} />
        {!!badge && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className={clsx("text-[9px] uppercase tracking-[0.12em] font-medium leading-none",
        active ? "text-gold" : "text-ink/40")}>
        {label}
      </span>
    </Link>
  );
}

export default function MobileBottomNav() {
  const path = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const wishlistCount = useWishlistStore((s) => s.wishlist.length);
  const isActive = (href: string) => path === href || (href !== "/" && path.startsWith(href));

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="bg-white/95 backdrop-blur-md border-t border-ink/8 shadow-[0_-4px_24px_rgba(11,28,44,0.10)]">
          <div className="flex items-end justify-around h-16 px-1 max-w-lg mx-auto">
            {leftTabs.map((t) => (
              <Tab key={t.href} {...t} active={isActive(t.href)}
                badge={t.href === "/wishlist" ? wishlistCount : undefined} />
            ))}

            {/* Centre WhatsApp FAB */}
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              onClick={() => analytics.whatsappClick("mobile_bottom_nav")}
              className="flex flex-col items-center gap-1 flex-1 -mt-5 pb-0.5">
              <div className="relative h-14 w-14 rounded-full bg-[#25D366] shadow-[0_4px_20px_rgba(37,211,102,0.45)] flex items-center justify-center transition-transform active:scale-95">
                <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
                <MessageCircle className="h-6 w-6 text-white relative fill-white" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.12em] font-medium text-ink/40 leading-none mt-0.5">Chat</span>
            </a>

            {/* Search button */}
            <button onClick={() => setSearchOpen(true)}
              className={clsx("flex flex-col items-center gap-1 flex-1 py-2 transition-all duration-200 min-h-[56px] justify-center",
                "text-ink/40 hover:text-ink/70")}>
              <div className="flex items-center justify-center rounded-xl w-10 h-7">
                <Search className="h-[18px] w-[18px]" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.12em] font-medium leading-none text-ink/40">Search</span>
            </button>

            {rightTabs.map((t) => (
              <Tab key={t.href} {...t} active={isActive(t.href)}
                badge={t.href === "/wishlist" ? wishlistCount : undefined} />
            ))}
          </div>
        </div>
      </nav>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
