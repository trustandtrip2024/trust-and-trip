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
  },
  {
    icon: "Heart",
    title: "Human Care",
    headline: "One planner, start to finish.",
    body: "A named human reads your form, plans your trip, and stays with you on WhatsApp through return. Not a queue, not a chatbot — a person whose phone is on.",
  },
  {
    icon: "Eye",
    title: "Detail",
    headline: "The small things, remembered.",
    body: "Diabetic snacks pre-stocked. Aisle seats noted. Prayer-time itineraries respected. A vegetarian-only Bali dinner reservation, made three weeks ahead. The details are the trip.",
  },
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  closingLine?: string;
  pillars?: { icon: string; title: string; headline: string; body: string }[];
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
    <section aria-labelledby="pillars-title" className="py-18 md:py-22">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        <ul className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map(({ icon, title, headline, body }) => {
            const Icon = ICONS[icon] ?? Sparkles;
            return (
              <li key={title} className="tt-card tt-card-p">
                <div className="h-10 w-10 rounded-md bg-amber-50 grid place-items-center text-amber-700">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 tt-eyebrow">{title}</p>
                <h3 className="mt-2 font-serif text-h3 text-stone-900">{headline}</h3>
                <p className="mt-3 text-body text-stone-700 leading-relaxed">{body}</p>
              </li>
            );
          })}
        </ul>

        <p className="mt-10 text-center font-serif italic text-h4 text-stone-700 max-w-3xl mx-auto">
          {closingLine}
        </p>
      </div>
    </section>
  );
}
