"use client";

import { useState } from "react";
import { Loader2, Sparkles, MessageSquare, Copy, Check } from "lucide-react";

export default function AgentsClient() {
  const [tab, setTab] = useState<"itinerary" | "intent">("itinerary");
  return (
    <div className="mt-8">
      <div className="flex gap-2 mb-6">
        <TabButton active={tab === "itinerary"} onClick={() => setTab("itinerary")}>
          <Sparkles className="h-3.5 w-3.5" /> Itinerary engine
        </TabButton>
        <TabButton active={tab === "intent"} onClick={() => setTab("intent")}>
          <MessageSquare className="h-3.5 w-3.5" /> WA intent parser
        </TabButton>
      </div>
      {tab === "itinerary" ? <ItineraryTester /> : <IntentTester />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-pill border text-sm ${
        active
          ? "bg-tat-charcoal text-tat-paper border-tat-charcoal"
          : "border-tat-charcoal/15 text-tat-charcoal/70 hover:border-tat-charcoal/40"
      }`}
    >
      {children}
    </button>
  );
}

// ── Itinerary engine tester ─────────────────────────────────────────────

function ItineraryTester() {
  const [destination, setDestination] = useState("Bali");
  const [days, setDays] = useState(5);
  const [travelType, setTravelType] = useState("Couple");
  const [budget, setBudget] = useState("85000");
  const [interests, setInterests] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<Record<string, unknown> | null>(null);

  async function go() {
    setBusy(true);
    setOut(null);
    setError(null);
    setUsage(null);
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          days,
          travelType,
          budgetPerPerson: budget ? Number(budget.replace(/\D/g, "")) : undefined,
          interests: interests || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      setOut(data.itinerary);
      setUsage(data.usage ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <form
        className="lg:col-span-2 bg-white rounded-card border border-tat-charcoal/10 p-5 md:p-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void go();
        }}
      >
        <Field label="Destination">
          <input value={destination} onChange={(e) => setDestination(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Days (2-21)">
          <input
            type="number"
            min={2}
            max={21}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className={inputCls}
          />
        </Field>
        <Field label="Travel type">
          <select value={travelType} onChange={(e) => setTravelType(e.target.value)} className={inputCls}>
            {["Couple", "Family", "Solo", "Group", "Pilgrim", "Luxury", "Adventure", "Wellness"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Budget per person ₹ (optional)">
          <input value={budget} onChange={(e) => setBudget(e.target.value)} inputMode="numeric" className={inputCls} />
        </Field>
        <Field label="Interests (optional)">
          <input value={interests} onChange={(e) => setInterests(e.target.value)} className={inputCls} placeholder="e.g. snorkelling, food, photos" />
        </Field>
        <button type="submit" disabled={busy} className={btnCls}>
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Running…</> : <><Sparkles className="h-4 w-4" /> Run engine</>}
        </button>
        {error && <p className="text-meta text-red-600">{error}</p>}
      </form>

      <div className="lg:col-span-3 space-y-4">
        {usage && (
          <div className="bg-white rounded-card border border-tat-charcoal/10 p-4">
            <p className="text-tag uppercase text-tat-slate">Usage</p>
            <ul className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-meta">
              {Object.entries(usage).map(([k, v]) => (
                <li key={k}>
                  <span className="text-tat-slate">{k}:</span>{" "}
                  <span className="text-tat-charcoal tabular-nums">{String(v)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <JsonOutput data={out} />
      </div>
    </div>
  );
}

// ── WA intent parser tester ─────────────────────────────────────────────

function IntentTester() {
  const [msg, setMsg] = useState(
    "Hi planning honeymoon to maldives in december, 5 days, ~85k budget"
  );
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setOut(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/agents/parse-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      setOut(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <form
        className="lg:col-span-2 bg-white rounded-card border border-tat-charcoal/10 p-5 md:p-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void go();
        }}
      >
        <Field label="WhatsApp message text">
          <textarea
            rows={6}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-card border border-tat-charcoal/15 text-sm outline-none resize-y"
          />
        </Field>
        <button type="submit" disabled={busy} className={btnCls}>
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Parsing…</> : <><MessageSquare className="h-4 w-4" /> Parse intent</>}
        </button>
        {error && <p className="text-meta text-red-600">{error}</p>}
        <details className="text-meta text-tat-slate">
          <summary className="cursor-pointer hover:text-tat-charcoal">Examples</summary>
          <ul className="mt-2 space-y-2">
            {[
              "Hello",
              "char dham 2 senior parents",
              "honeymoon to bali for 7 nights from delhi in march, budget around 1.5L pp",
              "spiti bike trip solo",
            ].map((ex) => (
              <li key={ex}>
                <button
                  type="button"
                  onClick={() => setMsg(ex)}
                  className="text-left text-tat-charcoal hover:text-tat-orange underline-offset-2 hover:underline"
                >
                  &ldquo;{ex}&rdquo;
                </button>
              </li>
            ))}
          </ul>
        </details>
      </form>

      <div className="lg:col-span-3">
        <JsonOutput data={out} />
      </div>
    </div>
  );
}

// ── Shared bits ─────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3.5 rounded-pill border border-tat-charcoal/15 text-sm outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2";

const btnCls =
  "w-full inline-flex items-center justify-center gap-2 h-12 px-5 rounded-pill bg-tat-orange text-white text-sm font-semibold hover:bg-tat-orange/90 disabled:opacity-60 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-tag uppercase text-tat-slate mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function JsonOutput({ data }: { data: unknown }) {
  const [copied, setCopied] = useState(false);
  if (data == null) {
    return (
      <div className="h-full min-h-[300px] grid place-items-center bg-white rounded-card border border-dashed border-tat-charcoal/15 p-8 text-center">
        <p className="text-tat-slate">Run an agent to see structured output.</p>
      </div>
    );
  }
  const json = JSON.stringify(data, null, 2);
  return (
    <div className="bg-white rounded-card border border-tat-charcoal/10 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-tag uppercase text-tat-slate">Output (JSON)</p>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(json);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch { /* ignore */ }
          }}
          className="inline-flex items-center gap-1.5 text-meta text-tat-slate hover:text-tat-charcoal"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          Copy
        </button>
      </div>
      <pre className="text-[12px] leading-relaxed text-tat-charcoal/85 font-mono overflow-auto max-h-[600px] whitespace-pre-wrap">
        {json}
      </pre>
    </div>
  );
}
