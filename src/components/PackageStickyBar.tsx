"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Flame, Sparkles, Tag, ArrowRight, ChevronUp } from "lucide-react";
import Link from "next/link";
import { captureIntent } from "@/lib/capture-intent";
import Price from "./Price";

interface Props {
  price: number;
  title: string;
  slug: string;
  duration: string;
  /** Optional original price for strikethrough + savings calc. */
  originalPrice?: number;
}

const WA = "918115999588";

/**
 * Mobile sticky pricing + booking bar that lives at the bottom of every
 * package detail page. Replaces the generic site bottom-nav on these
 * routes (`MobileBottomNav` skips /packages/* paths).
 *
 * Visual hierarchy:
 *  1. Promo strip — rotates between "Saving on package", "Flash deal" and
 *     "Special edition" so the bar always communicates value, not just
 *     price. Pseudo-deterministic per package slug so reloads don't churn.
 *  2. Pricing block — strikethrough original + live INR + savings %.
 *  3. Book CTA — primary, gold, full pill width.
 *  4. WhatsApp button — small icon-only (the secondary channel; the
 *     primary action is the Book button).
 */
export default function PackageStickyBar({
  price, title, slug, duration, originalPrice,
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

  const promo = useMemo(() => pickPromo(slug, price, originalPrice), [slug, price, originalPrice]);

  const waUrl = `https://wa.me/${WA}?text=${encodeURIComponent(
    `Hi Trust and Trip! 🙏\n\nI'd like to book the *${title}* package (₹${price.toLocaleString("en-IN")}/person · ${duration}).\n\nPlease help me proceed.`
  )}`;

  if (!visible) return null;

  const savings =
    originalPrice && originalPrice > price ? originalPrice - price : 0;
  const savingsPct =
    originalPrice && originalPrice > price
      ? Math.round((savings / originalPrice) * 100)
      : 0;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Outer wrapper: refined tray with rounded top, soft shadow, blur. */}
      <div className="bg-white/95 dark:bg-tat-charcoal/95 backdrop-blur-xl border-t border-tat-charcoal/10 dark:border-white/10 shadow-[0_-12px_32px_rgba(45,30,15,0.18)] rounded-t-2xl">
        {/* Promo strip */}
        <div
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white ${promo.bg}`}
        >
          <promo.Icon className="h-3.5 w-3.5" aria-hidden />
          <span className="truncate">{promo.label}</span>
        </div>

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
              {originalPrice && originalPrice > price && (
                <span className="text-[12px] line-through text-tat-charcoal/40 dark:text-tat-paper/40 leading-none">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[10px] text-tat-charcoal/50 dark:text-tat-paper/55">
              per person, twin sharing
              {savingsPct > 0 && (
                <span className="ml-1.5 font-semibold text-tat-gold dark:text-tat-gold">
                  · save {savingsPct}%
                </span>
              )}
            </p>
          </div>

          {/* WhatsApp — small icon button, secondary channel */}
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
            className="shrink-0 grid place-items-center h-11 w-11 rounded-full bg-[#25D366] text-white shadow-[0_4px_12px_-4px_rgba(37,211,102,0.55)] active:scale-95 transition"
          >
            <MessageCircle className="h-4.5 w-4.5 fill-white text-white" />
          </a>

          {/* Book — primary, full pill, gold */}
          <Link
            href={`/customize-trip?package=${slug}`}
            onClick={() =>
              captureIntent("book_now_click", {
                package_title: title,
                package_slug: slug,
                note: `Sticky bar · ₹${price.toLocaleString("en-IN")} · ${duration}`,
              })
            }
            className="flex-[1.2] inline-flex items-center justify-center gap-1.5 h-11 px-3.5 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-[13px] shadow-[0_4px_14px_-4px_rgba(200,147,42,0.65)] active:scale-[0.98] transition whitespace-nowrap"
          >
            Book now
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

// ─── Promo selection ──────────────────────────────────────────────────────

interface Promo {
  label: string;
  bg: string;
  Icon: typeof Flame;
}

/**
 * Pick a promo strip variant. If the package has a meaningful saving on
 * file, lead with that — that's the most concrete value proposition.
 * Otherwise, rotate between flash / special-edition / sale based on a
 * stable hash of the slug so the same package always shows the same
 * label across reloads.
 */
function pickPromo(slug: string, price: number, originalPrice?: number): Promo {
  if (originalPrice && originalPrice > price) {
    const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
    return {
      label: `Saving ₹${(originalPrice - price).toLocaleString("en-IN")} · ${pct}% off`,
      bg: "bg-tat-orange",
      Icon: Tag,
    };
  }

  const hash = [...slug].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
  const variants: Promo[] = [
    {
      label: "Flash deal · ends soon",
      bg: "bg-gradient-to-r from-red-600 to-rose-500",
      Icon: Flame,
    },
    {
      label: "Special edition departure",
      bg: "bg-tat-gold",
      Icon: Sparkles,
    },
    {
      label: "Limited slots · book early",
      bg: "bg-gradient-to-r from-amber-600 to-tat-gold",
      Icon: Tag,
    },
  ];
  return variants[hash % variants.length];
}
