"use client";

import { motion } from "framer-motion";
import { whyChooseUs } from "@/lib/data";

export default function WhyChooseUs() {
  return (
    <section className="py-24 md:py-32 bg-cream relative overflow-hidden">
      {/* Decorative circle */}
      <div
        aria-hidden
        className="absolute -left-48 top-20 w-96 h-96 rounded-full border border-gold/20 pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -right-32 -bottom-32 w-80 h-80 rounded-full bg-gold/5 pointer-events-none"
      />

      <div className="container-custom relative">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 md:gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:sticky lg:top-32"
          >
            <span className="eyebrow">Why choose us</span>
            <h2 className="heading-section mt-4 text-balance">
              Four promises we
              <span className="italic text-gold font-light"> never break.</span>
            </h2>
            <p className="mt-6 text-ink/60 leading-relaxed max-w-md">
              Trust isn't a tagline — it's our operating system. Here's what
              that means in practice, for every traveler, on every trip.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {whyChooseUs.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="group p-8 rounded-3xl bg-white border border-ink/5 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-500"
              >
                <div className="flex items-baseline justify-between mb-6">
                  <span className="font-display text-5xl md:text-6xl font-medium text-gold leading-none">
                    {item.stat}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-ink/40 text-right max-w-[60%]">
                    {item.statLabel}
                  </span>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-medium mb-3 text-balance">
                  {item.title}
                </h3>
                <p className="text-sm text-ink/60 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
