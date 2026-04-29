"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, ArrowRight, ChevronUp, Tag, Users, Clock } from "lucide-react";
import Link from "next/link";
import { captureIntent } from "@/lib/capture-intent";
import Price from "./Price";

interface Props {
  price: number;
  title: string;
  slug: string;
  duration: string;
  /** Sanity comparePrice — only set when verified savings vs aggregator. */
  originalPrice?: number;
  /** Sanity limitedSlots flag. */
  limitedSlots?: boolean;
  /** Real enquiries this month from Supabase package-stats. */
  enquiredCount?: number;
  /** ISO of the next fixed-departure batch — drives "Next batch" pill. */
  nextDepartureDate?: string;
  /** Slots left in that next batch (ops-updated). */
  nextDepartureSlots?: number;
}

const WA = "918115999588";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/**
 * Mobile sticky pricing + booking bar. Lives at the bottom of every
 * package detail page on small viewports. Replaces the generic site
 * MobileBottomNav (which skips /packages/* paths).
 *
 * Real-data only — no synthetic discounts, no hash-based fake promo
 * ribbons. The promo strip renders ONLY when one of the following is
 * backed by content or analytics:
 *   1. comparePrice (Sanity) → genuine "Save ₹X · Y% vs aggregators"
 *   2. nextDepartureDate (Sanity) → "Next batch · 12 Aug · 3 slots left"
 *   3. limitedSlots flag (Sanity) → "Limited slots — book early"
 *   4. enquiredCount > 15 (Supabase) → "X enquired this month"
 * Otherwise the strip is skipped and the bar collapses to a single row.
 *
 * Visual hierarchy:
 *   - Price block (left): from + duration + price + per-person clarifier
 *   - WhatsApp (small icon, secondary channel)
 *   - Book CTA (primary, gold, dominant width)
 *   - Back-to-top (ghost)
 */
