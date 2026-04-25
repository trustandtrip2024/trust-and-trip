"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

type Yatra = {
  href: string;
  title: string;
  duration: string;
  price: string;
  blurb: string;
  image: string;
};

const YATRAS: Yatra[] = [
  {
    href: "/packages/uttarakhand-kedarnath-trek-4n5d",
    title: "Kedarnath Yatra 4N/5D Trek — Ex Haridwar",
    duration: "4 Nights / 5 Days",
    price: "₹18,000",
    blurb: "The Kedarnath yatra by trek from Haridwar — the traditional way.",
    image: "/images/yatra/kedarnath-trek.jpg",
  },
  {
    href: "/packages/uttarakhand-dodham-road-6n7d",
    title: "Do Dham Yatra 6N/7D — Kedarnath & Badrinath by Road",
    duration: "6 Nights / 7 Days",
    price: "₹35,000",
    blurb: "The two most powerful shrines of the Char Dham in 7 days.",
    image: "/images/yatra/dodham-road.jpg",
  },
  {
    href: "/packages/uttarakhand-chardham-road-11n12d",
    title: "Char Dham Yatra 11N/12D by Road — Ex Delhi",
    duration: "11 Nights / 12 Days",
    price: "₹48,000",
    blurb: "The complete Char Dham Yatra by road from Delhi.",
    image: "/images/yatra/chardham-road.jpg",
  },
  {
    href: "/packages/uttarakhand-chardham-haridwar-9n10d",
    title: "Char Dham Yatra 9N/10D by Road — Ex Haridwar",
    duration: "9 Nights / 10 Days",
    price: "₹50,000",
    blurb: "Shorter and more focused than the Delhi route.",
    image: "/images/yatra/chardham-haridwar.jpg",
  },
  {
    href: "/packages/uttarakhand-kedarnath-heli-2n3d",
    title: "Kedarnath by Helicopter 2N/3D — Premium Quick Yatra",
    duration: "2 Nights / 3 Days",
    price: "₹55,000",
    blurb: "15-minute flight from Phata helipad covers the 16km trek.",
    image: "/images/yatra/kedarnath-heli.jpg",
  },
  {
    href: "/packages/uttarakhand-chardham-helicopter-5n6d",
    title: "Char Dham Yatra 5N/6D by Helicopter — Premium Ex Dehradun",
    duration: "5 Nights / 6 Days",
    price: "₹2,20,000",
    blurb: "All four sacred shrines without the long road journey.",
    image: "/images/yatra/chardham-heli.jpg",
  },
];

export default function SacredJourneys() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });

  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi]
  );
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

  return (
    <section
      aria-label="Sacred Journeys"
      className="bg-[#fbf6ec] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 inline-block bg-amber-300/70 px-2 py-1 text-xs font-semibold uppercase tracking-wider">
              Sacred Journeys
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
              Char Dham, Kedarnath &{" "}
              <span className="italic text-amber-700">Devbhumi yatras.</span>
            </h2>
            <p className="mt-4 text-slate-600">
              Fully arranged pilgrimages by road or helicopter — registration,
              transfers, and stay included.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/destinations/uttarakhand"
              className="hidden items-center gap-2 text-sm font-medium text-slate-900 hover:text-amber-700 md:inline-flex"
            >
              All yatra packages <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                aria-label="Previous slide"
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white transition hover:bg-slate-100 disabled:opacity-40"
                disabled={selected === 0}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={scrollNext}
                aria-label="Next slide"
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white transition hover:bg-slate-100 disabled:opacity-40"
                disabled={selected === snaps.length - 1}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {YATRAS.map((y, idx) => (
              <Link
                key={y.href}
                href={y.href}
                className="group relative flex min-w-0 shrink-0 grow-0 basis-[88%] flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-lg sm:basis-[48%] lg:basis-[32%]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={y.image}
                    alt={y.title}
                    fill
                    sizes="(max-width:640px) 90vw, (max-width:1024px) 48vw, 32vw"
                    priority={idx === 0}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-800 backdrop-blur">
                    {y.duration}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="text-lg font-semibold leading-snug text-slate-900">
                    {y.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-slate-600">
                    {y.blurb}
                  </p>

                  <div className="mt-auto flex items-end justify-between pt-2">
                    <div>
                      <div className="text-xl font-semibold text-amber-700">
                        {y.price}
                      </div>
                      <div className="text-xs text-slate-500">/ person</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-900 group-hover:text-amber-700">
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
                i === selected ? "w-8 bg-amber-600" : "w-3 bg-slate-300"
              }`}
            />
          ))}
        </div>

        <Link
          href="/destinations/uttarakhand"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-amber-700 md:hidden"
        >
          All yatra packages <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
