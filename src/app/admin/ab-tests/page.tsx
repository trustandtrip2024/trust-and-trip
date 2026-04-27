import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LeadRow {
  id: string;
  created_at: string;
  source: string | null;
  tier: "A" | "B" | "C" | null;
  destination: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  wa_variant: string | null;
}

function admin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function pct(n: number, d: number): string {
  if (!d) return "—";
  return ((n / d) * 100).toFixed(1) + "%";
}

// ── Wilson score for binomial CIs (small-sample sanity) ─────────────────
// Helps avoid declaring a winner with 5 leads.
function wilsonLower(success: number, trials: number, z = 1.96): number {
  if (trials === 0) return 0;
  const p = success / trials;
  const denom = 1 + (z * z) / trials;
  const center = p + (z * z) / (2 * trials);
  const margin = z * Math.sqrt((p * (1 - p)) / trials + (z * z) / (4 * trials * trials));
  return Math.max(0, (center - margin) / denom);
}

interface VariantStat {
  key: string;            // e.g. "A" or "Maldives:A"
  variant: string;
  trials: number;         // total clicks
  tierA: number;
  conversions: number;    // tier A or B = "useful conversion"
  rate: number;
  lower95: number;        // Wilson lower bound
}

function buildStats(rows: LeadRow[], makeKey: (r: LeadRow) => string | null): VariantStat[] {
  const map = new Map<string, { variant: string; trials: number; tierA: number; conv: number }>();
  for (const r of rows) {
    if (!r.wa_variant) continue;
    const key = makeKey(r);
    if (!key) continue;
    const e = map.get(key) ?? { variant: r.wa_variant, trials: 0, tierA: 0, conv: 0 };
    e.trials++;
    if (r.tier === "A") {
      e.tierA++;
      e.conv++;
    } else if (r.tier === "B") {
      e.conv++;
    }
    map.set(key, e);
  }
  return Array.from(map.entries())
    .map(([k, v]) => ({
      key: k,
      variant: v.variant,
      trials: v.trials,
      tierA: v.tierA,
      conversions: v.conv,
      rate: v.trials ? v.conv / v.trials : 0,
      lower95: wilsonLower(v.conv, v.trials),
    }))
    .sort((a, b) => b.lower95 - a.lower95);
}

export default async function AbTestsPage({
  searchParams,
}: {
  searchParams?: { window?: string };
}) {
  const sb = admin();
  if (!sb) return <main className="p-8">Supabase not configured.</main>;

  const days = Number(searchParams?.window) || 30;
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

  const { data, error } = await sb
    .from("leads")
    .select("id, created_at, source, tier, destination, utm_source, utm_campaign, wa_variant")
    .gte("created_at", since)
    .not("wa_variant", "is", null)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) return <main className="p-8 text-red-600">DB error: {error.message}</main>;

  const rows = (data ?? []) as LeadRow[];

  const overall = buildStats(rows, (r) => r.wa_variant);
  const byDest = buildStats(rows, (r) =>
    r.destination ? `${r.destination}::${r.wa_variant}` : null
  );
  const bySource = buildStats(rows, (r) =>
    r.utm_source ? `${r.utm_source}::${r.wa_variant}` : null
  );

  const totalClicks = rows.length;

  return (
    <main className="container-custom py-10 max-w-7xl">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[12px] tracking-[0.15em] uppercase font-semibold text-tat-gold">
            Admin · A/B Tests
          </p>
          <h1 className="mt-2 font-display text-display-md text-tat-charcoal">
            WhatsApp click variant CVR · {days}d
          </h1>
          <p className="mt-1 text-meta text-tat-slate max-w-3xl">
            Conversion = lead reaching tier A or B (showed buying intent). Wilson 95% lower bound shown
            to avoid declaring a winner with too few clicks. Pick the variant with highest <strong>lower
            bound</strong>, not highest raw rate.
          </p>
        </div>
        <nav className="flex gap-2 text-[12px]">
          {[7, 30, 90].map((d) => (
            <a
              key={d}
              href={`?window=${d}`}
              className={`px-3 py-1.5 rounded-full border ${
                d === days
                  ? "bg-tat-charcoal text-tat-paper border-tat-charcoal"
                  : "border-tat-charcoal/15 text-tat-charcoal/70 hover:border-tat-charcoal/40"
              }`}
            >
              {d}d
            </a>
          ))}
        </nav>
      </header>

      <p className="mt-6 text-meta text-tat-slate">
        <span className="font-semibold text-tat-charcoal">{totalClicks}</span> tracked WhatsApp clicks
        in window.
      </p>

      <Group title="Overall — variant performance" rows={overall} />
      <Group title="By destination" rows={byDest} />
      <Group title="By UTM source" rows={bySource} />
    </main>
  );
}

function Group({ title, rows }: { title: string; rows: VariantStat[] }) {
  if (!rows.length) return null;
  return (
    <section className="mt-10">
      <h2 className="font-display text-h3 text-tat-charcoal">{title}</h2>
      <div className="mt-4 overflow-x-auto rounded-card border border-tat-charcoal/10">
        <table className="w-full text-[13px]">
          <thead className="bg-tat-cream-warm/30 text-left text-tag uppercase text-tat-slate">
            <tr>
              <th className="px-3 py-2.5">Bucket</th>
              <th className="px-3 py-2.5 text-right">Variant</th>
              <th className="px-3 py-2.5 text-right">Clicks</th>
              <th className="px-3 py-2.5 text-right">Tier A</th>
              <th className="px-3 py-2.5 text-right">Conv (A+B)</th>
              <th className="px-3 py-2.5 text-right">Rate</th>
              <th className="px-3 py-2.5 text-right">Lower 95%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tat-charcoal/8">
            {rows.slice(0, 30).map((r) => (
              <tr key={r.key}>
                <td className="px-3 py-2 truncate max-w-[280px] text-tat-charcoal">{r.key}</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">{r.variant}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.trials}</td>
                <td className="px-3 py-2 text-right text-emerald-700 tabular-nums">{r.tierA}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.conversions}</td>
                <td className="px-3 py-2 text-right tabular-nums">{pct(r.conversions, r.trials)}</td>
                <td className="px-3 py-2 text-right text-tat-charcoal font-semibold tabular-nums">
                  {(r.lower95 * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
