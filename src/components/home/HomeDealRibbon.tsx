"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Gift, X } from "lucide-react";
import { analytics } from "@/lib/analytics";

const DISMISS_KEY = "tt_deal_ribbon_dismissed_v1";

interface Props {
  message?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * Site-wide promo strip rendered above the navbar.
 *
 * Earlier this component rendered `null` until a useEffect flipped a
 * `useState(false)` to true based on a localStorage check, which meant
 * every cold page load shifted the whole document down ~36px when the
 * ribbon appeared (visible CLS flicker — first-time visitors saw the
 * navbar jump on load).
 *
 * Now we render server-side by default. The pre-paint init script in
 * src/app/layout.tsx adds `html.tt-ribbon-dismissed` when localStorage
 * has the dismiss flag, and the CSS rule in globals.css hides
 * `[data-tt-ribbon]` under that class before first paint — no shift in
 * either direction.
 */
export default function HomeDealRibbon({
  message = "Plan this week — flat ₹2,000 off your first trip. 4 planner slots left.",
  ctaLabel = "Claim",
  ctaHref = "#plan",
}: Props = {}) {
  const [dismissedThisSession, setDismissedThisSession] = useState(false);

  // In-session dismiss only. The pre-paint init script handles cross-session
  // persistence, so reading localStorage here would be redundant.
  if (dismissedThisSession) return null;

  return (
    <div
      data-tt-ribbon
      role="region"
      aria-label="Site-wide promotion"
      className="bg-tat-charcoal text-white text-[12.5px] md:text-[13px]"
    >
      <div className="container-custom flex items-center gap-3 py-2">
        <Gift className="h-3.5 w-3.5 shrink-0 text-tat-orange-soft" aria-hidden />
        <p className="flex-1 truncate">
          <span className="font-semibold tracking-wide">{message}</span>
        </p>
        <Link
          href={ctaHref}
          className="hidden sm:inline-flex items-center gap-1 font-semibold text-tat-orange-soft hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange-soft focus-visible:ring-offset-2 focus-visible:ring-offset-tat-charcoal rounded-sm"
        >
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => {
            setDismissedThisSession(true);
            analytics.dealRibbonDismiss();
            try {
              localStorage.setItem(DISMISS_KEY, "1");
              document.documentElement.classList.add("tt-ribbon-dismissed");
            } catch {
              /* private mode */
            }
          }}
          aria-label="Dismiss promotion"
          className="ml-1 grid h-6 w-6 place-items-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
