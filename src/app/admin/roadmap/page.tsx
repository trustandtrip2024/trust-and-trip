export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import path from "path";
import { parseAllRoadmapTasks, type ParsedTask, type RawTaskStatus } from "@/lib/roadmap-parser";
import RoadmapBoard from "./RoadmapBoard";

export type StatusRow = {
  hash: string;
  status: RawTaskStatus;
  owner: string | null;
  notes: string | null;
  updated_at: string;
};

export type HydratedTask = ParsedTask & {
  status: RawTaskStatus;
  owner: string | null;
  notes: string | null;
};

async function loadVelocity(): Promise<{ weekStart: string; done: number }[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const since = new Date(Date.now() - 28 * 86_400_000).toISOString();
  const { data } = await supabase
    .from("roadmap_tasks")
    .select("status, updated_at")
    .eq("status", "done")
    .gte("updated_at", since);
  const buckets = new Map<string, number>();
  // Bucket by ISO week start (Mon-anchored).
  for (const r of data ?? []) {
    const d = new Date(r.updated_at as string);
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() - day + 1);
    const k = d.toISOString().slice(0, 10);
    buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  // Last 4 weeks, oldest first.
  const out: { weekStart: string; done: number }[] = [];
  const base = new Date();
  const baseDay = base.getUTCDay() || 7;
  base.setUTCDate(base.getUTCDate() - baseDay + 1);
  for (let i = 3; i >= 0; i--) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const k = d.toISOString().slice(0, 10);
    out.push({ weekStart: k, done: buckets.get(k) ?? 0 });
  }
  return out;
}

async function loadStaleDoing(): Promise<number> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const cutoff = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { count } = await supabase
    .from("roadmap_tasks")
    .select("hash", { count: "exact", head: true })
    .eq("status", "doing")
    .lt("updated_at", cutoff);
  return count ?? 0;
}

async function loadStatuses(hashes: string[]): Promise<Map<string, StatusRow>> {
  if (!hashes.length) return new Map();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  // Chunk to stay under the URL length cap on the .in() filter.
  const chunks: string[][] = [];
  for (let i = 0; i < hashes.length; i += 200) chunks.push(hashes.slice(i, i + 200));

  const map = new Map<string, StatusRow>();
  for (const chunk of chunks) {
    const { data, error } = await supabase
      .from("roadmap_tasks")
      .select("hash, status, owner, notes, updated_at")
      .in("hash", chunk);
    if (error) {
      // Surface DB errors loudly during build/dev; silent on prod prevents a
      // partial board from looking authoritative.
      console.error("[roadmap] supabase load error:", error);
      continue;
    }
    for (const row of data ?? []) map.set(row.hash, row as StatusRow);
  }
  return map;
}

function hydrate(tasks: ParsedTask[], statuses: Map<string, StatusRow>): HydratedTask[] {
  return tasks.map((t) => {
    const row = statuses.get(t.hash);
    return {
      ...t,
      status: row?.status ?? (t.doneInDoc ? "done" : "todo"),
      owner: row?.owner ?? null,
      notes: row?.notes ?? null,
    };
  });
}

