"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import JsonLd from "@/components/JsonLd";

interface Props {
  destinationName: string;
  bestTimeToVisit?: string;
  idealDuration?: string;
  priceFrom: number;
  visaFree?: boolean;
  packageCount: number;
}

interface QA {
  q: string;
  a: string;
}

export default function DestinationFAQ({
  destinationName, bestTimeToVisit, idealDuration, priceFrom, visaFree, packageCount,
}: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs: QA[] = [
    {
      q: `When is the best time to visit ${destinationName}?`,
      a: bestTimeToVisit
        ? `${bestTimeToVisit}. Our planners flex itineraries around weather windows so you land in the right season — not just on the right date.`
        : `${destinationName} works year-round, but our planners pick the right window based on what you want to do. Tell us your travel dates and we'll flag any weather caveats up front.`,
    },
    {
      q: `How many days should I plan for ${destinationName}?`,
      a: idealDuration
        ? `Most travelers find ${idealDuration} ideal in ${destinationName} — enough to settle in, see the must-dos, and still have a slow day. We can stretch or compress based on your other plans.`
        : `It depends on what you want to see. Tell our planner your interests and we'll suggest the right length, usually 5–10 days for a destination of this size.`,
    },
    {
      q: `What does a ${destinationName} trip cost on Trust and Trip?`,
      a: priceFrom > 0
        ? `Trips start at ₹${priceFrom.toLocaleString("en-IN")} per person and scale up by hotel category and season. We send a line-item quote — flights, hotel class, every inclusion — so there are no surprises later.`
        : `Pricing depends on hotel category, season, and group size. Tell us a budget per person and a planner will tailor the itinerary to land in that bracket.`,
    },
    {
      q: visaFree
        ? `Do Indian passport holders need a visa for ${destinationName}?`
        : `What about visa and passport requirements?`,
      a: visaFree
        ? `${destinationName} is visa-free or visa-on-arrival for Indian passport holders, with the usual passport-validity rules. We share the latest checklist (passport months, return-ticket proof, currency carry limits) when you confirm.`
        : `Visa rules change often. When you book, we share the current checklist for your passport — embassy appointments, document templates, and likely processing time so the visa never holds up the plan.`,
    },
    {
      q: `Can the trip be customised for honeymoon, family, or a group?`,
      a: `Yes — every itinerary is built from scratch for your group. We have ${packageCount} ${packageCount === 1 ? "starting point" : "starting points"} for ${destinationName} ranging across couple, family, group and solo styles, then we tune pace, hotel category, day length and inclusions.`,
    },
    {
      q: `What's included in a ${destinationName} package?`,
      a: `By default: hotels (with category clearly labelled), inter-city transfers, sightseeing per the day plan, applicable taxes, and on-trip planner support on WhatsApp. Flights, visa, and meals are quoted separately so you can mix and match. The detailed quote spells out every line.`,
    },
    {
      q: `What if I need to change dates or guests after I pay?`,
      a: `Free changes within 48 hours of receiving the itinerary, including swapping dates, hotels, or party size. After that we follow the supplier's refund schedule, which we share before you commit. No silent change-fees.`,
    },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={ld} />
      <div className="rounded-2xl bg-white dark:bg-white/[0.03] ring-1 ring-tat-charcoal/8 dark:ring-white/10 divide-y divide-tat-charcoal/8 dark:divide-white/10 overflow-hidden">
        {faqs.map((f, i) => (
          <details
            key={i}
            open={openIdx === i}
            onToggle={(e) => {
              if ((e.target as HTMLDetailsElement).open) setOpenIdx(i);
              else if (openIdx === i) setOpenIdx(null);
            }}
            className="group"
          >
            <summary className="cursor-pointer select-none list-none px-5 md:px-6 py-4 md:py-5 flex items-start justify-between gap-4 hover:bg-tat-cream-warm/40 dark:hover:bg-white/[0.04]">
              <h3 className="font-display text-[15px] md:text-[17px] font-medium text-tat-charcoal dark:text-tat-paper leading-snug">
                {f.q}
              </h3>
              <ChevronDown className="h-4 w-4 text-tat-charcoal/55 dark:text-tat-paper/55 transition-transform shrink-0 mt-1 group-open:rotate-180" />
            </summary>
            <div className="px-5 md:px-6 pb-5 text-[13px] md:text-[14px] leading-relaxed text-tat-charcoal/70 dark:text-tat-paper/70">
              {f.a}
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
