"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Props {
  images: string[];
  index: number;
  title: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ images, index, title, onClose, onPrev, onNext }: Props) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  // Touch swipe
  let touchStartX = 0;
  const onTouchStart = (e: React.TouchEvent) => { touchStartX = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? onNext() : onPrev();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center text-cream transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Counter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-cream/60 tabular-nums">
          {index + 1} / {images.length}
        </div>

        {/* Prev */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-3 md:left-6 z-10 h-11 w-11 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center text-cream transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Image */}
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl mx-14 md:mx-20 aspect-[4/3] md:aspect-[16/9]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={images[index]}
            alt={`${title} — photo ${index + 1}`}
            fill
            className="object-cover rounded-2xl"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
        </motion.div>

        {/* Next */}
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-3 md:right-6 z-10 h-11 w-11 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center text-cream transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Thumbnail strip */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 px-4 overflow-x-auto max-w-[90vw]">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); if (i < index) { for (let x = index; x > i; x--) onPrev(); } else { for (let x = index; x < i; x++) onNext(); } }}
              className={`relative h-12 w-16 shrink-0 rounded-lg overflow-hidden transition-all ${
                i === index ? "ring-2 ring-gold opacity-100" : "opacity-50 hover:opacity-80"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
