"use client";

import { useEffect, useState } from "react";

interface Props {
  endsAt: string; // ISO date string
  label?: string;
}

export default function CountdownTimer({ endsAt, label = "Offer ends in" }: Props) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true });
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  if (timeLeft.expired) {
    return <span className="text-[10px] text-red-400 uppercase tracking-wider font-medium">Expired</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      {timeLeft.d > 0 && <Unit v={timeLeft.d} u="d" />}
      <Unit v={timeLeft.h} u="h" />
      <Unit v={timeLeft.m} u="m" />
      <Unit v={timeLeft.s} u="s" />
    </div>
  );
}

function Unit({ v, u }: { v: number; u: string }) {
  return (
    <div className="flex items-center gap-0.5">
      <span className="font-display text-sm font-semibold tabular-nums text-cream w-5 text-center">
        {String(v).padStart(2, "0")}
      </span>
      <span className="text-[9px] text-cream/50 uppercase">{u}</span>
    </div>
  );
}
