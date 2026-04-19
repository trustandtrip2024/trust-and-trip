"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, X } from "lucide-react";

export default function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative py-24 md:py-32 bg-ink overflow-hidden">
      {/* Decorative grain */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay bg-grain pointer-events-none" />

      <div className="container-custom relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center mb-12 md:mb-16"
        >
          <span className="eyebrow text-gold">Our Story, On Film</span>
          <h2 className="heading-section text-cream mt-4 text-balance">
            Journeys that become
            <span className="italic text-gold font-light"> memories.</span>
          </h2>
          <p className="mt-4 text-cream/60 text-base leading-relaxed">
            A glimpse into the moments we craft for travelers who want more than
            a vacation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative aspect-video rounded-3xl overflow-hidden cursor-pointer group max-w-5xl mx-auto shadow-soft-lg"
          onClick={() => setPlaying(true)}
        >
          <Image
            src="https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=2000&q=85&auto=format&fit=crop"
            alt="Travel experience video preview"
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-ink/30 via-transparent to-ink/40" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gold/40 animate-ping" />
              <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full bg-gold flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-glow-gold">
                <Play className="h-8 w-8 md:h-10 md:w-10 text-ink fill-ink ml-1" />
              </div>
            </div>
          </div>

          {/* Bottom caption */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-cream">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-1">
                A Film by Trust and Trip
              </p>
              <p className="font-display text-xl md:text-2xl">
                Beyond the postcard — the real Bali
              </p>
            </div>
            <span className="text-xs text-cream/70">02:48</span>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      {playing && (
        <div
          className="fixed inset-0 bg-ink/95 z-[100] flex items-center justify-center p-4"
          onClick={() => setPlaying(false)}
        >
          <button
            onClick={() => setPlaying(false)}
            className="absolute top-6 right-6 h-12 w-12 rounded-full bg-cream/10 flex items-center justify-center hover:bg-gold hover:text-ink text-cream transition-colors"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="aspect-video w-full max-w-5xl rounded-2xl overflow-hidden bg-ink flex items-center justify-center">
            <p className="text-cream/40 text-sm">
              [ Your brand video would play here ]
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
