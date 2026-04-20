"use client";

import Link from "next/link";
import { Flame, Heart, Users, User, Mountain, Globe2, IndianRupee, Palmtree } from "lucide-react";

const filters = [
  { label: "Trending", icon: Flame, href: "/packages?type=trending", hot: true },
  { label: "Honeymoon", icon: Heart, href: "/packages?type=Couple" },
  { label: "Family", icon: Users, href: "/packages?type=Family" },
  { label: "Solo", icon: User, href: "/packages?type=Solo" },
  { label: "Adventure", icon: Mountain, href: "/packages?type=Group" },
  { label: "International", icon: Globe2, href: "/packages?destination=international" },
  { label: "Beaches", icon: Palmtree, href: "/packages?destination=goa" },
  { label: "Under ₹35K", icon: IndianRupee, href: "/packages?budget=budget" },
];

export default function QuickFilters() {
  return (
    <div className="bg-cream border-b border-ink/8 py-3 sticky top-[64px] z-30 shadow-sm">
      <div className="container-custom">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {filters.map(({ label, icon: Icon, href, hot }) => (
            <Link
              key={label}
              href={href}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0 border ${
                hot
                  ? "bg-gold text-ink border-gold hover:bg-gold/90"
                  : "bg-white border-ink/10 text-ink/70 hover:border-gold hover:text-ink hover:bg-gold/5"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
