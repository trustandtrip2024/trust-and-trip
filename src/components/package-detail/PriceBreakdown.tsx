import { Wallet, Info } from "lucide-react";

interface Breakdown {
  doubleSharing?: number;
  tripleSharing?: number;
  childUnder5?: number;
  childUnder12?: number;
  singleSupplement?: number;
}

interface Props {
  breakdown: Breakdown;
  basePrice: number;
}

function fmtINR(n: number) {
  return n.toLocaleString("en-IN");
}

const ROWS: Array<{ key: keyof Breakdown; label: string; sub: string }> = [
  { key: "doubleSharing",     label: "Double sharing",     sub: "Two travelers per room" },
  { key: "tripleSharing",     label: "Triple sharing",     sub: "Three sharing one room — best value" },
  { key: "childUnder5",       label: "Child (under 5)",    sub: "Sharing parents' bed" },
  { key: "childUnder12",      label: "Child (5–12)",       sub: "With extra bed" },
  { key: "singleSupplement",  label: "Single occupancy",   sub: "Add-on for solo travelers" },
];

/**
 * Per-occupancy price breakdown. Shown when Sanity has priceBreakdown set.
 * Returns null when fewer than 2 fields populated — a single price doesn't
 * justify a whole section.
 */
export default function PriceBreakdown({ breakdown, basePrice }: Props) {
  const filled = ROWS.filter((r) => typeof breakdown[r.key] === "number" && (breakdown[r.key] as number) > 0);
  if (filled.length < 2) return null;

  return (
    <section id="pricing" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
      <span className="eyebrow">Pricing</span>
      <h2 className="heading-section mt-2 mb-6 text-balance">
        How the
        <span className="italic text-tat-gold font-light"> price works.</span>
      </h2>

      <div className="rounded-2xl border border-tat-charcoal/10 overflow-hidden bg-white">
        <div className="px-5 md:px-6 py-4 bg-tat-cream/40 border-b border-tat-charcoal/8 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-tat-gold" />
          <p className="font-display text-h4 font-medium text-tat-charcoal">
            Per-person rates · ₹INR
          </p>
        </div>

        <ul className="divide-y divide-tat-charcoal/8">
          {filled.map((r) => {
            const v = breakdown[r.key] as number;
            return (
              <li key={r.key} className="flex items-center justify-between gap-4 px-5 md:px-6 py-3.5">
                <div>
                  <p className="font-medium text-tat-charcoal text-sm md:text-[15px]">{r.label}</p>
                  <p className="text-[12px] text-tat-charcoal/55">{r.sub}</p>
                </div>
                <p className="font-display text-h4 font-medium text-tat-charcoal whitespace-nowrap">
                  ₹{fmtINR(v)}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="px-5 md:px-6 py-3 bg-tat-cream/30 border-t border-tat-charcoal/8 flex items-start gap-2 text-[12px] text-tat-charcoal/65 leading-relaxed">
          <Info className="h-3.5 w-3.5 text-tat-charcoal/45 shrink-0 mt-0.5" />
          <span>
            Listed price <strong className="text-tat-charcoal">₹{fmtINR(basePrice)}</strong>{" "}
            assumes double sharing unless stated. Final per-person rate
            depends on room mix, batch, and add-ons.
          </span>
        </div>
      </div>
    </section>
  );
}
