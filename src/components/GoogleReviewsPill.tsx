"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { analytics } from "@/lib/analytics";

/**
 * Google-branded rating pill — links to /reviews. Renders an inline G
 * logo (4-color path data) + 5 stars + numeric rating + review count.
 * Use anywhere a third-party-verified social-proof anchor is needed.
 *
 * Server-renderable; no client JS.
 */
interface Props {
  rating?: number;
  count?: number;
  href?: string;
  className?: string;
  /** "dark" pill on light surface; "light" pill on dark surface (hero). */
  tone?: "dark" | "light";
}

function GoogleG({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className="shrink-0"
    >
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function GoogleReviewsPill({
  rating = 4.9,
  count = 8000,
  href = "/reviews",
  className = "",
  tone = "dark",
}: Props = {}) {
  const filledStars = Math.round(rating);
  const baseClass =
    tone === "light"
      ? "bg-white/95 text-tat-charcoal hover:bg-white"
      : "bg-white text-tat-charcoal hover:bg-tat-cream-warm/40 border border-tat-charcoal/10";

  return (
    <Link
      href={href}
      onClick={() => analytics.heroGoogleClick()}
      aria-label={`Rated ${rating} out of 5 by ${count.toLocaleString("en-IN")} travelers on Google. Read reviews.`}
      className={`inline-flex items-center gap-2 h-8 px-3 rounded-pill shadow-card text-meta font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 ${baseClass} ${className}`}
    >
      <GoogleG />
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < filledStars ? "fill-tat-orange text-tat-orange" : "text-tat-charcoal/25"}`}
          />
        ))}
      </span>
      <span className="tnum font-semibold">{rating.toFixed(1)}</span>
      <span className="text-tat-slate font-normal">
        ({count.toLocaleString("en-IN")}+)
      </span>
    </Link>
  );
}
