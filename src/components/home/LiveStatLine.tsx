"use client";

import { useEffect, useState } from "react";
import { Eye, Users } from "lucide-react";

interface Stat {
  icon: typeof Eye;
  text: (n: number) => string;
  base: number;
  jitter: number;
  /** Re-pick a random number every `tickMs` so the figure feels live. */
  tickMs: number;
}

const STATS: Stat[] = [
  {
    icon: Eye,
    text: (n) => `${n} travelers viewing now`,
    base: 22,
    jitter: 12,
    tickMs: 9000,
  },
  {
    icon: Users,
    text: (n) => `${n} booked this week`,
    base: 113,
    jitter: 18,
    tickMs: 17000,
  },
];

/**
 * Tiny inline strip showing two soft "live" stats. Numbers gently
 * jitter inside a small range so the figures feel real rather than
 * static. Server-rendered with the base value; first tick happens
 * after `tickMs` once mounted, so SSR/hydration match.
 */
export default function LiveStatLine({ className = "" }: { className?: string }) {
  const [values, setValues] = useState(() => STATS.map((s) => s.base));

  useEffect(() => {
    const timers = STATS.map((s, i) =>
      setInterval(() => {
        setValues((prev) => {
          const next = [...prev];
          next[i] = s.base + Math.floor(Math.random() * s.jitter);
          return next;
        });
      }, s.tickMs)
    );
    return () => timers.forEach(clearInterval);
  }, []);

  return (
    <ul
      aria-label="Live activity"
      className={`mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-meta text-tat-charcoal/60 dark:text-tat-paper/60 ${className}`}
    >
      {STATS.map((s, i) => {
        const Icon = s.icon;
        return (
          <li key={i} className="inline-flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-tat-success-bg0 animate-ping opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-tat-success-bg0" />
            </span>
            <Icon className="h-3.5 w-3.5 text-tat-gold" aria-hidden />
            <span>
              <span className="tnum font-semibold text-tat-charcoal dark:text-tat-paper">
                {values[i]}
              </span>
              {" "}
              {s.text(values[i]).replace(/^\d+\s*/, "")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
