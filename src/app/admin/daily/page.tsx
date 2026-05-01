export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import {
  dailyItems,
  weeklyItems,
  todayIST,
  weekKeyIST,
} from "@/lib/daily-checks";
import DailyChecksClient from "./DailyChecksClient";

type Row = {
  item_key: string;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
  check_date: string;
};

async function loadByDate(dates: string[]): Promise<Row[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data, error } = await supabase
    .from("daily_checks")
    .select("check_date, item_key, completed, completed_at, completed_by, notes")
    .in("check_date", dates);
  if (error) {
    console.error("[daily-checks] load error:", error);
    return [];
  }
  return (data ?? []) as Row[];
}

async function loadStreak(): Promise<number> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data } = await supabase
    .from("daily_checks")
    .select("check_date, item_key, completed")
    .gte("check_date", new Date(Date.now() - 60 * 86_400_000).toISOString().slice(0, 10))
    .order("check_date", { ascending: false });
  if (!data) return 0;

  const dailyKeys = new Set(dailyItems().map((i) => i.key));
  const byDate = new Map<string, Set<string>>();
  for (const r of data) {
    if (!r.completed) continue;
    if (!dailyKeys.has(r.item_key)) continue;
    if (!byDate.has(r.check_date)) byDate.set(r.check_date, new Set());
    byDate.get(r.check_date)!.add(r.item_key);
  }
  const total = dailyKeys.size;
  let streak = 0;
  let cursor = new Date(`${todayIST()}T00:00:00+05:30`);
  for (let i = 0; i < 60; i++) {
    const k = cursor.toISOString().slice(0, 10);
    const set = byDate.get(k);
    if (set && set.size >= total) {
      streak += 1;
      cursor = new Date(cursor.getTime() - 86_400_000);
    } else {
      if (i === 0) {
        cursor = new Date(cursor.getTime() - 86_400_000);
        continue;
      }
      break;
    }
  }
  return streak;
}

/**
 * Convert ISO week key (YYYY-Www) → Monday-anchored YYYY-MM-DD so the
 * weekly items share the same `check_date` storage column as daily ones.
 */
function weekStartDate(): string {
  const istNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = istNow.getDay() || 7;
  istNow.setDate(istNow.getDate() - (day - 1));
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(istNow);
}

export default async function DailyChecksPage() {
  const today = todayIST();
  const weekStart = weekStartDate();
  const weekLabel = weekKeyIST();

  const [rows, streak] = await Promise.all([
    loadByDate(today === weekStart ? [today] : [today, weekStart]),
    loadStreak(),
  ]);

  const dailyRows = rows.filter((r) => r.check_date === today);
  const weeklyRows = rows.filter((r) => r.check_date === weekStart);

  const dailyMap = new Map(dailyRows.map((r) => [r.item_key, r]));
  const weeklyMap = new Map(weeklyRows.map((r) => [r.item_key, r]));

  const initialDaily = dailyItems().map((item) => {
    const r = dailyMap.get(item.key);
    return {
      ...item,
      completed: r?.completed ?? false,
      completedAt: r?.completed_at ?? null,
      completedBy: r?.completed_by ?? null,
      notes: r?.notes ?? "",
    };
  });
  const initialWeekly = weeklyItems().map((item) => {
    const r = weeklyMap.get(item.key);
    return {
      ...item,
      completed: r?.completed ?? false,
      completedAt: r?.completed_at ?? null,
      completedBy: r?.completed_by ?? null,
      notes: r?.notes ?? "",
    };
  });

  const dailyDone = initialDaily.filter((i) => i.completed).length;
  const weeklyDone = initialWeekly.filter((i) => i.completed).length;
  const dailyAllDone = dailyDone === initialDaily.length && initialDaily.length > 0;

  return (
    <div className="min-h-screen bg-tat-paper">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

        <header>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-slate">
            Mandatory · daily resets midnight IST · weekly resets Mon
          </p>
          <h1 className="font-display text-3xl text-tat-charcoal mt-1">Today's checks</h1>
          <p className="text-sm text-tat-slate mt-1">
            {today} · daily {dailyDone}/{initialDaily.length} · weekly {weeklyDone}/{initialWeekly.length}{" "}
            <span className="text-tat-slate/70">·</span> streak {streak}d
          </p>
        </header>

        {dailyAllDone && (
          <div className="rounded-card border border-tat-teal/40 bg-tat-teal-mist/30 px-4 py-3 text-sm text-tat-teal-deep">
            All daily clear. Ship the day.
          </div>
        )}

        <section>
          <h2 className="font-display text-sm uppercase tracking-[0.18em] text-tat-charcoal/85 mb-3">
            Daily ({initialDaily.length})
          </h2>
          <DailyChecksClient initial={initialDaily} date={today} />
        </section>

        <section>
          <h2 className="font-display text-sm uppercase tracking-[0.18em] text-tat-charcoal/85 mb-3 flex items-baseline justify-between">
            <span>Weekly ({initialWeekly.length})</span>
            <span className="text-[10px] tracking-wider text-tat-slate normal-case">
              {weekLabel} · resets Monday
            </span>
          </h2>
          <DailyChecksClient initial={initialWeekly} date={weekStart} />
        </section>

      </div>
    </div>
  );
}
