"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Clock, MapPin, ArrowRight, Flame, TrendingUp, Heart, Sliders, PhoneCall } from "lucide-react";
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
        duration,
        destination_name: destinationName,
        travel_type: travelType,
      }, { onConflict: "user_id,package_slug" });
    }
  };
  const { price: dynPrice, originalPrice, tier, savings } = getDynamicPrice(price, slug);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
    <motion.article
      initial={inSlider ? false : { opacity: 0, y: 40 }}
      whileInView={inSlider ? undefined : { opacity: 1, y: 0 }}
      viewport={inSlider ? undefined : { once: true, margin: "-80px" }}
      transition={inSlider ? undefined : { delay: index * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="card-travel group h-full flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top tags */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {trending && (
            <span className="inline-flex items-center gap-1 bg-gold text-ink text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full">
              <Flame className="h-3 w-3" />
              Trending
            </span>
          )}
          {limitedSlots && (
            <span className="inline-flex items-center gap-1 bg-ink/90 backdrop-blur-sm text-cream text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              Limited Slots
            </span>
          )}
        </div>

        {/* Social proof badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 bg-ink/70 backdrop-blur-sm text-cream text-[10px] font-medium px-2.5 py-1 rounded-full">
            <TrendingUp className="h-3 w-3 text-gold" />
            {BOOKED_COUNTS[index % BOOKED_COUNTS.length]} booked this month
          </span>
        </div>

        {/* Wishlist + Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {rating && (
            <div className="bg-cream/95 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
              <Star className="h-3 w-3 fill-gold text-gold" />
              <span className="text-[11px] font-medium text-ink">{rating}</span>
            </div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); handleWishlist(); }}
            aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${
              wishlisted
                ? "bg-red-500 text-white scale-110"
                : "bg-cream/95 backdrop-blur-sm text-ink/60 hover:text-red-500"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${wishlisted ? "fill-white" : ""}`} />
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 flex-1 flex flex-col">
        {destinationName && (
          <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-[0.2em] text-ink/50">
            <MapPin className="h-3 w-3" />
            {destinationName}
            {travelType && (
              <>
                <span className="text-ink/30">·</span>
                <span className="bg-ink/5 px-2 py-0.5 rounded-full">{travelType}</span>
              </>
            )}
          </div>
        )}

        <h3 className="font-display text-lg md:text-xl font-medium leading-tight text-balance group-hover:text-gold transition-colors duration-300">
          {title}
        </h3>

        <div className="flex items-center gap-3 mt-2.5 text-xs text-ink/60">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {duration}
          </span>
          {reviews && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-gold text-gold" />
              {rating} <span className="text-ink/40">({reviews})</span>
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 mt-4 border-t border-ink/5 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${tier.color}`}>{tier.badge}</span>
                {savings > 0 && <span className="text-[9px] text-green-600 font-medium">Save ₹{savings.toLocaleString("en-IN")}</span>}
              </div>
              <p className="font-display text-xl md:text-2xl text-ink">
                ₹{dynPrice.toLocaleString("en-IN")}
                <span className="text-xs text-ink/50 font-sans font-normal ml-1">/ person</span>
              </p>
              {savings > 0 && (
                <p className="text-[10px] text-ink/35 line-through">₹{originalPrice.toLocaleString("en-IN")}</p>
              )}
            </div>
            <Link
              href={`/packages/${slug}`}
              className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-ink hover:bg-gold text-cream hover:text-ink transition-all duration-300 flex items-center justify-center group-hover:scale-110"
              aria-label={`View details for ${title}`}
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => { e.preventDefault(); setShowCustomize(true); }}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-ink/12 text-[11px] font-medium text-ink/65 hover:bg-ink hover:text-cream hover:border-ink transition-all duration-200"
            >
              <Sliders className="h-3.5 w-3.5 shrink-0" />
              Customize
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setShowSchedule(true); }}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gold/40 bg-gold/8 text-[11px] font-medium text-ink/70 hover:bg-gold hover:text-ink hover:border-gold transition-all duration-200"
            >
              <PhoneCall className="h-3.5 w-3.5 shrink-0" />
              Schedule Call
            </button>
          </div>
        </div>

      </div>
    </motion.article>

    {mounted && showCustomize && createPortal(
      <CustomizeModal
        packageTitle={title}
        packageSlug={slug}
        destinationName={destinationName}
        onClose={() => setShowCustomize(false)}
      />,
      document.body
    )}
    {mounted && showSchedule && createPortal(
      <ScheduleCallModal
        packageTitle={title}
        packageSlug={slug}
        destinationName={destinationName}
        onClose={() => setShowSchedule(false)}
      />,
      document.body
    )}
    </>
  );
}
