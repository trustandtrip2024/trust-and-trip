"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Clock, MapPin, ArrowRight, Flame } from "lucide-react";

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
  index?: number;
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
  index = 0,
}: PackageCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {trending && (
            <span className="inline-flex items-center gap-1 bg-gold text-ink text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full">
              <Flame className="h-3 w-3" />
              Trending
            </span>
          )}
          {limitedSlots && (
            <span className="inline-flex items-center gap-1 bg-ink text-cream text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              Limited Slots
            </span>
          )}
        </div>

        {/* Rating badge */}
        {rating && (
          <div className="absolute top-4 right-4 bg-cream/95 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="text-[11px] font-medium text-ink">{rating}</span>
          </div>
        )}
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

        <div className="mt-auto pt-4 mt-4 flex items-end justify-between border-t border-ink/5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink/50">Starting from</p>
            <p className="font-display text-xl md:text-2xl text-ink mt-0.5">
              ₹{price.toLocaleString("en-IN")}
              <span className="text-xs text-ink/50 font-sans font-normal ml-1">/ person</span>
            </p>
          </div>
          <Link
            href={`/packages/${slug}`}
            className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-ink hover:bg-gold text-cream hover:text-ink transition-all duration-300 flex items-center justify-center group-hover:scale-110"
            aria-label={`View details for ${title}`}
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
