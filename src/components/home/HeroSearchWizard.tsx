"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Star } from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";

const FOUNDER_NAME = "Akash Mishra";
const FOUNDER_ROLE = "Founder · Lead planner";
const FOUNDER_PHOTO = "";
const WHATSAPP_HREF =
  "https://wa.me/918115999588?text=" +
  encodeURIComponent("Hi Akash — I'd like help planning my trip.");

interface HeroProps {
  eyebrow?: string;
  trustStrip?: string;
  heroImage?: string;
  videoMp4Url?: string;
  videoUrl?: string;
  videoPosterUrl?: string;
}

export default function HeroSearchWizard({
  eyebrow = "Trust and Trip · Crafted travel since 2019",
  trustStrip = "4.9★ on Google · 8,000+ travelers · 60+ destinations",
}: HeroProps = {}) {
  const { open: openPlanner } = useTripPlanner();
  const initials = FOUNDER_NAME.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const usePhoto = FOUNDER_PHOTO.length > 0;

  return (
    <section
      aria-labelledby="hero-h1"
      className="relative bg-tat-paper dark:bg-tat-charcoal border-b border-tat-charcoal/8 dark:border-white/10 overflow-hidden"
    >
      {/* Soft accent backdrop — keeps the section warm without competing with copy. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-70 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 12% 0%, rgba(242, 179, 64, 0.18) 0%, transparent 55%), radial-gradient(ellipse at 88% 100%, rgba(14, 124, 123, 0.10) 0%, transparent 55%)",
        }}
      />

      <div className="container-custom py-16 md:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
          {/* ── Left: copy + CTA ─────────────────────────────────────── */}
          <div>
            <p className="tt-eyebrow text-tat-gold dark:text-tat-gold">{eyebrow}</p>
            <h1
              id="hero-h1"
              className="mt-3 font-display font-normal text-h1 md:text-display text-tat-charcoal dark:text-tat-paper text-balance leading-[1.05]"
            >
              Trips planned by a real human{" "}
              <em className="not-italic font-display italic text-tat-gold dark:text-tat-gold">
                in 24 hours.
              </em>
            </h1>
            <p className="mt-5 text-lead text-tat-charcoal/75 dark:text-tat-paper/80 max-w-xl">
              Tell us your dates and what you love. Akash drafts your itinerary himself —
              free until you&apos;re sure. No card, no commitment.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                type="button"
                onClick={() => openPlanner()}
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-pill bg-tat-teal hover:bg-tat-teal-deep text-white font-semibold text-[15px] shadow-[0_12px_32px_-12px_rgba(14,124,123,0.65)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
              >
                Plan my trip — free
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-charcoal/75 dark:text-tat-paper/75 hover:text-tat-gold underline-offset-4 hover:underline transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
              >
                <MessageCircle className="h-4 w-4 text-whatsapp" />
                or WhatsApp +91 8115 999 588
              </Link>
            </div>

            <p className="mt-7 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-tat-charcoal/65 dark:text-tat-paper/65">
              <Star className="h-3.5 w-3.5 fill-tat-gold text-tat-gold" aria-hidden />
              <span className="font-semibold text-tat-charcoal dark:text-tat-paper">
                {trustStrip}
              </span>
            </p>
          </div>

          {/* ── Right: founder portrait card ─────────────────────────── */}
          <aside className="relative">
            <div className="relative mx-auto max-w-sm lg:max-w-md">
              <div className="relative aspect-[4/5] rounded-card overflow-hidden bg-tat-charcoal/15 ring-1 ring-tat-charcoal/10 dark:ring-white/10 shadow-card">
                {usePhoto ? (
                  <Image
                    src={FOUNDER_PHOTO}
                    alt={`${FOUNDER_NAME}, ${FOUNDER_ROLE}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 480px"
                    quality={80}
                    className="object-cover"
                  />
                ) : (
                  <div
                    aria-label={`${FOUNDER_NAME} portrait`}
                    className="absolute inset-0 grid place-items-center bg-gradient-to-br from-tat-teal-deep via-tat-teal to-tat-gold"
                  >
                    <span className="font-display text-[120px] md:text-[160px] text-tat-paper/95 tracking-tight leading-none">
                      {initials}
                    </span>
                  </div>
                )}

                {/* Verified online pill */}
                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 text-tat-charcoal text-[11px] font-semibold px-3 py-1 rounded-pill shadow-card">
                  <span className="h-1.5 w-1.5 rounded-full bg-tat-teal animate-pulse" />
                  Online · Replies under 5 min
                </span>
              </div>

              {/* Caption card — overlaps photo bottom-right */}
              <div className="absolute -bottom-6 -right-2 sm:right-4 lg:-right-6 max-w-[260px] bg-white dark:bg-tat-charcoal rounded-card ring-1 ring-tat-charcoal/10 dark:ring-white/10 shadow-card p-4">
                <p className="font-display italic text-tat-charcoal/85 dark:text-tat-paper/90 text-[15px] leading-snug">
                  &ldquo;I read every form myself.&rdquo;
                </p>
                <p className="mt-2 text-meta font-semibold text-tat-charcoal dark:text-tat-paper">
                  {FOUNDER_NAME}
                </p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-tat-charcoal/55 dark:text-tat-paper/60">
                  {FOUNDER_ROLE}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
