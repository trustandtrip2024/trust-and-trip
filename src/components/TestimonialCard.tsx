"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import type { Testimonial } from "@/lib/data";

interface Props {
  testimonial: Testimonial;
  index?: number;
}

export default function TestimonialCard({ testimonial }: Props) {
  return (
    <div className="w-[300px] md:w-[340px] shrink-0 bg-white rounded-2xl p-6 border border-ink/6 flex flex-col gap-4">
      {/* Stars */}
      <div className="flex gap-0.5">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-sm text-ink/80 leading-relaxed flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-3 border-t border-ink/6">
        <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 ring-2 ring-gold/20">
          <Image src={testimonial.image} alt={testimonial.name} fill sizes="36px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{testimonial.name}</p>
          <p className="text-[11px] text-ink/40 truncate">{testimonial.trip} · {testimonial.location}</p>
        </div>
      </div>
    </div>
  );
}
