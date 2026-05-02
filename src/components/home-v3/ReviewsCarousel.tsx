"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export interface NormalizedReview {
  name: string;
  location?: string;
  trip?: string;
  rating: number;
  text: string;
  image?: string;
  source: "google" | "site";
}

interface Props {
  reviews: NormalizedReview[];
}

export default function ReviewsCarousel({ reviews }: Props) {
  // Autoplay rotates a card every 4.5s. Pauses on hover (desktop) and on
  // any pointer interaction so users can dwell. Loop wraps so the rail
  // never visually "ends" — feels like a continuous wall of social proof.
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", containScroll: "trimSnaps", dragFree: false },
    [Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => {
      setSnaps(emblaApi.scrollSnapList());
      onSelect();
    });
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (!reviews.length) return null;

  return (
    <div className="mt-7">
      {/* Embla viewport — overflow-hidden is mandatory so the slider clips
          the off-screen slides instead of wrapping. */}
      <div className="overflow-hidden -mx-5 px-5 lg:mx-0 lg:px-0" ref={emblaRef}>
        <ul className="flex gap-4 lg:gap-5 items-stretch touch-pan-y">
          {reviews.map((r, i) => (
            <li
              key={`${r.source}-${i}`}
              className="shrink-0 grow-0 basis-[85%] sm:basis-[65%] md:basis-[48%] lg:basis-[38%] xl:basis-[32%] flex"
            >
              <ReviewCard review={r} />
            </li>
          ))}
        </ul>
      </div>

      {/* Controls — prev/next + dot pagination. Sit beneath the rail so
          they never compete with the cards for visual weight. */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous review"
            onClick={() => emblaApi?.scrollPrev()}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-tat-charcoal/15 bg-white text-tat-charcoal/70 hover:text-tat-charcoal hover:border-tat-charcoal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next review"
            onClick={() => emblaApi?.scrollNext()}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-tat-charcoal/15 bg-white text-tat-charcoal/70 hover:text-tat-charcoal hover:border-tat-charcoal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5" role="tablist" aria-label="Review pagination">
          {snaps.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={selected === i}
              aria-label={`Go to review ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={[
                "h-1.5 rounded-full transition-all duration-300",
                selected === i
                  ? "w-6 bg-tat-gold"
                  : "w-1.5 bg-tat-charcoal/20 hover:bg-tat-charcoal/40",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: NormalizedReview }) {
  return (
    <article className="flex h-full w-full flex-col gap-4 rounded-2xl bg-white dark:bg-tat-charcoal p-5 md:p-6 ring-1 ring-tat-charcoal/10 dark:ring-white/10 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {review.image ? (
            <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden ring-1 ring-tat-charcoal/10">
              <Image
                src={review.image}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-full bg-tat-gold/20 grid place-items-center font-display font-semibold text-tat-gold">
              {review.name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-display font-medium text-[15px] text-tat-charcoal dark:text-tat-paper truncate">
              {review.name}
            </p>
            <p className="text-[11px] text-tat-charcoal/55 dark:text-tat-paper/55 truncate">
              {review.trip ?? review.location}
            </p>
          </div>
        </div>
        <Quote className="h-5 w-5 text-tat-gold/40 shrink-0" aria-hidden />
      </div>
      <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < review.rating ? "fill-tat-gold text-tat-gold" : "text-tat-charcoal/15"}`}
          />
        ))}
      </div>
      <p className="text-[14px] leading-relaxed text-tat-charcoal/80 dark:text-tat-paper/80 line-clamp-6">
        &ldquo;{review.text}&rdquo;
      </p>
      <div className="mt-auto pt-3 border-t border-tat-charcoal/10 dark:border-white/10 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-tat-charcoal/45 dark:text-tat-paper/45">
          {review.source === "google" ? "Verified · Google" : "Customer story"}
        </span>
        <Link
          href="/reviews"
          className="text-[11px] font-semibold text-tat-gold hover:underline underline-offset-4"
        >
          More like this
        </Link>
      </div>
    </article>
  );
}
