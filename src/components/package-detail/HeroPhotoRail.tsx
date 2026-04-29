"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface Props {
  images: string[];
  title: string;
}

/**
 * Horizontal photo strip directly under the hero. Pulls from the flattened
 * itinerary day photos (caller-side dedupe). Click opens a fullscreen
 * lightbox; arrow keys navigate. Returns null when fewer than 3 photos
 * — single-photo strips look like a broken hero.
 */
export default function HeroPhotoRail({ images, title }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  if (!images || images.length < 3) return null;
  const visible = images.slice(0, 12);

  return (
    <>
      <section
        aria-label={`Photos from ${title}`}
        className="-mt-1 border-b border-tat-charcoal/8 bg-tat-paper"
      >
        <ul className="flex gap-1 overflow-x-auto no-scrollbar snap-x snap-mandatory">
          {visible.map((src, i) => (
            <li
              key={`${src}-${i}`}
              className="relative shrink-0 snap-start aspect-[4/3] w-[44vw] sm:w-[28vw] md:w-[22vw] lg:w-[16vw] cursor-pointer group bg-tat-charcoal/8"
              onClick={() => setOpen(i)}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 640px) 44vw, (max-width: 1024px) 22vw, 16vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-tat-charcoal/0 group-hover:bg-tat-charcoal/10 transition-colors" />
            </li>
          ))}
        </ul>
      </section>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-8"
          onClick={() => setOpen(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(null);
            if (e.key === "ArrowLeft") setOpen((o) => (o !== null && o > 0 ? o - 1 : o));
            if (e.key === "ArrowRight") setOpen((o) => (o !== null && o < visible.length - 1 ? o + 1 : o));
          }}
          tabIndex={-1}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label="Close"
            className="absolute top-4 right-4 grid place-items-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative w-full max-w-5xl aspect-[3/2]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={visible[open]}
              alt=""
              fill
              sizes="(max-width: 1024px) 92vw, 1024px"
              className="object-contain"
              priority
            />
          </div>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-[12px] tracking-wide">
            {open + 1} / {visible.length}
          </p>
        </div>
      )}
    </>
  );
}
