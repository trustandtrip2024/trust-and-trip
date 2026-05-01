"use client";

import { useEffect, useState } from "react";

interface Props {
  targetIso: string;
}

interface Parts {
  d: number;
  h: number;
  m: number;
  s: number;
  done: boolean;
}

function diff(target: number): Parts {
  const ms = Math.max(0, target - Date.now());
  const total = Math.floor(ms / 1000);
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
    done: ms === 0,
  };
}

export default function ComingSoonCountdown({ targetIso }: Props) {
  const target = new Date(targetIso).getTime();
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    setParts(diff(target));
    const id = setInterval(() => setParts(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!parts) {
    return (
      <div className="flex gap-3" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] w-20 animate-pulse rounded-card bg-tat-charcoal/5"
          />
        ))}
      </div>
    );
  }

  if (parts.done) {
    return (
      <p className="font-display text-h3 italic text-tat-teal-deep">
        We&apos;re live — refresh in a moment.
      </p>
    );
  }

  const cells: { label: string; value: number }[] = [
    { label: "Days", value: parts.d },
    { label: "Hours", value: parts.h },
    { label: "Minutes", value: parts.m },
    { label: "Seconds", value: parts.s },
  ];

  return (
    <div
      className="flex gap-3"
      role="timer"
      aria-label={`Launching in ${parts.d} days, ${parts.h} hours, ${parts.m} minutes`}
    >
      {cells.map(({ label, value }) => (
        <div
          key={label}
          className="flex w-20 flex-col items-center rounded-card border border-tat-teal/15 bg-tat-paper/80 px-3 py-3 shadow-soft backdrop-blur"
        >
          <span className="font-display text-3xl font-medium tabular-nums tracking-tight text-tat-teal-deep">
            {String(value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-tat-charcoal/55">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
