"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, X } from "lucide-react";

const DISMISS_KEY = "tt_quiz_pill_dismissed_v1";
const SHOW_AFTER_PX = 600;

/**
 * Mobile-only floating pill that nudges visitors towards the trip-finder
 * quiz once they've scrolled past the hero. Sits above the MobileBottomNav
 * (which is fixed bottom-0 z-50, h-16). Dismiss persists in localStorage.
 */
export default function MobileQuizPill() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(true); // start hidden; flips after mount

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
    setDismissed(isDismissed);

    if (isDismissed) return;

    const onScroll = () => {
      setShow(window.scrollY > SHOW_AFTER_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function dismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
    setShow(false);
  }

  if (dismissed || !show) return null;

  return (
    <div
      className="lg:hidden fixed inset-x-0 z-40 px-4 pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 76px)" }}
    >
      <Link
        href="/quiz"
        className="pointer-events-auto group flex items-center justify-between gap-2 rounded-pill bg-tat-charcoal text-tat-paper shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] ring-1 ring-tat-gold/40 px-4 py-2.5 animate-slide-up"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="grid place-items-center h-7 w-7 rounded-full bg-tat-gold text-tat-charcoal shrink-0">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="flex flex-col leading-tight min-w-0">
            <span className="text-[12px] uppercase tracking-[0.16em] text-tat-gold/90 font-semibold">
              60-sec quiz
            </span>
            <span className="text-body-sm font-medium truncate">
              Find the trip that fits you
            </span>
          </span>
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss quiz pill"
            className="ml-1 grid place-items-center h-7 w-7 rounded-full text-tat-paper/55 hover:text-tat-paper hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      </Link>
    </div>
  );
}