export default function PackageStickyBar({
  price, title, slug, duration, originalPrice,
  limitedSlots, enquiredCount, nextDepartureDate, nextDepartureSlots,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide the floating WhatsApp + Aria chat bubbles while this bar is visible
  // — they overlap on mobile and dilute the primary CTA.
  useEffect(() => {
    document.documentElement.classList.toggle("pkg-sticky-active", visible);
    return () => document.documentElement.classList.remove("pkg-sticky-active");
  }, [visible]);

  const promo = useMemo(
    () => pickRealPromo({ price, originalPrice, limitedSlots, enquiredCount, nextDepartureDate, nextDepartureSlots }),
    [price, originalPrice, limitedSlots, enquiredCount, nextDepartureDate, nextDepartureSlots],
  );

  const waUrl = `https://wa.me/${WA}?text=${encodeURIComponent(
    `Hi Trust and Trip! 🙏\n\nI'd like to book the *${title}* package (₹${price.toLocaleString("en-IN")}/person · ${duration}).\n\nPlease help me proceed.`
  )}`;

  if (!visible) return null;

  const hasSavings = !!originalPrice && originalPrice > price;
  const savings = hasSavings ? originalPrice! - price : 0;
  const savingsPct = hasSavings ? Math.round((savings / originalPrice!) * 100) : 0;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="bg-white/95 dark:bg-tat-charcoal/95 backdrop-blur-xl border-t border-tat-charcoal/10 dark:border-white/10 shadow-[0_-12px_32px_rgba(45,30,15,0.18)] rounded-t-2xl">
        {/* Real-only promo strip. Hidden when no real data backs a claim. */}
        {promo && (
          <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-white ${promo.bg}`}>
            <promo.Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{promo.label}</span>
          </div>
        )}

        {/* Pricing + actions row */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          {/* Pricing block */}
          <div className="flex-1 min-w-0">
            <p className="text-[9.5px] uppercase tracking-[0.14em] text-tat-charcoal/55 dark:text-tat-paper/55">
              From · {duration}
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display text-[19px] font-semibold text-tat-charcoal dark:text-tat-paper leading-none">
                <Price inr={price} />
              </span>
              {hasSavings && (
                <span className="text-[12px] line-through text-tat-charcoal/40 dark:text-tat-paper/40 leading-none">
                  ₹{originalPrice!.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-tat-charcoal/55 dark:text-tat-paper/55">
              per person · twin sharing
              {hasSavings && (
                <span className="ml-1.5 font-semibold text-tat-orange">· save {savingsPct}%</span>
              )}
            </p>
          </div>

          {/* WhatsApp — small icon, secondary channel */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            onClick={() =>
              captureIntent("whatsapp_click", {
                package_title: title,
                package_slug: slug,
                note: "Sticky bar · WhatsApp",
              })
            }
            className="shrink-0 grid place-items-center h-11 w-11 rounded-full bg-whatsapp text-white shadow-[0_4px_12px_-4px_rgba(37,211,102,0.55)] active:scale-95 transition"
          >
            <MessageCircle className="h-[18px] w-[18px] fill-white text-white" />
          </a>

          {/* Book — primary, dominant pill */}
          <Link
            href={`/customize-trip?package=${slug}`}
            onClick={() =>
              captureIntent("book_now_click", {
                package_title: title,
                package_slug: slug,
                note: `Sticky bar · ₹${price.toLocaleString("en-IN")} · ${duration}`,
              })
            }
            className="flex-[1.3] inline-flex items-center justify-center gap-1.5 h-11 px-3.5 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-[13px] shadow-[0_4px_14px_-4px_rgba(200,147,42,0.65)] active:scale-[0.98] transition whitespace-nowrap"
          >
            Get itinerary
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Back-to-top — small ghost button */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="shrink-0 grid place-items-center h-11 w-9 rounded-full text-tat-charcoal/55 dark:text-tat-paper/55 hover:text-tat-charcoal dark:hover:text-tat-paper transition-colors"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Real-data promo selection ────────────────────────────────────────────

interface Promo {
  label: string;
  bg: string;
  Icon: typeof Tag;
}

interface PromoInputs {
  price: number;
  originalPrice?: number;
  limitedSlots?: boolean;
  enquiredCount?: number;
  nextDepartureDate?: string;
  nextDepartureSlots?: number;
}

/**
 * Returns null when nothing real backs a promo claim. Priority order:
 *   1. Real comparePrice savings (highest signal — money on table)
 *   2. Next-batch with low slots (concrete urgency)
 *   3. limitedSlots flag (general urgency, still real)
 *   4. High enquiry count (real social proof from Supabase)
 */
function pickRealPromo(i: PromoInputs): Promo | null {
  // 1. Real savings vs aggregator price.
  if (i.originalPrice && i.originalPrice > i.price) {
    const savings = i.originalPrice - i.price;
    const pct = Math.round((savings / i.originalPrice) * 100);
    return {
      label: `Save ₹${savings.toLocaleString("en-IN")} · ${pct}% vs OTAs`,
      bg: "bg-tat-orange",
      Icon: Tag,
    };
  }

  // 2. Next fixed-departure batch — date with optional slots-left urgency.
  if (i.nextDepartureDate) {
    const d = new Date(i.nextDepartureDate);
    if (!Number.isNaN(d.getTime()) && d.getTime() > Date.now()) {
      const date = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
      const lowSlots = typeof i.nextDepartureSlots === "number" && i.nextDepartureSlots > 0 && i.nextDepartureSlots <= 4;
      return lowSlots
        ? {
            label: `Next batch · ${date} · only ${i.nextDepartureSlots} slot${i.nextDepartureSlots === 1 ? "" : "s"} left`,
            bg: "bg-tat-orange",
            Icon: Clock,
          }
        : {
            label: typeof i.nextDepartureSlots === "number"
              ? `Next batch · ${date} · ${i.nextDepartureSlots} slots open`
              : `Next batch · ${date}`,
            bg: "bg-tat-charcoal",
            Icon: Clock,
          };
    }
  }

  // 3. Sanity limitedSlots flag — content-team-confirmed scarcity.
  if (i.limitedSlots) {
    return {
      label: "Limited slots — book early",
      bg: "bg-tat-orange",
      Icon: Clock,
    };
  }

  // 4. Real enquiry social proof — only when meaningful (>=15 in 30d).
  if (typeof i.enquiredCount === "number" && i.enquiredCount >= 15) {
    return {
      label: `${i.enquiredCount} enquired this month`,
      bg: "bg-tat-charcoal",
      Icon: Users,
    };
  }

  return null;
}
