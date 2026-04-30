"use client";

import { Sparkles, MessageCircle } from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";

interface Props {
  destinationName: string;
  destinationSlug: string;
  priceFrom: number;
}

export default function DestinationMobileCTA({ destinationName, destinationSlug, priceFrom }: Props) {
  const { open: openPlanner } = useTripPlanner();

  function askAria() {
    if (typeof window === "undefined") return;
    const msg = `I'm looking at ${destinationName}. What's the best time to go, ideal duration, and how should I budget?`;
    try {
      window.sessionStorage.setItem("tt_aria_text_preload", msg);
    } catch {}
    window.dispatchEvent(new CustomEvent("tt:aria-open"));
  }

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-tat-charcoal/10 bg-tat-paper/95 dark:bg-tat-charcoal/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="container-custom py-3 flex items-center gap-3">
        {priceFrom > 0 && (
          <div className="hidden xs:block sm:block min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-tat-charcoal/55">From</p>
            <p className="text-[14px] font-semibold text-tat-charcoal dark:text-tat-paper truncate">
              ₹{priceFrom.toLocaleString("en-IN")}
              <span className="text-[10px] font-normal text-tat-charcoal/55 ml-1">/ person</span>
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={askAria}
          aria-label={`Ask Aria about ${destinationName}`}
          className="shrink-0 inline-flex items-center justify-center gap-1.5 h-11 px-3 rounded-full bg-tat-gold/15 text-tat-gold text-[13px] font-semibold"
        >
          <MessageCircle className="h-4 w-4" />
          Ask Aria
        </button>
        <button
          type="button"
          onClick={() => openPlanner({ destinationName })}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 rounded-full bg-tat-teal text-white text-[13px] font-semibold shadow-[0_8px_20px_-8px_rgba(14,124,123,0.55)]"
        >
          <Sparkles className="h-4 w-4" />
          Plan {destinationName}
        </button>
      </div>
    </div>
  );
}
