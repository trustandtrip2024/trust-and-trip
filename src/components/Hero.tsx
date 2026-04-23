"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, MapPin, Heart, Users, User, Backpack, Mountain, Crown, Compass } from "lucide-react";
import SearchBar from "./SearchBar";
import LiveBookingTicker from "./LiveBookingTicker";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=2400&q=85&auto=format&fit=crop",
    destination: "Bali, Indonesia",
    tag: "Most Loved",
  },
  {
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=2400&q=85&auto=format&fit=crop",
    destination: "Maldives",
    tag: "Luxury",
  },
  {
    image: "https://images.unsplash.com/photo-1545569756-7e39db71a14e?w=2400&q=85&auto=format&fit=crop",
    destination: "Kedarnath, India",
    tag: "Sacred",
  },
  {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&q=85&auto=format&fit=crop",
    destination: "Swiss Alps",
    tag: "Adventure",
  },
];

const personaPills = [
  { label: "Honeymoon", icon: Heart, href: "/experiences/honeymoon", color: "hover:bg-rose-500/20 hover:border-rose-400/40" },
  { label: "Family", icon: Users, href: "/experiences/family", color: "hover:bg-sky-500/20 hover:border-sky-400/40" },
  { label: "Pilgrim", icon: Mountain, href: "/experiences/pilgrim", color: "hover:bg-amber-500/20 hover:border-amber-400/40" },
  { label: "Adventure", icon: Backpack, href: "/experiences/adventure", color: "hover:bg-orange-500/20 hover:border-orange-400/40" },
  { label: "Solo", icon: User, href: "/experiences/solo", color: "hover:bg-purple-500/20 hover:border-purple-400/40" },
  { label: "Luxury", icon: Crown, href: "/experiences/luxury", color: "hover:bg-gold/20 hover:border-gold/40" },
  { label: "Explore", icon: Compass, href: "/destinations", color: "hover:bg-green-500/20 hover:border-green-400/40" },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPrev(current);
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [current]);

  return (
    <section className="relative w-full min-h-screen flex flex-col overflow-hidden bg-ink">

      {/* Background slides — crossfade */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            <Image
              src={slide.image}
              alt={slide.destination}
              fill
              priority={i === 0}
              className="object-cover scale-105"
              sizes="100vw"
            />
          </div>
        ))}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30 z-10" />
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-grain z-10" />
      </div>

      {/* Current destination indicator — bottom left */}
      <div className="absolute bottom-48 md:bottom-40 left-0 right-0 z-20 container-custom">
        <div className="flex items-center gap-3">
          {SLIDES.map((slide, i) => (
            <button
              key={i}
              onClick={() => { setPrev(current); setCurrent(i); }}
              className="flex items-center gap-2 group"
            >
              <div className={`h-0.5 transition-all duration-500 rounded-full ${i === current ? "w-8 bg-gold" : "w-3 bg-cream/30 hover:bg-cream/50"}`} />
              {i === current && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] uppercase tracking-[0.2em] text-gold/80 font-medium hidden sm:block"
                >
                  {slide.destination}
                </motion.span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right-side floating trust card */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="hidden lg:block absolute right-10 xl:right-16 top-1/2 -translate-y-1/2 z-20"
      >
        <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl p-5 w-52">
          <div className="flex items-center gap-1 mb-2.5">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-gold text-gold" />)}
            <span className="text-cream/60 text-[10px] ml-1">4.9</span>
          </div>
          <p className="text-cream/85 text-xs leading-relaxed">
            &ldquo;They thought of everything we forgot to. Trip of a lifetime.&rdquo;
          </p>
          <p className="text-gold text-[9px] mt-2.5 uppercase tracking-wider">— Ananya M., Mumbai</p>
          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-cream text-sm font-display font-medium">10K+</p>
              <p className="text-cream/40 text-[9px] uppercase tracking-wide">Travellers</p>
            </div>
            <div>
              <p className="text-cream text-sm font-display font-medium">60+</p>
              <p className="text-cream/40 text-[9px] uppercase tracking-wide">Destinations</p>
            </div>
          </div>
        </div>

        {/* Current destination badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="mt-3 flex items-center gap-2 bg-white/8 backdrop-blur-xl border border-white/12 rounded-xl px-4 py-2.5"
          >
            <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
            <div>
              <p className="text-cream/90 text-xs font-medium">{SLIDES[current].destination}</p>
              <p className="text-[9px] text-gold/70 uppercase tracking-wider">{SLIDES[current].tag}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col justify-center container-custom pt-24 pb-36 z-20">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="eyebrow text-gold mb-5 flex items-center gap-3"
        >
          <span className="h-px w-8 bg-gold" />
          Travel with Trust — Not Issues
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-medium text-cream leading-[0.93] tracking-tight"
          style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
        >
          Journeys crafted
          <br />
          around{" "}
          <span className="italic text-gold font-light">your</span>{" "}
          story.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-6 max-w-lg text-cream/70 text-base md:text-lg leading-relaxed font-light"
        >
          We don&apos;t sell tours. We design experiences — handcrafted itineraries
          for honeymoons, pilgrimages, adventures, and everything in between.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link href="/experiences" className="btn-gold group">
            Browse Experiences
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 text-cream/80 hover:text-gold transition-colors text-sm font-medium border border-cream/20 hover:border-gold/40 px-5 py-2.5 rounded-full"
          >
            Free AI Itinerary
          </Link>
        </motion.div>

        {/* Persona pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-7"
        >
          <p className="text-cream/35 text-[10px] uppercase tracking-[0.22em] mb-3">I&apos;m travelling for</p>
          <div className="flex flex-wrap gap-2">
            {personaPills.map(({ label, icon: Icon, href, color }) => (
              <Link
                key={label}
                href={href}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-cream/15 bg-cream/8 backdrop-blur-sm text-cream/75 text-xs font-medium tracking-wide transition-all duration-300 ${color} hover:text-cream`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="mt-5">
          <LiveBookingTicker />
        </div>
      </div>

      {/* Search bar */}
      <div className="relative z-20 container-custom pb-8 md:pb-12">
        <SearchBar />
      </div>
    </section>
  );
}
