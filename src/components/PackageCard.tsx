"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Clock, MapPin, ArrowRight, Flame, TrendingUp, Heart, ShoppingCart, Check, CreditCard, MessageCircle } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useUserStore } from "@/store/useUserStore";
import { supabase } from "@/lib/supabase";
import { getDynamicPrice } from "@/lib/dynamic-pricing";
import Price from "./Price";

// Pre-prime Aria with this card's package context — mirrors the
// PackageAriaPreload flow on /packages/{slug} so Aria's welcome greeting
// names the package and can answer specific questions immediately.
function askAriaAboutPackage(args: {
  slug: string; title: string; price: number; duration: string;
  destinationName?: string; travelType?: string;
}) {
  if (typeof window === "undefined") return;
  const preload = {
    slug: args.slug,
    title: args.title,
    destinationName: args.destinationName ?? "",
    price: args.price,
    duration: args.duration,
    travelType: args.travelType ?? "",
  };
  try {
    window.sessionStorage.setItem("tt_aria_package_preload", JSON.stringify(preload));
    window.dispatchEvent(new CustomEvent("tt:aria-open"));
  } catch {
    window.location.href = `/packages/${args.slug}`;
  }
}

const BOOKED_COUNTS = [14, 8, 22, 6, 17, 11, 29, 5, 19, 9];

export interface PackageCardProps {
  title: string;
  slug: string;
  image: string;
  duration: string;
  price: number;
  rating?: number;
  reviews?: number;
  destinationName?: string;
  travelType?: string;
  limitedSlots?: boolean;
  trending?: boolean;
  highlights?: string[];
  inclusions?: string[];
  categories?: string[];
  pickupCity?: string;
  pickupMatch?: boolean;
  index?: number;
  inSlider?: boolean;
}

