"use client";

import { motion } from "framer-motion";
import { whyChooseUs } from "@/lib/data";

export default function WhyChooseUs() {
  return (
    <section className="py-16 md:py-20 bg-ink text-cream overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <span className="eyebrow text-gold">Why choose us</span>
            <h2 className="heading-section mt-2 text-cream text-balance">
              Four promises we
              <span className="italic text-gold font-light"> never break.</span>
            </h2>
          </div>
          <p className="text-cream/50 text-sm max-w-xs leading-relaxed md:text-right">
            Trust isn't a tagline — it's how we operate, on every trip.
          </p>
        </div>

        {/* 4 items in a row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-cream/10 rounded-2xl overflow-hidden">
          {whyChooseUs.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-ink px-6 py-8 md:px-8 md:py-10 group hover:bg-cream/5 transition-colors duration-300"
            >
              <p className="font-display text-4xl md:text-5xl font-medium text-gold leading-none mb-1">
                {item.stat}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-cream/40 mb-4">
                {item.statLabel}
              </p>
              <h3 className="font-display text-lg md:text-xl font-medium text-cream mb-2 text-balance">
                {item.title}
              </h3>
              <p className="text-sm text-cream/50 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
