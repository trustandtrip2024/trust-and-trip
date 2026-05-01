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