export default function PackageCard({
  title,
  slug,
  image,
  duration,
  price,
  rating,
  reviews,
  destinationName,
  travelType,
  limitedSlots,
  trending,
  highlights,
  inclusions,
  categories,
  pickupCity,
  pickupMatch,
  index = 0,
  inSlider = false,
}: PackageCardProps) {
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const { user } = useUserStore();
  const wishlisted = isWishlisted(slug);

  const handleWishlist = async () => {
    toggleWishlist(slug);
    if (!user) return;
    if (isWishlisted(slug)) {
      await supabase.from("user_saved_trips").delete().match({ user_id: user.id, package_slug: slug });
    } else {
      await supabase.from("user_saved_trips").upsert({
        user_id: user.id,
        package_slug: slug,
        package_title: title,
        package_image: image,
        package_price: price,
        price_at_save: dynPrice,
        duration,
        destination_name: destinationName,
        travel_type: travelType,
      }, { onConflict: "user_id,package_slug" });
    }
  };
  const { price: dynPrice, originalPrice, tier, savings } = getDynamicPrice(price, slug);
  const [inCart, setInCart] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || addingCart) return;
    setAddingCart(true);
    await supabase.from("user_cart").upsert({
      user_id: user.id,
      package_slug: slug,
      package_title: title,
      package_image: image,
      package_price: price,
      duration,
      destination_name: destinationName,
      travel_type: travelType,
    }, { onConflict: "user_id,package_slug" });
    setInCart(true);
    setAddingCart(false);
  };

  return (
    <>
    <motion.article
      initial={inSlider ? false : { opacity: 0, y: 40 }}
      whileInView={inSlider ? undefined : { opacity: 1, y: 0 }}
      viewport={inSlider ? undefined : { once: true, margin: "-80px" }}
      transition={inSlider ? undefined : { delay: index * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.98 }}
      className="card-travel group h-full flex flex-col touch-manipulation"
    >
      <div className="relative aspect-[3/2] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
          quality={70}
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top tags */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[calc(100%-7.5rem)]">
          {(() => {
            // Derive segment tier from existing `categories` so we can ship the
            // tier story without a Sanity migration. Luxury → Private,
            // Budget → Essentials, otherwise → Signature. Single chip per card.
            const cats = (categories ?? []).map((c) => c.toLowerCase());
            const tier = cats.includes("luxury")
              ? { label: "Private",    cls: "bg-tat-charcoal/90 text-tat-paper",          dot: "bg-tat-gold" }
              : cats.includes("budget")
              ? { label: "Essentials", cls: "bg-tat-paper/95 text-tat-charcoal",           dot: "bg-tat-orange" }
              : { label: "Signature",  cls: "bg-tat-gold text-tat-charcoal",               dot: "bg-tat-charcoal" };
            return (
              <span className={`inline-flex items-center gap-1.5 backdrop-blur-sm text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-full ${tier.cls}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${tier.dot}`} />
                {tier.label}
              </span>
            );
          })()}
          {trending && (
            <span className="inline-flex items-center gap-1 bg-tat-gold text-tat-charcoal text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full">
              <Flame className="h-3 w-3" />
              Trending
            </span>
          )}
          {limitedSlots && (
            <span className="inline-flex items-center gap-1 bg-tat-charcoal/90 backdrop-blur-sm text-tat-paper text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-tat-orange animate-pulse" />
              Limited Slots
            </span>
          )}
        </div>

        {/* Social proof badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 bg-tat-charcoal/70 backdrop-blur-sm text-tat-paper text-[10px] font-medium px-2.5 py-1 rounded-full">
            <TrendingUp className="h-3 w-3 text-tat-gold" />
            {BOOKED_COUNTS[index % BOOKED_COUNTS.length]} booked this month
          </span>
        </div>

        {/* Wishlist + Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {rating && (
            <div className="bg-tat-paper/95 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
              <Star className="h-3 w-3 fill-tat-gold text-tat-gold" />
              <span className="text-[11px] font-medium text-tat-charcoal">{rating}</span>
            </div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); handleWishlist(); }}
            aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${
              wishlisted
                ? "bg-red-500 text-white scale-110"
                : "bg-tat-paper/95 backdrop-blur-sm text-tat-charcoal/60 hover:text-red-500"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${wishlisted ? "fill-white" : ""}`} />
          </button>
        </div>
      </div>

      <div className="p-3.5 md:p-4 flex-1 flex flex-col">
        {destinationName && (
          <div className="flex items-center gap-1.5 mb-1.5 text-[10px] uppercase tracking-[0.18em] text-tat-charcoal/70 font-semibold">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{destinationName}</span>
            {travelType && (
              <>
                <span className="text-tat-charcoal/30">·</span>
                <span className="bg-tat-charcoal/5 px-2 py-0.5 rounded-full shrink-0">{travelType}</span>
              </>
            )}
          </div>
        )}

        {pickupCity && (
          <div className="flex items-center gap-1 mb-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                pickupMatch
                  ? "bg-tat-orange/15 text-tat-orange border-tat-orange/40"
                  : "bg-tat-charcoal/5 text-tat-charcoal/65 border-tat-charcoal/10"
              }`}
              title={`Departs from ${pickupCity}`}
            >
              {pickupMatch ? "✓" : "Ex"} {pickupCity}
            </span>
          </div>
        )}

        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {categories.slice(0, 3).map((c) => (
              <span
                key={c}
                className="inline-flex items-center text-[10px] tracking-wide font-medium px-1.5 py-0.5 rounded-full bg-tat-gold/10 text-tat-charcoal/75 border border-tat-gold/25"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        <h3
          title={title}
          className="font-display text-[15px] md:text-[17px] font-medium leading-snug text-balance group-hover:text-tat-gold transition-colors duration-300 line-clamp-2"
        >
          {title}
        </h3>

        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-tat-charcoal/60">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration}
          </span>
          {reviews && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-tat-gold text-tat-gold" />
              {rating} <span className="text-tat-charcoal/40">({reviews})</span>
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-tat-charcoal/5 space-y-2">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${tier.color}`}>{tier.badge}</span>
                {savings > 0 && (
                  <span className="text-[9px] text-tat-success-fg font-medium">
                    Save <Price inr={savings} />
                  </span>
                )}
              </div>
              <p className="font-display text-lg md:text-xl leading-none text-tat-charcoal">
                <Price inr={dynPrice} />
                <span className="text-[11px] text-tat-charcoal/50 font-sans font-normal ml-1">/ person</span>
              </p>
              {savings > 0 && (
                <Price
                  inr={originalPrice}
                  className="text-[10px] text-tat-charcoal/35 line-through"
                />
              )}
            </div>
            <Link
              href={`/packages/${slug}`}
              className="h-9 w-9 shrink-0 rounded-full bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal transition-all duration-300 flex items-center justify-center group-hover:scale-110"
              aria-label={`View details for ${title}`}
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Add to cart — logged-in only */}
          {user && (
            <button
              onClick={handleAddToCart}
              disabled={addingCart}
              className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 border ${
                inCart
                  ? "bg-tat-success-bg border-tat-success-fg/25 text-tat-success-fg"
                  : "bg-tat-charcoal/5 border-tat-charcoal/12 text-tat-charcoal/70 hover:bg-tat-charcoal hover:text-tat-paper hover:border-tat-charcoal"
              }`}
            >
              {inCart ? (
                <><Check className="h-3.5 w-3.5 shrink-0" />Added to cart</>
              ) : addingCart ? (
                <><ShoppingCart className="h-3.5 w-3.5 shrink-0 animate-pulse" />Adding…</>
              ) : (
                <><ShoppingCart className="h-3.5 w-3.5 shrink-0" />Add to Cart</>
              )}
            </button>
          )}

          {/* Quick Book + Ask Aria — shared CTA pair on every PackageCard across the site */}
          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href={`/packages/${slug}?book=1`}
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-tat-gold/40 bg-tat-gold/8 text-[11px] font-semibold text-tat-charcoal hover:bg-tat-gold hover:text-tat-charcoal hover:border-tat-gold transition-all duration-200"
            >
              <CreditCard className="h-3.5 w-3.5 shrink-0 text-tat-gold" />
              Quick Book
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                askAriaAboutPackage({ slug, title, price: dynPrice, duration, destinationName, travelType });
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-tat-charcoal/12 text-[11px] font-semibold text-tat-charcoal/80 hover:bg-tat-charcoal hover:text-tat-paper hover:border-tat-charcoal transition-all duration-200"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" />
              Ask Aria
            </button>
          </div>
        </div>

      </div>
    </motion.article>
    </>
  );
}
