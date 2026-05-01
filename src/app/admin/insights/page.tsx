export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const metadata = { title: "Insights · Trust and Trip Admin" };

type Lead = {
  id: string;
  package_slug: string | null;
  package_title: string | null;
  destination: string | null;
  source: string | null;
  status: string | null;
  tier: string | null;
  score: number | null;
  created_at: string;
};

type Booking = {
  id: string;
  package_slug: string;
  package_title: string;
  status: string;
  package_price: number;
  deposit_amount: number;
  created_at: string;
};

type View = {
  package_slug: string;
  viewed_at: string;
};

function pct(num: number, denom: number, digits = 1): string {
  if (!denom) return "—";
  return `${((num / denom) * 100).toFixed(digits)}%`;
}

function delta(current: number, prior: number): { txt: string; tone: "up" | "down" | "flat" } {
  if (prior === 0) return { txt: current > 0 ? "new" : "—", tone: current > 0 ? "up" : "flat" };
  const change = ((current - prior) / prior) * 100;
  if (Math.abs(change) < 2) return { txt: "flat", tone: "flat" };
  return { txt: `${change > 0 ? "+" : ""}${change.toFixed(0)}%`, tone: change > 0 ? "up" : "down" };
}

async function loadAll() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const since = new Date(Date.now() - 60 * 86_400_000).toISOString();

  const [leadsRes, bookingsRes, viewsRes] = await Promise.all([
    supabase
      .from("leads")
      .select("id, package_slug, package_title, destination, source, status, tier, score, created_at")
      .gte("created_at", since)
      .limit(5000),
    supabase
      .from("bookings")
      .select("id, package_slug, package_title, status, package_price, deposit_amount, created_at")
      .gte("created_at", since)
      .limit(2000),
    supabase
      .from("package_views")
      .select("package_slug, viewed_at")
      .gte("viewed_at", new Date(Date.now() - 7 * 86_400_000).toISOString())
      .limit(20000),
  ]);

  return {
    leads: (leadsRes.data ?? []) as Lead[],
    bookings: (bookingsRes.data ?? []) as Booking[],
    views: (viewsRes.data ?? []) as View[],
  };
}

