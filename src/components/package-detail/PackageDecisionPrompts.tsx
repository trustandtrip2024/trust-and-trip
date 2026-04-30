"use client";

import { Sparkles, ArrowRight } from "lucide-react";

interface Props {
  destinationName: string;
  packageTitle: string;
  travelType: string;
  /** First month already classified as "peak" by the CMS. Falls back to May. */
  bestMonthHint?: string;
}

/**
 * One-tap "Aria-prompts" — high-intent questions a real shopper has but
 * doesn't always type. Each tap drops a pre-baked message into Aria so
 * we surface helpfulness instead of waiting for the user to articulate.
 *
 * Sits between the planner card and the inclusions block.
 */
export default function PackageDecisionPrompts({
  destinationName, packageTitle, travelType, bestMonthHint,
}: Props) {
  const monthHint = bestMonthHint || "May";

  const prompts: { label: string; question: string }[] = [
    {
      label: `Is ${monthHint} a good month?`,
      question: `Is ${monthHint} a good month for "${packageTitle}" in ${destinationName}? Weather, crowds, prices?`,
    },
    {
      label: travelType === "Family" ? "Toddler-friendly?" : `${travelType} vibe?`,
      question: travelType === "Family"
        ? `We're a family with a toddler. Is "${packageTitle}" toddler-friendly — pace, hotels, food?`
        : `Tell me what the ${travelType.toLowerCase()} vibe is on "${packageTitle}". Is it laid-back or packed?`,
    },
    {
      label: "Veg/Jain food options?",
      question: `Are there vegetarian and Jain food options on "${packageTitle}" in ${destinationName}? Hotels and on-trip meals?`,
    },
    {
      label: "Customise this trip?",
      question: `Can we customise "${packageTitle}" — add a day, change a hotel, swap an activity?`,
    },
    {
      label: "Hidden costs?",
      question: `What are the hidden costs on "${packageTitle}"? Tips, taxes, optional activities — give me the honest list.`,
    },
    {
      label: "Best time to book?",
      question: `When's the best time to book "${packageTitle}" for the best price?`,
    },
  ];

  function ask(q: string) {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem("tt_aria_text_preload", q);
    } catch {}
    window.dispatchEvent(new CustomEvent("tt:aria-open"));
  }

  return (
    <section className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
        <div>
          <span className="eyebrow inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-tat-gold" />
            Ask before you book
          </span>
          <h2 className="heading-section mt-2 text-balance">
            Six questions{" "}
            <span className="italic text-tat-gold font-light">
              we hear most.
            </span>
          </h2>
          <p className="mt-2 text-[13px] text-tat-charcoal/65 max-w-xl">
            Tap one and Aria answers. Or chat with a real planner — both work.
          </p>
        </div>
      </div>

      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {prompts.map((p) => (
          <li key={p.label}>
            <button
              type="button"
              onClick={() => ask(p.question)}
              className="group w-full text-left flex items-center justify-between gap-3 rounded-2xl bg-tat-paper hover:bg-white border border-tat-charcoal/8 hover:border-tat-gold/40 transition-colors px-4 py-3.5"
            >
              <span className="text-[13.5px] md:text-[14px] font-medium text-tat-charcoal leading-snug">
                {p.label}
              </span>
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tat-gold/10 text-tat-gold group-hover:bg-tat-gold group-hover:text-white transition-colors">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
