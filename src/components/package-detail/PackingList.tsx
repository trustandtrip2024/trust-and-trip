import { Backpack, ChevronDown, Check } from "lucide-react";

interface PackingCategory {
  category?: string;
  items: string[];
}

interface Props {
  list: PackingCategory[];
}

/**
 * Categorised packing list. Renders as a collapsible block — first
 * category expanded by default so the user gets an immediate sample
 * without scanning past a long closed list.
 */
export default function PackingList({ list }: Props) {
  const filled = list.filter((c) => Array.isArray(c.items) && c.items.length > 0);
  if (filled.length === 0) return null;

  return (
    <section id="packing" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
      <span className="eyebrow">Packing checklist</span>
      <h2 className="heading-section mt-2 mb-2 text-balance">
        What to
        <span className="italic text-tat-gold font-light"> bring along.</span>
      </h2>
      <p className="text-tat-charcoal/65 mb-6 text-sm leading-relaxed inline-flex items-center gap-2">
        <Backpack className="h-4 w-4 text-tat-gold" />
        Curated by our planners — destination-aware, weather-tested.
      </p>

      <ul className="rounded-2xl border border-tat-charcoal/10 bg-white overflow-hidden divide-y divide-tat-charcoal/8">
        {filled.map((c, i) => (
          <li key={`${c.category}-${i}`}>
            <details className="group" open={i === 0}>
              <summary className="cursor-pointer list-none px-5 md:px-6 py-4 flex items-center justify-between gap-3 hover:bg-tat-cream/30 transition-colors">
                <div>
                  <p className="font-display text-h4 font-medium text-tat-charcoal">
                    {c.category ?? "Items"}
                  </p>
                  <p className="text-[12px] text-tat-charcoal/55 mt-0.5">
                    {c.items.length} item{c.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <ChevronDown className="h-5 w-5 text-tat-charcoal/50 transition-transform group-open:rotate-180 shrink-0" />
              </summary>
              <ul className="px-5 md:px-6 pb-5 grid sm:grid-cols-2 gap-x-5 gap-y-2">
                {c.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-tat-charcoal/75 leading-relaxed">
                    <Check className="h-4 w-4 text-tat-gold shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
