"use client";

import { Minus, Plus, Sparkles } from "lucide-react";

interface Props {
  packageTitle: string;
  /** Nights from Sanity. When unknown, the row hides the +/- variants. */
  nights?: number;
}

/**
 * Tiny row of trip-length variants under the hero. Click "Shorter" or
 * "Longer" → fires a window event that the PackageCustomize block
 * listens for, prefills the planner-callback with a duration tweak,
 * and scrolls the form into view.
 *
 * Decoupled via custom event so we don't have to lift state from the
 * PackageCustomize section all the way up. Both components live on the
 * same package detail page so the listener fires reliably.
 */
export default function PackageDurationVariants({ packageTitle, nights }: Props) {
  if (!nights || nights < 2) return null;

  const shorter = Math.max(1, nights - 2);
  const longer = nights + 2;

  const fire = (delta: number, target: number) => {
    const verb = delta > 0 ? "stretch this to" : "trim this to";
    const message = `Hi — I'd like ${packageTitle} but ${verb} ${target} nights instead of ${nights}. Please share a revised itinerary + price.`;
    window.dispatchEvent(
      new CustomEvent("tat:customize-prefill", {
        detail: { key: "add-day", message },
      }),
    );
  };

  return (
    <div className="bg-tat-cream/50 border-b border-tat-charcoal/8">
      <div className="container-custom py-3 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-charcoal/55 shrink-0">
          <Sparkles className="h-3 w-3 text-tat-gold" />
          Flex it
        </span>
        <button
          type="button"
          onClick={() => fire(-2, shorter)}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-tat-charcoal/15 bg-white px-3.5 py-1.5 text-xs font-medium text-tat-charcoal hover:border-tat-gold hover:bg-tat-gold/5 transition-colors"
        >
          <Minus className="h-3 w-3 text-tat-charcoal/55" />
          {shorter}-night version
        </button>
        <span className="shrink-0 inline-flex items-center rounded-full bg-tat-charcoal text-tat-paper px-3.5 py-1.5 text-xs font-semibold">
          {nights} nights · current
        </span>
        <button
          type="button"
          onClick={() => fire(+2, longer)}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-tat-charcoal/15 bg-white px-3.5 py-1.5 text-xs font-medium text-tat-charcoal hover:border-tat-gold hover:bg-tat-gold/5 transition-colors"
        >
          <Plus className="h-3 w-3 text-tat-charcoal/55" />
          {longer}-night version
        </button>
        <span className="shrink-0 text-[11px] text-tat-charcoal/55">
          We rework hotels + price for the new length.
        </span>
      </div>
    </div>
  );
}
