"use client";

import { useState } from "react";
import { Loader2, Copy, Check, Sparkles, RefreshCcw } from "lucide-react";

interface Creative {
  headlines: string[];
  primary_texts: string[];
  cta_buttons: string[];
  wa_messages: string[];
  notes: string;
}

const PRESETS = [
  {
    name: "Maldives — couples",
    lp: "/lp/maldives-honeymoon",
    destination: "Maldives",
    audience: "Couples 28-40, tier-1 metros, HHI ₹15L+, planning honeymoon, Indian-vegetarian",
    priceFrom: 68000,
  },
  {
    name: "Bali — couples",
    lp: "/lp/bali-honeymoon",
    destination: "Bali",
    audience: "Couples 25-40, India, interest: Bali / beach travel, mid-premium",
    priceFrom: 55000,
  },
  {
    name: "Switzerland — premium",
    lp: "/lp/switzerland-honeymoon",
    destination: "Switzerland",
    audience: "Couples 28-45, India, HHI ₹15L+, premium Europe travel",
    priceFrom: 145000,
  },
  {
    name: "Char Dham — pilgrim",
    lp: "/lp/char-dham-yatra",
    destination: "Char Dham",
    audience: "Adults 40-65, India, interest: pilgrimage / Hindu travel, often booking for elders",
    priceFrom: 48000,
  },
  {
    name: "Kerala — family",
    lp: "/lp/kerala-family",
    destination: "Kerala",
    audience: "Families 30-55, India, HHI ₹8L+, kid-friendly domestic travel",
    priceFrom: 28000,
  },
];

