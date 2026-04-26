"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart, Star, Clock, MapPin, Flame, Zap, ArrowRight, Sparkles,
} from "lucide-react";
import { useState } from "react";

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
  onWishlistToggle?: (next: boolean) => void;
}

const DEAL_COLOR: Record<NonNullable<PackageCardProps["dealKind"]>, string> = {
  flash:         "bg-rose-600 text-white",
  "early-bird":  "bg-emerald-600 text-white",
  "last-minute": "bg-tat-orange text-white",
  standard:      "bg-tat-charcoal text-white",
};

export default function PackageCardUI(p: PackageCardProps) {
  const [wished, setWished] = useState(false);
  const layout = p.layout ?? "vertical";
  const compact = p.density === "compact";
  const horizontal = layout === "horizontal";

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
          "relative block overflow-hidden bg-tat-charcoal/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2",
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
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.dealTag && (
            <span className={`inline-flex items-center gap-1 ${DEAL_COLOR[p.dealKind ?? "standard"]} text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-pill`}>
              <Sparkles className="h-3 w-3" />
              {p.dealTag}
            </span>
          )}
          {p.trending && (
            <span className="inline-flex items-center gap-1 bg-tat-orange text-white text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-pill">
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
        {p.bookedThisMonth && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-tat-charcoal/70 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1 rounded-pill">
            {p.bookedThisMonth} booked this month
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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2",
          wished ? "bg-rose-600 text-white" : "bg-white/95 text-tat-charcoal/80 hover:text-rose-600",
        ].join(" ")}
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-white" : ""}`} />
      </button>

      {/* BODY */}
      <div className={`flex-1 flex flex-col ${compact ? "p-4" : "p-5 md:p-6"}`}>
        {(p.destination || p.travelStyle) && (
          <div className="flex items-center gap-2 text-tag uppercase text-tat-slate/80">
            {p.destination && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {p.destination}
              </span>
            )}
            {p.destination && p.travelStyle && <span aria-hidden>·</span>}
            {p.travelStyle && (
              <span className="bg-tat-cream-warm/30 text-tat-gold px-2 py-0.5 rounded-pill normal-case tracking-normal">
                {p.travelStyle}
              </span>
            )}
          </div>
        )}

        <h3 className={`mt-2 font-serif ${compact ? "text-h4" : "text-h3"} text-tat-charcoal leading-snug text-balance`}>
          {p.title}
        </h3>

        <div className="mt-2.5 flex items-center gap-3 text-meta text-tat-slate">
          {p.duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {p.duration}
            </span>
          )}
          {typeof p.rating === "number" && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              {p.rating}
              {p.ratingCount && <span className="text-tat-slate/80">({p.ratingCount})</span>}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-tat-charcoal/12 flex items-end justify-between gap-3">
          <div className="min-w-0">
            {p.saveAmount && p.saveAmount > 0 && (
              <p className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">
                Save ₹{p.saveAmount.toLocaleString("en-IN")}
              </p>
            )}
            <p className="font-serif text-h3 text-tat-charcoal leading-none">
              ₹{p.price.toLocaleString("en-IN")}
              <span className="text-meta font-sans text-tat-slate/80 font-normal ml-1">/ person</span>
            </p>
            {p.originalPrice && p.originalPrice > p.price && (
              <p className="text-[11px] text-tat-slate/60 line-through mt-0.5">
                ₹{p.originalPrice.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={p.href}
            className="tt-cta-alt !h-10 !px-3 !text-meta"
          >
            View details
          </Link>
          <Link
            href={p.customizeHref ?? `${p.href}?customize=1`}
            className="tt-cta !h-10 !px-3 !text-meta"
          >
            Customise
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
