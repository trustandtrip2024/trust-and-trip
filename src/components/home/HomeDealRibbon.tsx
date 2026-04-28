"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Gift, X } from "lucide-react";

const DISMISS_KEY = "tt_deal_ribbon_dismissed_v1";

interface Props {
  message?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function HomeDealRibbon({
  message = "Plan this week — flat ₹2,000 off your first trip. 4 planner slots left.",
  ctaLabel = "Claim",
  ctaHref = "#plan",
}: Props = {}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(DISMISS_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  return (
    <div
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
            setOpen(false);
            try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* private mode */ }
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
