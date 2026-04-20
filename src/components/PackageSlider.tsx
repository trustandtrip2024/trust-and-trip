"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import PackageCard from "./PackageCard";
import type { Package } from "@/lib/data";

interface Props {
  eyebrow: string;
  heading: string;
  packages: Package[];
  viewAllHref?: string;
  viewAllLabel?: string;
  id: string;
}

export default function PackageSlider({
  eyebrow,
  heading,
  packages,
  viewAllHref = "/packages",
  viewAllLabel = "View all",
  id,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const cardWidthRef = useRef(300);

  // Measure card width once and keep it updated on resize
  useEffect(() => {
    const measure = () => {
      const card = scrollRef.current?.querySelector("[data-card]") as HTMLElement | null;
      if (card) cardWidthRef.current = card.offsetWidth + 16;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const updateState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / cardWidthRef.current);
    setActiveIndex(idx);
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateState, { passive: true });
    updateState();
    return () => el.removeEventListener("scroll", updateState);
  }, [updateState]);

  const scrollTo = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -cardWidthRef.current : cardWidthRef.current, behavior: "smooth" });
  };

  const scrollToIndex = (i: number) => {
    scrollRef.current?.scrollTo({ left: i * cardWidthRef.current, behavior: "smooth" });
  };

  if (!packages.length) return null;

  const dotCount = Math.min(packages.length, 8);

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2
            className="heading-section mt-2 max-w-xs md:max-w-lg text-balance"
            dangerouslySetInnerHTML={{ __html: heading }}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scrollTo("left")}
              disabled={!canLeft}
              aria-label="Previous packages"
              className="h-9 w-9 rounded-full border border-ink/15 flex items-center justify-center hover:bg-gold hover:border-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollTo("right")}
              disabled={!canRight}
              aria-label="Next packages"
              className="h-9 w-9 rounded-full border border-ink/15 flex items-center justify-center hover:bg-gold hover:border-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold transition-colors group"
          >
            <span className="hidden sm:inline">{viewAllLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Slider */}
      <div
        ref={scrollRef}
        id={id}
        role="list"
        aria-label={eyebrow}
        className="flex gap-4 overflow-x-auto snap-x snap-proximity scroll-smooth no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-2"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {packages.map((p, i) => (
          <div
            key={p.slug}
            role="listitem"
            data-card
            className="snap-start shrink-0 w-[73vw] sm:w-[44vw] md:w-[42vw] lg:w-[calc(33.333%-11px)]"
          >
            <PackageCard
              title={p.title}
              slug={p.slug}
              image={p.image}
              duration={p.duration}
              price={p.price}
              rating={p.rating}
              reviews={p.reviews}
              destinationName={p.destinationName}
              travelType={p.travelType}
              trending={p.trending}
              limitedSlots={p.limitedSlots}
              highlights={p.highlights}
              inclusions={p.inclusions}
              index={i}
              inSlider
            />
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="mt-4 flex items-center justify-center gap-1.5 lg:hidden">
        {Array.from({ length: dotCount }).map((_, i) => (
          <button
            key={i}
            aria-label={`Go to package ${i + 1}`}
            onClick={() => scrollToIndex(i)}
            className={`rounded-full transition-all duration-300 ${
              activeIndex === i ? "w-5 h-1.5 bg-gold" : "w-1.5 h-1.5 bg-ink/20 hover:bg-ink/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
