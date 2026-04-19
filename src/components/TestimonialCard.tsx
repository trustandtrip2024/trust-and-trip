"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import type { Testimonial } from "@/lib/data";

interface Props {
  testimonial: Testimonial;
  index?: number;
}

export default function TestimonialCard({ testimonial, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-cream rounded-3xl p-8 md:p-10 relative overflow-hidden group h-full flex flex-col"
    >
      {/* Decorative quote mark */}
      <Quote
        className="absolute -top-4 -right-4 h-32 w-32 text-gold/10 rotate-180 stroke-[0.5]"
        aria-hidden
      />

      <div className="flex items-center gap-0.5 mb-6 relative">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-gold text-gold" />
        ))}
      </div>

      <blockquote className="font-display text-xl md:text-[22px] leading-snug text-ink flex-1 text-balance">
        "{testimonial.quote}"
      </blockquote>

      <div className="mt-8 flex items-center gap-4 pt-6 border-t border-ink/10">
        <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-gold/30">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink">{testimonial.name}</p>
          <p className="text-xs text-ink/50 mt-0.5">
            {testimonial.location} · {testimonial.trip}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
