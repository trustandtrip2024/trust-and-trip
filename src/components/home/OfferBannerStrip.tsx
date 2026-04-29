"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface OfferBanner {
  slug: string;
  eyebrow: string;
  title: string;
  sub: string;
  ctaLabel: string;
  href: string;
  /** Tailwind gradient classes — tat-teal/orange/gold tones. */
  gradient: string;
  /** Optional urgency badge (top-right). */
  badge?: string;
}

// Dummy seed — replace with Sanity-backed `offerBanner` schema later.
// Gradients map to brand palette so banners look on-brand without
// real imagery being uploaded yet.
const DEFAULT_OFFERS: OfferBanner[] = [
  {
    slug: "monsoon-kerala",
    eyebrow: "Monsoon special",
    title: "Kerala Backwaters",
    sub: "5N from ₹38,500 · Book by Aug 15",
    ctaLabel: "View deal",
    href: "/destinations/kerala",
    gradient: "from-tat-teal-deep via-tat-teal to-tat-teal/70",
    badge: "20% off",
  },
  {
    slug: "couples-bali",
    eyebrow: "Honeymoon",
    title: "Bali for Two",
    sub: "6N · Private villa + sunset cruise",
    ctaLabel: "View deal",
    href: "/destinations/bali",
    gradient: "from-tat-orange via-tat-gold to-tat-gold/80",
    badge: "Free upgrade",
  },
  {
    slug: "char-dham-2026",
    eyebrow: "Yatra 2026",
    title: "Char Dham · 11N",
    sub: "Helicopter + standard packages",
    ctaLabel: "Reserve seat",
    href: "/lp/char-dham",
    gradient: "from-tat-charcoal via-tat-charcoal/90 to-tat-teal-deep",
    badge: "Limited slots",
  },
  {
    slug: "winter-switzerland",
    eyebrow: "Visa-friendly",
    title: "Switzerland · 7N",
    sub: "Glacier express + Zermatt + Lucerne",
    ctaLabel: "View deal",
    href: "/lp/switzerland",
    gradient: "from-tat-teal via-tat-teal-deep to-tat-charcoal",
    badge: "Schengen 2-week",
  },
];

interface Props {
  offers?: OfferBanner[];
}

export default function OfferBannerStrip({ offers = DEFAULT_OFFERS }: Props) {
  return (
    <section className="py-10 md:py-14 bg-tat-paper" aria-label="Featured offers">
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <p className="tt-eyebrow text-tat-gold">Designed for you</p>
            <h2 className="mt-1.5 font-display text-h3 md:text-h2 font-medium text-tat-charcoal text-balance">
              This week&rsquo;s offers
            </h2>
          </div>
          <Link
            href="/packages?filter=deals"
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-medium text-tat-charcoal/65 hover:text-tat-charcoal"
          >
            See all deals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile: horizontal scroll-snap. Desktop: 4-col grid. */}
        <ul
          className="
            grid grid-flow-col auto-cols-[80%] gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2
            md:grid-flow-row md:auto-cols-auto md:grid-cols-2 md:gap-4 md:overflow-visible md:pb-0
            lg:grid-cols-4
          "
        >
          {offers.map((o, idx) => (
            <li key={o.slug} className="snap-start">
              <Link
                href={o.href}
                onClick={() => analytics.offerBannerClick(o.slug, idx + 1)}
                className={`
                  group relative block overflow-hidden rounded-card aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/10]
                  bg-gradient-to-br ${o.gradient}
                  shadow-card hover:shadow-rail transition-all duration-300 hover:-translate-y-0.5
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2
                `}
              >
                {/* Subtle texture overlay so flat gradients don't read as cheap. */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.6), transparent 55%), radial-gradient(circle at 75% 80%, rgba(0,0,0,0.4), transparent 60%)",
                  }}
                />

                {/* Bottom-left content lockup */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6 text-tat-paper">
                  <p className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-paper/80 mb-1.5">
                    {o.eyebrow}
                  </p>
                  <h3 className="font-display text-h3 md:text-h2 font-medium leading-tight text-balance">
                    {o.title}
                  </h3>
                  <p className="mt-1.5 text-body-sm text-tat-paper/85 line-clamp-2">{o.sub}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-paper">
                    {o.ctaLabel}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>

                {/* Top-right urgency badge */}
                {o.badge && (
                  <span className="absolute top-3 right-3 inline-flex items-center bg-tat-paper/95 text-tat-charcoal text-[10px] uppercase tracking-[0.16em] font-bold px-2.5 py-1 rounded-pill backdrop-blur-sm">
                    {o.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
