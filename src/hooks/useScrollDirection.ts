"use client";

import { useEffect, useState } from "react";

type Direction = "up" | "down";

export function useScrollDirection(threshold = 8): { direction: Direction; atTop: boolean } {
  const [direction, setDirection] = useState<Direction>("up");
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        setAtTop(y < 4);
        if (Math.abs(delta) > threshold) {
          setDirection(delta > 0 ? "down" : "up");
          lastY = y;
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { direction, atTop };
}
