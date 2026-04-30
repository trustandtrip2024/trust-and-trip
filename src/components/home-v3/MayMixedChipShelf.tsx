"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Waves, Mountain, Landmark, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PackageCard, { type PackageCardProps } from "@/components/ui/PackageCard";

interface Props {
  packages: PackageCardProps[];
}

type VibeId = "all" | "beach" | "mountain" | "cultural";

const VIBE_CHIPS: { id: VibeId; label: string; icon: LucideIcon; slugs: string[] }[] = [
  { id: "all",      label: "All vibes", icon: Sparkles, slugs: [] },
  { id: "beach",    label: "Beach",     icon: Waves,    slugs: ["bali", "maldives", "kerala", "goa", "mauritius", "fiji", "santorini", "vietnam", "phuket", "andaman"] },
  { id: "mountain", label: "Mountain",  icon: Mountain, slugs: ["switzerland", "iceland", "norway", "kashmir", "ladakh", "spiti", "himachal", "nepal", "bhutan", "japan"] },
  { id: "cultural", label: "Cultural",  icon: Landmark, slugs: ["rajasthan", "jaipur", "italy", "france", "greece", "europe", "japan", "uk", "england", "scotland"] },
];

export default function MayMixedChipShelf({ packages }: Props) {
  const [active, setActive] = useState<VibeId>("all");

  const items = useMemo(() => {
    const cfg = VIBE_CHIPS.find((c) => c.id === active)!;
    if (!cfg.slugs.length) return packages.slice(0, 10);
    const set = new Set(cfg.slugs);
    return packages
      .filter((p) => {
        const hay = `${p.destination ?? ""} ${p.href}`.toLowerCase();
        return [...set].some((s) => hay.includes(s));
      })
      .slice(0, 10);
  }, [packages, active]);

  if (!packages.length) return null;

  return (
    <section
      id="may-trending"
      aria-labelledby="may-trending-title"
      className="py-12 md:py-16 bg-tat-cream-warm/30 dark:bg-tat-charcoal/95 scroll-mt-44 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Perfect for next month
            </p>
            <h2
              id="may-trending-title"
              className="mt-2 font-display font-normal text-[22px] md:text-[30px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              Trending in{" "}
              <em className="not-italic font-display italic text-tat-gold">May.</em>
            </h2>
          </div>
          <Link
            href="/packages?month=may"
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            All May trips
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mixed chip strip: locked May pill + vibe filters */}
        <div
          className="mt-5 -mx-5 px-5 lg:mx-0 lg:px-0 flex gap-2 overflow-x-auto no-scrollbar pb-1 items-center"
        >
          <span className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-[12px] font-semibold bg-tat-gold/15 text-tat-gold border border-tat-gold/30">
            May
          </span>
          <span aria-hidden className="shrink-0 text-tat-charcoal/30">+</span>
          <div role="tablist" aria-label="Filter May trips by vibe" className="flex gap-2">
            {VIBE_CHIPS.map(({ id, label, icon: Icon }) => {
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
        </div>

        {items.length > 0 ? (
          <div className="mt-5 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
            <ul className="flex gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0 items-stretch">
              {items.map((p) => (
                <li
                  key={`${active}-${p.href}`}
                  className="shrink-0 snap-start flex w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[24%]"
                >
                  <PackageCard {...p} density="compact" />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-tat-charcoal/15 p-6 text-center">
            <p className="text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70">
              No May trips matching this vibe yet — try another.
            </p>
          </div>
        )}

        <div className="sm:hidden mt-5 text-center">
          <Link
            href="/packages?month=may"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            All May trips
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
