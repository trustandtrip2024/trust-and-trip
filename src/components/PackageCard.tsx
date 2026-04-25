"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Clock, MapPin, ArrowRight, Flame, TrendingUp, Heart, Sliders, PhoneCall, ShoppingCart, Check } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useUserStore } from "@/store/useUserStore";
import { supabase } from "@/lib/supabase";
import { getDynamicPrice } from "@/lib/dynamic-pricing";
import CustomizeModal from "./CustomizeModal";
import ScheduleCallModal from "./ScheduleCallModal";

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
  const [showCustomize, setShowCustomize] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
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
      <div className="relative aspect-[4/3] overflow-hidden">
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
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {trending && (
            <span className="inline-flex items-center gap-1 bg-tat-gold text-tat-charcoal text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full">
              <Flame className="h-3 w-3" />
              Trending
            </span>
          )}
          {limitedSlots && (
            <span className="inline-flex items-center gap-1 bg-tat-charcoal/90 backdrop-blur-sm text-tat-paper text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
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

      <div className="p-4 md:p-6 flex-1 flex flex-col">
        {destinationName && (
          <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-[0.2em] text-tat-charcoal/70 font-semibold">
            <MapPin className="h-3 w-3" />
            {destinationName}
            {travelType && (
              <>
                <span className="text-tat-charcoal/30">·</span>
                <span className="bg-tat-charcoal/5 px-2 py-0.5 rounded-full">{travelType}</span>
              </>
            )}
          </div>
        )}

        <h3 className="font-display text-lg md:text-xl font-medium leading-tight text-balance group-hover:text-tat-gold transition-colors duration-300">
          {title}
        </h3>

        <div className="flex items-center gap-3 mt-2.5 text-xs text-tat-charcoal/60">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {duration}
          </span>
          {reviews && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-tat-gold text-tat-gold" />
              {rating} <span className="text-tat-charcoal/40">({reviews})</span>
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 mt-4 border-t border-tat-charcoal/5 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${tier.color}`}>{tier.badge}</span>
                {savings > 0 && <span className="text-[9px] text-green-600 font-medium">Save ₹{savings.toLocaleString("en-IN")}</span>}
              </div>
              <p className="font-display text-xl md:text-2xl text-tat-charcoal">
                ₹{dynPrice.toLocaleString("en-IN")}
                <span className="text-xs text-tat-charcoal/50 font-sans font-normal ml-1">/ person</span>
              </p>
              {savings > 0 && (
                <p className="text-[10px] text-tat-charcoal/35 line-through">₹{originalPrice.toLocaleString("en-IN")}</p>
              )}
            </div>
            <Link
              href={`/packages/${slug}`}
              className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal transition-all duration-300 flex items-center justify-center group-hover:scale-110"
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
              className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 border ${
                inCart
                  ? "bg-green-50 border-green-200 text-green-700"
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

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => { e.preventDefault(); setShowCustomize(true); }}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-tat-charcoal/12 text-[11px] font-medium text-tat-charcoal/65 hover:bg-tat-charcoal hover:text-tat-paper hover:border-tat-charcoal transition-all duration-200"
            >
              <Sliders className="h-3.5 w-3.5 shrink-0" />
              Customize
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setShowSchedule(true); }}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-tat-gold/40 bg-tat-gold/8 text-[11px] font-medium text-tat-charcoal/70 hover:bg-tat-gold hover:text-tat-charcoal hover:border-tat-gold transition-all duration-200"
            >
              <PhoneCall className="h-3.5 w-3.5 shrink-0" />
              Schedule Call
            </button>
          </div>
        </div>

      </div>
    </motion.article>

    {showCustomize && (
      <CustomizeModal
        packageTitle={title}
        packageSlug={slug}
        destinationName={destinationName}
        onClose={() => setShowCustomize(false)}
      />
    )}
    {showSchedule && (
      <ScheduleCallModal
        packageTitle={title}
        packageSlug={slug}
        destinationName={destinationName}
        onClose={() => setShowSchedule(false)}
      />
    )}
    </>
  );
}
