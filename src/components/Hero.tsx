"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, PlayCircle } from "lucide-react";
import SearchBar from "./SearchBar";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[92vh] md:min-h-screen flex flex-col overflow-hidden bg-ink">
      {/* Background image with slow zoom */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-slow-zoom">
          <Image
            src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=2400&q=85&auto=format&fit=crop"
            alt="Bali landscape at sunset"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        {/* Editorial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink/80 via-ink/40 to-ink/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none bg-grain" />
      </div>

      {/* Side numeric accent */}
      <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-4 items-center text-cream/40 text-[10px] tracking-[0.3em] uppercase z-10">
        <span className="rotate-180 [writing-mode:vertical-rl]">Chapter 01 — The Journey</span>
        <div className="h-16 w-px bg-gold/50" />
        <span className="font-display text-2xl text-gold">26°</span>
      </div>

      {/* Right-side rating card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="hidden md:block absolute right-6 lg:right-12 top-28 lg:top-36 z-10 bg-cream/10 backdrop-blur-md border border-cream/20 rounded-2xl p-4 max-w-[220px]"
      >
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
          ))}
        </div>
        <p className="text-cream/90 text-xs leading-relaxed">
          "The trip of a lifetime — they thought of everything we forgot to."
        </p>
        <p className="text-gold text-[10px] mt-2 uppercase tracking-wider">— Ananya M.</p>
      </motion.div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col justify-center container-custom pt-20 pb-32 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="eyebrow text-gold mb-6 md:mb-8 flex items-center gap-3"
        >
          <span className="h-px w-8 bg-gold" />
          Travel with Trust — Not Issues
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-medium text-cream text-display-xl max-w-[14ch] leading-[0.95] tracking-tight text-balance"
        >
          Travel beyond{" "}
          <span className="italic text-gold font-light">packages.</span>
          <br />
          Experience <span className="italic font-light">trust.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-8 max-w-xl text-cream/80 text-base md:text-lg leading-relaxed font-light"
        >
          We don't sell tours. We design journeys — handcrafted itineraries that
          listen to the way you want to travel. From honeymoons to family
          odysseys, every mile is ours to carry.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link href="/packages" className="btn-gold group">
            Explore Trips
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/customize-trip"
            className="inline-flex items-center gap-2 text-cream/90 hover:text-gold transition-colors text-sm font-medium"
          >
            <PlayCircle className="h-5 w-5" />
            Watch our story
          </Link>
        </motion.div>
      </div>

      {/* Search bar floating at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="relative z-10 container-custom pb-8 md:pb-12"
      >
        <SearchBar />
      </motion.div>
    </section>
  );
}
