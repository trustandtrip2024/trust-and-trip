"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart, Star, Clock, MapPin, Flame, Zap, ArrowRight, Sparkles,
  Hotel, Utensils, Bus, Camera, MessageCircle, CreditCard,
  ShieldCheck, RotateCcw, BadgeIndianRupee,
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
  flash:         "bg-tat-orange text-white",
  "early-bird":  "bg-tat-teal text-white",
  "last-minute": "bg-tat-orange text-white",
  standard:      "bg-tat-charcoal text-white",
};

const INCLUSION_META = {
  hotels:      { icon: Hotel,    label: "Hotels" },
  meals:       { icon: Utensils, label: "Meals" },
  transfers:   { icon: Bus,      label: "Transfers" },
  sightseeing: { icon: Camera,   label: "Sightseeing" },
} as const;

// Open Aria pre-primed with this card's package context. Mirrors the
// PackageAriaPreload pattern used on /packages/{slug} so Aria's system
// prompt picks up "user is viewing this package" from sessionStorage and
// the welcome greeting names the package by title.
function askAriaAboutPackage(p: PackageCardProps) {
  if (typeof window === "undefined") return;
  const slug = p.href.replace(/^\/packages\//, "").replace(/\/.*$/, "");
  if (!slug) return;
  const preload = {
    slug,
    title: p.title,
    destinationName: p.destination ?? "",
    price: p.price,
    duration: p.duration ?? "",
    travelType: p.travelStyle ?? "",
  };
  try {
    window.sessionStorage.setItem("tt_aria_package_preload", JSON.stringify(preload));
    window.dispatchEvent(new CustomEvent("tt:aria-open"));
  } catch {
    // sessionStorage can throw in private mode — silently fall back to
    // the package detail page where Aria will pick up the same context.
    window.location.href = p.href;
  }
}

// Deterministic seat counter for limitedSlots cards. Hashes the slug so the
// same package always shows the same number on every render — no flicker,
// no fake refresh loop. Range 2–6 keeps it credible (a real boutique slot
// count, not the inflated "ONLY 1 LEFT" pattern aggregators abuse).
function seatHint(href: string): number {
  let h = 0;
  for (let i = 0; i < href.length; i++) h = (h * 31 + href.charCodeAt(i)) >>> 0;
  return 2 + (h % 5);
}

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
  // Show the prominent SAVE pill only when the discount is meaningful — sub-10%
  // looks like noise and undermines trust.
  const showSavePill = !!(p.saveAmount && p.saveAmount > 0 && discountPct && discountPct >= 10);
  const seatsLeft = p.limitedSlots ? seatHint(p.href) : null;

  return (
    <article
      className={[
        "tt-card group relative h-full flex overflow-hidden transition duration-200 hover:shadow-hover hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none",
        // Visible ring when any focusable element inside the card has
        // focus — keyboard users see exactly which card they're on.
        "focus-within:ring-2 focus-within:ring-tat-gold focus-within:ring-offset-2",
        horizontal ? "flex-col md:flex-row" : "flex-col",
      ].join(" ")}
    >
      {/* IMAGE — title link below is the canonical accessible name; this
          link is decorative click target only, hidden from AT to avoid
          duplicate "Package title" announcements. */}
      <Link
        href={p.href}
        tabIndex={-1}
        aria-hidden="true"
        className={[
          "relative block overflow-hidden bg-tat-charcoal/15",
          horizontal ? "md:w-[40%] aspect-[3/2] md:aspect-auto" : "aspect-[3/2]",
        ].join(" ")}
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
        {/* Gradient + duration pill bottom-left */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
        {p.duration && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-white/95 text-tat-charcoal text-[11px] font-semibold px-2.5 py-1 rounded-pill shadow-card">
            <Clock className="h-3 w-3 text-tat-gold" />
            {p.duration}
          </span>
        )}
        {/* Rating chip bottom-right — moved out of card body to save vertical space */}
        {typeof p.rating === "number" && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-tat-teal text-white text-[11px] font-semibold px-2 py-1 rounded-pill shadow-card">
            <Star className="h-3 w-3 fill-white" />
            {p.rating.toFixed(1)}
            {p.ratingCount && (
              <span className="font-normal text-white/80 hidden sm:inline">
                · {p.ratingCount.toLocaleString("en-IN")}
              </span>
            )}
          </span>
        )}
        {/* bookedThisMonth lives in the body urgency line now (more visible at compact width). */}
      </Link>

      {/* WISHLIST */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); const next = !wished; setWished(next); p.onWishlistToggle?.(next); }}
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={wished}
        className={[
          "absolute top-3 right-3 h-9 w-9 rounded-full grid place-items-center shadow-card transition duration-120",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2",
          wished ? "bg-tat-orange text-white" : "bg-white/95 text-tat-charcoal/80 hover:text-tat-danger-fg",
        ].join(" ")}
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-white" : ""}`} />
      </button>

      {/* BODY */}
      <div className={`flex-1 flex flex-col ${compact ? "p-3 sm:p-3.5" : "p-3 md:p-4"}`}>
        {/* Destination + travel style */}
        {(p.destination || p.travelStyle) && (
          <div className="flex items-center gap-2 text-tag uppercase text-tat-slate/80">
            {p.destination && (
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 text-tat-gold shrink-0" />
                <span className="truncate">{p.destination}</span>
              </span>
            )}
            {p.destination && p.travelStyle && <span aria-hidden className="text-tat-charcoal/30">·</span>}
            {p.travelStyle && (
              <span className="bg-tat-gold/10 text-tat-gold px-2 py-0.5 rounded-pill normal-case tracking-normal font-medium">
                {p.travelStyle}
              </span>
            )}
          </div>
        )}

        {/* Title — wraps the canonical Link so screen readers, keyboard
            users, and click-anywhere-on-the-name visitors all hit the
            same target. The image link above is decorative + aria-hidden
            so AT doesn't announce the title twice. */}
        <h3
          title={p.title}
          className={`mt-1 font-display font-normal ${compact ? "text-[14.5px] sm:text-[16px]" : "text-[16px] md:text-[18px]"} text-tat-charcoal leading-snug text-balance line-clamp-2`}
        >
          <Link
            href={p.href}
            className="rounded-sm hover:text-tat-orange transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-1"
          >
            {p.title}
          </Link>
        </h3>

        {/* Urgency / social-proof line — always renders so cards in the
            same rail row stay vertically aligned. The slot stays blank
            (but height-stable) when there's no signal to show. Limited
            slots wins over booked-this-month if both fire. */}
        <div className="mt-1 min-h-[16px] inline-flex items-center gap-1.5 text-[11px] font-semibold">
          {seatsLeft ? (
            <>
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-tat-orange animate-pulse motion-reduce:animate-none" />
              <span className="text-tat-orange">Only {seatsLeft} seats left</span>
            </>
          ) : p.bookedThisMonth ? (
            <span className="text-tat-charcoal/65">
              <span className="text-tat-charcoal font-bold">{p.bookedThisMonth}</span> booked this month
            </span>
          ) : (
            <span aria-hidden>&nbsp;</span>
          )}
        </div>

        {/* Inclusions strip — hidden on mobile in compact mode to shorten the rail card */}
        <ul className={`${compact ? "mt-2 hidden sm:flex" : "mt-2.5 flex"} flex-wrap items-center gap-x-3 gap-y-1 text-meta text-tat-charcoal/75`}>
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

        {/* Price block — always anchored to bottom of the card body via
            mt-auto, regardless of density. Compact still drops the
            divider on mobile but no longer floats mid-card when
            optional rows above collapse to zero. */}
        <div className={`mt-auto ${compact ? "pt-2 sm:pt-2 sm:border-t sm:border-tat-charcoal/10" : "pt-2.5 border-t border-tat-charcoal/10"}`}>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              {/* Original-price line — height reserved so cards without a
                  comparison price still align with neighbours that do. */}
              <p className="text-[11px] sm:text-[12px] text-tat-slate/70 leading-none min-h-[14px]">
                {p.originalPrice && p.originalPrice > p.price ? (
                  <>
                    <Price inr={p.originalPrice} className="line-through" />
                    {discountPct !== null && (
                      <span className="ml-1.5 text-tat-success-fg font-semibold">
                        {discountPct}% off
                      </span>
                    )}
                  </>
                ) : (
                  <span aria-hidden>&nbsp;</span>
                )}
              </p>
              <p className={`mt-0.5 font-display ${compact ? "text-[19px] sm:text-[22px]" : "text-[22px] md:text-[26px]"} text-tat-charcoal leading-none`}>
                <span className="text-[11px] font-sans text-tat-slate font-normal mr-0.5 align-baseline">from</span>
                <Price inr={p.price} />
                <span className="text-[11px] font-sans text-tat-slate font-normal ml-1">
                  <span className="sm:hidden">/pp</span>
                  <span className="hidden sm:inline">/ person</span>
                </span>
              </p>
            </div>
            {/* Prominent save pill — only when discount is ≥10% so it doesn't
                cry-wolf on flat-priced packages. Sits to the right of the
                price so the eye moves from price → savings in one sweep. */}
            {showSavePill && (
              <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-tat-success-fg/10 text-tat-success-fg text-[11px] font-bold whitespace-nowrap">
                <BadgeIndianRupee className="h-3 w-3" aria-hidden />
                Save <Price inr={p.saveAmount!} />
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-tat-slate/70 leading-none min-h-[14px]">+ taxes &amp; fees</p>
        </div>

        {/* CTAs */}
        <div className={`${compact ? "mt-2 sm:mt-2.5 gap-1.5" : "mt-3 gap-1.5"} flex flex-col`}>
          <Link
            href={p.href}
            className={`group/cta inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-pill bg-tat-teal hover:bg-tat-teal-deep text-white font-semibold text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2 shadow-sm hover:shadow`}
          >
            Plan this trip
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
          </Link>
          {/* Quick Book + Ask Aria — visible on every breakpoint per shared CTA spec */}
          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href={`${p.href}?book=1`}
              className={`inline-flex items-center justify-center gap-1 h-9 px-2 rounded-pill border border-tat-gold/40 bg-tat-gold/8 text-[12px] font-semibold text-tat-charcoal hover:bg-tat-gold hover:border-tat-gold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2`}
            >
              <CreditCard className="h-3.5 w-3.5 text-tat-gold" />
              Quick Book
            </Link>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); askAriaAboutPackage(p); }}
              className={`inline-flex items-center justify-center gap-1 h-9 px-2 rounded-pill border border-tat-charcoal/15 bg-white text-[12px] font-semibold text-tat-charcoal hover:bg-tat-charcoal hover:text-tat-paper hover:border-tat-charcoal transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2`}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Ask Aria
            </button>
          </div>

          {/* Risk-reversal trust strip — three crossed-checks below the CTA
              cluster. Lowers hesitation right where the user decides whether
              to tap. Single line on all breakpoints; truncates if cramped. */}
          <ul className="mt-1 flex items-center justify-between gap-1.5 text-[10px] text-tat-charcoal/65">
            <li className="inline-flex items-center gap-1 truncate">
              <ShieldCheck className="h-3 w-3 text-tat-success-fg shrink-0" aria-hidden />
              <span>₹0 to start</span>
            </li>
            <li className="inline-flex items-center gap-1 truncate">
              <RotateCcw className="h-3 w-3 text-tat-success-fg shrink-0" aria-hidden />
              <span>Free 48h changes</span>
            </li>
            <li className="inline-flex items-center gap-1 truncate">
              <Sparkles className="h-3 w-3 text-tat-gold shrink-0" aria-hidden />
              <span>Real planner</span>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
}
