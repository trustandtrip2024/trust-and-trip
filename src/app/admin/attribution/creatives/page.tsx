import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LeadRow {
  id: string;
  created_at: string;
  source: string | null;
  tier: string | null;
  score: number | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

function admin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function pct(n: number, d: number): string {
  if (!d) return "—";
  return ((n / d) * 100).toFixed(1) + "%";
}

interface Bucket {
  key: string;
  total: number;
  tierA: number;
  tierB: number;
  avgScore: number;
}

function group(rows: LeadRow[], make: (r: LeadRow) => string | null): Bucket[] {
  const map = new Map<string, { total: number; tierA: number; tierB: number; sumScore: number }>();
  for (const r of rows) {
    const key = make(r);
    if (!key) continue;
    const e = map.get(key) ?? { total: 0, tierA: 0, tierB: 0, sumScore: 0 };
    e.total++;
    if (r.tier === "A") e.tierA++;
    if (r.tier === "B") e.tierB++;
    e.sumScore += r.score ?? 0;
    map.set(key, e);
  }
  return Array.from(map.entries())
    .map(([key, v]) => ({
      key,
      total: v.total,
      tierA: v.tierA,
      tierB: v.tierB,
      avgScore: v.total ? Math.round(v.sumScore / v.total) : 0,
    }))
    .sort((a, b) => b.tierA / Math.max(b.total, 1) - a.tierA / Math.max(a.total, 1) || b.total - a.total);
}

export default async function CreativesAttributionPage({
  searchParams,
}: {
  searchParams?: { window?: string; min?: string };
}) {
  const sb = admin();
  if (!sb) return <main className="p-8">Supabase not configured.</main>;

  const days = Number(searchParams?.window) || 7;
  const minLeads = Number(searchParams?.min) || 5;
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

  const { data, error } = await sb
    .from("leads")
    .select("id, created_at, source, tier, score, utm_source, utm_medium, utm_campaign, utm_content, utm_term")
    .gte("created_at", since)
    .not("utm_source", "is", null)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) return <main className="p-8 text-red-600">DB error: {error.message}</main>;

  const rows = (data ?? []) as LeadRow[];

  // A "creative" key = source/medium/campaign/content (Meta ad-id usually goes in utm_content)
  const byCreative = group(rows, (r) =>
    [r.utm_source, r.utm_medium, r.utm_campaign, r.utm_content].filter(Boolean).join(" · ")
  ).filter((b) => b.total >= minLeads);

  const byCampaign = group(rows, (r) =>
    [r.utm_source, r.utm_campaign].filter(Boolean).join(" · ")
  ).filter((b) => b.total >= minLeads);

  const byTerm = group(rows, (r) => r.utm_term ?? null).filter((b) => b.total >= minLeads);

  // Top + bottom 5 creatives by Tier A rate (stack-rank for budget reallocation)
  const ranked = byCreative.slice().sort((a, b) => b.tierA / Math.max(b.total, 1) - a.tierA / Math.max(a.total, 1));
  const winners = ranked.slice(0, 5);
  const losers = ranked.slice(-5).reverse();

  return (
    <main className="container-custom py-10 max-w-7xl">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[12px] tracking-[0.15em] uppercase font-semibold text-tat-gold">
            Admin · Attribution · Creatives
          </p>
          <h1 className="mt-2 font-display text-display-md text-tat-charcoal">
            Ad creative leaderboard · {days}d
          </h1>
          <p className="mt-1 text-meta text-tat-slate max-w-3xl">
            Stack-ranked by Tier A conversion rate. Pause creatives with high spend + low tier-A%.
            Scale creatives at the top. Min {minLeads} leads to qualify (filter via <code>?min=N</code>).
          </p>
          <p className="mt-1 text-meta text-tat-slate">
            <Link href="/admin/attribution" className="underline">← Overview</Link>
          </p>
        </div>
        <nav className="flex gap-2 text-[12px]">
          {[1, 7, 30].map((d) => (
            <a
              key={d}
              href={`?window=${d}&min=${minLeads}`}
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

      {!ranked.length && (
        <p className="mt-10 text-tat-slate">
          No creatives have ≥ {minLeads} leads yet in this window. Try <code>?min=1</code> or wait for more
          traffic.
        </p>
      )}

      {/* Winners + Losers strip */}
      {ranked.length > 0 && (
        <section className="mt-7 grid md:grid-cols-2 gap-5">
          <Card title="🏆 Scale these" tone="emerald" rows={winners} />
          <Card title="🪦 Pause / replace" tone="rose" rows={losers} />
        </section>
      )}

      <Group title="By creative (utm_source · medium · campaign · content)" rows={byCreative} />
      <Group title="By campaign (utm_source · campaign)" rows={byCampaign} />
      <Group title="By keyword / utm_term" rows={byTerm} />
    </main>
  );
}

function rate(b: Bucket): number {
  return b.total ? b.tierA / b.total : 0;
}

function Card({
  title,
  tone,
  rows,
}: {
  title: string;
  tone: "emerald" | "rose";
  rows: Bucket[];
}) {
  return (
    <div
      className={`rounded-card border p-5 md:p-6 ${
        tone === "emerald"
          ? "border-emerald-300/50 bg-emerald-50/40"
          : "border-rose-300/50 bg-rose-50/40"
      }`}
    >
      <h3 className="font-display text-h3 text-tat-charcoal">{title}</h3>
      <ul className="mt-3 divide-y divide-tat-charcoal/10">
        {rows.map((b) => (
          <li key={b.key} className="py-2.5 flex items-baseline justify-between gap-3">
            <span className="text-[13px] text-tat-charcoal truncate max-w-[60%]">{b.key}</span>
            <span className="text-meta text-tat-slate tabular-nums">
              <span className={`font-semibold ${tone === "emerald" ? "text-emerald-700" : "text-rose-700"}`}>
                {(rate(b) * 100).toFixed(1)}%
              </span>{" "}
              · {b.total} leads · {b.tierA} A · score {b.avgScore}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Group({ title, rows }: { title: string; rows: Bucket[] }) {
  if (!rows.length) return null;
  return (
    <section className="mt-10">
      <h2 className="font-display text-h3 text-tat-charcoal">{title}</h2>
      <div className="mt-4 overflow-x-auto rounded-card border border-tat-charcoal/10">
        <table className="w-full text-[13px]">
          <thead className="bg-tat-cream-warm/30 text-left text-tag uppercase text-tat-slate">
            <tr>
              <th className="px-3 py-2.5">Bucket</th>
              <th className="px-3 py-2.5 text-right">Leads</th>
              <th className="px-3 py-2.5 text-right">Tier A</th>
              <th className="px-3 py-2.5 text-right">Tier B</th>
              <th className="px-3 py-2.5 text-right">A rate</th>
              <th className="px-3 py-2.5 text-right">Avg score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tat-charcoal/8">
            {rows.slice(0, 30).map((b) => (
              <tr key={b.key}>
                <td className="px-3 py-2 truncate max-w-[420px] text-tat-charcoal">{b.key}</td>
                <td className="px-3 py-2 text-right tabular-nums">{b.total}</td>
                <td className="px-3 py-2 text-right text-emerald-700 tabular-nums">{b.tierA}</td>
                <td className="px-3 py-2 text-right text-amber-700 tabular-nums">{b.tierB}</td>
                <td className="px-3 py-2 text-right font-semibold text-tat-charcoal tabular-nums">
                  {pct(b.tierA, b.total)}
                </td>
                <td className="px-3 py-2 text-right text-tat-slate tabular-nums">{b.avgScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