export default async function InsightsPage() {
  const { leads, bookings, views } = await loadAll();
  const now = Date.now();
  const w7 = new Date(now - 7 * 86_400_000).getTime();
  const w14 = new Date(now - 14 * 86_400_000).getTime();
  const w30 = new Date(now - 30 * 86_400_000).getTime();
  const w60 = new Date(now - 60 * 86_400_000).getTime();

  // Buckets
  const leads7 = leads.filter((l) => new Date(l.created_at).getTime() >= w7);
  const leadsPrior7 = leads.filter((l) => {
    const t = new Date(l.created_at).getTime();
    return t >= w14 && t < w7;
  });
  const leads30 = leads.filter((l) => new Date(l.created_at).getTime() >= w30);
  const leadsPrior30 = leads.filter((l) => {
    const t = new Date(l.created_at).getTime();
    return t >= w60 && t < w30;
  });

  const bookings7 = bookings.filter((b) => new Date(b.created_at).getTime() >= w7);
  const bookingsPrior7 = bookings.filter((b) => {
    const t = new Date(b.created_at).getTime();
    return t >= w14 && t < w7;
  });
  const bookingsVerified7 = bookings7.filter((b) => b.status === "verified");
  const bookingsVerified30 = bookings.filter(
    (b) => b.status === "verified" && new Date(b.created_at).getTime() >= w30,
  );

  // Conversion (verified bookings ÷ leads, last 30d)
  const conv30 = pct(bookingsVerified30.length, leads30.length);

  // Tier A %
  const tierA30 = leads30.filter((l) => l.tier === "A").length;
  const tierAPct = pct(tierA30, leads30.length);

  // Stuck bookings: created > 30 min ago, status still 'created'
  const stuckCutoff = now - 30 * 60_000;
  const stuckBookings = bookings.filter(
    (b) => b.status === "created" && new Date(b.created_at).getTime() < stuckCutoff,
  ).length;

  // Top packages by lead count (30d)
  const leadByPkg = new Map<string, { title: string; count: number }>();
  for (const l of leads30) {
    if (!l.package_slug) continue;
    const k = l.package_slug;
    const cur = leadByPkg.get(k);
    leadByPkg.set(k, {
      title: l.package_title ?? k,
      count: (cur?.count ?? 0) + 1,
    });
  }
  const topPkgsByLead = Array.from(leadByPkg.entries())
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Top packages by views (7d)
  const viewByPkg = new Map<string, number>();
  for (const v of views) {
    viewByPkg.set(v.package_slug, (viewByPkg.get(v.package_slug) ?? 0) + 1);
  }
  const topPkgsByView = Array.from(viewByPkg.entries())
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Lead → booking ratio per top package
  const bookingsByPkg = new Map<string, number>();
  for (const b of bookings.filter((x) => x.status === "verified" && new Date(x.created_at).getTime() >= w30)) {
    bookingsByPkg.set(b.package_slug, (bookingsByPkg.get(b.package_slug) ?? 0) + 1);
  }

  // Avg score 30d
  const scoredLeads30 = leads30.filter((l) => typeof l.score === "number");
  const avgScore = scoredLeads30.length
    ? Math.round(scoredLeads30.reduce((s, l) => s + (l.score ?? 0), 0) / scoredLeads30.length)
    : null;

  // Status mix 30d
  const statusMix = new Map<string, number>();
  for (const l of leads30) {
    const k = l.status ?? "(no status)";
    statusMix.set(k, (statusMix.get(k) ?? 0) + 1);
  }

  // Source quality — tier-A conversion rate by source (30d). Highlights
  // which channels bring qualified leads vs. tire-kickers.
  const sourceTotals = new Map<string, { total: number; tierA: number }>();
  for (const l of leads30) {
    const s = l.source ?? "(unknown)";
    const cur = sourceTotals.get(s) ?? { total: 0, tierA: 0 };
    cur.total += 1;
    if (l.tier === "A") cur.tierA += 1;
    sourceTotals.set(s, cur);
  }
  const sourceQuality = Array.from(sourceTotals.entries())
    .filter(([, v]) => v.total >= 5) // need a min sample
    .map(([source, v]) => ({
      source,
      total: v.total,
      tierA: v.tierA,
      pct: v.total > 0 ? (v.tierA / v.total) * 100 : 0,
    }))
    .sort((a, b) => b.pct - a.pct);

  // Slow burners — packages with high views but low lead conversion.
  // View → lead ratio < 1% with > 20 views = slow burn.
  const leadCountByPkg = new Map<string, number>();
  for (const l of leads30) {
    if (!l.package_slug) continue;
    leadCountByPkg.set(l.package_slug, (leadCountByPkg.get(l.package_slug) ?? 0) + 1);
  }
  const slowBurners = Array.from(viewByPkg.entries())
    .map(([slug, viewCount]) => {
      const leadCount = leadCountByPkg.get(slug) ?? 0;
      const ratio = viewCount > 0 ? (leadCount / viewCount) * 100 : 0;
      return { slug, viewCount, leadCount, ratio };
    })
    .filter((p) => p.viewCount >= 20 && p.ratio < 1)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 6);

  // Funnel — leads → contacted → tier-A → bookings (30d). Each step is a
  // simple count; ratio relative to previous step shown below.
  const contactedCount = leads30.filter(
    (l) => l.status === "contacted" || l.status === "qualified" || l.status === "booked",
  ).length;
  const funnel = [
    { label: "Leads",     value: leads30.length },
    { label: "Contacted", value: contactedCount },
    { label: "Tier A",    value: tierA30 },
    { label: "Bookings",  value: bookingsVerified30.length },
  ];
  const funnelMax = Math.max(...funnel.map((f) => f.value), 1);

  // Day-of-week distribution — when leads come in (IST). Helps decide ad
  // schedule + planner shift coverage.
  const dowCounts = new Array(7).fill(0) as number[];
  for (const l of leads30) {
    const d = new Date(new Date(l.created_at).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    dowCounts[d.getDay()]++;
  }
  const dowMax = Math.max(...dowCounts, 1);
  const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // ─── Recommendations — auto-generated plain-English suggestions ────
  // Each rec is a small heuristic over the same numbers shown above.
  // Goal: founder reads them and knows what to do without crunching.
  type Rec = { kind: "push" | "kill" | "fix" | "watch"; text: string };
  const recs: Rec[] = [];

  // Source quality: top channel by tier-A %
  if (sourceQuality.length >= 2) {
    const top = sourceQuality[0];
    const bottom = sourceQuality[sourceQuality.length - 1];
    if (top.pct >= 25 && top.total >= 8) {
      recs.push({
        kind: "push",
        text: `Push more budget to "${top.source}" — ${top.pct.toFixed(0)}% tier-A on ${top.total} leads. Best-converting source.`,
      });
    }
    if (bottom.pct < 5 && bottom.total >= 10 && bottom.source !== top.source) {
      recs.push({
        kind: "kill",
        text: `Pause or audit "${bottom.source}" — ${bottom.pct.toFixed(0)}% tier-A on ${bottom.total} leads. Channel is leaking budget.`,
      });
    }
  }

  // Top package by leads with low conversion
  for (const p of topPkgsByLead.slice(0, 3)) {
    const conv = bookingsByPkg.get(p.slug) ?? 0;
    const ratio = p.count > 0 ? (conv / p.count) * 100 : 0;
    if (p.count >= 8 && ratio < 5) {
      recs.push({
        kind: "fix",
        text: `Many leads on "${p.title}" but only ${conv} booked (${ratio.toFixed(0)}%). Audit price, hero, or itinerary clarity.`,
      });
    }
    if (p.count >= 8 && ratio >= 15) {
      recs.push({
        kind: "push",
        text: `"${p.title}" converts ${ratio.toFixed(0)}% — promote on home + social. Hero candidate.`,
      });
    }
  }

  // Slow burner highlight
  if (slowBurners.length > 0) {
    const sb = slowBurners[0];
    recs.push({
      kind: "fix",
      text: `Slow burner: ${sb.slug} — ${sb.viewCount} views, ${sb.leadCount} leads. CTA broken or copy weak. Re-test hero + first-fold form.`,
    });
  }

  // Day-of-week skew → ad scheduling
  const totalLeads = leads30.length;
  if (totalLeads >= 30) {
    const peakIdx = dowCounts.indexOf(Math.max(...dowCounts));
    const lowIdx = dowCounts.indexOf(Math.min(...dowCounts));
    const peakShare = (dowCounts[peakIdx] / totalLeads) * 100;
    const lowShare = (dowCounts[lowIdx] / totalLeads) * 100;
    if (peakShare > 22) {
      recs.push({
        kind: "push",
        text: `${DOW_LABELS[peakIdx]} delivers ${peakShare.toFixed(0)}% of weekly leads. Concentrate ad spend + planner shifts here.`,
      });
    }
    if (lowShare < 8) {
      recs.push({
        kind: "kill",
        text: `${DOW_LABELS[lowIdx]} delivers only ${lowShare.toFixed(0)}% of leads. Drop ad budget or run repurposed creative.`,
      });
    }
  }

  // Stuck bookings
  if (stuckBookings >= 3) {
    recs.push({
      kind: "fix",
      text: `${stuckBookings} bookings stuck at status=created. Razorpay verify webhook may be misfiring. Check /api/payment/verify logs.`,
    });
  }

  // Tier-A ratio
  if (leads30.length >= 30) {
    const tierAPctRaw = (tierA30 / leads30.length) * 100;
    if (tierAPctRaw < 15) {
      recs.push({
        kind: "watch",
        text: `Tier-A ratio ${tierAPctRaw.toFixed(0)}% (target 25%+). Check scoring rules in src/lib/lead-scoring.ts — gates may be too loose.`,
      });
    }
    if (tierAPctRaw > 50) {
      recs.push({
        kind: "watch",
        text: `Tier-A ratio ${tierAPctRaw.toFixed(0)}% — suspiciously high. Scoring may be too generous; verify recent rule changes.`,
      });
    }
  }

  // Lead → booking week-over-week
  if (leads7.length >= 10 && leadsPrior7.length >= 10) {
    const w = (leads7.length - leadsPrior7.length) / leadsPrior7.length;
    if (w < -0.2) {
      recs.push({
        kind: "watch",
        text: `Leads down ${(w * -100).toFixed(0)}% week-over-week. Check creative fatigue + paused campaigns before assuming demand drop.`,
      });
    }
  }

  return (
    <div className="min-h-screen bg-tat-paper">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        <header>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-slate">
            What's working / what's not
          </p>
          <h1 className="font-display text-3xl text-tat-charcoal mt-1">Insights</h1>
          <p className="text-sm text-tat-slate mt-1">
            Last 60 days of leads + bookings, last 7 days of package views.
          </p>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi
            label="Leads · 7d"
            value={leads7.length}
            delta={delta(leads7.length, leadsPrior7.length)}
          />
          <Kpi
            label="Verified bookings · 7d"
            value={bookingsVerified7.length}
            delta={delta(bookingsVerified7.length, bookingsPrior7.filter((b) => b.status === "verified").length)}
          />
          <Kpi label="Conversion · 30d" value={conv30} />
          <Kpi label="Tier A %" value={tierAPct} />
          <Kpi label="Leads · 30d" value={leads30.length} delta={delta(leads30.length, leadsPrior30.length)} />
          <Kpi label="Avg lead score" value={avgScore ?? "—"} />
          <Kpi
            label="Stuck bookings"
            value={stuckBookings}
            tone={stuckBookings > 0 ? "warn" : "default"}
          />
          <Kpi label="Package views · 7d" value={views.length} />
        </section>

        {/* Auto-recommendations */}
        <section>
          <Card title="Recommendations · auto-generated">
            {recs.length === 0 ? (
              <Empty>Not enough signal yet — collect more leads/views, then re-check.</Empty>
            ) : (
              <ul className="divide-y divide-tat-charcoal/8">
                {recs.map((r, i) => {
                  const tone = {
                    push:  { tag: "PUSH",  cls: "bg-tat-teal text-white" },
                    kill:  { tag: "KILL",  cls: "bg-tat-orange text-white" },
                    fix:   { tag: "FIX",   cls: "bg-tat-gold text-tat-charcoal" },
                    watch: { tag: "WATCH", cls: "bg-tat-slate/30 text-tat-charcoal" },
                  }[r.kind];
                  return (
                    <li key={i} className="px-4 py-3 flex items-start gap-3">
                      <span className={`inline-block rounded-pill px-2 py-0.5 text-[9px] font-bold tracking-wider shrink-0 mt-0.5 ${tone.cls}`}>
                        {tone.tag}
                      </span>
                      <p className="text-sm text-tat-charcoal">{r.text}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </section>

        {/* Top packages */}
        <section className="grid lg:grid-cols-2 gap-4">
          <Card title="Top packages by leads · 30d" cta={{ href: "/admin/leads", label: "Open leads" }}>
            {topPkgsByLead.length === 0 ? (
              <Empty>No packaged leads in window.</Empty>
            ) : (
              <ul className="divide-y divide-tat-charcoal/8">
                {topPkgsByLead.map((p) => {
                  const conv = bookingsByPkg.get(p.slug) ?? 0;
                  const r = pct(conv, p.count);
                  return (
                    <li key={p.slug} className="px-4 py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-tat-charcoal truncate">{p.title}</p>
                        <code className="font-mono text-[10px] text-tat-slate">{p.slug}</code>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-tat-charcoal tabular-nums">{p.count}</p>
                        <p className="text-[10px] text-tat-slate">{r} converted</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Top packages by views · 7d" cta={{ href: "/admin/funnel", label: "Open funnel" }}>
            {topPkgsByView.length === 0 ? (
              <Empty>No package views recorded.</Empty>
            ) : (
              <ul className="divide-y divide-tat-charcoal/8">
                {topPkgsByView.map((p) => {
                  const max = topPkgsByView[0].count;
                  const w = (p.count / max) * 100;
                  return (
                    <li key={p.slug} className="px-4 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <code className="font-mono text-xs text-tat-charcoal truncate flex-1">{p.slug}</code>
                        <span className="text-sm font-semibold text-tat-charcoal tabular-nums">{p.count}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-tat-paper overflow-hidden">
                        <div className="h-full bg-tat-gold rounded-full" style={{ width: `${w}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </section>

        {/* Funnel */}
        <section>
          <Card title="Conversion funnel · 30d">
            <div className="px-4 py-4 space-y-2">
              {funnel.map((f, i) => {
                const prev = i > 0 ? funnel[i - 1].value : f.value;
                const stepConv = i > 0 ? pct(f.value, prev) : "—";
                return (
                  <div key={f.label} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs font-semibold text-tat-charcoal">{f.label}</span>
                    <div className="flex-1 h-6 rounded-md bg-tat-paper overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-tat-teal-deep to-tat-teal rounded-md flex items-center justify-end pr-2 text-white text-[11px] font-semibold"
                        style={{ width: `${(f.value / funnelMax) * 100}%`, minWidth: f.value > 0 ? "32px" : 0 }}
                      >
                        {f.value > 0 ? f.value : null}
                      </div>
                    </div>
                    <span className="w-20 shrink-0 text-right text-[11px] text-tat-slate tabular-nums">
                      {i === 0 ? "—" : `${stepConv} of prev`}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        {/* Source quality + slow burners */}
        <section className="grid lg:grid-cols-2 gap-4">
          <Card title="Source quality · tier-A %" cta={{ href: "/admin/marketing", label: "Marketing" }}>
            {sourceQuality.length === 0 ? (
              <Empty>Need ≥ 5 leads per source for a signal.</Empty>
            ) : (
              <ul className="divide-y divide-tat-charcoal/8">
                {sourceQuality.slice(0, 8).map((s) => {
                  const tone =
                    s.pct >= 30 ? "bg-tat-teal" : s.pct >= 15 ? "bg-tat-gold" : "bg-tat-orange";
                  return (
                    <li key={s.source} className="px-4 py-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm text-tat-charcoal truncate flex-1">{s.source}</p>
                        <span className="text-sm font-semibold text-tat-charcoal tabular-nums">{s.pct.toFixed(0)}%</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-tat-paper overflow-hidden">
                          <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(s.pct, 100)}%` }} />
                        </div>
                        <span className="text-[10px] text-tat-slate shrink-0 tabular-nums">
                          {s.tierA}/{s.total}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Slow burners · high views, no leads" cta={{ href: "/admin/funnel", label: "Funnel" }}>
            {slowBurners.length === 0 ? (
              <Empty>No slow burners — every viewed package converts ≥ 1%.</Empty>
            ) : (
              <ul className="divide-y divide-tat-charcoal/8">
                {slowBurners.map((p) => (
                  <li key={p.slug} className="px-4 py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <code className="font-mono text-xs text-tat-charcoal truncate flex-1">{p.slug}</code>
                      <span className="text-[10px] text-tat-orange font-semibold">{p.ratio.toFixed(2)}%</span>
                    </div>
                    <p className="text-[11px] text-tat-slate mt-0.5 tabular-nums">
                      {p.viewCount} views · {p.leadCount} lead{p.leadCount === 1 ? "" : "s"}
                    </p>
                  </li>
                ))}
                <li className="px-4 py-2.5 bg-tat-paper">
                  <p className="text-[11px] text-tat-charcoal/70 italic">
                    Action: review hero copy + first scroll on each. Likely missing trust strip
                    or unclear CTA.
                  </p>
                </li>
              </ul>
            )}
          </Card>
        </section>

        {/* Day-of-week heatmap */}
        <section>
          <Card title="Lead arrivals by weekday · 30d (IST)">
            <div className="px-4 py-4 flex items-end gap-2 h-28">
              {dowCounts.map((c, i) => {
                const h = (c / dowMax) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                    <span className="text-[10px] text-tat-slate tabular-nums">{c}</span>
                    <div
                      className="w-full bg-tat-teal rounded-t"
                      style={{ height: `${Math.max(4, h)}%`, minHeight: 4 }}
                      title={`${DOW_LABELS[i]}: ${c}`}
                    />
                    <span className="text-[10px] uppercase tracking-wider text-tat-charcoal/65">
                      {DOW_LABELS[i]}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="px-4 pb-3 text-[11px] text-tat-slate italic">
              Lighter days = candidates to pause ad spend. Heavier days = ensure planner cover.
            </p>
          </Card>
        </section>

        {/* Status mix */}
        <section>
          <Card title="Lead status mix · 30d" cta={{ href: "/admin/leads", label: "Open leads" }}>
            {statusMix.size === 0 ? (
              <Empty>No leads in window.</Empty>
            ) : (
              <div className="px-4 py-3 space-y-2">
                {Array.from(statusMix.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => {
                    const max = Math.max(...statusMix.values());
                    const w = (count / max) * 100;
                    const share = pct(count, leads30.length);
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className="w-32 shrink-0 text-xs text-tat-charcoal">{status}</span>
                        <div className="flex-1 h-2.5 rounded-full bg-tat-paper overflow-hidden">
                          <div
                            className="h-full bg-tat-teal rounded-full"
                            style={{ width: `${w}%` }}
                          />
                        </div>
                        <span className="w-20 shrink-0 text-right text-[11px] text-tat-charcoal/65 tabular-nums">
                          {count} · {share}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>
        </section>

        <p className="text-[11px] text-tat-slate/80">
          Live numbers — pulls service-role from Supabase on each load.{" "}
          <Link href="/admin/marketing" className="text-tat-teal underline-offset-2 hover:underline">
            See the marketing direction
          </Link>{" "}
          for what to do about them.
        </p>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  tone = "default",
}: {
  label: string;
  value: number | string;
  delta?: { txt: string; tone: "up" | "down" | "flat" };
  tone?: "default" | "warn";
}) {
  const toneCls = tone === "warn" && typeof value === "number" && value > 0
    ? "border-tat-orange/40 bg-tat-orange-soft/15"
    : "border-tat-charcoal/10 bg-white";
  const deltaCls = delta
    ? delta.tone === "up"
      ? "text-tat-success-fg"
      : delta.tone === "down"
        ? "text-tat-danger-fg"
        : "text-tat-slate"
    : "";
  return (
    <div className={`rounded-card border ${toneCls} px-4 py-3 shadow-soft`}>
      <p className="text-[10px] uppercase tracking-[0.16em] text-tat-slate font-semibold">{label}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-display text-2xl text-tat-charcoal tabular-nums">{value}</span>
        {delta && <span className={`text-xs font-semibold ${deltaCls}`}>{delta.txt}</span>}
      </div>
    </div>
  );
}

function Card({
  title,
  cta,
  children,
}: {
  title: string;
  cta?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft overflow-hidden">
      <header className="px-4 py-3 border-b border-tat-charcoal/8 flex items-center justify-between">
        <h3 className="font-display text-sm uppercase tracking-[0.16em] text-tat-charcoal/85">{title}</h3>
        {cta && (
          <Link
            href={cta.href}
            className="text-[11px] font-semibold text-tat-teal hover:text-tat-teal-deep underline-offset-2 hover:underline"
          >
            {cta.label} →
          </Link>
        )}
      </header>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-6 text-xs text-tat-slate italic text-center">{children}</p>;
}
