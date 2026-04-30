"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import RecentItineraryCard from "@/components/ui/RecentItineraryCard";
import { RECENT_ITINERARIES, type RecentItinerary } from "@/data/recentItineraries";

type ScopeId = "all" | "week";

const TABS: { id: ScopeId; label: string }[] = [
  { id: "all",  label: "All recent" },
  { id: "week", label: "This week" },
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
}

function isWithinWeek(timeAgo: string): boolean {
  const lower = timeAgo.toLowerCase();
  if (lower.includes("hour")) return true;
  const dayMatch = lower.match(/(\d+)\s*day/);
  if (dayMatch) return parseInt(dayMatch[1], 10) <= 7;
  return false;
}

export default function RecentlyCraftedSection({
  eyebrow = "Recently crafted",
  titleStart = "Real itineraries,",
  titleItalic = "fresh off the road.",
  lede = "143 trips planned this month. Tap any one — we'll build you something similar in 24 hours.",
}: Props = {}) {
  const [scope, setScope] = useState<ScopeId>("all");

  const items = useMemo<RecentItinerary[]>(() => {
    const base = scope === "week"
      ? RECENT_ITINERARIES.filter((i) => isWithinWeek(i.timeAgo))
      : RECENT_ITINERARIES;
    return base.slice(0, 12);
  }, [scope]);

  const totalThisMonth = RECENT_ITINERARIES.length;

  return (
    <section aria-labelledby="recent-title" className="py-16 md:py-24">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-[1480px]">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

          {/* Live activity pill — pairs with header to make the feed feel alive. */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tat-orange/10 ring-1 ring-tat-orange/25 text-tat-charcoal"
            aria-label={`${totalThisMonth} trips planned this month`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-tat-success-bg0 animate-ping opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-tat-success-bg0" />
            </span>
            <span className="text-meta">
              <span className="font-semibold tnum">{totalThisMonth}+</span>{" "}
              <span className="text-tat-slate">trips this month</span>
            </span>
          </div>
        </div>

        {/* Two-tab scope toggle — replaces 7-chip filter. Less choice, faster glance. */}
        <div className="mt-6 flex items-center gap-1 p-1 rounded-full bg-tat-paper ring-1 ring-tat-charcoal/10 w-fit">
          {TABS.map((t) => {
            const active = t.id === scope;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setScope(t.id)}
                aria-pressed={active}
                className={`px-4 py-1.5 rounded-full text-body-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-tat-charcoal text-white shadow-sm"
                    : "text-tat-charcoal/70 hover:text-tat-charcoal"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {items.length === 0 ? (
          <p className="mt-10 text-body text-tat-slate">
            No itineraries crafted in this window yet — switch to “All recent” to see the rest.
          </p>
        ) : (
          <div className="mt-8 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
            <ul className="flex gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="shrink-0 snap-start w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[30%]"
                >
                  <RecentItineraryCard
                    firstName={it.firstName}
                    city={it.city}
                    timeAgo={it.timeAgo}
                    tripStyle={it.tripStyle}
                    nights={it.nights}
                    primaryDestination={it.primaryDestination}
                    otherDestinationsCount={it.otherDestinationsCount}
                    price={it.price}
                    plannerName={it.plannerName}
                    href={it.href}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/packages?sort=recent"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-charcoal hover:text-tat-gold transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            See all recent itineraries
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-tag uppercase text-tat-slate/70">
            {items.length} of {totalThisMonth} shown
          </p>
        </div>
      </div>
    </section>
  );
}
