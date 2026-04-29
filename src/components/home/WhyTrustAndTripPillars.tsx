import Link from "next/link";
import { Sparkles, Heart, Eye, Compass, ShieldCheck, Award, ArrowRight, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

const ICONS: Record<string, LucideIcon> = {
  Sparkles, Heart, Eye, Compass, ShieldCheck, Award, TrendingDown,
};

interface Pillar {
  icon: string;
  title: string;
  headline: string;
  body: string;
  proof?: { value: string; label: string };
  /** Retained for back-compat with existing Sanity content; ignored visually. */
  accent?: "passion" | "aurora";
}

const DEFAULT_PILLARS: Pillar[] = [
  {
    icon: "Sparkles",
    title: "Originality",
    headline: "Hand-built, not shelf-picked.",
    body: "Every itinerary is written for you, by a planner who's actually been to the place. We don't sell pre-made packages and rebrand them as “custom.”",
    proof: { value: "100%", label: "custom-built" },
  },
  {
    icon: "Heart",
    title: "Human Care",
    headline: "One planner, start to finish.",
    body: "A named human reads your form, plans your trip, and stays with you on WhatsApp through return. Not a queue, not a chatbot — a person whose phone is on.",
    proof: { value: "<5 min", label: "WhatsApp reply" },
  },
  {
    icon: "Eye",
    title: "Detail",
    headline: "The small things, remembered.",
    body: "Diabetic snacks pre-stocked. Aisle seats noted. Prayer-time itineraries respected. A vegetarian-only Bali dinner, reserved three weeks ahead.",
    proof: { value: "8,000+", label: "trips since 2019" },
  },
  {
    icon: "TrendingDown",
    title: "Honest pricing",
    headline: "Same hotels, less padding.",
    body: "Aggregators stack 12-18% commission on every booking. We don't. Hotels quote us net rates and we pass the saving on, line-itemised in your quote — taxes, GST, TCS, all of it.",
    proof: { value: "~12%", label: "saved vs. OTAs" },
  },
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  closingLine?: string;
  pillars?: Pillar[];
}

export default function WhyTrustAndTripPillars({
  eyebrow = "Why Trust and Trip",
  titleStart = "Four reasons travelers",
  titleItalic = "come back.",
  lede,
  closingLine = "Originality. Human care. Detail. Honest pricing.",
  pillars,
}: Props = {}) {
  const items = (pillars && pillars.length >= 2) ? pillars : DEFAULT_PILLARS;

  return (
    <section
      aria-labelledby="pillars-title"
      className="py-16 md:py-24 bg-tat-paper dark:bg-tat-charcoal/95"
    >
      <div className="container-custom max-w-6xl">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} align="center" />

        <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
          {items.map(({ icon, title, headline, body, proof }, idx) => {
            const Icon = ICONS[icon] ?? Sparkles;

            return (
              <li
                key={title}
                className="relative flex flex-col rounded-2xl bg-white dark:bg-white/5 ring-1 ring-tat-charcoal/8 dark:ring-white/10 px-6 py-7 md:px-7 md:py-8 transition duration-200 hover:ring-tat-gold/30"
              >
                {/* Tiny index — sits as a hairline number, not a billboard. */}
                <span
                  aria-hidden
                  className="font-display text-[13px] tracking-[0.32em] text-tat-gold/70 dark:text-tat-gold/80"
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* Quiet outlined icon — no gradient tile. */}
                <div className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-tat-gold/30 text-tat-gold dark:text-tat-gold dark:ring-tat-gold/30">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden />
                </div>

                <p className="mt-5 text-[11px] uppercase tracking-[0.22em] font-medium text-tat-charcoal/55 dark:text-tat-paper/55">
                  {title}
                </p>
                <h3 className="mt-1.5 font-display font-normal text-[20px] md:text-[22px] leading-snug text-tat-charcoal dark:text-tat-paper text-balance">
                  {headline}
                </h3>
                <p className="mt-3 text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70 leading-relaxed">
                  {body}
                </p>

                {proof && (
                  <div className="mt-6 pt-4 border-t border-tat-charcoal/8 dark:border-white/10 flex items-baseline gap-2">
                    <span className="font-display text-[16px] font-medium text-tat-gold dark:text-tat-gold">
                      {proof.value}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.16em] text-tat-charcoal/50 dark:text-tat-paper/55">
                      {proof.label}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Closing — restrained centred line + two quiet links. */}
        <div className="mt-14 md:mt-16 text-center">
          <p className="font-display italic text-lg md:text-xl text-tat-charcoal/75 dark:text-tat-paper/80">
            {closingLine}
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center">
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-1.5 text-body-sm font-semibold text-tat-charcoal dark:text-tat-paper underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
            >
              Read our story
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span aria-hidden className="hidden sm:inline-block w-px h-4 bg-tat-charcoal/20 self-center" />
            <Link
              href="/reviews"
              className="inline-flex items-center justify-center gap-1.5 text-body-sm font-semibold text-tat-gold dark:text-tat-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
            >
              Read 4.9★ reviews
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
