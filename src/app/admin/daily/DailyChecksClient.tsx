"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Loader2, ExternalLink } from "lucide-react";
import type { DailyCheckItem } from "@/lib/daily-checks";

type Item = DailyCheckItem & {
  completed: boolean;
  completedAt: string | null;
  completedBy: string | null;
  notes: string;
};

export default function DailyChecksClient({ initial, date }: { initial: Item[]; date: string }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function patch(key: string, fields: Partial<Pick<Item, "completed" | "notes">>) {
    setBusyKey(key);
    setErrorMsg(null);
    const before = items;
    startTransition(() => {
      setItems((prev) =>
        prev.map((i) =>
          i.key === key
            ? {
                ...i,
                ...fields,
                completedAt: fields.completed ? new Date().toISOString() : i.completedAt,
              }
            : i,
        ),
      );
    });
    try {
      const res = await fetch("/api/admin/daily", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, item_key: key, ...fields }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
    } catch (e) {
      setItems(before);
      setErrorMsg((e as Error).message);
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="rounded-card border border-tat-danger-fg/30 bg-tat-danger-bg/40 px-4 py-3 text-sm text-tat-danger-fg">
          Save failed: {errorMsg}
        </div>
      )}
      {items.map((it) => (
        <Card key={it.key} item={it} busy={busyKey === it.key} onPatch={patch} />
      ))}
    </div>
  );
}

function Card({
  item,
  busy,
  onPatch,
}: {
  item: Item;
  busy: boolean;
  onPatch: (key: string, fields: Partial<Pick<Item, "completed" | "notes">>) => Promise<void>;
}) {
  const [draftNotes, setDraftNotes] = useState(item.notes ?? "");
  const [showNotes, setShowNotes] = useState(false);

  return (
    <article
      className={`rounded-card border px-4 py-3 transition-colors ${
        item.completed
          ? "bg-tat-teal-mist/20 border-tat-teal/35"
          : "bg-white border-tat-charcoal/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => onPatch(item.key, { completed: !item.completed })}
          className={`mt-0.5 grid place-items-center h-6 w-6 rounded-md border shrink-0 transition ${
            item.completed
              ? "bg-tat-teal border-tat-teal text-white"
              : "bg-white border-tat-charcoal/25 hover:border-tat-teal/60"
          } disabled:opacity-60`}
          aria-label={item.completed ? "Mark not done" : "Mark done"}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : item.completed ? (
            <Check className="h-3.5 w-3.5" />
          ) : null}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3
              className={`font-display text-[17px] font-medium ${
                item.completed ? "text-tat-charcoal/55 line-through" : "text-tat-charcoal"
              }`}
            >
              {item.label}
            </h3>
            {item.cta && (
              <Link
                href={item.cta.href}
                className="inline-flex items-center gap-1 text-xs font-semibold text-tat-teal hover:text-tat-teal-deep"
              >
                {item.cta.label}
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
          <p className="text-xs text-tat-charcoal/65 mt-0.5">{item.description}</p>
          <p className="text-[11px] text-tat-slate/85 mt-1 italic">{item.why}</p>

          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-tat-charcoal/55">
            {item.completed && item.completedAt ? (
              <span>
                Done at {new Date(item.completedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            ) : (
              <span className="text-tat-orange/85 font-semibold">Pending</span>
            )}
            <button
              type="button"
              onClick={() => setShowNotes((v) => !v)}
              className="text-tat-charcoal/55 hover:text-tat-charcoal underline-offset-2 hover:underline"
            >
              {showNotes ? "Hide notes" : item.notes ? "Notes" : "+ Note"}
            </button>
          </div>

          {showNotes && (
            <textarea
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              onBlur={() => {
                if (draftNotes !== (item.notes ?? "")) {
                  onPatch(item.key, { notes: draftNotes });
                }
              }}
              rows={2}
              placeholder="Anything anomalous today?"
              className="mt-2 w-full bg-tat-paper border border-tat-charcoal/12 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-tat-gold/40 resize-none"
            />
          )}
        </div>
      </div>
    </article>
  );
}
