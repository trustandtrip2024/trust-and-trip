"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MapPin, Sliders, Phone } from "lucide-react";
import clsx from "clsx";

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/packages", icon: Compass, label: "Packages" },
  { href: "/destinations", icon: MapPin, label: "Explore" },
  { href: "/customize-trip", icon: Sliders, label: "Customize" },
  { href: "/contact", icon: Phone, label: "Contact" },
];

export default function MobileBottomNav() {
  const path = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-cream/98 backdrop-blur-xl border-t border-ink/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active =
            path === href || (href !== "/" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-1 flex-1 py-2 transition-all duration-200",
                active ? "text-gold" : "text-ink/40 hover:text-ink/70"
              )}
            >
              <div
                className={clsx(
                  "relative flex items-center justify-center rounded-xl w-10 h-7 transition-all duration-200",
                  active && "bg-gold/10"
                )}
              >
                <Icon
                  className={clsx(
                    "h-[18px] w-[18px] transition-transform duration-200",
                    active && "scale-110"
                  )}
                />
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
                )}
              </div>
              <span
                className={clsx(
                  "text-[9px] uppercase tracking-[0.12em] font-medium leading-none",
                  active ? "text-gold" : "text-ink/40"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
