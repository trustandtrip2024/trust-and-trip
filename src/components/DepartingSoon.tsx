"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Users, ArrowRight, Zap } from "lucide-react";
import type { Package } from "@/lib/data";

// Generate deterministic upcoming departure dates per package
function getNextDepartures(slug: string): string[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const offsets = [
    (hash % 7) + 3,
    (hash % 7) + 10,
    (hash % 7) + 17,
  ];
  return offsets.map((days) => {
    const d = new Date(base);
    d.setDate(base.getDate() + days);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  });
}

function getSeatsLeft(slug: string): number {
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (hash % 8) + 2; // 2–9
}

interface Props {
  packages: Package[];
}

export default function DepartingSoon({ packages }: Props) {
  const shown = packages.slice(0, 6);
  if (!shown.length) return null;

  return (
    <section className="py-10 md:py-12 bg-ink text-cream">
      <div className="container-custom">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium">Live Availability</p>
              <h2 className="font-display text-xl md:text-2xl font-medium text-cream">
                Departing soon — seats filling fast
              </h2>
            </div>
          </div>
          <Link href="/packages" className="hidden md:inline-flex items-center gap-1.5 text-sm text-cream/60 hover:text-gold transition-colors shrink-0">
            All packages <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Horizontal scroll strip */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-proximity scroll-smooth no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-1"
          style={{ WebkitOverflowScrolling: "touch" }}>
          {shown.map((pkg) => {
            const dates = getNextDepartures(pkg.slug);
            const seats = getSeatsLeft(pkg.slug);
            const urgent = seats <= 4;

            return (
              <Link
                key={pkg.slug}
                href={`/packages/${pkg.slug}`}
                className="snap-start shrink-0 w-[72vw] sm:w-[44vw] md:w-[300px] bg-white/8 hover:bg-white/12 border border-white/10 hover:border-gold/40 rounded-2xl overflow-hidden group transition-all duration-200"
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 72vw, 300px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                  {urgent && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500/90 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                      <Zap className="h-2.5 w-2.5" />
                      Only {seats} seats left
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-1">{pkg.destinationName}</p>
                  <h3 className="font-display text-sm font-medium text-cream leading-tight line-clamp-2 mb-3">
                    {pkg.title}
                  </h3>

                  {/* Departure dates */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <CalendarDays className="h-3 w-3 text-cream/40 shrink-0" />
                    <div className="flex gap-1.5 flex-wrap">
                      {dates.map((d) => (
                        <span key={d} className="text-[10px] bg-white/10 text-cream/80 px-2 py-0.5 rounded-full">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-cream/50 text-[10px]">
                      <Users className="h-3 w-3" />
                      {urgent ? (
                        <span className="text-red-400 font-medium">{seats} seats left</span>
                      ) : (
                        <span>{seats} seats left</span>
                      )}
                    </div>
                    <p className="font-display text-base font-medium text-gold">
                      ₹{pkg.price.toLocaleString("en-IN")}
                      <span className="text-[10px] text-cream/40 font-sans ml-0.5">/pp</span>
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
