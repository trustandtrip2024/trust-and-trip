import { Clock, Star, Users, ShieldCheck, BadgeIndianRupee } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import CountUp from "@/components/ui/CountUp";

interface Props {
  totalTravelers?: number;
  reviewCount?: number;
  rating?: number;
}

interface Stat {
  icon: LucideIcon;
  value: string;
  label: string;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

export default function TrustRibbon({
  totalTravelers = 8000,
  reviewCount = 200,
  rating = 4.9,
}: Props = {}) {
  const stats: Stat[] = [
    { icon: Star,             value: `${rating.toFixed(1)} ★`,        label: `${fmt(reviewCount)}+ Google reviews` },
    { icon: Users,            value: `${fmt(totalTravelers)}+`,       label: "happy travelers since 2019" },
    { icon: Clock,            value: "24 hours",                       label: "to your first itinerary" },
    { icon: BadgeIndianRupee, value: "₹0",                             label: "to start · pay only when sure" },
    { icon: ShieldCheck,      value: "Free changes",                   label: "within 48 h of itinerary" },
  ];

  const Tile = ({ icon: Icon, value, label }: Stat) => (
    <li className="flex items-center gap-3 rounded-xl px-3 py-2.5 md:py-3 bg-tat-cream-warm/50 dark:bg-white/5 border border-tat-charcoal/5 dark:border-white/10 min-w-0">
      <span className="shrink-0 h-9 w-9 rounded-full bg-tat-gold/15 text-tat-gold flex items-center justify-center">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] md:text-[14px] font-semibold text-tat-charcoal dark:text-tat-paper leading-tight tabular-nums whitespace-nowrap">
          <CountUp value={value} />
        </p>
        <p className="text-[10px] md:text-[11px] text-tat-charcoal/60 dark:text-tat-paper/60 leading-tight truncate">
          {label}
        </p>
      </div>
    </li>
  );

  return (
    <section
      aria-label="Why travelers trust us"
      className="bg-tat-paper dark:bg-tat-charcoal/95 border-b border-tat-charcoal/8 dark:border-white/10"
    >
      {/* All viewports: static grid. 2 cols on mobile (last tile spans
          both), 3 cols on sm, 5 across at md+. Earlier mobile build used
          a CSS marquee, but reduced-motion users + an overflow-hidden
          parent froze the strip at translateX(0) and clipped tiles 2–5,
          so only the Google rating chip showed. Static grid removes the
          failure mode entirely. */}
      <div className="container-custom py-5 md:py-7">
        <ul
          role="list"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-5 [&>li:last-child]:col-span-2 sm:[&>li:last-child]:col-span-1"
        >
          {stats.map((s) => <Tile key={s.label} {...s} />)}
        </ul>
      </div>
    </section>
  );
}
