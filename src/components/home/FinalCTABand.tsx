"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";

const WHATSAPP_HREF =
  "https://wa.me/918115999588?text=" +
  encodeURIComponent("Hi Trust and Trip — I'd like to plan a trip.");

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  ctaLabel?: string;
  microcopy?: string;
}

export default function FinalCTABand({
  eyebrow = "Your turn",
  titleStart = "Let's build something",
  titleItalic = "worth remembering.",
  lede = "A 2-minute form. A 24-hour reply. A trip you'll talk about for years.",
  ctaLabel = "Plan my trip — free",
  microcopy = "Free until you're sure. No card needed to start.",
}: Props = {}) {
  const { open: openPlanner } = useTripPlanner();
  return (
    <section
      aria-labelledby="final-cta-title"
      className="bg-tat-charcoal text-white py-18 md:py-22"
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-3xl text-center">
        <p className="text-eyebrow uppercase font-medium text-tat-orange-soft/90">{eyebrow}</p>
        <h2 id="final-cta-title" className="mt-2 font-serif text-h1 md:text-display text-white text-balance">
          {titleStart}{" "}
          <em className="not-italic font-serif italic text-tat-orange-soft">{titleItalic}</em>
        </h2>
        <p className="mt-3 text-lead text-white/75 max-w-xl mx-auto">{lede}</p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => openPlanner()} className="tt-cta !w-auto !min-w-[220px]">
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
          <Link
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-white/85 hover:text-tat-orange-soft transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange-soft focus-visible:ring-offset-2 focus-visible:ring-offset-tat-charcoal rounded-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Or message a planner on WhatsApp
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-6 text-tag uppercase text-white/55">{microcopy}</p>
      </div>
    </section>
  );
}