export default async function RoadmapPage() {
  const repoRoot = path.resolve(process.cwd());
  const tasks = await parseAllRoadmapTasks(repoRoot);
  const statuses = await loadStatuses(tasks.map((t) => t.hash));
  const hydrated = hydrate(tasks, statuses);

  const counts = {
    total: hydrated.length,
    todo: hydrated.filter((t) => t.status === "todo").length,
    doing: hydrated.filter((t) => t.status === "doing").length,
    blocked: hydrated.filter((t) => t.status === "blocked").length,
    done: hydrated.filter((t) => t.status === "done").length,
    p1: hydrated.filter((t) => t.priority === "P1").length,
    p2: hydrated.filter((t) => t.priority === "P2").length,
    p3: hydrated.filter((t) => t.priority === "P3").length,
  };

  // Source mix
  const sourceCounts = new Map<string, number>();
  for (const t of hydrated) sourceCounts.set(t.source, (sourceCounts.get(t.source) ?? 0) + 1);

  // P1 progress (most important — all P1s should be on the move)
  const p1 = hydrated.filter((t) => t.priority === "P1");
  const p1Done = p1.filter((t) => t.status === "done").length;
  const p1Pct = p1.length ? Math.round((p1Done / p1.length) * 100) : 0;

  // Velocity — last 4 weeks of done updates from roadmap_tasks
  const velocity = await loadVelocity();

  // Stale doing — tasks marked doing with no status update in > 7 days
  const staleDoing = await loadStaleDoing();

  return (
    <div className="min-h-screen bg-tat-paper">
      <div className="max-w-[1400px] mx-auto px-4 py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-tat-charcoal">Roadmap</h1>
            <p className="text-tat-slate text-sm mt-1">
              Source of truth: <code className="font-mono text-xs">DIRECTOR_AUDIT.md</code> ·{" "}
              <code className="font-mono text-xs">CONTENT_MEDIA_TODO.md</code> ·{" "}
              <code className="font-mono text-xs">OPERATOR_HANDBOOK.md</code> at repo root. Status
              tracked in <code className="font-mono text-xs">roadmap_tasks</code>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill label="Total" value={counts.total} tone="charcoal" />
            <Pill label="P1" value={counts.p1} tone="orange" />
            <Pill label="P2" value={counts.p2} tone="gold" />
            <Pill label="P3" value={counts.p3} tone="slate" />
            <Pill label="Done" value={counts.done} tone="teal" />
          </div>
        </header>

        {/* Charts row */}
        <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          {/* P1 progress ring */}
          <div className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-tat-slate font-semibold">
              P1 progress
            </p>
            <div className="mt-2 flex items-center gap-3">
              <Ring value={p1Pct} />
              <div>
                <p className="font-display text-2xl text-tat-charcoal tabular-nums">
                  {p1Done}<span className="text-tat-slate text-base">/{p1.length}</span>
                </p>
                <p className="text-[11px] text-tat-slate">
                  {p1.length === 0 ? "no P1" : p1Done === p1.length ? "all clear" : `${p1.length - p1Done} pending`}
                </p>
              </div>
            </div>
          </div>

          {/* Status stack */}
          <div className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-tat-slate font-semibold">
              Status mix
            </p>
            <div className="mt-3 h-3 rounded-full bg-tat-paper overflow-hidden flex">
              <Bar pct={(counts.todo / Math.max(1, counts.total)) * 100} cls="bg-tat-cream-warm" title={`Backlog ${counts.todo}`} />
              <Bar pct={(counts.doing / Math.max(1, counts.total)) * 100} cls="bg-tat-teal" title={`In progress ${counts.doing}`} />
              <Bar pct={(counts.blocked / Math.max(1, counts.total)) * 100} cls="bg-tat-orange" title={`Blocked ${counts.blocked}`} />
              <Bar pct={(counts.done / Math.max(1, counts.total)) * 100} cls="bg-tat-teal-deep" title={`Done ${counts.done}`} />
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-y-1 text-[11px] text-tat-charcoal/75">
              <Legend swatch="bg-tat-cream-warm" label="Backlog" value={counts.todo} />
              <Legend swatch="bg-tat-teal" label="In progress" value={counts.doing} />
              <Legend swatch="bg-tat-orange" label="Blocked" value={counts.blocked} />
              <Legend swatch="bg-tat-teal-deep" label="Done" value={counts.done} />
            </ul>
          </div>

          {/* Source breakdown */}
          <div className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-tat-slate font-semibold">
              By source doc
            </p>
            <div className="mt-2.5 space-y-1.5">
              {Array.from(sourceCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([src, count]) => {
                  const w = (count / Math.max(...sourceCounts.values())) * 100;
                  return (
                    <div key={src} className="flex items-center gap-2 text-[11px]">
                      <span className="w-32 shrink-0 truncate font-mono text-tat-charcoal/85" title={src}>
                        {src.replace(".md", "")}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-tat-paper overflow-hidden">
                        <div className="h-full bg-tat-gold rounded-full" style={{ width: `${w}%` }} />
                      </div>
                      <span className="w-6 text-right tabular-nums text-tat-charcoal/65">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Velocity */}
          <div className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] uppercase tracking-[0.16em] text-tat-slate font-semibold">
                Velocity · 4w
              </p>
              {staleDoing > 0 && (
                <span
                  className="text-[10px] font-semibold text-tat-orange"
                  title="Tasks marked doing with no update in > 7 days"
                >
                  {staleDoing} stale
                </span>
              )}
            </div>
            <div className="mt-3 flex items-end gap-1.5 h-14">
              {velocity.map((w) => {
                const max = Math.max(1, ...velocity.map((v) => v.done));
                const h = (w.done / max) * 100;
                return (
                  <div key={w.weekStart} className="flex-1 flex flex-col items-center justify-end" title={`Week of ${w.weekStart}: ${w.done} done`}>
                    <div
                      className="w-full bg-tat-teal rounded-t"
                      style={{ height: `${Math.max(4, h)}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-tat-slate/85">
              {velocity.map((w) => (
                <span key={w.weekStart}>{w.weekStart.slice(5)}</span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-tat-charcoal/65 tabular-nums">
              total this month: <span className="font-semibold">{velocity.reduce((s, v) => s + v.done, 0)}</span>
            </p>
          </div>
        </section>

        <RoadmapBoard initialTasks={hydrated} />
      </div>
    </div>
  );
}

function Pill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "charcoal" | "orange" | "gold" | "slate" | "teal";
}) {
  const toneCls = {
    charcoal: "bg-tat-charcoal text-tat-paper",
    orange: "bg-tat-orange text-white",
    gold: "bg-tat-gold text-white",
    slate: "bg-tat-slate text-white",
    teal: "bg-tat-teal text-white",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-xs font-semibold ${toneCls}`}>
      <span className="opacity-80">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </span>
  );
}

function Ring({ value }: { value: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-label={`${value}%`}>
      <circle cx="28" cy="28" r={r} stroke="rgba(42,42,42,0.1)" strokeWidth="5" fill="none" />
      <circle
        cx="28" cy="28" r={r}
        stroke="#0E7C7B" strokeWidth="5" fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 28 28)"
      />
      <text
        x="28" y="32"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui"
        fontSize="13"
        fontWeight="700"
        fill="#2A2A2A"
      >
        {value}%
      </text>
    </svg>
  );
}

function Bar({ pct, cls, title }: { pct: number; cls: string; title: string }) {
  if (pct <= 0) return null;
  return <div className={`h-full ${cls}`} style={{ width: `${pct}%` }} title={title} />;
}

function Legend({ swatch, label, value }: { swatch: string; label: string; value: number }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-sm ${swatch}`} />
      <span className="flex-1">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </li>
  );
}
