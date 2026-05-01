"use client";

import { useMemo, useState, useTransition } from "react";
import type { HydratedTask } from "./page";
import type { RawTaskStatus } from "@/lib/roadmap-parser";

type Filter = {
  source: "all" | string;
  priority: "all" | "P1" | "P2" | "P3";
  hideDone: boolean;
  query: string;
};

const STATUSES: { id: RawTaskStatus; label: string; tone: string }[] = [
  { id: "todo",    label: "Backlog",     tone: "bg-tat-cream-warm/60 border-tat-charcoal/15" },
  { id: "doing",   label: "In progress", tone: "bg-tat-teal-mist/40 border-tat-teal/30" },
  { id: "blocked", label: "Blocked",     tone: "bg-tat-orange-soft/30 border-tat-orange/30" },
  { id: "done",    label: "Done",        tone: "bg-tat-teal/15 border-tat-teal/40" },
];

const PRIORITY_TONE: Record<"P1" | "P2" | "P3", string> = {
  P1: "bg-tat-orange text-white",
  P2: "bg-tat-gold text-white",
  P3: "bg-tat-slate/90 text-white",
};

export default function RoadmapBoard({ initialTasks }: { initialTasks: HydratedTask[] }) {
  const [tasks, setTasks] = useState<HydratedTask[]>(initialTasks);
  const [filter, setFilter] = useState<Filter>({
    source: "all",
    priority: "all",
    hideDone: false,
    query: "",
  });
  const [, startTransition] = useTransition();
  const [savingHash, setSavingHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sources = useMemo(
    () => Array.from(new Set(initialTasks.map((t) => t.source))).sort(),
    [initialTasks],
  );

  const filtered = useMemo(() => {
    const q = filter.query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filter.source !== "all" && t.source !== filter.source) return false;
      if (filter.priority !== "all" && t.priority !== filter.priority) return false;
      if (filter.hideDone && t.status === "done") return false;
      if (q && !t.text.toLowerCase().includes(q) && !t.lane.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tasks, filter]);

  async function patch(hash: string, fields: Partial<Pick<HydratedTask, "status" | "owner" | "notes">>) {
    setSavingHash(hash);
    setErrorMsg(null);
    const before = tasks;
    // Optimistic update.
    startTransition(() => {
      setTasks((prev) => prev.map((t) => (t.hash === hash ? { ...t, ...fields } : t)));
    });
    try {
      const res = await fetch("/api/admin/roadmap", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash, ...fields }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
    } catch (e) {
      // Rollback.
      setTasks(before);
      setErrorMsg((e as Error).message);
    } finally {
      setSavingHash(null);
    }
  }

  function exportJson() {
    const payload = tasks.map((t) => ({
      hash: t.hash,
      source: t.source,
      lane: t.lane,
      text: t.text,
      priority: t.priority,
      status: t.status,
      owner: t.owner,
      notes: t.notes,
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roadmap-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="rounded-card border border-tat-danger-fg/30 bg-tat-danger-bg/40 px-4 py-3 text-sm text-tat-danger-fg">
          Save failed: {errorMsg}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-card bg-white border border-tat-charcoal/8 px-3 py-2 shadow-soft">
        <input
          type="text"
          placeholder="Search…"
          value={filter.query}
          onChange={(e) => setFilter({ ...filter, query: e.target.value })}
          className="flex-1 min-w-[180px] bg-transparent border border-tat-charcoal/12 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-tat-gold/40"
        />
        <Select
          value={filter.source}
          onChange={(v) => setFilter({ ...filter, source: v })}
          options={[{ id: "all", label: "All docs" }, ...sources.map((s) => ({ id: s, label: s }))]}
        />
        <Select
          value={filter.priority}
          onChange={(v) => setFilter({ ...filter, priority: v as Filter["priority"] })}
          options={[
            { id: "all", label: "Any priority" },
            { id: "P1",  label: "P1 only" },
            { id: "P2",  label: "P2 only" },
            { id: "P3",  label: "P3 only" },
          ]}
        />
        <label className="inline-flex items-center gap-1.5 text-sm text-tat-charcoal/75 select-none">
          <input
            type="checkbox"
            checked={filter.hideDone}
            onChange={(e) => setFilter({ ...filter, hideDone: e.target.checked })}
            className="accent-tat-teal"
          />
          Hide done
        </label>
        <button
          type="button"
          onClick={exportJson}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-tat-charcoal/15 bg-tat-paper px-3 py-1.5 text-xs font-semibold text-tat-charcoal hover:bg-tat-cream-warm/60 transition-colors"
        >
          Export JSON
        </button>
      </div>

      {/* Kanban */}
      <div className="grid gap-4 xl:grid-cols-4">
        {STATUSES.map((col) => {
          const inCol = filtered.filter((t) => t.status === col.id);
          return (
            <section
              key={col.id}
              className={`rounded-card border ${col.tone} flex flex-col min-h-[400px]`}
            >
              <header className="px-4 py-3 border-b border-tat-charcoal/8 flex items-center justify-between">
                <h2 className="font-display text-sm uppercase tracking-[0.18em] text-tat-charcoal/85">
                  {col.label}
                </h2>
                <span className="text-xs font-semibold text-tat-charcoal/55">{inCol.length}</span>
              </header>
              <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[78vh]">
                {inCol.length === 0 && (
                  <p className="text-xs text-tat-charcoal/40 italic px-2 py-6 text-center">
                    No tasks here.
                  </p>
                )}
                {inCol.map((t) => (
                  <Card key={t.hash} task={t} saving={savingHash === t.hash} onPatch={patch} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Card({
  task,
  saving,
  onPatch,
}: {
  task: HydratedTask;
  saving: boolean;
  onPatch: (hash: string, fields: Partial<Pick<HydratedTask, "status" | "owner" | "notes">>) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draftOwner, setDraftOwner] = useState(task.owner ?? "");
  const [draftNotes, setDraftNotes] = useState(task.notes ?? "");

  return (
    <article className="rounded-md border border-tat-charcoal/10 bg-white px-3 py-2.5 shadow-soft">
      <div className="flex items-start gap-2">
        <span className={`shrink-0 rounded-pill px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${PRIORITY_TONE[task.priority]}`}>
          {task.priority}
        </span>
        <p className="text-[13px] leading-snug text-tat-charcoal flex-1">{task.text}</p>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-tat-charcoal/55">
        <span className="truncate">
          <span className="font-semibold">{task.source}</span>
          {task.section ? <> · {task.section}</> : null}
        </span>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 rounded px-1.5 py-0.5 hover:bg-tat-charcoal/5 text-tat-charcoal/70"
        >
          {expanded ? "Hide" : "Edit"}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={saving || s.id === task.status}
            onClick={() => onPatch(task.hash, { status: s.id })}
            className={`rounded px-2 py-0.5 text-[10px] font-semibold border transition ${
              s.id === task.status
                ? "bg-tat-charcoal text-white border-tat-charcoal"
                : "bg-tat-paper text-tat-charcoal/70 border-tat-charcoal/15 hover:bg-tat-cream-warm/70"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-tat-charcoal/8 pt-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.16em] text-tat-charcoal/50 font-semibold">
              Owner
            </span>
            <input
              value={draftOwner}
              onChange={(e) => setDraftOwner(e.target.value)}
              onBlur={() => {
                if (draftOwner !== (task.owner ?? "")) {
                  onPatch(task.hash, { owner: draftOwner.trim() || null });
                }
              }}
              placeholder="Akash / Eng / Ops"
              className="mt-0.5 w-full bg-tat-paper border border-tat-charcoal/12 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-tat-gold/40"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.16em] text-tat-charcoal/50 font-semibold">
              Notes
            </span>
            <textarea
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              onBlur={() => {
                if (draftNotes !== (task.notes ?? "")) {
                  onPatch(task.hash, { notes: draftNotes.trim() || null });
                }
              }}
              rows={3}
              placeholder="Blockers, decisions, links…"
              className="mt-0.5 w-full bg-tat-paper border border-tat-charcoal/12 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-tat-gold/40 resize-none"
            />
          </label>
          <p className="text-[10px] text-tat-charcoal/40">
            <code className="font-mono">{task.source}:{task.line}</code> · hash{" "}
            <code className="font-mono">{task.hash}</code>
          </p>
        </div>
      )}
    </article>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-tat-paper border border-tat-charcoal/12 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-tat-gold/40"
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
