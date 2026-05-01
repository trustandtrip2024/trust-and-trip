"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type Summary = { rating: number; count: number } | null;

// Compact "4.9★ · 8,000+ Google reviews" trust chip rendered in the
// header. Fetches lazily so the badge never blocks first paint.
export default function GoogleReviewsBadge({
  className = "",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const [data, setData] = useState<Summary>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reviews/google-summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j?.ok) return;
        setData({ rating: j.rating, count: j.count });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;

  const count =
    data.count >= 1000
      ? `${Math.floor(data.count / 1000)}k+`
      : `${data.count}`;

  const palette =
    variant === "dark"
      ? "text-tat-paper bg-tat-paper/10 hover:bg-tat-paper/15"
      : "text-tat-charcoal bg-tat-cream-warm/60 hover:bg-tat-cream-warm";

  return (
    <a
      href="https://www.google.com/search?q=Trust+And+Trip+Experiences+PVT+LTD+reviews"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${data.rating.toFixed(1)} stars from ${data.count} Google reviews`}
      className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-semibold transition-colors ${palette} ${className}`}
    >
      <Star className="h-3 w-3 fill-tat-gold text-tat-gold" aria-hidden />
      <span className="tabular-nums">{data.rating.toFixed(1)}</span>
      <span className="opacity-60">·</span>
      <span>{count} Google reviews</span>
    </a>
  );
}