export default function CreativesClient() {
  const [lp, setLp] = useState(PRESETS[0].lp);
  const [destination, setDestination] = useState(PRESETS[0].destination);
  const [audience, setAudience] = useState(PRESETS[0].audience);
  const [angle, setAngle] = useState("");
  const [priceFrom, setPriceFrom] = useState<string>(String(PRESETS[0].priceFrom));

  const [running, setRunning] = useState(false);
  const [refreshNext, setRefreshNext] = useState(false);
  const [creative, setCreative] = useState<Creative | null>(null);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyPreset(idx: number) {
    const p = PRESETS[idx];
    setLp(p.lp);
    setDestination(p.destination);
    setAudience(p.audience);
    setPriceFrom(String(p.priceFrom));
    setCreative(null);
    setError(null);
  }

  async function generate() {
    setError(null);
    setCreative(null);
    setRunning(true);
    try {
      const res = await fetch("/api/admin/creatives/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lp,
          destination,
          audience,
          angle: angle.trim() || undefined,
          priceFrom: priceFrom ? Number(priceFrom.replace(/\D/g, "")) || undefined : undefined,
          refresh: refreshNext,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      setCreative(data.creative as Creative);
      setCached(Boolean(data.cached));
      setRefreshNext(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mt-8 grid lg:grid-cols-5 gap-6">
      {/* Form */}
      <form
        className="lg:col-span-2 bg-white rounded-card border border-tat-charcoal/10 p-5 md:p-6 shadow-card space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void generate();
        }}
      >
        <div>
          <label className="block text-tag uppercase text-tat-slate mb-1.5">Preset</label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(i)}
                className="text-[12px] px-2.5 py-1 rounded-full border border-tat-charcoal/15 text-tat-charcoal/70 hover:border-tat-orange/40 hover:text-tat-charcoal"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <FormField label="LP path">
          <input
            value={lp}
            onChange={(e) => setLp(e.target.value)}
            placeholder="/lp/maldives-honeymoon"
            className="w-full h-10 px-3.5 rounded-pill border border-tat-charcoal/15 text-sm outline-none"
          />
        </FormField>

        <FormField label="Destination">
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Maldives"
            className="w-full h-10 px-3.5 rounded-pill border border-tat-charcoal/15 text-sm outline-none"
          />
        </FormField>

        <FormField label="Audience description">
          <textarea
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-card border border-tat-charcoal/15 text-sm outline-none resize-y"
          />
        </FormField>

        <FormField label="Angle / hook (optional)">
          <input
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            placeholder="e.g. Indian-vegetarian friendly resorts"
            className="w-full h-10 px-3.5 rounded-pill border border-tat-charcoal/15 text-sm outline-none"
          />
        </FormField>

        <FormField label="Lowest price (₹/person)">
          <input
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
            inputMode="numeric"
            className="w-full h-10 px-3.5 rounded-pill border border-tat-charcoal/15 text-sm outline-none"
          />
        </FormField>

        <label className="flex items-center gap-2 text-meta text-tat-slate select-none">
          <input
            type="checkbox"
            checked={refreshNext}
            onChange={(e) => setRefreshNext(e.target.checked)}
          />
          Force refresh (skip 24h cache)
        </label>

        {error && (
          <p className="text-meta text-red-600 bg-red-50 border border-red-200 rounded p-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={running}
          className="w-full inline-flex items-center justify-center gap-2 h-12 px-5 rounded-pill bg-tat-orange text-white font-semibold hover:bg-tat-orange/90 disabled:opacity-60 transition"
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate creatives
            </>
          )}
        </button>
        {creative && (
          <button
            type="button"
            onClick={() => {
              setRefreshNext(true);
              void generate();
            }}
            className="w-full inline-flex items-center justify-center gap-2 text-meta text-tat-slate hover:text-tat-charcoal"
          >
            <RefreshCcw className="h-3 w-3" />
            Regenerate (force fresh)
          </button>
        )}
      </form>

      {/* Output */}
      <div className="lg:col-span-3">
        {!creative && !running && (
          <div className="h-full min-h-[320px] grid place-items-center bg-white rounded-card border border-dashed border-tat-charcoal/15 p-8 text-center">
            <div>
              <Sparkles className="h-8 w-8 mx-auto text-tat-gold/60" />
              <p className="mt-3 text-tat-charcoal font-display text-h3">Ready</p>
              <p className="mt-1 text-meta text-tat-slate max-w-xs mx-auto">
                Pick a preset on the left, tweak audience, hit Generate. Output is copy-paste ready
                for Meta Ads Manager.
              </p>
            </div>
          </div>
        )}

        {creative && (
          <div className="space-y-5">
            {cached && (
              <p className="text-meta text-amber-700 bg-amber-50 border border-amber-200 rounded p-2.5">
                Returned from 24h cache. Tick "Force refresh" or click Regenerate for new variants.
              </p>
            )}

            <CreativeBlock title="Headlines (≤ 40 char)" items={creative.headlines} />
            <CreativeBlock title="Primary texts (≤ 125 char)" items={creative.primary_texts} />
            <CreativeBlock title="CTA buttons" items={creative.cta_buttons} compact />
            <CreativeBlock title="WhatsApp prefill messages" items={creative.wa_messages} />

            {creative.notes && (
              <div className="rounded-card border border-tat-charcoal/10 bg-tat-cream-warm/30 p-4">
                <p className="text-tag uppercase text-tat-slate">Strategy notes</p>
                <p className="mt-1 text-meta text-tat-charcoal/80 italic">{creative.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-tag uppercase text-tat-slate mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function CreativeBlock({
  title,
  items,
  compact,
}: {
  title: string;
  items: string[];
  compact?: boolean;
}) {
  return (
    <section className="bg-white rounded-card border border-tat-charcoal/10 p-4 md:p-5">
      <h3 className="text-tag uppercase text-tat-slate">{title}</h3>
      <ul className={`mt-3 ${compact ? "flex flex-wrap gap-2" : "space-y-2"}`}>
        {items.map((it, i) => (
          <li
            key={i}
            className={
              compact
                ? "inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-tat-cream-warm/40 border border-tat-charcoal/10"
                : "flex items-start gap-3 px-3 py-2.5 rounded border border-tat-charcoal/10 bg-tat-paper/40"
            }
          >
            <span className="flex-1 text-[13.5px] text-tat-charcoal leading-snug">{it}</span>
            <CopyButton value={it} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // ignore
        }
      }}
      className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-tat-slate hover:bg-tat-charcoal/8 hover:text-tat-charcoal"
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
