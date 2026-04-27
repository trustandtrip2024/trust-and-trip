"use client";

import { useEffect, useState } from "react";

const DEALS = [
  "10% Off · book 60+ days ahead",
  "₹2,000 off honeymoon trips · book this week",
  "Free Bali airport transfer · ends Sunday",
  "Maldives flat ₹15K off · 3 cottages left",
  "Char Dham yatra · early-bird ₹4K off",
];

interface Props {
  className?: string;
  interval?: number;
}

export default function FlashDealRotator({ className = "", interval = 5500 }: Props) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % DEALS.length), interval);
    return () => clearInterval(t);
  }, [interval]);

  return (
    <span
      key={idx}
      className={`inline-block animate-in fade-in slide-in-from-bottom-1 duration-300 ${className}`}
      aria-live="polite"
    >
      {DEALS[idx]}
    </span>
  );
}
