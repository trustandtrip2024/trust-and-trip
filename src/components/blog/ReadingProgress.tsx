"use client";

import { useEffect, useState } from "react";

/**
 * Thin gold progress bar pinned to the very top of the viewport. Tracks how
 * far the user has scrolled through the page (0 → 100%). Intentionally not
 * tied to any single article element — the bar reflects whole-document
 * progress so it keeps moving while the user reads the related-posts and
 * CTA sections that live below the article body.
 */
export default function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (max <= 0) {
        setPct(0);
        return;
      }
      const ratio = Math.min(1, Math.max(0, h.scrollTop / max));
      setPct(ratio * 100);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 inset-x-0 z-[60] h-0.5 bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-tat-gold transition-[width] duration-100 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
