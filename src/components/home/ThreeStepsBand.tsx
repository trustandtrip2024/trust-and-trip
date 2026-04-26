import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

const DEFAULT_STEPS = [
  { n: "01", title: "Tell us your dream",          body: "Where, when, who's coming, and what you can't live without. A 2-minute form is all we need." },
  { n: "02", title: "A planner reads it — really", body: "Not a bot. A named human at our office, who'll stay with you from enquiry through return." },
  { n: "03", title: "Get a custom itinerary",      body: "Usually within 24 hours. Edit it freely, switch hotels, change cities. Pay only when you're sure." },
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  closingLine?: string;
  steps?: { n: string; title: string; body: string }[];
}

export default function ThreeStepsBand({
  eyebrow = "How it works",
  titleStart = "Three steps. One planner.",
  titleItalic = "Zero stress.",
  lede = "No call centres, no auto-emails, no generic packages. Just one human, building your trip with you.",
  closingLine = "Free until you're sure. That's the promise.",
  steps,
}: Props = {}) {
  const items = steps && steps.length === 3 ? steps : DEFAULT_STEPS;
  return (
    <section
      aria-labelledby="steps-title"
      className="bg-stone-50 py-18 md:py-22 border-y border-stone-200/70"
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-6xl">
        <div className="text-center">
          <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} align="center" />
        </div>

        <ol className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((s) => (
            <li key={s.n} className="tt-card tt-card-p">
              <p className="font-serif text-h2 text-amber-700/80">{s.n}</p>
              <h3 className="mt-2 font-serif text-h3 text-stone-900">{s.title}</h3>
              <p className="mt-2 text-body text-stone-700">{s.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-center font-serif italic text-h4 text-amber-700/80">
          {closingLine}
        </p>

        <div className="mt-6 flex justify-center">
          <Link href="/plan" className="tt-cta !w-auto !min-w-[220px]">
            Plan my trip — free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
