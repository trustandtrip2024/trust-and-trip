"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Shared classlist for every home-rail <li>. Single source of truth so
 * card widths can't drift between shelves. Apply on the <li> wrapping
 * each PackageCard inside a ShelfRail.
 */
export const HOME_RAIL_ITEM =
  "shrink-0 snap-start flex w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[24%]";

interface Props {
  /** Accessible label for the carousel region (e.g. shelf eyebrow). */
  ariaLabel: string;
  /** The list of cards. Pass already-rendered <li> children. */
  children: React.ReactNode;
}

/**
 * Reusable horizontal-scroll rail with prev/next buttons, keyboard
 * arrow navigation, and a tiny page indicator. Wraps any shelf of
 * cards on the homepage.
 *
 * Why this and not Embla: keeps cards as native DOM with snap scrolling,
 * which means screen readers and keyboard users get standard tab order
 * + focus visibility for free. Embla virtualises and traps focus in
 * ways that hurt accessibility on a marketing page.
 *
 * Behaviour:
 *  - Buttons paginate by ~85% of the rail's visible width.
 *  - Arrow keys navigate when focus is inside the rail (or on the rail
 *    itself). Buttons are not native input controls so we don't break
 *    form keyboard semantics.
 *  - aria-roledescription="carousel" so AT users hear the right pattern.
 *  - prefers-reduced-motion: scroll behaviour swaps from smooth to auto.
 */
export default function ShelfRail({ ariaLabel, children }: Props) {
  const railRef = useRef<HTMLUListElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  const updateState = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 4);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 4);
    const totalPages = Math.max(1, Math.ceil(scrollWidth / clientWidth));
    const currentPage = Math.min(totalPages, Math.round(scrollLeft / clientWidth) + 1);
    setPageCount(totalPages);
    setPage(currentPage);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    updateState();
    el.addEventListener("scroll", updateState, { passive: true });
    const ro = new ResizeObserver(updateState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateState);
      ro.disconnect();
    };
  }, [updateState]);

  const scrollByPage = useCallback((dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: dir * Math.round(el.clientWidth * 0.85),
      behavior: reduce ? "auto" : "smooth",
    });
  }, []);

  const onKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByPage(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByPage(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      railRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    } else if (e.key === "End") {
      e.preventDefault();
      const el = railRef.current;
      if (el) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    }
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className="relative"
    >
      {/* Desktop prev/next buttons sit absolute over the rail. Hidden on
          touch devices to leave more room for scroll inertia. */}
      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        disabled={!canPrev}
        aria-label="Show previous packages"
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-card border border-tat-charcoal/10 items-center justify-center text-tat-charcoal hover:bg-tat-gold hover:text-white hover:border-tat-gold transition disabled:opacity-0 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        disabled={!canNext}
        aria-label="Show more packages"
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-card border border-tat-charcoal/10 items-center justify-center text-tat-charcoal hover:bg-tat-gold hover:text-white hover:border-tat-gold transition disabled:opacity-0 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>

      <ul
        ref={railRef}
        tabIndex={0}
        onKeyDown={onKey}
        aria-label={`${ariaLabel} — use left and right arrow keys to navigate`}
        className="flex gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0 items-stretch overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-4 rounded-xl"
      >
        {children}
      </ul>

      {/* Live page indicator — desktop, polite. Mobile users get the
          scroll-by-touch affordance + dot count visually. */}
      <p
        className="hidden md:block absolute -top-7 right-0 text-[11px] font-medium text-tat-charcoal/55 tabular-nums"
        aria-live="polite"
        aria-atomic="true"
      >
        {page} / {pageCount}
      </p>
    </div>
  );
}
