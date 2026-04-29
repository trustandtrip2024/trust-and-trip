import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LeadRow {
  id: string;
  created_at: string;
  source: string | null;
  tier: string | null;
  score: number | null;
  destination: string | null;
  budget: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  page_url: string | null;
}

function admin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function bucket(rows: LeadRow[], key: keyof LeadRow): { label: string; total: number; tierA: number; tierB: number }[] {
  const map = new Map<string, { total: number; tierA: number; tierB: number }>();
  for (const r of rows) {
    const v = (r[key] as string | null) ?? "(none)";
    const e = map.get(v) ?? { total: 0, tierA: 0, tierB: 0 };
    e.total++;
    if (r.tier === "A") e.tierA++;
    if (r.tier === "B") e.tierB++;
    map.set(v, e);
  }
  return Array.from(map.entries())
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => b.total - a.total);
}

function pct(n: number, d: number): string {
  if (!d) return "—";
  return ((n / d) * 100).toFixed(1) + "%";
}

export default async function AttributionPage({
  searchParams,
}: {
  searchParams?: { window?: string };
}) {
  const sb = admin();
  if (!sb) {
    return <main className="p-8">Supabase not configured.</main>;
  }

  const days = Number(searchParams?.window) || 7;
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

  const { data, error } = await sb
    .from("leads")
    .select("id, created_at, source, tier, score, destination, budget, utm_source, utm_medium, utm_campaign, page_url")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) {
    return <main className="p-8 text-tat-danger-fg">DB error: {error.message}</main>;
  }

  const rows = (data ?? []) as LeadRow[];

  const total = rows.length;
  const tierA = rows.filter((r) => r.tier === "A").length;
  const tierB = rows.filter((r) => r.tier === "B").length;
  const tierC = rows.filter((r) => r.tier === "C").length;
  const avgScore = rows.length ? Math.round(rows.reduce((s, r) => s + (r.score ?? 0), 0) / rows.length) : 0;

  const bySource = bucket(rows, "source");
  const byUtmSource = bucket(rows, "utm_source");
  const byUtmCampaign = bucket(rows, "utm_campaign");
  const byUtmMedium = bucket(rows, "utm_medium");
  const byDestination = bucket(rows, "destination");

  return (
    <main className="container-custom py-10 max-w-7xl">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[12px] tracking-[0.15em] uppercase font-semibold text-tat-gold">Admin · Attribution</p>
          <h1 className="mt-2 font-display text-display-md text-tat-charcoal">
            Lead attribution · last {days} day{days === 1 ? "" : "s"}
          </h1>
          <p className="mt-1 text-meta text-tat-slate">
            Live from Supabase. Tier breakdown by UTM lets you spot which ads drive hot leads vs noise.
          </p>
        </div>
        <nav className="flex gap-2 text-[12px]">
          {[1, 7, 30].map((d) => (
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

      {/* Top stats */}
      <section className="mt-7 grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Total leads" value={total.toLocaleString("en-IN")} />
        <Stat label="Tier A · hot" value={`${tierA} · ${pct(tierA, total)}`} accent="emerald" />
        <Stat label="Tier B · warm" value={`${tierB} · ${pct(tierB, total)}`} accent="gold" />
        <Stat label="Tier C · cold" value={`${tierC} · ${pct(tierC, total)}`} />
        <Stat label="Avg score" value={`${avgScore} / 100`} />
      </section>

      <Group title="By UTM source" rows={byUtmSource} total={total} />
      <Group title="By UTM campaign" rows={byUtmCampaign} total={total} />
      <Group title="By UTM medium" rows={byUtmMedium} total={total} />
      <Group title="By lead source" rows={bySource} total={total} />
      <Group title="By destination" rows={byDestination} total={total} />

      {/* Recent rows */}
      <section className="mt-12">
        <h2 className="font-display text-h3 text-tat-charcoal">Most recent leads</h2>
        <p className="text-meta text-tat-slate mt-1">First 25 in window. Click ID for full Supabase row in admin.</p>
        <div className="mt-4 overflow-x-auto rounded-card border border-tat-charcoal/10">
          <table className="w-full text-[13px]">
            <thead className="bg-tat-cream-warm/30 text-left text-tag uppercase text-tat-slate">
              <tr>
                <th className="px-3 py-2.5">When</th>
                <th className="px-3 py-2.5">Tier</th>
                <th className="px-3 py-2.5">Score</th>
                <th className="px-3 py-2.5">Source</th>
                <th className="px-3 py-2.5">UTM src/cmp</th>
                <th className="px-3 py-2.5">Destination</th>
                <th className="px-3 py-2.5">Budget</th>
                <th className="px-3 py-2.5">Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tat-charcoal/8">
              {rows.slice(0, 25).map((r) => (
                <tr key={r.id} className="hover:bg-tat-paper/40">
                  <td className="px-3 py-2 whitespace-nowrap text-tat-slate">
                    {new Date(r.created_at).toLocaleString("en-IN", { hour12: false })}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold ${
                        r.tier === "A"
                          ? "bg-tat-success-bg text-tat-success-fg"
                          : r.tier === "B"
                          ? "bg-tat-warning-bg text-tat-warning-fg"
                          : "bg-tat-charcoal/10 text-tat-charcoal/60"
                      }`}
                    >
                      {r.tier ?? "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{r.score ?? 0}</td>
                  <td className="px-3 py-2">{r.source ?? "—"}</td>
                  <td className="px-3 py-2 text-tat-slate truncate max-w-[180px]">
                    {r.utm_source ?? "—"} / {r.utm_campaign ?? "—"}
                  </td>
                  <td className="px-3 py-2">{r.destination ?? "—"}</td>
                  <td className="px-3 py-2">{r.budget ?? "—"}</td>
                  <td className="px-3 py-2 truncate max-w-[180px] text-tat-slate">
                    {r.page_url ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "gold";
}) {
  return (
    <div className="rounded-card border border-tat-charcoal/10 bg-white px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.12em] text-tat-slate">{label}</p>
      <p
        className={`mt-1 font-display text-h3 leading-none ${
          accent === "emerald"
            ? "text-tat-success-fg"
            : accent === "gold"
            ? "text-tat-gold"
            : "text-tat-charcoal"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Group({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { label: string; total: number; tierA: number; tierB: number }[];
  total: number;
}) {
  if (!rows.length) return null;
  const top = rows.slice(0, 12);
  return (
    <section className="mt-10">
      <h2 className="font-display text-h3 text-tat-charcoal">{title}</h2>
      <div className="mt-4 overflow-x-auto rounded-card border border-tat-charcoal/10">
        <table className="w-full text-[13px]">
          <thead className="bg-tat-cream-warm/30 text-left text-tag uppercase text-tat-slate">
            <tr>
              <th className="px-3 py-2.5">Bucket</th>
              <th className="px-3 py-2.5 text-right">Leads</th>
              <th className="px-3 py-2.5 text-right">% of total</th>
              <th className="px-3 py-2.5 text-right">Tier A</th>
              <th className="px-3 py-2.5 text-right">Tier B</th>
              <th className="px-3 py-2.5 text-right">A+B%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tat-charcoal/8">
            {top.map((r) => (
              <tr key={r.label}>
                <td className="px-3 py-2 truncate max-w-[280px]">{r.label}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.total}</td>
                <td className="px-3 py-2 text-right text-tat-slate tabular-nums">{pct(r.total, total)}</td>
                <td className="px-3 py-2 text-right text-tat-success-fg tabular-nums">{r.tierA}</td>
                <td className="px-3 py-2 text-right text-tat-warning-fg tabular-nums">{r.tierB}</td>
                <td className="px-3 py-2 text-right text-tat-charcoal tabular-nums">
                  {pct(r.tierA + r.tierB, r.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
