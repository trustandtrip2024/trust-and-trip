import JsonLd from "@/components/JsonLd";

export interface PackageFAQItem {
  q: string;
  a: string;
}

interface Props {
  faqs?: PackageFAQItem[];
  packageTitle?: string;
}

export default function PackageFAQ({ faqs, packageTitle }: Props) {
  if (!faqs?.length) return null;

  const cleaned = faqs.filter((f) => f?.q?.trim() && f?.a?.trim());
  if (!cleaned.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: packageTitle ? `${packageTitle} — FAQ` : "Package FAQ",
    mainEntity: cleaned.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div>
      <JsonLd data={jsonLd} />
      <span className="eyebrow">Frequently asked</span>
      <h2 className="heading-section mt-2 mb-6 text-balance">
        Quick answers,
        <span className="italic text-tat-gold font-light"> no surprises.</span>
      </h2>
      <div className="space-y-2.5">
        {cleaned.map((f, i) => (
          <details
            key={i}
            className="group rounded-card bg-tat-paper dark:bg-white/[0.04] ring-1 ring-tat-charcoal/8 dark:ring-white/10 [&_summary]:list-none open:ring-tat-gold/40"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer p-4 md:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-card">
              <span className="font-medium text-tat-charcoal dark:text-tat-paper text-body">
                {f.q}
              </span>
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4 shrink-0 text-tat-charcoal/45 dark:text-tat-paper/45 transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              >
                <path
                  d="M5 7l5 6 5-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <div className="px-4 md:px-5 pb-5 -mt-1 text-body-sm text-tat-charcoal/75 dark:text-tat-paper/75 leading-relaxed whitespace-pre-line">
              {f.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
