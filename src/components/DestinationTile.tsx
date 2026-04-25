"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Destination } from "@/lib/data";

interface Props {
  destination: Destination;
  index?: number;
}

export default function DestinationTile({ destination, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/destinations/${destination.slug}`}
        aria-label={`Explore ${destination.name}, ${destination.country}`}
        className="group relative block overflow-hidden rounded-xl md:rounded-2xl aspect-square bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        {destination.image ? (
          <Image
            src={destination.image}
            alt={destination.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            quality={70}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/80 to-gold/20" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />

        <div className="absolute top-2.5 left-2.5">
          <span className="text-[9px] uppercase tracking-[0.18em] text-gold font-medium bg-ink/60 backdrop-blur-sm px-2 py-1 rounded-full">
            {destination.country}
          </span>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-3">
          <h3 className="font-display text-sm md:text-[15px] font-medium text-cream leading-tight group-hover:text-gold transition-colors duration-300">
            {destination.name}
          </h3>
          <p className="text-[10px] text-cream/55 mt-0.5">
            ₹{destination.priceFrom.toLocaleString("en-IN")}+
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
