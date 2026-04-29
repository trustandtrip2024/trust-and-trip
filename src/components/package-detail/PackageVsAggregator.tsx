import { TrendingDown, ShieldCheck, MessageCircle } from "lucide-react";
import Price from "@/components/Price";

interface Props {
  ourPrice: number;
  theirPrice: number;
  packageTitle?: string;
}

/**
 * "Same trip, less spend" comparison card. Renders a side-by-side price
 * with the savings amount and three concrete reasons we come in lower
 * than aggregators. Pure server component — no JS.
 *
 * Hidden if `theirPrice` is missing or not strictly higher than `ourPrice`.
 */
export default function PackageVsAggregator({ ourPrice, theirPrice, packageTitle }: Props) {
  if (!theirPrice || theirPrice <= ourPrice) return null;

  const saving = theirPrice - ourPrice;
  const pct = Math.round((saving / theirPrice) * 100);

  return (
    <section
      aria-labelledby="vs-agg-title"
      className="rounded-card bg-emerald-50/60 dark:bg-emerald-900/15 ring-1 ring-emerald-300/50 dark:ring-emerald-700/40 p-5 md:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-white">
          <TrendingDown className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 id="vs-agg-title" className="font-display font-normal text-h3 text-tat-charcoal dark:text-tat-paper">
            Same trip,{" "}
            <em className="not-italic font-display italic text-emerald-700 dark:text-emerald-400">
              less spend.
            </em>
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-4 max-w-md">
            <div>
              <p className="text-meta uppercase tracking-wider text-tat-slate/80">Aggregator price</p>
              <p className="mt-1 font-display text-h2 text-tat-slate line-through tnum">
                <Price inr={theirPrice} />
              </p>
            </div>
            <div>
              <p className="text-meta uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">Our price</p>
              <p className="mt-1 font-display text-h2 text-tat-charcoal dark:text-tat-paper tnum">
                <Price inr={ourPrice} />
              </p>
            </div>
          </div>

          <p className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-emerald-600 text-white text-meta font-semibold">
            You save <Price inr={saving} className="tnum" /> · {pct}% lower
          </p>

          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-meta text-tat-charcoal/75 dark:text-tat-paper/75">
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              No middle-marketplace cut
            </li>
            <li className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              Direct planner, no chatbot queue
            </li>
            <li className="inline-flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              Hotel/transfer rates we negotiate
            </li>
          </ul>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-tat-charcoal/45 dark:text-tat-paper/45 italic">
        {packageTitle ? `Comparison for "${packageTitle}". ` : ""}Aggregator price compiled from public listings on MakeMyTrip / Yatra at the time of writing.
      </p>
    </section>
  );
}
