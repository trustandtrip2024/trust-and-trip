"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const SWIPE_THRESHOLD = 50;
const VERTICAL_DISMISS = 120;

export default function Lightbox({ images, index, title, onClose, onPrev, onNext }: Props) {
  const [mounted, setMounted] = useState(false);
  // Tracks the in-flight swipe so the active image follows the finger
  // (mobile-feel) rather than snapping at touch-end.
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const startRef = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => setMounted(true), []);

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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [handleKey]);

  const onTouchStart = (e: React.TouchEvent) => {
    startRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
    setDrag({ x: 0, y: 0 });
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startRef.current.x;
    const dy = e.touches[0].clientY - startRef.current.y;
    // Only let vertical drags through when they dominate (swipe-to-dismiss);
    // otherwise stick to horizontal so the user doesn't "fight" diagonal.
    setDrag({ x: dx, y: Math.abs(dy) > Math.abs(dx) ? dy : 0 });
  };
  const onTouchEnd = () => {
    const { x, y } = drag;
    if (Math.abs(y) > VERTICAL_DISMISS && Math.abs(y) > Math.abs(x)) {
      onClose();
    } else if (Math.abs(x) > SWIPE_THRESHOLD) {
      x < 0 ? onNext() : onPrev();
    }
    setDrag({ x: 0, y: 0 });
  };

  // Render adjacent images so swipe reveals them without a flash. Wrap
  // around so first/last pair seamlessly.
  const adj = (offset: number) => images[(index + offset + images.length) % images.length];

  if (!mounted) return null;

  // Portal to body so no ancestor stacking context (sticky aside, motion
  // wrappers, transformed sections) can trap the lightbox inside a
  // sibling of the page.
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-tat-charcoal/95 backdrop-blur-sm select-none"
        onClick={onClose}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        {/* Top bar — counter left, close right. Safe-area padding so the
            iOS notch + Dynamic Island don't crash into controls. */}
        <div
          className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 py-3"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <div className="text-xs text-tat-paper/70 tabular-nums px-3 py-1.5 rounded-full bg-tat-charcoal/40 backdrop-blur">
            {index + 1} <span className="opacity-50">/ {images.length}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="h-11 w-11 rounded-full bg-tat-paper/10 hover:bg-tat-paper/20 active:bg-tat-paper/30 flex items-center justify-center text-tat-paper transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Prev arrow — desktop only, mobile uses swipe */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-tat-paper/10 hover:bg-tat-paper/20 items-center justify-center text-tat-paper transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Image stage — three-up layout (prev offscreen-left, current
            centered, next offscreen-right) so horizontal drag can show
            the neighbour as the user swipes. */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            className="relative w-full h-full flex items-center"
            animate={{ x: drag.x, y: drag.y, opacity: 1 - Math.min(0.6, Math.abs(drag.y) / 400) }}
            transition={drag.x === 0 && drag.y === 0 ? { type: "spring", stiffness: 380, damping: 38 } : { duration: 0 }}
          >
            {/* Prev (offscreen-left) */}
            <div className="absolute right-full pr-4 md:pr-8 w-screen h-full flex items-center justify-center">
              <div className="relative w-full max-w-5xl h-[80svh] md:h-[85vh]">
                <Image
                  src={adj(-1)}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="100vw"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Current */}
            <div className="w-screen h-full flex items-center justify-center">
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
                className="relative w-full max-w-5xl h-[80svh] md:h-[85vh]"
              >
                <Image
                  src={images[index]}
                  alt={`${title} — photo ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </motion.div>
            </div>

            {/* Next (offscreen-right) */}
            <div className="absolute left-full pl-4 md:pl-8 w-screen h-full flex items-center justify-center">
              <div className="relative w-full max-w-5xl h-[80svh] md:h-[85vh]">
                <Image
                  src={adj(1)}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="100vw"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Next arrow — desktop only */}
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-tat-paper/10 hover:bg-tat-paper/20 items-center justify-center text-tat-paper transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Bottom — dot indicators on mobile, thumbnail strip on desktop.
            Safe-area padding for iOS home-indicator. */}
        <div
          className="absolute bottom-0 inset-x-0 z-20 flex items-center justify-center px-4 pb-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {/* Mobile dots */}
          <div className="md:hidden flex items-center gap-1.5">
            {images.slice(0, 12).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-tat-gold" : "w-1.5 bg-tat-paper/30"
                }`}
              />
            ))}
            {images.length > 12 && (
              <span className="text-[10px] text-tat-paper/50 ml-1">+{images.length - 12}</span>
            )}
          </div>

          {/* Desktop thumbnails */}
          <div className="hidden md:flex gap-2 overflow-x-auto max-w-[90vw] no-scrollbar">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); if (i < index) { for (let x = index; x > i; x--) onPrev(); } else { for (let x = index; x < i; x++) onNext(); } }}
                className={`relative h-14 w-20 shrink-0 rounded-lg overflow-hidden transition-all ${
                  i === index ? "ring-2 ring-tat-gold opacity-100" : "opacity-50 hover:opacity-80"
                }`}
                aria-label={`Photo ${i + 1}`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
