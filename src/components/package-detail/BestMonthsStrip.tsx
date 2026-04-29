import { CalendarDays } from "lucide-react";

interface Month {
  month: number;
  tag?: "peak" | "shoulder" | "off" | "avoid";
  note?: string;
}

interface Props {
  months: Month[];
  destinationName: string;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TAG_STYLES: Record<NonNullable<Month["tag"]>, { bg: string; text: string; ring: string; label: string }> = {
  peak:     { bg: "bg-tat-gold/15",     text: "text-tat-charcoal",       ring: "ring-tat-gold/40",       label: "Peak"     },
  shoulder: { bg: "bg-tat-teal/15",     text: "text-tat-teal-deep",      ring: "ring-tat-teal/35",       label: "Shoulder" },
  off:      { bg: "bg-tat-charcoal/8",  text: "text-tat-charcoal/70",    ring: "ring-tat-charcoal/15",   label: "Off"      },
  avoid:    { bg: "bg-tat-orange/12",   text: "text-tat-orange",         ring: "ring-tat-orange/30",     label: "Avoid"    },
};

/**
 * 12-month best-time strip. Each month tile gets a tag (peak/shoulder/off/
 * avoid) and an optional note ("Whale-watching window"). Months not
 * present in Sanity render as a quiet untagged tile so the strip is
 * always 12-wide.
 */
export default function BestMonthsStrip({ months, destinationName }: Props) {
  if (!months || months.length === 0) return null;

  const byMonth = new Map<number, Month>();
  for (const m of months) {
    if (m.month >= 1 && m.month <= 12) byMonth.set(m.month, m);
  }

  return (
    <section id="best-time" className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
      <span className="eyebrow">Best time to travel</span>
      <h2 className="heading-section mt-2 mb-2 text-balance">
        When {destinationName}
        <span className="italic text-tat-gold font-light"> shines.</span>
      </h2>
      <p className="text-tat-charcoal/65 mb-6 text-sm leading-relaxed">
        Climate windows tagged for this trip — peak months are hotel-priced
        accordingly, shoulder months trade weather for value.
      </p>

      <ul className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const m = byMonth.get(i + 1);
          const style = m?.tag ? TAG_STYLES[m.tag] : null;
          return (
            <li
              key={i}
              className={`rounded-xl border border-tat-charcoal/8 px-2 py-3 text-center ${style ? `${style.bg} ring-1 ${style.ring}` : "bg-white"}`}
              title={m?.note ?? ""}
            >
              <p className={`text-[10px] uppercase tracking-[0.16em] font-semibold ${style ? style.text : "text-tat-charcoal/55"}`}>
                {MONTH_LABELS[i]}
              </p>
              {style && (
                <p className={`mt-1 text-[10px] font-bold ${style.text}`}>
                  {style.label}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/* Notes legend */}
      {months.some((m) => m.note) && (
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-tat-charcoal/70">
          {months.filter((m) => m.note).map((m) => (
            <li key={m.month} className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3 text-tat-gold" />
              <strong className="font-semibold text-tat-charcoal">{MONTH_LABELS[m.month - 1]}:</strong>{" "}
              <span>{m.note}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
