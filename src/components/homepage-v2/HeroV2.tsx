"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import SearchBar from "../SearchBar";

const CLIPS = [
  {
    src: "/hero/hero-1.mp4",
    poster: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=2400&q=85&auto=format&fit=crop",
    label: "Bali, Indonesia",
    tag: "Most Loved",
  },
  {
    src: "/hero/hero-2.mp4",
    poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&q=85&auto=format&fit=crop",
    label: "Himalayas, India",
    tag: "Adventure",
  },
  {
    src: "/hero/hero-3.mp4",
    poster: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=2400&q=85&auto=format&fit=crop",
    label: "Maldives",
    tag: "Luxury",
  },
];

export default function HeroV2() {
  const [current, setCurrent] = useState(0);
  const [videoOk, setVideoOk] = useState<boolean[]>(() => CLIPS.map(() => true));
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Auto-advance slides
  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % CLIPS.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  // Play active video, pause others
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === current) {
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [current]);

  const markVideoMissing = (i: number) => {
    setVideoOk((prev) => {
      if (!prev[i]) return prev;
      const next = [...prev];
      next[i] = false;
      return next;
    });
  };

  return (
    <section className="relative w-full min-h-[95vh] md:min-h-screen flex flex-col overflow-hidden bg-ink">
      {/* Background media — crossfade */}
      <div className="absolute inset-0">
        {CLIPS.map((clip, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            {videoOk[i] && (
              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                src={clip.src}
                poster={clip.poster}
                muted
                loop
                playsInline
                preload={i === 0 ? "auto" : "metadata"}
                onError={() => markVideoMissing(i)}
                onStalled={() => markVideoMissing(i)}
                className="absolute inset-0 h-full w-full object-cover"
                aria-hidden="true"
              />
            )}
            {/* Always render poster beneath video for fallback + instant paint */}
            <Image
              src={clip.poster}
              alt={clip.label}
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover ${videoOk[i] ? "opacity-0" : "animate-[slowZoom_20s_ease-in-out_infinite_alternate]"}`}
            />
          </div>
        ))}

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent z-10" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none bg-grain z-10" />
      </div>

      {/* Active destination label — top-right */}
      <div className="absolute top-24 md:top-28 right-5 md:right-10 z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.45 }}
            className="flex items-center gap-2 bg-cream/10 backdrop-blur-md border border-cream/15 rounded-full px-3.5 py-2"
          >
            <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
            <div className="flex items-center gap-2">
              <span className="text-cream/90 text-xs font-medium">{CLIPS[current].label}</span>
              <span className="text-[9px] text-gold/80 uppercase tracking-widest border-l border-cream/20 pl-2">
                {CLIPS[current].tag}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-40 md:bottom-32 left-0 right-0 z-20 container-custom">
        <div className="flex items-center gap-3">
          {CLIPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Show slide ${i + 1}`}
              className="group"
            >
              <div
                className={`h-0.5 rounded-full transition-all duration-500 ${
                  i === current ? "w-10 bg-gold" : "w-4 bg-cream/30 group-hover:bg-cream/50"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col justify-center container-custom pt-28 pb-36 md:pb-40 z-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex items-center gap-2.5 text-gold mb-5"
        >
          <span className="h-px w-8 bg-gold/70" />
          <span className="text-[10px] uppercase tracking-[0.28em] font-medium">
            Crafting Reliable Travel
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-medium text-cream leading-[0.94] tracking-tight text-balance"
          style={{ fontSize: "clamp(2.6rem, 7vw, 5.5rem)" }}
        >
          Trips that feel
          <br />
          made just{" "}
          <span className="italic text-gold font-light">for you.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-6 max-w-xl text-cream/75 text-base md:text-lg leading-relaxed font-light"
        >
          Real humans designing every itinerary. No bloated packages, no hidden
          markups — just journeys that match how you actually travel.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link href="/plan" className="btn-gold group">
            <Sparkles className="h-4 w-4 mr-1" />
            Plan my trip with AI
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/experiences"
            className="inline-flex items-center gap-2 text-cream/85 hover:text-gold transition-colors text-sm font-medium border border-cream/20 hover:border-gold/40 px-5 py-2.5 rounded-full"
          >
            Browse experiences
          </Link>
        </motion.div>
      </div>

      {/* Search bar — bottom */}
      <div className="relative z-20 container-custom pb-6 md:pb-10">
        <SearchBar />
      </div>
    </section>
  );
}
