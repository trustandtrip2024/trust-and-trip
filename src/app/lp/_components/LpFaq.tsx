import { ChevronDown } from "lucide-react";

export interface LpFaqItem {
  q: string;
  a: string;
}

/**
 * Per-LP FAQ accordion — renders a native <details>/<summary> structure
 * (no JS), pairs with FAQPage JSON-LD emitted from the page so search
 * engines see the same Q&As they render. Matches the brand voice: teal
 * accents, gold eyebrows, charcoal copy.
 */
export default function LpFaq({
  eyebrow = "Frequently asked",
  titleStart,
  titleItalic,
  items,
}: {
  eyebrow?: string;
  titleStart: string;
  titleItalic: string;
  items: LpFaqItem[];
}) {
  return (
    <section className="py-16 md:py-20 bg-tat-paper border-y border-tat-charcoal/10" aria-labelledby="lp-faq-title">
      <div className="container-custom max-w-3xl">
        <p className="tt-eyebrow">{eyebrow}</p>
        <h2 id="lp-faq-title" className="mt-2 heading-section text-tat-charcoal leading-tight">
          {titleStart}
          <span className="italic text-tat-gold font-light"> {titleItalic}</span>
        </h2>

        <ul className="mt-8 divide-y divide-tat-charcoal/10 border-y border-tat-charcoal/10">
          {items.map((item) => (
            <li key={item.q}>
              <details className="group">
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-teal/40 focus-visible:rounded-md">
                  <span className="font-display text-lg md:text-xl font-medium text-tat-charcoal text-balance">
                    {item.q}
                  </span>
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-tat-gold transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="pb-5 -mt-1 text-tat-charcoal/75 leading-relaxed text-base">
                  {item.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
