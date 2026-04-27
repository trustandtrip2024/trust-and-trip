import { Sparkles, Heart, Eye, Compass, ShieldCheck, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

const ICONS: Record<string, LucideIcon> = {
  Sparkles, Heart, Eye, Compass, ShieldCheck, Award,
};

const DEFAULT_PILLARS = [
  {
    icon: "Sparkles",
    title: "Originality",
    headline: "Hand-built, not shelf-picked.",
    body: "Every itinerary is written for you, by a planner who's actually been to the place. We don't sell pre-made packages and rebrand them as “custom.”",
    accent: "aurora" as const,
  },
  {
    icon: "Heart",
    title: "Human Care",
    headline: "One planner, start to finish.",
    body: "A named human reads your form, plans your trip, and stays with you on WhatsApp through return. Not a queue, not a chatbot — a person whose phone is on.",
    accent: "passion" as const,
  },
  {
    icon: "Eye",
    title: "Detail",
    headline: "The small things, remembered.",
    body: "Diabetic snacks pre-stocked. Aisle seats noted. Prayer-time itineraries respected. A vegetarian-only Bali dinner reservation, made three weeks ahead. The details are the trip.",
    accent: "aurora" as const,
  },
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  closingLine?: string;
  pillars?: { icon: string; title: string; headline: string; body: string; accent?: "passion" | "aurora" }[];
}

export default function WhyTrustAndTripPillars({
  eyebrow = "Why Trust and Trip",
  titleStart = "Three reasons travelers",
  titleItalic = "come back.",
  lede = "We're not the cheapest, and we're not the loudest. We're the people who pick up the phone at 11pm in Reykjavik when your luggage hasn't.",
  closingLine = "Originality. Trust. Human care. Detail. The four values that built us — still the four we lead with.",
  pillars,
}: Props = {}) {
  const items = (pillars && pillars.length >= 2) ? pillars : DEFAULT_PILLARS;

  return (
    <section
      aria-labelledby="pillars-title"
      className="relative py-20 md:py-24 overflow-hidden bg-tat-paper"
    >
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[680px] rounded-full bg-gradient-sunset blur-3xl opacity-70 pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 right-0 h-[360px] w-[360px] rounded-full bg-gradient-passion blur-[140px] opacity-15 pointer-events-none"
      />

      <div className="relative container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        <ul className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(({ icon, title, headline, body, accent }) => {
            const Icon = ICONS[icon] ?? Sparkles;
            const tile = accent === "aurora" ? "bg-gradient-aurora shadow-glow-gold" : "bg-gradient-passion shadow-glow-ember";
            const bar  = accent === "aurora" ? "bg-gradient-aurora" : "bg-gradient-passion";

            return (
              <li
                key={title}
                className="group relative rounded-card bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lift overflow-hidden"
              >
                <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${bar}`} />

                <div className="p-7 pt-8">
                  <div
                    className={`relative h-14 w-14 rounded-2xl grid place-items-center text-white ${tile} transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2.2} />
                  </div>

                  <p className="mt-5 text-[10.5px] uppercase tracking-[0.3em] font-semibold text-gradient-passion">
                    {title}
                  </p>
                  <h3 className="mt-2 font-serif text-h3 text-tat-charcoal leading-snug">
                    {headline}
                  </h3>
                  <p className="mt-3 text-body text-tat-charcoal/75 leading-relaxed">
                    {body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="relative mt-12 max-w-3xl mx-auto text-center">
          <div aria-hidden className="absolute inset-0 rounded-3xl bg-gradient-sunset opacity-50 blur-2xl pointer-events-none" />
          <p className="relative font-display text-h4 text-tat-charcoal/85 px-6">
            <span className="text-gradient-aurora font-semibold">Originality. Trust. Human care. Detail.</span>{" "}
            <span className="block mt-1">{closingLine.replace(/^Originality\. Trust\. Human care\. Detail\.\s*/, "")}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
