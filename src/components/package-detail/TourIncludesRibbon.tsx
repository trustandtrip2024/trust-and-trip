"use client";

import { useMemo, useState } from "react";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { deriveTourIncludes } from "@/lib/tour-includes";

interface Props {
  highlights: string[];
  /** Inclusions text array — drives which icons render in the top ribbon.
   *  Heuristically matched to icon buckets (Hotel/Meals/Flight/etc.). */
  inclusions?: string[];
}

/**
 * Tour includes + highlights ribbon. The top ribbon's icons are derived
 * per-package from the inclusions[] array (e.g. an inclusions list with
 * "houseboat cruise" lights up the Cruise icon, not the generic Bus).
 * Expandable highlights list lives below.
 */
export default function TourIncludesRibbon({ highlights, inclusions = [] }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? highlights : highlights.slice(0, 6);
  const includes = useMemo(() => deriveTourIncludes(inclusions), [inclusions]);
  // Grid-cols varies with detected count so 3 tiles don't look orphaned
  // in a 5-col grid. Maps 3→3, 4→4, 5→5.
  const gridCols =
    includes.length >= 5 ? "grid-cols-5"
    : includes.length === 4 ? "grid-cols-4"
    : "grid-cols-3";

  return (
    <div className="rounded-3xl border border-tat-charcoal/8 dark:border-white/10 bg-white dark:bg-white/5 shadow-soft overflow-hidden">
      {/* Top: Tour Includes */}
      <div className="px-5 md:px-7 py-5 md:py-6 border-b border-tat-charcoal/8 dark:border-white/10">
        <p className="tt-eyebrow !text-tat-gold dark:!text-tat-gold mb-3 inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          Tour includes
        </p>
        <ul className={`grid ${gridCols} gap-3 md:gap-5`}>
          {includes.map(({ id, icon: Icon, label }) => (
            <li
              key={id}
              className="flex flex-col items-center gap-2 text-center group/include"
            >
              <span className="grid place-items-center h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-tat-gold/15 to-tat-gold/5 ring-1 ring-tat-gold/25 group-hover/include:scale-105 transition-transform">
                <Icon className="h-5 w-5 md:h-6 md:w-6 text-tat-gold dark:text-tat-gold" strokeWidth={1.8} />
              </span>
              <span className="text-[11px] md:text-[12px] font-medium text-tat-charcoal dark:text-tat-paper">
                {label}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[12px] text-tat-charcoal/60 dark:text-tat-paper/60 leading-relaxed">
          Includes the services of a Trust and Trip planner who builds your
          itinerary, books hotels and transport, and stays on WhatsApp
          throughout the trip.
        </p>
      </div>

      {/* Bottom: Tour Highlights */}
      {highlights.length > 0 && (
        <div className="px-5 md:px-7 py-5 md:py-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="font-display text-[16px] md:text-[18px] font-medium text-tat-charcoal dark:text-tat-paper">
              Tour highlights
            </p>
            {highlights.length > 6 && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-tat-gold dark:text-tat-gold hover:underline"
              >
                {expanded ? "View less" : "View more"}
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {visible.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13.5px] md:text-[14px] text-tat-charcoal/80 dark:text-tat-paper/80 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-tat-gold shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
