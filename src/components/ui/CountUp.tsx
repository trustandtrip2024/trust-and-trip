"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  /** The full final string, e.g. "4.9 ★", "8,000+", "24 hours", "₹0", "Free changes". */
  value: string;
  /** Animation duration in ms. */
  duration?: number;
  className?: string;
}

interface Parsed {
  prefix: string;
  numeric: number | null;
  decimals: number;
  suffix: string;
}

// Pulls the first numeric run out of the string. Preserves prefix
// (e.g. "₹") and suffix (e.g. "+", "hours", "★") so the animated
// portion is just the number, and non-numeric values short-circuit.
function parse(value: string): Parsed {
  const match = value.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return { prefix: "", numeric: null, decimals: 0, suffix: value };
  const [, prefix, numStr, suffix] = match;
  const cleaned = numStr.replace(/,/g, "");
  const numeric = Number(cleaned);
  if (Number.isNaN(numeric)) {
    return { prefix: "", numeric: null, decimals: 0, suffix: value };
  }
  const dot = cleaned.indexOf(".");
  const decimals = dot >= 0 ? cleaned.length - dot - 1 : 0;
  return { prefix, numeric, decimals, suffix };
}

function format(n: number, decimals: number): string {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function CountUp({ value, duration = 1400, className }: Props) {
  const parsed = parse(value);
  const [display, setDisplay] = useState(
    parsed.numeric === null ? value : `${parsed.prefix}${format(0, parsed.decimals)}${parsed.suffix}`
  );
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || parsed.numeric === null || startedRef.current) return;
    startedRef.current = true;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const target = parsed.numeric;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      setDisplay(`${parsed.prefix}${format(current, parsed.decimals)}${parsed.suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, parsed.numeric, parsed.prefix, parsed.suffix, parsed.decimals, duration, value]);

  return (
    <span ref={ref} className={className} aria-label={value}>
      {display}
    </span>
  );
}
