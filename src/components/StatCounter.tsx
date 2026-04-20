"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  label: string;
}

function parseValue(v: string) {
  const match = v.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { num: null, suffix: v };
  return { num: parseFloat(match[1]), suffix: match[2] };
}

export default function StatCounter({ value, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [displayed, setDisplayed] = useState("0");
  const [started, setStarted] = useState(false);
  const { num, suffix } = parseValue(value);

  useEffect(() => {
    if (!ref.current || num === null) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [num, started]);

  useEffect(() => {
    if (!started || num === null) return;
    const duration = 1800;
    const steps = 50;
    const increment = num / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, num);
      const formatted =
        num % 1 !== 0
          ? current.toFixed(1)
          : Math.round(current).toLocaleString("en-IN");
      setDisplayed(formatted + suffix);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, num, suffix]);

  return (
    <div
      ref={ref}
      className="text-center md:border-r md:border-cream/10 last:md:border-r-0 md:px-4"
    >
      <div className="font-display text-3xl md:text-5xl font-medium text-gold leading-none tabular-nums">
        {num !== null ? (started ? displayed : "0" + suffix) : value}
      </div>
      <p className="mt-2 text-[9px] md:text-[10px] uppercase tracking-[0.22em] text-cream/60">
        {label}
      </p>
    </div>
  );
}
