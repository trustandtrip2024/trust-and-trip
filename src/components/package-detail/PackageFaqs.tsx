import { ChevronDown } from "lucide-react";
import JsonLd from "@/components/JsonLd";

interface Faq {
  q: string;
  a: string;
}

interface Props {
  faqs: Faq[];
  /** Used to scope FAQPage JSON-LD canonical URL. */
  pageUrl: string;
}

/**
 * Package-level FAQ block. Renders Sanity faqs[] as native <details> for
 * keyboard + a11y, and emits FAQPage JSON-LD so Google can pull these
 * into rich snippets. Returns null when no FAQs — callers don't need to
 * gate the render themselves.
 */
export default function PackageFaqs({ faqs, pageUrl }: Props) {
  if (!faqs || faqs.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
    url: pageUrl,
  };

  return (
    <section id="faqs" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
      <JsonLd data={jsonLd} />

      <span className="eyebrow">Common questions</span>
      <h2 className="heading-section mt-2 mb-6 text-balance">
        Things travelers
        <span className="italic text-tat-gold font-light"> always ask.</span>
      </h2>

      <ul className="divide-y divide-tat-charcoal/8 rounded-2xl border border-tat-charcoal/8 bg-white overflow-hidden">
        {faqs.map((f, i) => (
          <li key={i}>
            <details className="group">
              <summary className="cursor-pointer list-none px-5 md:px-6 py-4 flex items-start justify-between gap-4 hover:bg-tat-cream/40 transition-colors">
                <span className="font-display text-h4 font-medium text-tat-charcoal leading-snug">
                  {f.q}
                </span>
                <ChevronDown className="h-5 w-5 shrink-0 mt-0.5 text-tat-charcoal/50 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-5 md:px-6 pb-5 -mt-1">
                <p className="text-tat-charcoal/75 leading-relaxed whitespace-pre-line">
                  {f.a}
                </p>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
