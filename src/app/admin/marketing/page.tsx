export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { getOfferBanners } from "@/lib/sanity-queries";

export const metadata = { title: "Marketing · Trust and Trip Admin" };

// ─── Editable monthly direction ──────────────────────────────────────────
// Update these constants once a month. The values render directly to the
// admin home so the founder + team see the same north-star text. Keep
// each line tight; this is the priority list, not an essay.
const MONTH = "May 2026";
const NORTH_STAR = "Honeymoon couples + Char Dham yatra + Bali June batch.";
const PUSH_THIS_MONTH = [
  "Bali June honeymoon batch — limited slots, gold landing CTA.",
  "Char Dham 2026 — pilgrim landing page + Instagram reels.",
  "Maldives weather story — \"why June isn't off-season\" blog post.",
];
const KILL_OR_SHRINK = [
  "Generic \"Top destinations\" reels — converts < 0.6%.",
  "Newsletter at 7AM IST — open rate dipping, move to 6PM.",
  "Stop boosting Switzerland UGC posts (low Indian-passport conversion).",
];
const COPY_RULES = [
  '"Crafted journeys" / "handpicked" / "honest pricing" — keep',
  '"Best", "cheapest", "guaranteed" — never use',
  "Numbers must be sourceable — no vibe stats",
  "Hero CTA: 5 words max",
];

type LeadRow = { source: string | null; created_at: string; status: string | null };

async function loadLeadMix() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data } = await supabase
    .from("leads")
    .select("source, created_at, status")
    .gte("created_at", since)
    .limit(2000);
  return (data ?? []) as LeadRow[];
}

export default async function MarketingPage() {
  const [banners, leads] = await Promise.all([
    getOfferBanners(20).catch(() => []),
    loadLeadMix().catch(() => [] as LeadRow[]),
  ]);

  const total = leads.length;
  const sourceMix = new Map<string, number>();
  for (const l of leads) {
    const k = l.source ?? "(unknown)";
    sourceMix.set(k, (sourceMix.get(k) ?? 0) + 1);
  }
  const ranked = Array.from(sourceMix.entries()).sort((a, b) => b[1] - a[1]);
  const max = ranked[0]?.[1] ?? 1;

  return (
    <div className="min-h-screen bg-tat-paper">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        <header>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-slate">
            {MONTH} · north-star
          </p>
          <h1 className="font-display text-3xl text-tat-charcoal mt-1">Marketing direction</h1>
          <p className="text-base text-tat-charcoal/85 mt-2 max-w-2xl">{NORTH_STAR}</p>
        </header>

        {/* This month */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="rounded-card border border-tat-teal/30 bg-tat-teal-mist/15 p-5">
            <p className="font-display text-sm uppercase tracking-[0.18em] text-tat-teal-deep mb-3">
              Push this month
            </p>
            <ul className="space-y-2 text-sm text-tat-charcoal/85">
              {PUSH_THIS_MONTH.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-tat-teal mt-0.5">▶</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-tat-orange/30 bg-tat-orange-soft/15 p-5">
            <p className="font-display text-sm uppercase tracking-[0.18em] text-tat-orange mb-3">
              Kill or shrink
            </p>
            <ul className="space-y-2 text-sm text-tat-charcoal/85">
              {KILL_OR_SHRINK.map((k) => (
                <li key={k} className="flex gap-2">
                  <span className="text-tat-orange mt-0.5">×</span>
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Active banners from Sanity */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="font-display text-xl text-tat-charcoal">Active offer banners</h2>
            <Link
              href="/studio/structure/offerBanner"
              className="text-xs font-semibold text-tat-teal hover:text-tat-teal-deep underline-offset-2 hover:underline"
            >
              Edit in Sanity →
            </Link>
          </div>
          {banners.length === 0 ? (
            <p className="text-sm text-tat-slate italic">
              No active banners. Sanity → Offer banner → set <code className="font-mono">active</code> + future{" "}
              <code className="font-mono">expiresAt</code>.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {banners.map((b) => (
                <div
                  key={b.slug}
                  className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft overflow-hidden"
                >
                  <div className={`h-3 bg-gradient-to-r ${b.gradient}`} />
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-tat-slate">{b.eyebrow}</p>
                    <h3 className="font-display text-lg text-tat-charcoal mt-1">{b.title}</h3>
                    {b.sub && <p className="text-xs text-tat-charcoal/65 mt-1">{b.sub}</p>}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-tat-slate">
                      <code className="font-mono truncate max-w-[60%]">{b.href}</code>
                      {b.expiresAt && (
                        <span>
                          expires {new Date(b.expiresAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Lead source mix */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="font-display text-xl text-tat-charcoal">Lead source mix · last 30d</h2>
            <span className="text-xs text-tat-slate">{total} leads</span>
          </div>
          {ranked.length === 0 ? (
            <p className="text-sm text-tat-slate italic">No leads in window.</p>
          ) : (
            <div className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft p-4 space-y-2">
              {ranked.slice(0, 12).map(([source, count]) => {
                const pct = (count / max) * 100;
                const share = ((count / total) * 100).toFixed(1);
                return (
                  <div key={source} className="flex items-center gap-3">
                    <span className="w-44 shrink-0 text-xs font-medium text-tat-charcoal truncate" title={source}>
                      {source}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-tat-paper overflow-hidden">
                      <div
                        className="h-full bg-tat-teal rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right text-[11px] text-tat-charcoal/65 tabular-nums">
                      {count} · {share}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Copy rules quick ref */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="font-display text-xl text-tat-charcoal">Copy voice quick ref</h2>
            <Link
              href="/admin/brand"
              className="text-xs font-semibold text-tat-teal hover:text-tat-teal-deep underline-offset-2 hover:underline"
            >
              Full brand guideline →
            </Link>
          </div>
          <ul className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft divide-y divide-tat-charcoal/8">
            {COPY_RULES.map((r) => (
              <li key={r} className="px-4 py-2.5 text-sm text-tat-charcoal/85">{r}</li>
            ))}
          </ul>
        </section>

        <p className="text-[11px] text-tat-slate/80">
          Edit this page's monthly direction at{" "}
          <code className="font-mono">src/app/admin/marketing/page.tsx</code> (constants at top).
          Banner content lives in Sanity.
        </p>
      </div>
    </div>
  );
}
