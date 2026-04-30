"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";

interface Props {
  category: string;
  postTitle: string;
}

/**
 * Mid-article conversion card. Drops between paragraphs after the reader
 * is invested but before they finish — peak intent moment to surface a
 * planner CTA. Style is editorial (not banner-ad) so it doesn't break the
 * read flow.
 */
export default function BlogPostInlineCTA({ category, postTitle }: Props) {
  const { open: openPlanner } = useTripPlanner();

  function askAria() {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(
        "tt_aria_text_preload",
        `I'm reading "${postTitle}". Can you suggest a trip inspired by this — keep it ${category.toLowerCase()}-themed?`
      );
    } catch {}
    window.dispatchEvent(new CustomEvent("tt:aria-open"));
  }

  return (
    <aside
      role="complementary"
      aria-label="Plan a trip inspired by this article"
      className="my-10 rounded-3xl bg-gradient-to-br from-tat-cream-warm/60 via-tat-paper to-tat-cream-warm/30 ring-1 ring-tat-gold/25 p-6 md:p-7"
    >
      <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-tat-gold inline-flex items-center gap-1.5">
        <Sparkles className="h-3 w-3" />
        Inspired to go?
      </p>
      <h3 className="mt-2 font-display text-[20px] md:text-[24px] font-medium text-tat-charcoal leading-tight text-balance">
        Plan a {category.toLowerCase()} trip{" "}
        <span className="italic font-display font-light text-tat-gold">
          shaped around this story.
        </span>
      </h3>
      <p className="mt-2 text-[13px] md:text-[14px] text-tat-charcoal/65 max-w-xl leading-relaxed">
        A real planner drafts your itinerary in 24 hours. ₹0 to start, free
        changes for 48 h after we send it.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={() => openPlanner()}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-tat-teal hover:bg-tat-teal-deep text-white text-[13px] font-semibold"
        >
          Get a free quote
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={askAria}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-tat-gold/15 hover:bg-tat-gold/25 text-tat-gold text-[13px] font-semibold"
        >
          <Sparkles className="h-4 w-4" />
          Ask Aria for ideas
        </button>
      </div>
    </aside>
  );
}
