"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Plane, Map } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { DESTINATIONS_BY_DURATION, type DurationId } from "@/data/destinationsByDuration";

interface DurationTileMeta {
  id: DurationId;
  label: string;
  tagline: string;
  icon: typeof Calendar;
}

const DURATIONS: DurationTileMeta[] = [
  { id: "long-weekend", label: "Long weekend",  tagline: "2–3 nights. Fly Friday, back Sunday.", icon: Clock },
  { id: "3-5",          label: "3–5 days",       tagline: "Short break, no jet lag. India, mostly.", icon: Calendar },
  { id: "6-9",          label: "6–9 days",       tagline: "The sweet spot. International is open.", icon: Plane },
  { id: "10+",          label: "10+ days",       tagline: "The full holiday. Multi-country welcome.", icon: Map },
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  tightTop?: boolean;
}

function DurationTile({ meta }: { meta: DurationTileMeta }) {
  const matches = DESTINATIONS_BY_DURATION.filter((d) => d.durations.includes(meta.id));
  const heroImage = matches[0]?.image ?? "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=75";
  const sampleDestinations = matches.slice(0, 3);
  const totalCount = matches.length;
  const minPrice = matches.length > 0 ? Math.min(...matches.map((m) => m.priceFrom)) : 0;
  const Icon = meta.icon;

  return (
    <Link
      href={`/packages?duration=${meta.id}`}
      aria-label={`Trips that fit a ${meta.label.toLowerCase()}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-tat-charcoal ring-1 ring-tat-charcoal/10 shadow-soft hover:shadow-soft-lg transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[5/6] md:aspect-[16/9] lg:aspect-[4/3] xl:aspect-[3/2]">
        <Image
          src={heroImage}
          alt=""
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 23vw"
          quality={70}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal via-tat-charcoal/55 to-tat-charcoal/15" />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/15 backdrop-blur-sm text-white ring-1 ring-white/20">
            <Icon className="h-4 w-4" />
          </span>
          {totalCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-tat-gold text-tat-charcoal text-[11px] font-bold">
              {totalCount} {totalCount === 1 ? "trip" : "trips"}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
          <h3 className="font-display font-medium text-h3 leading-tight">
            {meta.label}
          </h3>
          <p className="mt-1 text-body-sm text-white/75 leading-snug line-clamp-2">
            {meta.tagline}
          </p>

          {/* Sample destination chips — small avatars + names. */}
          {sampleDestinations.length > 0 && (
            <ul className="mt-3 flex items-center gap-2">
              {sampleDestinations.map((d) => (
                <li
                  key={d.id}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/12 backdrop-blur-sm text-[11px] text-white/90"
                >
                  <span
                    className="relative h-4 w-4 rounded-full overflow-hidden bg-white/20 shrink-0"
                    aria-hidden
                  >
                    <Image
                      src={d.image}
                      alt=""
                      fill
                      sizes="16px"
                      className="object-cover"
                    />
                  </span>
                  <span className="truncate max-w-[80px]">{d.name}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
            {minPrice > 0 ? (
              <p className="text-[11px] text-white/65">
                from <span className="font-semibold text-white tnum">₹{minPrice.toLocaleString("en-IN")}</span>
              </p>
            ) : <span />}
            <span className="inline-flex items-center gap-1 text-body-sm font-semibold text-tat-gold group-hover:translate-x-0.5 transition-transform duration-200">
              Browse
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PackagesByDurationSection({
  eyebrow = "Browse by length",
  titleStart = "How long do you have?",
  titleItalic = "We'll fit it in.",
  lede,
  tightTop = false,
}: Props = {}) {
  return (
    <section
      aria-labelledby="duration-title"
      className={`${tightTop ? "pt-4 md:pt-6 pb-16 md:pb-24" : "py-16 md:py-24"} bg-tat-paper`}
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-[1480px]">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        {/* 4 large duration tiles. 1-col mobile, 2-col sm/md, 4-col lg.
            Replaces chip+rail with photo-led portals — same browse intent,
            shown not chosen. */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {DURATIONS.map((meta) => (
            <DurationTile key={meta.id} meta={meta} />
          ))}
        </div>
      </div>
    </section>
  );
}
