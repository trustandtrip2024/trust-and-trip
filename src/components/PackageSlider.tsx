"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    skipSnaps: false,
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [snapCount, setSnapCount] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setSnapCount(emblaApi.scrollSnapList().length);
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  if (!packages.length) return null;

  const dotCount = Math.min(snapCount, 8);

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
              onClick={scrollPrev}
              disabled={!canPrev}
              aria-label="Previous packages"
              className="h-9 w-9 rounded-full border border-tat-charcoal/15 flex items-center justify-center hover:bg-tat-gold hover:border-tat-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canNext}
              aria-label="Next packages"
              className="h-9 w-9 rounded-full border border-tat-charcoal/15 flex items-center justify-center hover:bg-tat-gold hover:border-tat-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Link
            href={viewAllHref}
            aria-label={viewAllLabel}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-tat-charcoal hover:text-tat-orange transition-colors group"
          >
            <span className="hidden sm:inline">{viewAllLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Embla viewport */}
      <div
        ref={emblaRef}
        id={id}
        role="list"
        aria-label={eyebrow}
        className="overflow-hidden -mx-5 px-5 md:mx-0 md:px-0"
      >
        <div className="flex gap-4 lg:gap-5 pb-2">
          {packages.map((p, i) => (
            <div
              key={p.slug}
              role="listitem"
              className="shrink-0 w-[73vw] sm:w-[44vw] md:w-[42vw] lg:w-[calc(33.333%-11px)]"
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
                categories={p.categories}
                index={i}
                inSlider
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progress dots — 44x44 tap target wraps visible pill */}
      {dotCount > 1 && (
        <div className="mt-2 flex items-center justify-center gap-0.5 lg:hidden">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to package ${i + 1}`}
              onClick={() => scrollTo(i)}
              className="h-11 w-11 inline-flex items-center justify-center"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  selectedIndex === i ? "w-5 h-1.5 bg-tat-gold" : "w-1.5 h-1.5 bg-tat-charcoal/20"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
