"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart, Star, Clock, MapPin, Flame, Zap, ArrowRight, Sparkles,
  Hotel, Utensils, Bus, Camera,
} from "lucide-react";
import { useState } from "react";
import Price from "@/components/Price";

export interface PackageCardProps {
  image: string;
  title: string;
  href: string;
  destination?: string;
  travelStyle?: string;
  duration?: string;
  rating?: number;
  ratingCount?: number;
  price: number;
  originalPrice?: number;
  saveAmount?: number;
  customizeHref?: string;
  trending?: boolean;
  limitedSlots?: boolean;
  bookedThisMonth?: number;
  dealTag?: string;
  dealKind?: "flash" | "early-bird" | "last-minute" | "standard";
  density?: "compact" | "default";
  layout?: "vertical" | "horizontal";
  inclusions?: ("hotels" | "meals" | "transfers" | "sightseeing")[];
  onWishlistToggle?: (next: boolean) => void;
}

const DEAL_COLOR: Record<NonNullable<PackageCardProps["dealKind"]>, string> = {
  flash:         "bg-rose-600 text-white",
  "early-bird":  "bg-emerald-600 text-white",
  "last-minute": "bg-tat-orange text-white",
  standard:      "bg-tat-charcoal text-white",
};

const INCLUSION_META = {
  hotels:      { icon: Hotel,    label: "Hotels" },
  meals:       { icon: Utensils, label: "Meals" },
  transfers:   { icon: Bus,      label: "Transfers" },
  sightseeing: { icon: Camera,   label: "Sightseeing" },
} as const;

export default function PackageCardUI(p: PackageCardProps) {
  const [wished, setWished] = useState(false);
  const layout = p.layout ?? "vertical";
  const compact = p.density === "compact";
  const horizontal = layout === "horizontal";

  const inclusions = p.inclusions ?? ["hotels", "meals", "transfers", "sightseeing"];
  const discountPct =
    p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : null;

  return (
    <article
      className={[
        "tt-card group relative h-full flex overflow-hidden transition duration-200 hover:shadow-hover",
        horizontal ? "flex-col md:flex-row" : "flex-col",
      ].join(" ")}
    >
      {/* IMAGE */}
      <Link
        href={p.href}
        className={[
          "relative block overflow-hidden bg-tat-charcoal/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-burnt focus-visible:ring-offset-2",
          horizontal ? "md:w-[40%] aspect-[4/3] md:aspect-auto" : "aspect-[4/3]",
        ].join(" ")}
        aria-label={p.title}
      >
        <Image
          src={p.image}
          alt={p.title}
          fill
          sizes={horizontal ? "(max-width: 768px) 100vw, 320px" : "(max-width: 768px) 100vw, 33vw"}
          quality={70}
          className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
        />
        {/* Top-left badge stack */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.dealTag && (
            <span className={`inline-flex items-center gap-1 ${DEAL_COLOR[p.dealKind ?? "standard"]} text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-pill`}>
              <Sparkles className="h-3 w-3" />
              {p.dealTag}
            </span>
          )}
          {p.trending && (
            <span className="inline-flex items-center gap-1 bg-tat-burnt text-white text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-pill">
              <Flame className="h-3 w-3" />
              Trending
            </span>
          )}
          {p.limitedSlots && (
            <span className="inline-flex items-center gap-1 bg-tat-charcoal/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-pill">
              <Zap className="h-3 w-3" />
              Limited
            </span>
          )}
        </div>
        {/* Gradient + duration pill bottom-left */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
        {p.duration && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-white/95 text-tat-charcoal text-[11px] font-semibold px-2.5 py-1 rounded-pill shadow-card">
            <Clock className="h-3 w-3 text-tat-burnt" />
            {p.duration}
          </span>
        )}
        {p.bookedThisMonth && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-tat-charcoal/75 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1 rounded-pill">
            {p.bookedThisMonth} booked
          </span>
        )}
      </Link>

      {/* WISHLIST */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); const next = !wished; setWished(next); p.onWishlistToggle?.(next); }}
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={wished}
        className={[
          "absolute top-3 right-3 h-9 w-9 rounded-full grid place-items-center shadow-card transition duration-120",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-burnt focus-visible:ring-offset-2",
          wished ? "bg-rose-600 text-white" : "bg-white/95 text-tat-charcoal/80 hover:text-rose-600",
        ].join(" ")}
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-white" : ""}`} />
      </button>

      {/* BODY */}
      <div className={`flex-1 flex flex-col ${compact ? "p-4" : "p-4 md:p-5"}`}>
        {/* Destination + travel style */}
        {(p.destination || p.travelStyle) && (
          <div className="flex items-center gap-2 text-tag uppercase text-tat-slate/80">
            {p.destination && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 text-tat-burnt" />
                {p.destination}
              </span>
            )}
            {p.destination && p.travelStyle && <span aria-hidden className="text-tat-charcoal/30">·</span>}
            {p.travelStyle && (
              <span className="bg-tat-burnt/10 text-tat-burnt px-2 py-0.5 rounded-pill normal-case tracking-normal font-medium">
                {p.travelStyle}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3
          title={p.title}
          className={`mt-2 font-display font-normal ${compact ? "text-h4" : "text-h3"} text-tat-charcoal leading-snug text-balance line-clamp-2`}
        >
          {p.title}
        </h3>

        {/* Rating */}
        {typeof p.rating === "number" && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-meta">
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[11px] font-semibold">
              <Star className="h-3 w-3 fill-white" />
              {p.rating.toFixed(1)}
            </span>
            {p.ratingCount && (
              <span className="text-tat-slate">({p.ratingCount.toLocaleString("en-IN")} reviews)</span>
            )}
          </div>
        )}

        {/* Inclusions strip */}
        <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-meta text-tat-charcoal/75">
          {inclusions.map((id) => {
            const meta = INCLUSION_META[id];
            const Icon = meta.icon;
            return (
              <li key={id} className="inline-flex items-center gap-1">
                <Icon className="h-3.5 w-3.5 text-tat-teal" />
                {meta.label}
              </li>
            );
          })}
        </ul>

        {/* Price block */}
        <div className="mt-4 pt-3 border-t border-tat-charcoal/10">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              {p.originalPrice && p.originalPrice > p.price && (
                <p className="text-[12px] text-tat-slate/70 leading-none">
                  <Price inr={p.originalPrice} className="line-through" />
                  {discountPct !== null && (
                    <span className="ml-1.5 text-emerald-700 font-semibold">
                      {discountPct}% off
                    </span>
                  )}
                </p>
              )}
              <p className="mt-1 font-display text-h2 text-tat-charcoal leading-none">
                <Price inr={p.price} />
                <span className="text-meta font-sans text-tat-slate font-normal ml-1">/ person</span>
              </p>
              {p.saveAmount && p.saveAmount > 0 && (
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-emerald-700 font-semibold">
                  Save <Price inr={p.saveAmount} />
                </p>
              )}
            </div>
          </div>
          <p className="mt-1 text-[11px] text-tat-slate/70">+ taxes &amp; fees</p>
        </div>

        {/* CTAs */}
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href={p.href}
            className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-pill bg-tat-teal hover:bg-tat-teal-deep text-white font-semibold text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-burnt focus-visible:ring-offset-2"
          >
            View details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={p.customizeHref ?? `${p.href}?customize=1`}
            className="inline-flex items-center justify-center gap-1.5 h-9 text-meta font-medium text-tat-charcoal/80 hover:text-tat-burnt transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-burnt focus-visible:ring-offset-2 rounded-md"
          >
            Customise this trip
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
