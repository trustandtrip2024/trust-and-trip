"use client";

import { useState } from "react";
import { Plane, Crown, Phone, Sparkles } from "lucide-react";

type TabId = "flight" | "seats" | "hotel";

const TABS: { id: TabId; label: string; icon: typeof Plane; blurb: string; bullets: string[] }[] = [
  {
    id: "flight",
    label: "Flight upgrade",
    icon: Plane,
    blurb: "Want luxury at minimum cost?",
    bullets: [
      "Business / First class on the entire route",
      "Premium-economy on long-haul legs only — saves up to 40%",
      "Lounge access at originating + connecting airports",
      "Priority boarding, extra checked bags",
    ],
  },
  {
    id: "seats",
    label: "Prime seats",
    icon: Crown,
    blurb: "Pre-pick the right seats.",
    bullets: [
      "Window or aisle on every leg, by name",
      "Front-row / extra-legroom seats reserved at booking",
      "Family seating block (up to 6) guaranteed adjacent",
      "Bassinet / SSR seats where supported by airline",
    ],
  },
  {
    id: "hotel",
    label: "Stay upgrade",
    icon: Sparkles,
    blurb: "Wake up somewhere better.",
    bullets: [
      "Room upgrade to suite or premium ocean-view (subject to availability)",
      "Late checkout till 4 PM",
      "Honeymoon set-up: flowers, cake, private dinner",
      "Daily breakfast + select-night dinner included",
    ],
  },
];

/**
 * Upgrade options exposed as tabs. Replaces the Veena-style "Flight Upgrade
 * / Prime Seats" two-tab block with a richer three-tab layout including
 * stay upgrades. Each tab shows a benefits checklist + a single contact CTA
 * since pricing varies per departure.
 */
export default function UpgradesTabs() {
  const [active, setActive] = useState<TabId>("flight");
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <div className="rounded-3xl border border-tat-charcoal/8 dark:border-white/10 bg-white dark:bg-white/5 shadow-soft overflow-hidden">
      <div className="px-5 md:px-7 pt-5 md:pt-6">
        <p className="tt-eyebrow !text-tat-gold dark:!text-tat-gold mb-1.5">
          Upgrades available
        </p>
        <p className="font-display text-[20px] md:text-[22px] font-medium text-tat-charcoal dark:text-tat-paper leading-tight">
          Want luxury?{" "}
          <em className="not-italic font-display italic text-tat-gold dark:text-tat-gold">
            Add it at minimum cost.
          </em>
        </p>
      </div>

      {/* Tab bar */}
      <div role="tablist" aria-label="Upgrade options" className="mt-4 px-3 md:px-5 flex gap-1 border-b border-tat-charcoal/8 dark:border-white/10 overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = active === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(t.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-3 text-[13px] font-semibold border-b-2 transition-colors ${
                on
                  ? "border-tat-gold dark:border-tat-gold text-tat-charcoal dark:text-tat-paper"
                  : "border-transparent text-tat-charcoal/55 dark:text-tat-paper/55 hover:text-tat-charcoal dark:hover:text-tat-paper"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="px-5 md:px-7 py-5 md:py-6">
        <p className="text-[14px] text-tat-charcoal/75 dark:text-tat-paper/75 mb-4">
          {tab.blurb}
        </p>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {tab.bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-[13.5px] text-tat-charcoal/85 dark:text-tat-paper/85 leading-relaxed"
            >
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-tat-gold shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 md:px-7 py-4 bg-tat-cream-warm/40 dark:bg-white/5 border-t border-tat-charcoal/8 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[12.5px] text-tat-charcoal/65 dark:text-tat-paper/70">
          Pricing depends on the departure date, airline and hotel inventory.
          Speak to a planner for an exact quote.
        </p>
        <a
          href="tel:+918115999588"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tat-charcoal text-tat-paper text-[13px] font-semibold hover:bg-tat-teal transition-colors shrink-0"
        >
          <Phone className="h-4 w-4" />
          Talk to a planner
        </a>
      </div>
    </div>
  );
}
