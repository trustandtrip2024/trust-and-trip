"use client";

import { useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import PackageCard from "./PackageCard";
import type { Package } from "@/lib/data";

interface Props {
  eyebrow: string;
  heading: string;
  headingItalic?: string;
  packages: Package[];
  viewAllHref?: string;
  viewAllLabel?: string;
  id: string;
}

export default function PackageSlider({
  eyebrow,
  heading,
  headingItalic,
  packages,
  viewAllHref = "/packages",
  viewAllLabel = "View all",
  id,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-card]") as HTMLElement | null;
    const cardW = card ? card.offsetWidth + 16 : 300;
    scrollRef.current.scrollBy({ left: dir === "left" ? -cardW : cardW, behavior: "smooth" });
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-card]") as HTMLElement | null;
    const cardW = card ? card.offsetWidth + 16 : 300;
    const idx = Math.round(scrollRef.current.scrollLeft / cardW);
    setActiveIndex(idx);
  }, []);

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
          {/* Arrow buttons — tablet+ */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              aria-label="Previous packages"
              className="h-9 w-9 rounded-full border border-ink/15 flex items-center justify-center hover:bg-gold hover:border-gold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next packages"
              className="h-9 w-9 rounded-full border border-ink/15 flex items-center justify-center hover:bg-gold hover:border-gold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold transition-colors group"
            aria-label={viewAllLabel}
          >
            <span className="hidden sm:inline">{viewAllLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Slider — shows ~1.35 cards on mobile, ~2.1 on tablet, 3 on desktop */}
      <div
        ref={scrollRef}
        id={id}
        role="list"
        aria-label={eyebrow}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-1"
      >
        {packages.map((p, i) => (
          <div
            key={p.slug}
            role="listitem"
            data-card
            className="snap-start shrink-0 w-[73vw] sm:w-[44vw] md:w-[42vw] lg:w-[calc(33.333%-14px)]"
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
              index={i}
            />
          </div>
        ))}
      </div>

      {/* Scroll progress dots — mobile/tablet */}
      <div className="mt-4 flex items-center justify-center gap-1.5 lg:hidden">
        {Array.from({ length: dotCount }).map((_, i) => (
          <button
            key={i}
            aria-label={`Go to package ${i + 1}`}
            onClick={() => {
              if (!scrollRef.current) return;
              const card = scrollRef.current.querySelector("[data-card]") as HTMLElement | null;
              const cardW = card ? card.offsetWidth + 16 : 300;
              scrollRef.current.scrollTo({ left: i * cardW, behavior: "smooth" });
              setActiveIndex(i);
            }}
            className={`rounded-full transition-all duration-300 ${
              activeIndex === i
                ? "w-5 h-1.5 bg-gold"
                : "w-1.5 h-1.5 bg-ink/20 hover:bg-ink/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
