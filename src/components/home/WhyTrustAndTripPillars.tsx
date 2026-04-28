import Link from "next/link";
import { Sparkles, Heart, Eye, Compass, ShieldCheck, Award, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

const ICONS: Record<string, LucideIcon> = {
  Sparkles, Heart, Eye, Compass, ShieldCheck, Award,
};

interface Pillar {
  icon: string;
  title: string;
  headline: string;
  body: string;
  /** Concrete proof point — shown as a stat ribbon at the top of the card. */
  proof?: { value: string; label: string };
  accent?: "passion" | "aurora";
}

const DEFAULT_PILLARS: Pillar[] = [
  {
    icon: "Sparkles",
    title: "Originality",
    headline: "Hand-built, not shelf-picked.",
    body: "Every itinerary is written for you, by a planner who's actually been to the place. We don't sell pre-made packages and rebrand them as “custom.”",
    proof: { value: "100%", label: "custom-built itineraries" },
    accent: "aurora",
  },
  {
    icon: "Heart",
    title: "Human Care",
    headline: "One planner, start to finish.",
    body: "A named human reads your form, plans your trip, and stays with you on WhatsApp through return. Not a queue, not a chatbot — a person whose phone is on.",
    proof: { value: "<5 min", label: "average WhatsApp reply" },
    accent: "passion",
  },
  {
    icon: "Eye",
    title: "Detail",
    headline: "The small things, remembered.",
    body: "Diabetic snacks pre-stocked. Aisle seats noted. Prayer-time itineraries respected. A vegetarian-only Bali dinner reservation, made three weeks ahead. The details are the trip.",
    proof: { value: "8,000+", label: "trips, hand-detailed since 2019" },
    accent: "aurora",
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
  titleStart = "Three reasons travelers",
  titleItalic = "come back.",
  lede,
  closingLine = "Originality. Trust. Human care. Detail.",
  pillars,
}: Props = {}) {
  const items = (pillars && pillars.length >= 2) ? pillars : DEFAULT_PILLARS;

  return (
    <section
      aria-labelledby="pillars-title"
      className="relative py-20 md:py-28 overflow-hidden bg-tat-paper"
    >
      {/* Layered radial glows so the section reads as a hero break, not a
          plain stripe between rails. */}
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[760px] rounded-full bg-gradient-sunset blur-3xl opacity-60 pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -right-20 h-[420px] w-[420px] rounded-full bg-gradient-passion blur-[160px] opacity-20 pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute top-1/2 -left-40 h-[320px] w-[320px] rounded-full bg-tat-teal/30 blur-[140px] opacity-50 pointer-events-none"
      />

      <div className="relative container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        {/* Connecting dotted line between cards on desktop — visually links
            the three pillars as a journey rather than three islands. */}
        <div className="relative mt-14 md:mt-16">
          <div
            aria-hidden
            className="hidden lg:block absolute top-[100px] left-[16%] right-[16%] h-px border-t-2 border-dashed border-tat-burnt/25 pointer-events-none"
          />

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
            {items.map(({ icon, title, headline, body, proof, accent }, idx) => {
              const Icon = ICONS[icon] ?? Sparkles;
              const tile = accent === "aurora"
                ? "bg-gradient-aurora shadow-glow-gold"
                : "bg-gradient-passion shadow-glow-ember";
              const numColor = accent === "aurora" ? "text-tat-teal/12" : "text-tat-burnt/12";

              return (
                <li
                  key={title}
                  className="group relative rounded-3xl bg-white dark:bg-white/5 ring-1 ring-tat-charcoal/8 dark:ring-white/10 shadow-card hover:shadow-premium-lift transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Animated gradient border on hover. Sits behind content. */}
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(242,179,64,0.18) 0%, rgba(194,84,28,0.18) 50%, rgba(14,124,123,0.18) 100%)",
                      mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                      WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                      maskComposite: "exclude",
                      WebkitMaskComposite: "xor",
                      padding: "1.5px",
                    }}
                  />

                  {/* Background numeral — huge, low opacity, sits behind text. */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute -top-6 -right-2 font-display font-semibold text-[160px] leading-none ${numColor} select-none transition-transform duration-700 group-hover:translate-x-1 group-hover:-translate-y-1`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <div className="relative p-7 md:p-8 pt-9">
                    {/* Stat ribbon — the concrete proof, anchored top-left. */}
                    {proof && (
                      <div className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-full bg-tat-charcoal/[0.04] dark:bg-white/10 border border-tat-charcoal/8 dark:border-white/10 mb-6">
                        <span className="font-display text-[15px] font-semibold text-tat-burnt dark:text-tat-gold">
                          {proof.value}
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.14em] text-tat-charcoal/60 dark:text-tat-paper/65">
                          {proof.label}
                        </span>
                      </div>
                    )}

                    <div
                      className={`relative h-14 w-14 rounded-2xl grid place-items-center text-white ${tile} transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6`}
                    >
                      <Icon className="h-6 w-6" strokeWidth={2.2} />
                      {/* Pulse ring */}
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-2xl ring-2 ring-tat-gold/40 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700"
                      />
                    </div>

                    <p className="mt-5 text-[10.5px] uppercase tracking-[0.3em] font-semibold text-gradient-passion">
                      {title}
                    </p>
                    <h3 className="mt-2 font-display text-2xl md:text-[26px] font-medium text-tat-charcoal dark:text-tat-paper leading-snug text-balance">
                      {headline}
                    </h3>
                    <p className="mt-3 text-body text-tat-charcoal/75 dark:text-tat-paper/75 leading-relaxed">
                      {body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Closing band: brand mantra + CTA pair so the section ends with an
            action, not just a quote. */}
        <div className="relative mt-14 md:mt-16">
          <div aria-hidden className="absolute inset-0 rounded-3xl bg-gradient-sunset opacity-40 blur-2xl pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center px-6 md:px-10 py-7 md:py-9 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-sm ring-1 ring-tat-charcoal/8 dark:ring-white/10">
            <p className="font-display text-2xl md:text-[28px] font-medium leading-snug text-tat-charcoal dark:text-tat-paper text-balance">
              <span className="text-gradient-aurora font-semibold">{closingLine}</span>
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full bg-tat-charcoal text-tat-paper text-[13px] font-semibold hover:bg-tat-burnt transition-colors"
              >
                Read our story
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/reviews"
                className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full bg-transparent border border-tat-charcoal/20 dark:border-white/20 text-tat-charcoal dark:text-tat-paper text-[13px] font-semibold hover:bg-tat-charcoal/5 dark:hover:bg-white/5 transition-colors"
              >
                Read 4.9★ reviews
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
