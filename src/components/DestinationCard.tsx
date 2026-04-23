"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Destination } from "@/lib/data";

interface Props {
  destination: Destination;
  index?: number;
}

export default function DestinationCard({ destination, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/destinations/${destination.slug}`}
        className="group relative block overflow-hidden rounded-3xl bg-ink aspect-[3/4]"
      >
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
          className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-ink/20" />

        {/* Top tag */}
        <div className="absolute top-5 left-5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-cream/20 backdrop-blur-md text-cream text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full border border-cream/20">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            {destination.region}
          </span>
        </div>

        {/* Arrow */}
        <div className="absolute top-5 right-5 h-11 w-11 rounded-full bg-cream/20 backdrop-blur-md border border-cream/20 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-all duration-500">
          <ArrowUpRight className="h-4 w-4 text-cream group-hover:text-ink transition-colors duration-500" />
        </div>

        {/* Bottom content */}
        <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">
            {destination.tagline}
          </p>
          <h3 className="font-display text-3xl md:text-4xl font-medium leading-none mb-3 group-hover:translate-x-1 transition-transform duration-500">
            {destination.name}
          </h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-cream/60">Starting from</p>
              <p className="font-display text-xl text-cream mt-0.5">
                ₹{destination.priceFrom.toLocaleString("en-IN")}
              </p>
            </div>
            <span className="text-xs text-cream/70 underline-offset-2 decoration-gold group-hover:text-gold group-hover:underline transition-colors">
              View Experiences
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
