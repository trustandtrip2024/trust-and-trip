export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { DAILY_CHECK_ITEMS, todayIST } from "@/lib/daily-checks";
import DailyChecksClient from "./DailyChecksClient";

type Row = {
  item_key: string;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
};

async function loadToday(date: string): Promise<Row[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data, error } = await supabase
    .from("daily_checks")
    .select("item_key, completed, completed_at, completed_by, notes")
    .eq("check_date", date);
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
  // Look back 60 days, count consecutive days where every item completed.
  const { data } = await supabase
    .from("daily_checks")
    .select("check_date, item_key, completed")
    .gte("check_date", new Date(Date.now() - 60 * 86_400_000).toISOString().slice(0, 10))
    .order("check_date", { ascending: false });
  if (!data) return 0;
  const byDate = new Map<string, Set<string>>();
  for (const r of data) {
    if (!r.completed) continue;
    if (!byDate.has(r.check_date)) byDate.set(r.check_date, new Set());
    byDate.get(r.check_date)!.add(r.item_key);
  }
  const total = DAILY_CHECK_ITEMS.length;
  let streak = 0;
  let cursor = new Date(`${todayIST()}T00:00:00+05:30`);
  for (let i = 0; i < 60; i++) {
    const k = cursor.toISOString().slice(0, 10);
    const set = byDate.get(k);
    if (set && set.size >= total) {
      streak += 1;
      cursor = new Date(cursor.getTime() - 86_400_000);
    } else {
      // Today incomplete is not a streak break — only past days count.
      if (i === 0) {
        cursor = new Date(cursor.getTime() - 86_400_000);
        continue;
      }
      break;
    }
  }
  return streak;
}

export default async function DailyChecksPage() {
  const date = todayIST();
  const [rows, streak] = await Promise.all([loadToday(date), loadStreak()]);
  const stateByKey = new Map(rows.map((r) => [r.item_key, r]));

  const initial = DAILY_CHECK_ITEMS.map((item) => {
    const r = stateByKey.get(item.key);
    return {
      ...item,
      completed: r?.completed ?? false,
      completedAt: r?.completed_at ?? null,
      completedBy: r?.completed_by ?? null,
      notes: r?.notes ?? "",
    };
  });

  const doneCount = initial.filter((i) => i.completed).length;
  const allDone = doneCount === initial.length;

  return (
    <div className="min-h-screen bg-tat-paper">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <header className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-slate">
            Mandatory · resets at 00:00 IST
          </p>
          <h1 className="font-display text-3xl text-tat-charcoal mt-1">Today's checks</h1>
          <p className="text-sm text-tat-slate mt-1">
            {date} · {doneCount} of {initial.length} done · streak {streak}d
          </p>
        </header>

        {allDone && (
          <div className="mb-6 rounded-card border border-tat-teal/40 bg-tat-teal-mist/30 px-4 py-3 text-sm text-tat-teal-deep">
            All five clear. Ship the day.
          </div>
        )}

        <DailyChecksClient initial={initial} date={date} />
      </div>
    </div>
  );
}
