"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type DecisionRow = {
  id: number;
  decided_at: string;
  area: string;
  decision: string;
  rationale: string | null;
  expected: string | null;
  review_on: string | null;
  outcome: string | null;
  outcome_at: string | null;
};

const AREAS = ["marketing", "product", "ops", "hire", "money", "brand", "tech", "other"];

const AREA_TONE: Record<string, string> = {
  marketing: "bg-tat-orange/15 text-tat-orange",
  product:   "bg-tat-teal/15 text-tat-teal-deep",
  ops:       "bg-tat-gold/20 text-tat-charcoal",
  hire:      "bg-tat-teal-mist/40 text-tat-teal-deep",
  money:     "bg-tat-success-bg text-tat-success-fg",
  brand:     "bg-tat-cream-warm/80 text-tat-charcoal",
  tech:      "bg-tat-slate/20 text-tat-charcoal",
  other:     "bg-tat-paper text-tat-slate",
};

export default function DecisionsClient({
  initial,
  dueForReview,
}: {
  initial: DecisionRow[];
  dueForReview: DecisionRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [filter, setFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(initial.length === 0);
  const [outcomeId, setOutcomeId] = useState<number | null>(null);
  const [outcomeText, setOutcomeText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const visible = filter === "all" ? initial : initial.filter((r) => r.area === filter);

  function newDecision(form: HTMLFormElement) {
    const fd = new FormData(form);
    const body = {
      area:      fd.get("area"),
      decision:  fd.get("decision"),
      rationale: fd.get("rationale"),
      expected:  fd.get("expected"),
      review_on: fd.get("review_on") || "",
    };

    start(async () => {
      setError(null);
      const res = await fetch("/api/admin/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Save failed.");
        return;
      }
      form.reset();
      setShowForm(false);
      router.refresh();
    });
  }

  function saveOutcome(id: number) {
    if (!outcomeText.trim()) return;
    start(async () => {
      setError(null);
      const res = await fetch("/api/admin/decisions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, outcome: outcomeText }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Save failed.");
        return;
      }
      setOutcomeId(null);
      setOutcomeText("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {/* Due for review banner */}
      {dueForReview.length > 0 && (
        <div className="rounded-card border border-tat-orange/40 bg-tat-orange-soft/15 px-4 py-3">
          <p className="text-sm font-semibold text-tat-charcoal">
            {dueForReview.length} decision{dueForReview.length === 1 ? "" : "s"} due for review
          </p>
          <p className="text-xs text-tat-slate mt-0.5">
            Scroll to "Review on or before today" rows below — write the outcome.
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[11px] font-semibold text-tat-slate uppercase tracking-wider">Area</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs px-2 py-1 rounded-md border border-tat-charcoal/15 bg-white"
          >
            <option value="all">All</option>
            {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <span className="text-[11px] text-tat-slate">{visible.length} entr{visible.length === 1 ? "y" : "ies"}</span>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold bg-tat-teal text-white hover:bg-tat-teal-deep transition"
        >
          {showForm ? "Cancel" : "+ Log decision"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); newDecision(e.currentTarget); }}
          className="rounded-card border border-tat-charcoal/12 bg-white p-4 space-y-3 shadow-soft"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Area">
              <select name="area" required className="w-full text-sm px-2 py-1.5 rounded-md border border-tat-charcoal/15">
                {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Review on (optional)">
              <input type="date" name="review_on" className="w-full text-sm px-2 py-1.5 rounded-md border border-tat-charcoal/15" />
            </Field>
          </div>
          <Field label="Decision (one line, ≤ 280 chars)">
            <input
              name="decision"
              required
              maxLength={280}
              placeholder="Pause Switzerland UGC ads — converts &lt; 0.6%"
              className="w-full text-sm px-2 py-1.5 rounded-md border border-tat-charcoal/15"
            />
          </Field>
          <Field label="Rationale (why)">
            <textarea
              name="rationale"
              rows={2}
              maxLength={2000}
              placeholder="30d data: 240 views, 1 lead, 0 booked. Same budget on Bali = 18%."
              className="w-full text-sm px-2 py-1.5 rounded-md border border-tat-charcoal/15"
            />
          </Field>
          <Field label="Expected outcome">
            <textarea
              name="expected"
              rows={2}
              maxLength={1000}
              placeholder="Reallocating to Bali should lift verified bookings by 1–2/week within 14 days."
              className="w-full text-sm px-2 py-1.5 rounded-md border border-tat-charcoal/15"
            />
          </Field>

          {error && <p className="text-xs text-tat-orange">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-xs font-semibold bg-tat-charcoal text-white hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Saving..." : "Save decision"}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <p className="text-sm text-tat-slate italic text-center py-8">
          {initial.length === 0 ? "No decisions logged yet. Log the first." : "No decisions in this area."}
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => {
            const dueToday = r.review_on && !r.outcome && new Date(r.review_on) <= new Date();
            return (
              <li
                key={r.id}
                className={`rounded-card bg-white shadow-soft border ${dueToday ? "border-tat-orange/40" : "border-tat-charcoal/10"}`}
              >
                <header className="px-4 py-2.5 flex items-center justify-between gap-2 border-b border-tat-charcoal/8">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`inline-block rounded-pill px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${AREA_TONE[r.area] ?? "bg-tat-paper text-tat-slate"}`}>
                      {r.area}
                    </span>
                    <span className="text-[11px] text-tat-slate">
                      {new Date(r.decided_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {r.review_on && (
                      <span className={`text-[10px] ${dueToday ? "text-tat-orange font-semibold" : "text-tat-slate/70"}`}>
                        · review {r.review_on}
                      </span>
                    )}
                  </div>
                  {r.outcome && (
                    <span className="text-[9px] font-bold uppercase tracking-wider rounded-pill px-2 py-0.5 bg-tat-teal text-white">
                      Closed
                    </span>
                  )}
                </header>

                <div className="px-4 py-3 space-y-2">
                  <p className="text-sm font-medium text-tat-charcoal">{r.decision}</p>
                  {r.rationale && (
                    <p className="text-xs text-tat-slate"><strong className="text-tat-charcoal/80">Why:</strong> {r.rationale}</p>
                  )}
                  {r.expected && (
                    <p className="text-xs text-tat-slate"><strong className="text-tat-charcoal/80">Expected:</strong> {r.expected}</p>
                  )}

                  {r.outcome ? (
                    <div className="mt-2 rounded-md bg-tat-cream/40 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-tat-slate font-semibold">
                        Outcome · {r.outcome_at && new Date(r.outcome_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                      <p className="text-xs text-tat-charcoal mt-0.5">{r.outcome}</p>
                    </div>
                  ) : outcomeId === r.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        autoFocus
                        rows={2}
                        value={outcomeText}
                        onChange={(e) => setOutcomeText(e.target.value)}
                        placeholder="What actually happened? Worth repeating?"
                        className="w-full text-sm px-2 py-1.5 rounded-md border border-tat-charcoal/15"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setOutcomeId(null); setOutcomeText(""); }}
                          className="text-[11px] px-2.5 py-1 rounded-pill text-tat-slate hover:text-tat-charcoal"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveOutcome(r.id)}
                          disabled={pending || !outcomeText.trim()}
                          className="text-[11px] px-2.5 py-1 rounded-pill bg-tat-teal text-white hover:bg-tat-teal-deep disabled:opacity-50"
                        >
                          Save outcome
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setOutcomeId(r.id); setOutcomeText(""); }}
                      className="text-[11px] text-tat-teal hover:text-tat-teal-deep underline-offset-2 hover:underline"
                    >
                      + Add outcome
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-tat-slate font-semibold">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
