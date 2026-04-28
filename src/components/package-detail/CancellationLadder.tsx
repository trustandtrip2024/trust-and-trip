"use client";

import { useState } from "react";
import { CalendarClock, ChevronDown, Phone, Info } from "lucide-react";
import Link from "next/link";

interface Props {
  /** Tour price per person, used to compute deduction amounts. */
  price: number;
  /** ISO date string of the planned departure (yyyy-mm-dd). */
  departureDate?: string;
}

/**
 * Sliding cancellation policy ladder. Each tier shows the days-prior
 * window, the percentage deducted, and the resulting rupee amount based
 * on the per-person price. The active tier (the one matching today's
 * date if a departureDate is supplied) is auto-highlighted.
 *
 * Better than the Veena reference because:
 *  • The price-per-person flows through; users see ₹ figures immediately.
 *  • The current window is auto-highlighted (no math required).
 *  • Mobile keeps tiers stacked; desktop renders an accent rail.
 */

interface Tier {
  pct: number;
  daysFrom: number;
  daysTo: number;
}

const DEFAULT_TIERS: Tier[] = [
  { pct: 10,  daysFrom: 121, daysTo: 900 },
  { pct: 15,  daysFrom: 91,  daysTo: 120 },
  { pct: 20,  daysFrom: 61,  daysTo: 90  },
  { pct: 30,  daysFrom: 46,  daysTo: 60  },
  { pct: 40,  daysFrom: 31,  daysTo: 45  },
  { pct: 50,  daysFrom: 16,  daysTo: 30  },
  { pct: 75,  daysFrom: 6,   daysTo: 15  },
  { pct: 100, daysFrom: 0,   daysTo: 5   },
];

function formatINR(amount: number): string {
  return amount.toLocaleString("en-IN");
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function isoToReadable(iso?: string): string {
  if (!iso) return "your departure";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return "your departure";
  }
}

export default function CancellationLadder({ price, departureDate }: Props) {
  const [tiersOpen, setTiersOpen] = useState(false);

  // Identify the active tier based on today + departure window.
  const today = new Date();
  let activeIdx = -1;
  if (departureDate) {
    const dep = new Date(departureDate);
    const days = daysBetween(today, dep);
    activeIdx = DEFAULT_TIERS.findIndex((t) => days >= t.daysFrom && days <= t.daysTo);
  }

  return (
    <div className="rounded-3xl border border-tat-charcoal/8 dark:border-white/10 bg-white dark:bg-white/5 shadow-soft overflow-hidden">
      {/* Top: tour price + departure context */}
      <div className="px-5 md:px-7 py-5 md:py-6 border-b border-tat-charcoal/8 dark:border-white/10">
        <p className="tt-eyebrow !text-tat-burnt dark:!text-tat-gold mb-1.5 inline-flex items-center gap-2">
          <CalendarClock className="h-3.5 w-3.5" />
          Cancellation policy &amp; payment terms
        </p>
        <p className="font-display text-[20px] md:text-[22px] font-medium text-tat-charcoal dark:text-tat-paper leading-tight">
          Tour price · ₹{formatINR(price)}
          <span className="text-tat-charcoal/55 dark:text-tat-paper/55 text-[15px] md:text-[16px] font-normal">
            {" "}/ per person on twin sharing
          </span>
        </p>
        <p className="mt-1.5 text-[13px] text-tat-charcoal/65 dark:text-tat-paper/70 leading-relaxed">
          Departure: <strong>{isoToReadable(departureDate)}</strong>. The
          cancellation deduction depends on how close to departure you cancel
          — the closer to the date, the larger the slab.{" "}
          <Link
            href="/cancellation-policy"
            className="text-tat-burnt dark:text-tat-gold underline underline-offset-2 hover:no-underline"
          >
            Read the full policy
          </Link>
        </p>
      </div>

      {/* Tier ladder */}
      <ol className="divide-y divide-tat-charcoal/6 dark:divide-white/8">
        {DEFAULT_TIERS.map((t, i) => {
          const amount = Math.round((price * t.pct) / 100);
          const active = i === activeIdx;
          const visible = tiersOpen || i < 3 || active;
          if (!visible) return null;

          return (
            <li
              key={t.pct}
              className={`relative flex items-center gap-4 px-5 md:px-7 py-3.5 md:py-4 ${
                active ? "bg-tat-burnt/5 dark:bg-tat-gold/8" : ""
              }`}
            >
              <span
                aria-hidden
                className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                  active
                    ? "bg-tat-burnt dark:bg-tat-gold"
                    : t.pct >= 75
                      ? "bg-red-500"
                      : t.pct >= 40
                        ? "bg-amber-500"
                        : t.pct >= 20
                          ? "bg-yellow-500"
                          : "bg-green-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-display text-[18px] md:text-[20px] font-semibold text-tat-charcoal dark:text-tat-paper leading-none">
                  ₹{formatINR(amount)}
                  <span className="ml-2 text-[12px] font-normal text-tat-charcoal/55 dark:text-tat-paper/55">
                    ({t.pct}% deduction)
                  </span>
                </p>
                <p className="mt-1 text-[13px] text-tat-charcoal/70 dark:text-tat-paper/70">
                  {t.daysFrom === t.daysTo
                    ? `${t.daysFrom} days prior`
                    : `${t.daysFrom}–${t.daysTo} days prior`}
                </p>
              </div>
              {active && (
                <span className="hidden sm:inline-flex shrink-0 items-center gap-1 px-2.5 py-1 rounded-full bg-tat-burnt text-white text-[11px] font-semibold">
                  Current window
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Toggle to expand all tiers */}
      <button
        type="button"
        onClick={() => setTiersOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-tat-charcoal/8 dark:border-white/10 text-[13px] font-semibold text-tat-burnt dark:text-tat-gold hover:bg-tat-cream-warm/40 dark:hover:bg-white/5 transition-colors"
      >
        {tiersOpen ? "Show fewer slabs" : "View all cancellation slabs"}
        <ChevronDown className={`h-4 w-4 transition-transform ${tiersOpen ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {/* Help footer */}
      <div className="px-5 md:px-7 py-4 bg-tat-cream-warm/40 dark:bg-white/5 border-t border-tat-charcoal/8 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[13px] text-tat-charcoal/70 dark:text-tat-paper/75 inline-flex items-center gap-2">
          <Info className="h-4 w-4 text-tat-burnt dark:text-tat-gold" />
          Need to change or cancel? We&apos;ll handle it.
        </p>
        <a
          href="tel:+918115999588"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tat-charcoal text-tat-paper text-[13px] font-semibold hover:bg-tat-burnt transition-colors"
        >
          <Phone className="h-4 w-4" />
          Call +91 8115 999 588
        </a>
      </div>
    </div>
  );
}
