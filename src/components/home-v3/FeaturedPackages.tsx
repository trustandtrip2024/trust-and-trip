"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, Flame, Sparkles, Heart, Users, User, Globe2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PackageCard, { type PackageCardProps } from "@/components/ui/PackageCard";

interface Props {
  packagesByType: {
    Couple: PackageCardProps[];
    Family: PackageCardProps[];
    Solo:   PackageCardProps[];
    Group:  PackageCardProps[];
  };
}

interface EditorialBadge {
  label: string;
  icon: LucideIcon;
  tone: string;
}

const BADGES: (EditorialBadge | null)[] = [
  { label: "Editor's pick",   icon: Award,    tone: "bg-tat-gold text-tat-charcoal" },
  { label: "Most asked",      icon: Flame,    tone: "bg-tat-orange text-white" },
  { label: "Hand-tuned trip", icon: Sparkles, tone: "bg-tat-teal text-white" },
];

type ChipId = "all" | "Couple" | "Family" | "Solo" | "Group";

const CHIPS: { id: ChipId; label: string; icon: LucideIcon }[] = [
  { id: "all",    label: "All",       icon: Sparkles },
  { id: "Couple", label: "Honeymoon", icon: Heart },
  { id: "Family", label: "Family",    icon: Users },
  { id: "Solo",   label: "Solo",      icon: User },
  { id: "Group",  label: "Group",     icon: Globe2 },
];

export default function FeaturedPackages({ packagesByType }: Props) {
  const [active, setActive] = useState<ChipId>("all");

  const items = useMemo(() => {
    if (active === "all") {
      return [
        ...packagesByType.Couple.slice(0, 2),
        ...packagesByType.Family.slice(0, 2),
        ...packagesByType.Solo.slice(0, 2),
        ...packagesByType.Group.slice(0, 2),
      ];
    }
    return packagesByType[active].slice(0, 8);
  }, [active, packagesByType]);

  if (!items.length) return null;

  return (
    <section
      id="packages"
      aria-labelledby="featured-pkg-title"
      className="py-14 md:py-20 bg-tat-cream-warm/30 dark:bg-tat-charcoal/95 scroll-mt-28 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Featured trips
            </p>
            <h2
              id="featured-pkg-title"
              className="mt-2 font-display font-normal text-[26px] md:text-[36px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              Itineraries we&apos;d send{" "}
              <em className="not-italic font-display italic text-tat-gold">our own family on.</em>
            </h2>
          </div>
          <Link
            href="/packages"
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            Browse all packages
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Filter chips */}
        <div
          role="tablist"
          aria-label="Filter featured trips by traveler type"
          className="mt-5 -mx-5 px-5 lg:mx-0 lg:px-0 flex gap-2 overflow-x-auto no-scrollbar pb-1"
        >
          {CHIPS.map(({ id, label, icon: Icon }) => {
            const isActive = id === active;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(id)}
                className={[
                  "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-[12px] font-semibold transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2",
                  isActive
                    ? "bg-tat-charcoal text-tat-paper border border-tat-charcoal"
                    : "bg-white text-tat-charcoal/80 border border-tat-charcoal/15 hover:border-tat-gold/60 hover:text-tat-gold",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
          <ul className="flex gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0 items-stretch">
            {items.map((p, i) => {
              const badge = active === "all" ? BADGES[i] ?? null : null;
              return (
                <li
                  key={`${active}-${p.href}`}
                  className="shrink-0 snap-start flex w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[24%]"
                >
                  <div className="relative w-full">
                    {badge && (
                      <span
                        className={`absolute z-10 top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${badge.tone}`}
                      >
                        <badge.icon className="h-3 w-3" aria-hidden />
                        {badge.label}
                      </span>
                    )}
                    <PackageCard {...p} density="compact" />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            Browse all packages
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
