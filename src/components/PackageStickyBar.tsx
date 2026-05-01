"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MessageCircle, ArrowRight, ChevronUp, Tag, Users, Clock, Star,
  ShieldCheck,
} from "lucide-react";
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
 * package detail page on small viewports.
 *
 * Real-data only — no synthetic discounts, no hash-based fake promo
 * ribbons. The promo strip renders ONLY when one of the following is
 * backed by content or analytics:
 *   1. comparePrice (Sanity) → genuine "Save ₹X · Y% vs aggregators"
 *   2. nextDepartureDate (Sanity) → "Next batch · 12 Aug · 3 slots left"
 *   3. limitedSlots flag (Sanity) → "Limited slots — book early"
 *   4. enquiredCount > 15 (Supabase) → "X enquired this month"
 * Otherwise the strip falls back to a quiet rating + travelers trust line.
 *
 * Polish notes:
 *   - Promo strip uses an animated pulse dot, not a marquee, so motion
 *     doesn't feel cheap.
 *   - Gold CTA gets a soft shimmer keyframe via inline style + Tailwind
 *     fade — subtle, not a flashing button.
 *   - Price typography reads bigger; savings collapses into a gold pill
 *     rather than free-floating text.
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
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden animate-slide-up-soft"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Outer wrapper — gradient hairline at top, stronger shadow,
          rounded shoulders. Backdrop-blur intensified for depth. */}
      <div className="relative bg-tat-paper/95 dark:bg-tat-charcoal/95 backdrop-blur-2xl border-t border-tat-charcoal/10 dark:border-white/10 shadow-[0_-18px_40px_rgba(45,30,15,0.22)] rounded-t-[20px]">
        {/* Top hairline — subtle gold-to-charcoal gradient. Reads as a
            "premium edge" on the bar. */}
        <span
          aria-hidden
          className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-tat-gold/50 to-transparent"
        />

        {/* PROMO STRIP — animated pulse dot when real urgency is on. */}
        {promo ? (
          <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em] text-white ${promo.bg}`}>
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
              <span className="absolute inset-0 rounded-full bg-white/70 animate-ping opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <promo.Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{promo.label}</span>
          </div>
        ) : (
          // FALLBACK trust strip — rating + travelers when no urgency
          // claim is backed by data. Stays honest; never fakes a deal.
          <div className="flex items-center justify-center gap-3 px-3 py-1.5 bg-tat-cream-warm/50 dark:bg-tat-charcoal/60 text-[10.5px] font-medium text-tat-charcoal/70 dark:text-tat-paper/70">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-tat-gold text-tat-gold" aria-hidden />
              <strong className="font-semibold text-tat-charcoal dark:text-tat-paper">4.9</strong>
              <span>· 8k+ travelers</span>
            </span>
            <span className="h-3 w-px bg-tat-charcoal/15 dark:bg-tat-paper/15" aria-hidden />
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-tat-gold" aria-hidden />
              <span>₹0 to start · 48h free changes</span>
            </span>
          </div>
        )}

        {/* MAIN ROW — price + WhatsApp + CTA + back-to-top */}
        <div className="flex items-center gap-2 px-3 pt-2.5 pb-2.5">
          {/* PRICE BLOCK */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-tat-charcoal/50 dark:text-tat-paper/50 font-semibold">
                From
              </span>
              <span className="text-[10px] text-tat-charcoal/45 dark:text-tat-paper/45">
                · {duration}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
              <span className="font-display text-[22px] font-semibold text-tat-charcoal dark:text-tat-paper leading-none tabular-nums">
                <Price inr={price} />
              </span>
              {hasSavings && (
                <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded-full bg-tat-orange/15 text-tat-orange text-[10px] font-semibold leading-none">
                  <Tag className="h-2.5 w-2.5" aria-hidden />
                  −{savingsPct}%
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-tat-charcoal/55 dark:text-tat-paper/55 truncate">
              per person · twin sharing
              {hasSavings && (
                <>
                  {" "}
                  <span className="line-through text-tat-charcoal/35 dark:text-tat-paper/35">
                    ₹{originalPrice!.toLocaleString("en-IN")}
                  </span>
                </>
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
            className="shrink-0 grid place-items-center h-12 w-12 rounded-full bg-whatsapp text-white shadow-[0_6px_16px_-4px_rgba(37,211,102,0.55)] active:scale-95 transition"
          >
            <MessageCircle className="h-[19px] w-[19px] fill-white text-white" />
          </a>

          {/* Primary CTA — gold pill with shimmer + label + subtext.
              Two-line stack so the secondary "free · 2 mins" reduces
              perceived friction without taking another row. */}
          <Link
            href={`/customize-trip?package=${slug}`}
            onClick={() =>
              captureIntent("book_now_click", {
                package_title: title,
                package_slug: slug,
                note: `Sticky bar · ₹${price.toLocaleString("en-IN")} · ${duration}`,
              })
            }
            className="relative overflow-hidden flex-[1.4] inline-flex items-center justify-center gap-2 h-12 px-3 rounded-full bg-gradient-to-r from-tat-gold via-tat-gold to-tat-gold/85 text-tat-charcoal font-semibold text-[13px] shadow-[0_8px_22px_-6px_rgba(200,147,42,0.7)] active:scale-[0.97] transition whitespace-nowrap group"
          >
            {/* Shimmer overlay — subtle gold sheen sweeping across the
                CTA every few seconds. animate-tt-shimmer keyframe lives
                in tailwind.config.js; pointer-events-none so it never
                eats taps. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-tt-shimmer"
            />
            <span className="relative flex flex-col items-center leading-none">
              <span className="flex items-center gap-1">
                Get free quote
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="text-[9px] font-medium opacity-75 mt-0.5 tracking-wide">
                Free · 2 mins
              </span>
            </span>
          </Link>

          {/* Back-to-top — small ghost button */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="shrink-0 grid place-items-center h-12 w-7 rounded-full text-tat-charcoal/50 dark:text-tat-paper/50 hover:text-tat-charcoal dark:hover:text-tat-paper transition-colors"
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
      bg: "bg-gradient-to-r from-tat-orange to-tat-orange/85",
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
            bg: "bg-gradient-to-r from-tat-orange to-tat-orange/85",
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
      bg: "bg-gradient-to-r from-tat-orange to-tat-orange/85",
      Icon: Clock,
    };
  }

  // 4. Real enquiry social proof — only when meaningful (>=15 in 30d).
  if (typeof i.enquiredCount === "number" && i.enquiredCount >= 15) {
    return {
      label: `${i.enquiredCount} travelers enquired this month`,
      bg: "bg-tat-charcoal",
      Icon: Users,
    };
  }

  return null;
}
