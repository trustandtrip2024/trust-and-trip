import { Sparkles, Heart, Trophy } from "lucide-react";

const FALLBACK = [
  "Hand-built itinerary, not a shelf package",
  "WhatsApp-first planner, on call through return",
  "Free changes within 48 hours after the draft",
];

const ICONS = [Sparkles, Heart, Trophy];

interface Props {
  bullets?: string[];
  bestFor?: string;
}

/**
 * Three-bullet elevator pitch above the overview. Pulls from
 * Sanity package.whyThisPackage when set; falls back to brand-level
 * promises so every package has the section even if the editor hasn't
 * filled in custom hooks yet.
 */
export default function PackageWhyThis({ bullets, bestFor }: Props) {
  const items = (bullets && bullets.length > 0 ? bullets : FALLBACK).slice(0, 4);

  return (
    <section
      aria-labelledby="why-this-title"
      className="rounded-card bg-gradient-to-br from-tat-cream-warm/50 via-tat-paper to-tat-paper dark:from-white/5 dark:via-tat-charcoal dark:to-tat-charcoal ring-1 ring-tat-charcoal/8 dark:ring-white/10 p-5 md:p-6"
    >
      {bestFor && (
        <p className="inline-flex items-center gap-1.5 mb-3 text-eyebrow uppercase font-semibold text-tat-burnt dark:text-tat-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-tat-burnt dark:bg-tat-gold" />
          Best for {bestFor}
        </p>
      )}
      <h2
        id="why-this-title"
        className="font-display font-normal text-h3 text-tat-charcoal dark:text-tat-paper text-balance"
      >
        Why this package
      </h2>
      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((b, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <li
              key={i}
              className="flex items-start gap-3"
            >
              <span className="shrink-0 grid h-9 w-9 place-items-center rounded-full bg-tat-burnt/10 dark:bg-tat-gold/15 text-tat-burnt dark:text-tat-gold">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <p className="text-body-sm text-tat-charcoal/80 dark:text-tat-paper/80 leading-relaxed">
                {b}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
