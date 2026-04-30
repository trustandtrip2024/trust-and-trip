"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plane, Stamp } from "lucide-react";
import PackageCard, { type PackageCardProps } from "@/components/ui/PackageCard";

interface Props {
  packages: PackageCardProps[];
}

const VISA_FREE_LABELS = [
  "All", "Bali", "Thailand", "Sri Lanka", "Maldives", "Nepal",
  "Bhutan", "Vietnam", "Mauritius", "Indonesia",
];

export default function VisaFreeShelf({ packages }: Props) {
  const [active, setActive] = useState<string>("All");

  const items = useMemo(() => {
    const list = active === "All"
      ? packages
      : packages.filter((p) => (p.destination ?? "").toLowerCase().includes(active.toLowerCase()));
    return list.slice(0, 10);
  }, [packages, active]);

  if (!packages.length) return null;

  return (
    <section
      id="visa-free"
      aria-labelledby="visa-free-title"
      className="relative py-12 md:py-16 bg-tat-paper dark:bg-tat-charcoal scroll-mt-44 lg:scroll-mt-32 overflow-hidden"
    >
      {/* Subtle passport-stamp watermark */}
      <Stamp
        aria-hidden
        className="pointer-events-none absolute -top-6 -right-6 h-44 w-44 text-tat-gold/8 rotate-12"
      />

      <div className="container-custom relative">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold inline-flex items-center gap-1.5">
              <Plane className="h-3 w-3" aria-hidden />
              Skip the visa queue
            </p>
            <h2
              id="visa-free-title"
              className="mt-2 font-display font-normal text-[22px] md:text-[30px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              Visa-free escapes{" "}
              <em className="not-italic font-display italic text-tat-gold">for Indian passports.</em>
            </h2>
          </div>
          <Link
            href="/packages?theme=visa-free"
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            All visa-free trips
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Destination chips */}
        <div
          role="tablist"
          aria-label="Filter visa-free trips by destination"
          className="mt-5 -mx-5 px-5 lg:mx-0 lg:px-0 flex gap-2 overflow-x-auto no-scrollbar pb-1"
        >
          {VISA_FREE_LABELS.map((label) => {
            const isActive = label === active;
            return (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(label)}
                className={[
                  "shrink-0 inline-flex items-center px-3.5 py-1.5 rounded-pill text-[12px] font-semibold transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2",
                  isActive
                    ? "bg-tat-charcoal text-tat-paper border border-tat-charcoal"
                    : "bg-white text-tat-charcoal/80 border border-tat-charcoal/15 hover:border-tat-gold/60 hover:text-tat-gold",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>

        {items.length > 0 ? (
          <div className="mt-5 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
            <ul className="flex gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0 items-stretch">
              {items.map((p) => (
                <li
                  key={`${active}-${p.href}`}
                  className="shrink-0 snap-start flex w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[24%]"
                >
                  <div className="relative w-full">
                    {/* VISA-FREE corner stamp — diagonal, passport-style */}
                    <span
                      aria-label="Visa-free for Indian passports"
                      className="absolute z-10 top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-tat-success-fg/95 text-white text-[10px] font-bold uppercase tracking-wider shadow-md ring-2 ring-white/40 -rotate-6"
                    >
                      <Stamp className="h-3 w-3" aria-hidden />
                      Visa-free
                    </span>
                    <PackageCard {...p} density="compact" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-tat-charcoal/15 p-6 text-center">
            <p className="text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70">
              No itineraries indexed for {active} yet — try another destination.
            </p>
          </div>
        )}

        <div className="sm:hidden mt-5 text-center">
          <Link
            href="/packages?theme=visa-free"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            All visa-free trips
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
