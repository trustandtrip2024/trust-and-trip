const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Props {
  /** Free-text best-time-to-visit string from CMS, e.g. "Apr to Oct, except July monsoon" */
  bestTimeToVisit?: string;
}

type Tier = "peak" | "shoulder" | "off";

function classifyMonth(idx: number, bestTimeToVisit: string | undefined): Tier {
  if (!bestTimeToVisit) return "shoulder";
  const t = bestTimeToVisit.toLowerCase();
  const month = MONTHS[idx].toLowerCase();
  const monthFull = [
    "january","february","march","april","may","june",
    "july","august","september","october","november","december",
  ][idx];
  // Explicit "avoid"/"except"/"monsoon" mention near the month name => off
  if (
    /avoid|except|monsoon|skip|not recommended/.test(t) &&
    (t.includes(month) || t.includes(monthFull))
  ) {
    return "off";
  }
  if (t.includes(month) || t.includes(monthFull)) return "peak";
  return "off";
}

const TIER_STYLES: Record<Tier, { bar: string; label: string; pillBg: string; pillText: string }> = {
  peak:     { bar: "bg-tat-gold",                label: "Peak",     pillBg: "bg-tat-gold/15",       pillText: "text-tat-gold" },
  shoulder: { bar: "bg-tat-teal/60",             label: "Shoulder", pillBg: "bg-tat-teal/15",       pillText: "text-tat-teal-deep" },
  off:      { bar: "bg-tat-charcoal/15 dark:bg-white/15", label: "Off-season", pillBg: "bg-tat-charcoal/8 dark:bg-white/10", pillText: "text-tat-charcoal/55 dark:text-tat-paper/55" },
};

export default function DestinationMonthBar({ bestTimeToVisit }: Props) {
  const currentMonth = new Date().getMonth();
  const tiers = MONTHS.map((_, i) => classifyMonth(i, bestTimeToVisit));

  return (
    <div className="rounded-2xl bg-tat-paper dark:bg-white/[0.03] ring-1 ring-tat-charcoal/8 dark:ring-white/10 p-5 md:p-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-gold">When to go</p>
          <h3 className="mt-1 font-display text-[18px] md:text-[20px] font-medium text-tat-charcoal dark:text-tat-paper">
            Twelve months at a glance
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <Legend tier="peak" />
          <Legend tier="shoulder" />
          <Legend tier="off" />
        </div>
      </div>

      <ul role="list" className="mt-4 grid grid-cols-12 gap-1 md:gap-1.5">
        {MONTHS.map((m, i) => {
          const tier = tiers[i];
          const styles = TIER_STYLES[tier];
          const isCurrent = i === currentMonth;
          return (
            <li
              key={m}
              className="flex flex-col items-center gap-1.5"
              aria-label={`${m}: ${styles.label}`}
            >
              <div
                className={[
                  "h-9 md:h-12 w-full rounded-md transition",
                  styles.bar,
                  isCurrent && "ring-2 ring-tat-gold ring-offset-2 ring-offset-tat-paper dark:ring-offset-tat-charcoal",
                ].filter(Boolean).join(" ")}
              />
              <span className={[
                "text-[9px] md:text-[10px] uppercase tracking-wider",
                isCurrent ? "text-tat-gold font-bold" : "text-tat-charcoal/55 dark:text-tat-paper/55 font-medium",
              ].join(" ")}>
                {m}
              </span>
            </li>
          );
        })}
      </ul>

      {bestTimeToVisit && (
        <p className="mt-4 text-[12px] text-tat-charcoal/65 dark:text-tat-paper/65 italic">
          Planner&rsquo;s note · {bestTimeToVisit}
        </p>
      )}
    </div>
  );
}

function Legend({ tier }: { tier: Tier }) {
  const s = TIER_STYLES[tier];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${s.pillBg} ${s.pillText} text-[10px] font-semibold uppercase tracking-wider`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.bar}`} />
      {s.label}
    </span>
  );
}
