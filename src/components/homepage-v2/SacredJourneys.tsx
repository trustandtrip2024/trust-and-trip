"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { Package } from "@/lib/data";

interface Props {
  /** Pass `getPilgrimPackages()` result from a server page; falls back to a built-in
   *  list when the prop is omitted (e.g. previewing the section in isolation). */
  packages?: Package[];
}

// Static fallback used only when no Sanity packages are passed in.
// TODO: drop entirely once Sanity is the single source of truth.
const FALLBACK: Package[] = [];

export default function SacredJourneys({ packages = FALLBACK }: Props) {
  const yatras = packages;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const scrollTo   = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    setSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => setSnaps(emblaApi.scrollSnapList()));
    onSelect();
  }, [emblaApi]);

  if (yatras.length === 0) return null;

  return (
    <section aria-label="Sacred Journeys" className="bg-[#fbf6ec] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 inline-block bg-tat-orange-soft/70 px-2 py-1 text-xs font-semibold uppercase tracking-wider">
              Sacred Journeys
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-tat-charcoal sm:text-4xl md:text-5xl">
              Char Dham, Kedarnath &{" "}
              <span className="italic text-tat-gold">Devbhumi yatras.</span>
            </h2>
            <p className="mt-4 text-tat-slate">
              Fully arranged pilgrimages by road or helicopter — registration,
              transfers, and stay included.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/destinations/uttarakhand"
              className="hidden items-center gap-2 text-sm font-medium text-tat-charcoal hover:text-tat-gold md:inline-flex"
            >
              All yatra packages <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                aria-label="Previous slide"
                className="grid h-10 w-10 place-items-center rounded-full border border-tat-charcoal/20 bg-white transition hover:bg-tat-cream/40 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
                disabled={selected === 0}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next slide"
                className="grid h-10 w-10 place-items-center rounded-full border border-tat-charcoal/20 bg-white transition hover:bg-tat-cream/40 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
                disabled={selected >= snaps.length - 1}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {yatras.map((y, idx) => (
              <Link
                key={y.slug}
                href={`/packages/${y.slug}`}
                className="group relative flex min-w-0 shrink-0 grow-0 basis-[88%] flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-tat-charcoal/15 transition hover:shadow-lg sm:basis-[48%] lg:basis-[32%] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-tat-charcoal/15">
                  {y.image && (
                    <Image
                      src={y.image}
                      alt={y.title}
                      fill
                      sizes="(max-width:640px) 90vw, (max-width:1024px) 48vw, 32vw"
                      priority={idx === 0}
                      loading={idx === 0 ? "eager" : "lazy"}
                      quality={70}
                      className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                    />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-tat-charcoal backdrop-blur">
                    {y.duration}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="text-lg font-semibold leading-snug text-tat-charcoal">
                    {y.title}
                  </h3>
                  {y.description && (
                    <p className="line-clamp-2 text-sm text-tat-slate">
                      {y.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-end justify-between pt-2">
                    <div>
                      <div className="text-xl font-semibold text-tat-gold">
                        ₹{y.price.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-tat-slate/80">/ person</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-tat-charcoal group-hover:text-tat-gold">
                      View <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="mt-6 flex justify-center gap-2">
          {snaps.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === selected ? "w-8 bg-tat-orange" : "w-3 bg-tat-charcoal/20"
              }`}
            />
          ))}
        </div>

        <Link
          href="/destinations/uttarakhand"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-tat-charcoal hover:text-tat-gold md:hidden"
        >
          All yatra packages <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
