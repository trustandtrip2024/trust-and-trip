import {
  Plane, Hotel, Utensils, Bus, Camera, Sparkles, FileCheck, ShieldCheck,
  Check, X as XIcon, MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  inclusions: string[];
  exclusions: string[];
}

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Lower-cased substrings that route a free-text item into this bucket. */
  match: string[];
}

const CATEGORIES: Category[] = [
  { id: "flights",     label: "Flights",      icon: Plane,       match: ["flight", "airfare", "airline", "boarding"] },
  { id: "hotels",      label: "Hotels & Stays", icon: Hotel,     match: ["hotel", "resort", "stay", "accommodation", "villa", "homestay", "houseboat", "lodge", "camp"] },
  { id: "meals",       label: "Meals",        icon: Utensils,    match: ["breakfast", "lunch", "dinner", "meal", "snack", "tea", "coffee", "all-inclusive", "vegetarian", "veg "] },
  { id: "transfers",   label: "Transfers",    icon: Bus,         match: ["transfer", "pickup", "drop", "car", "cab", "taxi", "private vehicle", "speedboat", "seaplane", "ferry"] },
  { id: "sightseeing", label: "Sightseeing",  icon: Camera,      match: ["sightseeing", "tour", "guide", "entry", "ticket", "monument", "park", "museum"] },
  { id: "activities",  label: "Activities",   icon: Sparkles,    match: ["activity", "experience", "snorkel", "scuba", "trek", "hike", "cycle", "raft", "spa", "yoga", "ritual", "darshan"] },
  { id: "visa",        label: "Visa & Permits", icon: FileCheck, match: ["visa", "permit", "etoken", "registration", "yatra registration"] },
  { id: "insurance",   label: "Insurance & Support", icon: ShieldCheck, match: ["insurance", "support", "24/7", "concierge", "assist"] },
];

function classify(item: string): string {
  const lc = item.toLowerCase();
  for (const c of CATEGORIES) {
    if (c.match.some((m) => lc.includes(m))) return c.id;
  }
  return "other";
}

function group(items: string[]) {
  const buckets: Record<string, string[]> = {};
  for (const it of items) {
    const cat = classify(it);
    (buckets[cat] ??= []).push(it);
  }
  return buckets;
}

export default function PackageInclusionsGrouped({ inclusions, exclusions }: Props) {
  const inc = group(inclusions);
  const exc = group(exclusions);

  // Show only categories that have at least one item on either side. Other
  // (unclassified) items always render last.
  const visible = CATEGORIES.filter((c) => inc[c.id]?.length || exc[c.id]?.length);
  const hasOther = inc["other"]?.length || exc["other"]?.length;

  return (
    <div className="space-y-3">
      {visible.map((c) => {
        const Icon = c.icon;
        const incItems = inc[c.id] ?? [];
        const excItems = exc[c.id] ?? [];
        return (
          <details
            key={c.id}
            open
            className="group rounded-card bg-tat-paper dark:bg-white/[0.04] ring-1 ring-tat-charcoal/8 dark:ring-white/10 [&_summary]:list-none"
          >
            <summary className="flex items-center justify-between gap-3 cursor-pointer p-4 md:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-card">
              <span className="inline-flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-tat-burnt/10 dark:bg-tat-gold/15 text-tat-burnt dark:text-tat-gold shrink-0">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block font-display text-h4 text-tat-charcoal dark:text-tat-paper leading-tight">
                    {c.label}
                  </span>
                  <span className="block text-meta text-tat-slate/70 dark:text-tat-paper/55 leading-tight">
                    {incItems.length} included{excItems.length > 0 ? ` · ${excItems.length} not included` : ""}
                  </span>
                </span>
              </span>
              <ChevronGlyph />
            </summary>
            <div className="px-4 md:px-5 pb-5 grid gap-4 md:grid-cols-2">
              {incItems.length > 0 && (
                <ul className="space-y-1.5">
                  {incItems.map((it, i) => (
                    <li key={i} className="flex items-start gap-2 text-body-sm text-tat-charcoal/80 dark:text-tat-paper/80">
                      <Check className="h-3.5 w-3.5 mt-1 shrink-0 text-emerald-600" aria-hidden />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              )}
              {excItems.length > 0 && (
                <ul className="space-y-1.5">
                  {excItems.map((it, i) => (
                    <li key={i} className="flex items-start gap-2 text-body-sm text-tat-slate/70 dark:text-tat-paper/55">
                      <XIcon className="h-3.5 w-3.5 mt-1 shrink-0 text-tat-slate/50" aria-hidden />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        );
      })}

      {hasOther && (
        <details className="group rounded-card bg-tat-paper dark:bg-white/[0.04] ring-1 ring-tat-charcoal/8 dark:ring-white/10 [&_summary]:list-none">
          <summary className="flex items-center justify-between gap-3 cursor-pointer p-4 md:p-5">
            <span className="inline-flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-tat-charcoal/8 dark:bg-white/10 text-tat-charcoal/70 dark:text-tat-paper/70 shrink-0">
                <MoreHorizontal className="h-4 w-4" aria-hidden />
              </span>
              <span>
                <span className="block font-display text-h4 text-tat-charcoal dark:text-tat-paper leading-tight">
                  Other
                </span>
                <span className="block text-meta text-tat-slate/70 dark:text-tat-paper/55 leading-tight">
                  {(inc["other"]?.length ?? 0) + (exc["other"]?.length ?? 0)} more
                </span>
              </span>
            </span>
            <ChevronGlyph />
          </summary>
          <div className="px-4 md:px-5 pb-5 grid gap-4 md:grid-cols-2">
            {inc["other"]?.length ? (
              <ul className="space-y-1.5">
                {inc["other"].map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-body-sm text-tat-charcoal/80 dark:text-tat-paper/80">
                    <Check className="h-3.5 w-3.5 mt-1 shrink-0 text-emerald-600" aria-hidden />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {exc["other"]?.length ? (
              <ul className="space-y-1.5">
                {exc["other"].map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-body-sm text-tat-slate/70 dark:text-tat-paper/55">
                    <XIcon className="h-3.5 w-3.5 mt-1 shrink-0 text-tat-slate/50" aria-hidden />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </details>
      )}
    </div>
  );
}

function ChevronGlyph() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0 text-tat-charcoal/45 dark:text-tat-paper/45 transition-transform duration-200 group-open:rotate-180"
      aria-hidden
    >
      <path d="M5 7l5 6 5-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
