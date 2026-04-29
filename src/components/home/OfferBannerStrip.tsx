"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { analytics } from "@/lib/analytics";

export interface OfferBanner {
  slug: string;
  title: string;
  eyebrow?: string;
  sub?: string;
  ctaLabel?: string;
  href: string;
  /** Tailwind gradient classes — tat-teal/orange/gold tones. */
  gradient?: string;
  /** Optional urgency badge (top-right). */
  badge?: string;
  /** Optional photo overlay. Sits over the gradient. */
  image?: string;
  /** ISO datetime — drives a live countdown chip. */
  expiresAt?: string;
}

const DEFAULT_GRADIENT = "from-tat-teal-deep via-tat-teal to-tat-teal/70";

// Seed used when Sanity returns nothing — keeps the strip visually present
// during early adoption. Each entry mirrors the offerBanner schema shape so
// drop-in replacement works without code changes.
const DEFAULT_OFFERS: OfferBanner[] = [
  { slug: "monsoon-kerala",   eyebrow: "Monsoon special", title: "Kerala Backwaters", sub: "5N from ₹38,500 · Book by Aug 15",     ctaLabel: "View deal",    href: "/destinations/kerala",   gradient: "from-tat-teal-deep via-tat-teal to-tat-teal/70",         badge: "20% off"        },
  { slug: "couples-bali",     eyebrow: "Honeymoon",       title: "Bali for Two",      sub: "6N · Private villa + sunset cruise",   ctaLabel: "View deal",    href: "/destinations/bali",     gradient: "from-tat-orange via-tat-gold to-tat-gold/80",            badge: "Free upgrade"   },
  { slug: "char-dham-2026",   eyebrow: "Yatra 2026",      title: "Char Dham · 11N",   sub: "Helicopter + standard packages",       ctaLabel: "Reserve seat", href: "/lp/char-dham",          gradient: "from-tat-charcoal via-tat-charcoal/90 to-tat-teal-deep", badge: "Limited slots"  },
  { slug: "winter-switzerland", eyebrow: "Visa-friendly", title: "Switzerland · 7N",  sub: "Glacier express + Zermatt + Lucerne",  ctaLabel: "View deal",    href: "/lp/switzerland",        gradient: "from-tat-teal via-tat-teal-deep to-tat-charcoal",        badge: "Schengen 2-week"},
];

interface Props {
  offers?: OfferBanner[];
}

/**
 * Live countdown chip — updates once per second, hides when expired.
 * Renders nothing on SSR (returns null until mounted) so the server-
 * rendered banner never includes a stale "5h 12m" label.
 */
function CountdownChip({ expiresAt }: { expiresAt: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;
  const target = new Date(expiresAt).getTime();
  if (Number.isNaN(target)) return null;
  const remaining = target - now;
  if (remaining <= 0) return null;

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  const label =
    days > 0 ? `${days}d ${hours}h left`
    : hours > 0 ? `${hours}h ${minutes}m left`
    : minutes > 0 ? `${minutes}m ${String(seconds).padStart(2, "0")}s`
    : `${seconds}s`;

  // Urgency intensifies when <24h.
  const urgent = days === 0 && hours < 24;

  return (
    <span
      className={`absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-bold px-2.5 py-1 rounded-pill backdrop-blur-sm ${urgent ? "bg-tat-orange text-tat-paper animate-pulse" : "bg-tat-charcoal/85 text-tat-paper"}`}
      aria-live="polite"
    >
      <Clock className="h-3 w-3" />
      {label}
    </span>
  );
}

export default function OfferBannerStrip({ offers }: Props) {
  // Hide expired ones at render time too (server has cached fetch + 2 min
  // TTL, so a banner expiring between fetches needs client-side prune).
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const source = offers && offers.length > 0 ? offers : DEFAULT_OFFERS;
  const visible = source.filter((o) => {
    if (!o.expiresAt) return true;
    const t = new Date(o.expiresAt).getTime();
    return Number.isNaN(t) || t > Date.now();
  });
  // tick reads here so eslint doesn't drop it; loop refreshes the filter.
  void tick;

  if (visible.length === 0) return null;

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
          {visible.map((o, idx) => {
            const gradient = o.gradient ?? DEFAULT_GRADIENT;
            return (
              <li key={o.slug} className="snap-start">
                <Link
                  href={o.href}
                  onClick={() => analytics.offerBannerClick(o.slug, idx + 1)}
                  className={`
                    group relative block overflow-hidden rounded-card aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/10]
                    bg-gradient-to-br ${gradient}
                    shadow-card hover:shadow-rail transition-all duration-300 hover:-translate-y-0.5
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2
                  `}
                >
                  {/* Photo overlay (when set) — sits over the gradient. */}
                  {o.image && (
                    <Image
                      src={o.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 80vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover opacity-90"
                    />
                  )}

                  {/* Texture overlay so flat gradients don't read as cheap;
                      also dims photo overlay so the title stays readable. */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.4] mix-blend-multiply"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.05) 55%, transparent)",
                    }}
                  />

                  {/* Bottom-left content lockup */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6 text-tat-paper">
                    {o.eyebrow && (
                      <p className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-paper/80 mb-1.5">
                        {o.eyebrow}
                      </p>
                    )}
                    <h3 className="font-display text-h3 md:text-h2 font-medium leading-tight text-balance">
                      {o.title}
                    </h3>
                    {o.sub && (
                      <p className="mt-1.5 text-body-sm text-tat-paper/85 line-clamp-2">{o.sub}</p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-paper">
                      {o.ctaLabel ?? "View deal"}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>

                  {/* Top-left countdown when expiresAt set */}
                  {o.expiresAt && <CountdownChip expiresAt={o.expiresAt} />}

                  {/* Top-right urgency badge */}
                  {o.badge && (
                    <span className="absolute top-3 right-3 inline-flex items-center bg-tat-paper/95 text-tat-charcoal text-[10px] uppercase tracking-[0.16em] font-bold px-2.5 py-1 rounded-pill backdrop-blur-sm">
                      {o.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
