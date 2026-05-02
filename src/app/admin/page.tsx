export const dynamic = "force-dynamic";

import Link from "next/link";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import {
  CheckSquare, Map as MapIcon, BarChart3, Megaphone, Palette, Activity,
  Users, ShoppingBag, Star, ArrowRight, AlertTriangle, TrendingUp, TrendingDown,
  Wallet, Flame, Clock, Lightbulb,
} from "lucide-react";
import { DAILY_CHECK_ITEMS, dailyItems, todayIST } from "@/lib/daily-checks";
import { parseAllRoadmapTasks } from "@/lib/roadmap-parser";

type LeadRow = {
  id: string;
  name: string | null;
  destination: string | null;
  package_title: string | null;
  source: string | null;
  tier: string | null;
  status: string | null;
  created_at: string;
};

type BookingRow = {
  id: string;
  customer_name: string;
  package_title: string;
  status: string;
  deposit_amount: number;
  created_at: string;
};

type CronRow = { job_path: string; last_run_at: string; status: string };

// Job → expected max-interval in minutes. Cron exceeds this → "overdue".
const CRON_SLA_MIN: Record<string, number> = {
  "/api/cron/escalate-stale-leads": 60,
  "/api/cron/cart-abandonment":     90,
  "/api/cron/price-drops":          1500, // daily
  "/api/cron/review-request":       1500, // daily
  "/api/cron/founder-digest":       1500, // daily
  "/api/cron/refresh-creatives":    10080, // weekly
};

async function loadHomeData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const now = Date.now();
  const yesterday   = new Date(now -      24 * 60 * 60_000).toISOString();
  const w7          = new Date(now -  7 * 24 * 60 * 60_000).toISOString();
  const w14         = new Date(now - 14 * 24 * 60 * 60_000).toISOString();
  const w30         = new Date(now - 30 * 24 * 60 * 60_000).toISOString();
  const stuckCutoff = new Date(now -      30      * 60_000).toISOString();
  const today = todayIST();

  // Per-call try/catch — pre-migration tables degrade to fallback,
  // never 500 the home view.
  const tryRun = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try { return await fn(); } catch { return fallback; }
  };

  const [
    leads24,
    tierAOpen,
    oldestTierA,
    stuck,
    pendingReviews,
    leads7,
    leadsPrev7,
    verified7,
    verifiedPrev7,
    deposits7,
    deposits30,
    recentLeads,
    recentBookings,
    dailyRows,
    roadmapStatus,
    cronRows,
  ] = await Promise.all([
    tryRun(async () => (await supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", yesterday)).count ?? 0, 0),
    tryRun(async () => (await supabase.from("leads").select("id", { count: "exact", head: true }).eq("tier", "A").neq("status", "booked")).count ?? 0, 0),
    tryRun(async () => {
      const { data } = await supabase.from("leads").select("created_at").eq("tier", "A").neq("status", "booked").order("created_at", { ascending: true }).limit(1);
      return data?.[0]?.created_at ?? null;
    }, null as string | null),
    tryRun(async () => (await supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "created").lt("created_at", stuckCutoff)).count ?? 0, 0),
    tryRun(async () => (await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending")).count ?? 0, 0),
    tryRun(async () => (await supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", w7)).count ?? 0, 0),
    tryRun(async () => (await supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", w14).lt("created_at", w7)).count ?? 0, 0),
    tryRun(async () => (await supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "verified").gte("created_at", w7)).count ?? 0, 0),
    tryRun(async () => (await supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "verified").gte("created_at", w14).lt("created_at", w7)).count ?? 0, 0),
    tryRun(async () => {
      const { data } = await supabase.from("bookings").select("deposit_amount").eq("status", "verified").gte("created_at", w7);
      return (data ?? []).reduce((s, r: { deposit_amount: number | null }) => s + (r.deposit_amount ?? 0), 0);
    }, 0),
    tryRun(async () => {
      const { data } = await supabase.from("bookings").select("deposit_amount").eq("status", "verified").gte("created_at", w30);
      return (data ?? []).reduce((s, r: { deposit_amount: number | null }) => s + (r.deposit_amount ?? 0), 0);
    }, 0),
    tryRun(async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, name, destination, package_title, source, tier, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return (data ?? []) as LeadRow[];
    }, [] as LeadRow[]),
    tryRun(async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, customer_name, package_title, status, deposit_amount, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return (data ?? []) as BookingRow[];
    }, [] as BookingRow[]),
    tryRun(async () => {
      const { data } = await supabase.from("daily_checks").select("item_key, completed").eq("check_date", today);
      return (data ?? []) as { item_key: string; completed: boolean }[];
    }, [] as { item_key: string; completed: boolean }[]),
    tryRun(async () => {
      const { data } = await supabase.from("roadmap_tasks").select("hash, status");
      return (data ?? []) as { hash: string; status: string }[];
    }, [] as { hash: string; status: string }[]),
    tryRun(async () => {
      const { data } = await supabase.from("cron_runs").select("job_path, last_run_at, status");
      return (data ?? []) as CronRow[];
    }, [] as CronRow[]),
  ]);

  const decisionsDue = await tryRun(async () => {
    const { count } = await supabase
      .from("decisions")
      .select("id", { count: "exact", head: true })
      .lte("review_on", todayIST())
      .is("outcome", null);
    return count ?? 0;
  }, 0);

  return {
    leads24, tierAOpen, oldestTierA, stuck, pendingReviews,
    leads7, leadsPrev7, verified7, verifiedPrev7,
    deposits7, deposits30,
    recentLeads, recentBookings,
    dailyDone: dailyRows.filter((r) => r.completed).length,
    roadmapStatus, cronRows, decisionsDue,
  };
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function inr(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function deltaPct(curr: number, prev: number): { txt: string; tone: "up" | "down" | "flat" } {
  if (prev === 0) return { txt: curr > 0 ? "new" : "—", tone: curr > 0 ? "up" : "flat" };
  const c = ((curr - prev) / prev) * 100;
  if (Math.abs(c) < 2) return { txt: "flat", tone: "flat" };
  return { txt: `${c > 0 ? "+" : ""}${c.toFixed(0)}%`, tone: c > 0 ? "up" : "down" };
}

type Brief = {
  id: string;
  severity: "danger" | "warn" | "info";
  title: string;
  detail: string;
  href: string;
  cta: string;
  score: number;
};

export default async function AdminHome() {
  const repoRoot = path.resolve(process.cwd());
  const [data, tasks] = await Promise.all([loadHomeData(), parseAllRoadmapTasks(repoRoot)]);
  const statusByHash = new Map(data.roadmapStatus.map((r) => [r.hash, r.status]));
  const p1 = tasks.filter((t) => t.priority === "P1");
  const p1Open = p1.filter((t) => {
    const s = statusByHash.get(t.hash);
    return s !== "done" && !(s === undefined && t.doneInDoc);
  }).length;
  const blocked = tasks.filter((t) => statusByHash.get(t.hash) === "blocked").length;

  const dailyTotalAll = DAILY_CHECK_ITEMS.length;
  const dailyComplete = data.dailyDone === dailyTotalAll;
  const dailyOnly = dailyItems();
  const ist = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const istHour = ist.getHours();

  // ─── Decision Brief — rank what to act on right now ──────────────────
  const briefs: Brief[] = [];

  if (data.stuck > 0) {
    briefs.push({
      id: "stuck",
      severity: "danger",
      title: `${data.stuck} stuck booking${data.stuck === 1 ? "" : "s"} hold money + seats`,
      detail: "Razorpay never returned. Verify status manually or cancel to free inventory.",
      href: "/admin/bookings",
      cta: "Resolve",
      score: 100 + data.stuck * 5,
    });
  }

  if (data.tierAOpen > 0) {
    let detail = `Hot prospects waiting. SLA: contact within 30 min in work hours.`;
    if (data.oldestTierA) {
      const ageHrs = (Date.now() - new Date(data.oldestTierA).getTime()) / 3_600_000;
      if (ageHrs > 0.5) detail = `Oldest tier-A waiting ${ageHrs < 24 ? `${ageHrs.toFixed(1)} h` : `${(ageHrs / 24).toFixed(1)} d`}. SLA breached.`;
    }
    briefs.push({
      id: "tierA",
      severity: data.tierAOpen >= 5 ? "danger" : "warn",
      title: `${data.tierAOpen} tier-A lead${data.tierAOpen === 1 ? "" : "s"} open`,
      detail,
      href: "/admin/leads",
      cta: "Contact",
      score: 90 + data.tierAOpen * 4,
    });
  }

  // Daily checks past mid-day still incomplete
  if (!dailyComplete && istHour >= 14) {
    const missing = dailyTotalAll - data.dailyDone;
    briefs.push({
      id: "daily",
      severity: istHour >= 20 ? "danger" : "warn",
      title: `${missing} daily check${missing === 1 ? "" : "s"} not done — past 2pm IST`,
      detail: "EOD risk: stale lead, unmoderated review, or missed deploy regression.",
      href: "/admin/daily",
      cta: "Open",
      score: 70 + missing * 3 + (istHour >= 20 ? 15 : 0),
    });
  }

  if (data.pendingReviews >= 3) {
    briefs.push({
      id: "reviews",
      severity: "warn",
      title: `${data.pendingReviews} reviews waiting moderation`,
      detail: "Backlog erodes trust on package pages and dampens new submissions.",
      href: "/admin/reviews",
      cta: "Moderate",
      score: 50 + data.pendingReviews,
    });
  }

  if (p1Open > 0) {
    briefs.push({
      id: "p1",
      severity: p1Open >= 5 ? "warn" : "info",
      title: `${p1Open} P1 roadmap item${p1Open === 1 ? "" : "s"} open`,
      detail: blocked > 0 ? `${blocked} blocked overall — unblock or re-scope.` : "Founder-only blockers from director audit.",
      href: "/admin/roadmap?priority=P1",
      cta: "Plan",
      score: 40 + p1Open * 2,
    });
  }

  if (data.decisionsDue > 0) {
    briefs.push({
      id: "decisions",
      severity: "info",
      title: `${data.decisionsDue} decision${data.decisionsDue === 1 ? "" : "s"} due for review`,
      detail: "Write the outcome — closes the loop and trains future judgment.",
      href: "/admin/decisions",
      cta: "Review",
      score: 35 + data.decisionsDue * 2,
    });
  }

  // Overdue crons
  const overdueCrons: { job: string; ageMin: number }[] = [];
  const seenJobs = new Set(data.cronRows.map((r) => r.job_path));
  for (const [job, slaMin] of Object.entries(CRON_SLA_MIN)) {
    const row = data.cronRows.find((r) => r.job_path === job);
    if (!row) continue;
    const ageMin = (Date.now() - new Date(row.last_run_at).getTime()) / 60_000;
    if (ageMin > slaMin || row.status === "error") overdueCrons.push({ job, ageMin });
  }
  // jobs that never reported at all (after first migration window) — silent if none seen
  if (seenJobs.size > 0 && overdueCrons.length > 0) {
    briefs.push({
      id: "crons",
      severity: overdueCrons.some((c) => c.ageMin > 60 * 24) ? "warn" : "info",
      title: `${overdueCrons.length} cron job${overdueCrons.length === 1 ? "" : "s"} overdue`,
      detail: overdueCrons.slice(0, 2).map((c) => c.job.split("/").pop()).join(", "),
      href: "/admin/health",
      cta: "Inspect",
      score: 30 + overdueCrons.length * 2,
    });
  }

  briefs.sort((a, b) => b.score - a.score);

  const leadsDelta = deltaPct(data.leads7, data.leadsPrev7);
  const verifiedDelta = deltaPct(data.verified7, data.verifiedPrev7);

  return (
    <div className="min-h-screen bg-tat-paper">
      <div className="max-w-[1400px] mx-auto px-4 py-10">

        <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-slate">
              Admin · {todayIST()} · {ist.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })} IST
            </p>
            <h1 className="font-display text-3xl text-tat-charcoal mt-1">Today at Trust and Trip</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill href="/admin/daily" label={`Daily ${data.dailyDone}/${dailyTotalAll}`} tone={dailyComplete ? "teal" : "orange"} />
            <Pill href="/admin/roadmap?priority=P1" label={`P1 open ${p1Open}`} tone={p1Open === 0 ? "teal" : "orange"} />
          </div>
        </header>

        {/* ─── DECISION BRIEF — what to act on right now ──────────────── */}
        <section className="mb-8">
          <div className="rounded-card border border-tat-charcoal/12 bg-white shadow-soft overflow-hidden">
            <header className="px-4 py-3 border-b border-tat-charcoal/8 flex items-center justify-between gap-2">
              <h3 className="font-display text-sm uppercase tracking-[0.16em] text-tat-charcoal/85 inline-flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-tat-orange" />
                Decision brief · act on these now
              </h3>
              <span className="text-[10px] text-tat-slate">
                Ranked by impact × urgency
              </span>
            </header>
            {briefs.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-tat-charcoal">All clear. Nothing on fire.</p>
                <p className="text-[11px] text-tat-slate mt-1">
                  Use the calm window: pick a P2 from <Link href="/admin/roadmap" className="text-tat-teal underline-offset-2 hover:underline">roadmap</Link>{" "}
                  or scan <Link href="/admin/insights" className="text-tat-teal underline-offset-2 hover:underline">insights</Link> for compounding wins.
                </p>
              </div>
            ) : (
              <ol className="divide-y divide-tat-charcoal/8">
                {briefs.slice(0, 5).map((b, i) => (
                  <BriefRow key={b.id} index={i + 1} brief={b} />
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* ─── Money + week deltas ─────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Money
            label="Deposits · 7d"
            value={inr(data.deposits7)}
            sub={`${data.verified7} verified`}
            delta={verifiedDelta}
          />
          <Money
            label="Deposits · 30d"
            value={inr(data.deposits30)}
            sub="Razorpay verified only"
          />
          <Money
            label="Leads · 7d"
            value={data.leads7.toString()}
            sub={`vs ${data.leadsPrev7} prev wk`}
            delta={leadsDelta}
          />
          <Money
            label="Conversion · 7d"
            value={data.leads7 ? `${((data.verified7 / data.leads7) * 100).toFixed(1)}%` : "—"}
            sub="Verified ÷ leads"
          />
        </section>

        {/* ─── Attention strip — counts only ─────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Attn label="New leads · 24h"   value={data.leads24}        href="/admin/leads"    tone={data.leads24 > 0       ? "teal"   : "default"} />
          <Attn label="🔥 Tier A open"    value={data.tierAOpen}      href="/admin/leads"    tone={data.tierAOpen > 0     ? "warn"   : "default"} />
          <Attn label="Stuck bookings"    value={data.stuck}          href="/admin/bookings" tone={data.stuck > 0         ? "danger" : "default"} />
          <Attn label="Reviews pending"   value={data.pendingReviews} href="/admin/reviews"  tone={data.pendingReviews > 0 ? "warn"  : "default"} />
        </section>

        {/* Section tiles */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          <Tile href="/admin/daily"     icon={CheckSquare} title="Daily checks"        sub={`${dailyOnly.length} daily + 5 weekly · resets midnight IST`} accent={dailyComplete ? "teal" : "orange"} />
          <Tile href="/admin/decisions" icon={Lightbulb}   title="Decisions journal"   sub="Log + revisit each call · solo-founder memory aid" accent={data.decisionsDue > 0 ? "orange" : "default"} />
          <Tile href="/admin/roadmap"   icon={MapIcon}     title="Roadmap"             sub="Kanban from MD docs · velocity + blockers" />
          <Tile href="/admin/insights"  icon={BarChart3}   title="Insights"            sub="What's working / not · 7d & 30d KPIs" />
          <Tile href="/admin/marketing" icon={Megaphone}   title="Marketing direction" sub="This-month focus · banners · source mix" />
          <Tile href="/admin/brand"     icon={Palette}     title="Brand guideline"     sub="Palette · type · media specs · copy voice" />
          <Tile href="/admin/health"    icon={Activity}    title="System health"       sub="Live probes · cron jobs · 14d uptime · external dashboards" />
          <Tile href="/admin/leads"     icon={Users}       title="Leads CRM"           sub="Assignment, scoring, status" />
          <Tile href="/admin/packages-overview" icon={ShoppingBag} title="Packages overview" sub="56 destinations · 206 packages · search, filter, export" />
        </section>

        {/* Activity feed */}
        <section className="grid lg:grid-cols-2 gap-4">
          <Card title="Latest leads" cta={{ href: "/admin/leads", label: "All" }} icon={Users}>
            {data.recentLeads.length === 0 ? (
              <Empty>No leads yet.</Empty>
            ) : (
              <ul className="divide-y divide-tat-charcoal/8">
                {data.recentLeads.map((l) => (
                  <li key={l.id} className="px-4 py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm text-tat-charcoal truncate">
                        <span className="font-medium">{l.name || "Anonymous"}</span>
                        {l.tier === "A" && (
                          <span className="ml-2 inline-block rounded-pill bg-tat-orange/15 text-tat-orange px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            Tier A
                          </span>
                        )}
                      </p>
                      <span className="text-[10px] text-tat-slate shrink-0">{timeAgo(l.created_at)}</span>
                    </div>
                    <p className="text-xs text-tat-slate truncate mt-0.5">
                      {l.package_title || l.destination || "(no package)"} · {l.source ?? "—"} · {l.status ?? "new"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Latest bookings" cta={{ href: "/admin/bookings", label: "All" }} icon={ShoppingBag}>
            {data.recentBookings.length === 0 ? (
              <Empty>No bookings yet.</Empty>
            ) : (
              <ul className="divide-y divide-tat-charcoal/8">
                {data.recentBookings.map((b) => (
                  <li key={b.id} className="px-4 py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm text-tat-charcoal truncate">
                        <span className="font-medium">{b.customer_name}</span>
                        <StatusChip status={b.status} />
                      </p>
                      <span className="text-[10px] text-tat-slate shrink-0">{timeAgo(b.created_at)}</span>
                    </div>
                    <p className="text-xs text-tat-slate truncate mt-0.5">
                      {b.package_title} · ₹{b.deposit_amount.toLocaleString("en-IN")} deposit
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

      </div>
    </div>
  );
}

function BriefRow({ index, brief }: { index: number; brief: Brief }) {
  const sev = {
    danger: { ring: "border-l-tat-orange",         icon: <AlertTriangle className="h-4 w-4 text-tat-orange" />,    pill: "bg-tat-orange text-white" },
    warn:   { ring: "border-l-tat-gold",           icon: <Clock className="h-4 w-4 text-tat-gold" />,              pill: "bg-tat-gold text-tat-charcoal" },
    info:   { ring: "border-l-tat-teal",           icon: <Star className="h-4 w-4 text-tat-teal" />,               pill: "bg-tat-teal text-white" },
  }[brief.severity];
  return (
    <li className={`pl-3 pr-4 py-3 border-l-4 ${sev.ring} flex items-start gap-3`}>
      <span className="grid place-items-center h-6 w-6 rounded-full bg-tat-paper text-[10px] font-bold tabular-nums text-tat-charcoal/70 shrink-0 mt-0.5">
        {index}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {sev.icon}
          <p className="text-sm font-semibold text-tat-charcoal truncate">{brief.title}</p>
        </div>
        <p className="text-xs text-tat-slate mt-0.5">{brief.detail}</p>
      </div>
      <Link
        href={brief.href}
        className={`shrink-0 inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-semibold ${sev.pill} hover:opacity-90 transition`}
      >
        {brief.cta}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </li>
  );
}

function Money({
  label, value, sub, delta,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: { txt: string; tone: "up" | "down" | "flat" };
}) {
  const Trend = delta?.tone === "up" ? TrendingUp : delta?.tone === "down" ? TrendingDown : null;
  const deltaCls = delta?.tone === "up"
    ? "text-tat-success-fg"
    : delta?.tone === "down"
      ? "text-tat-danger-fg"
      : "text-tat-slate";
  return (
    <div className="rounded-card border border-tat-charcoal/10 bg-white px-4 py-3 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.16em] text-tat-slate font-semibold inline-flex items-center gap-1.5">
          <Wallet className="h-3 w-3 text-tat-slate/70" />
          {label}
        </p>
        {delta && Trend && (
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${deltaCls}`}>
            <Trend className="h-3 w-3" />
            {delta.txt}
          </span>
        )}
      </div>
      <p className="font-display text-2xl text-tat-charcoal tabular-nums mt-1">{value}</p>
      {sub && <p className="text-[10px] text-tat-slate mt-0.5">{sub}</p>}
    </div>
  );
}

function Pill({ href, label, tone }: { href: string; label: string; tone: "teal" | "orange" }) {
  const cls = tone === "teal" ? "bg-tat-teal text-white" : "bg-tat-orange text-white";
  return (
    <Link href={href} className={`inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-xs font-semibold ${cls} hover:opacity-90 transition`}>
      {label}
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

function Attn({
  label, value, href, tone,
}: {
  label: string;
  value: number;
  href: string;
  tone: "default" | "teal" | "warn" | "danger";
}) {
  const cls = {
    default: "border-tat-charcoal/10 bg-white",
    teal:    "border-tat-teal/35 bg-tat-teal-mist/15",
    warn:    "border-tat-gold/35 bg-tat-gold/10",
    danger:  "border-tat-orange/40 bg-tat-orange-soft/15",
  }[tone];
  return (
    <Link href={href} className={`rounded-card border ${cls} px-4 py-3 shadow-soft hover:shadow-soft-lg transition-shadow group`}>
      <p className="text-[10px] uppercase tracking-[0.16em] text-tat-slate font-semibold">{label}</p>
      <div className="mt-1 flex items-baseline justify-between">
        <span className="font-display text-2xl text-tat-charcoal tabular-nums">{value}</span>
        <ArrowRight className="h-3.5 w-3.5 text-tat-slate group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

function Tile({
  href, icon: Icon, title, sub, accent = "default",
}: {
  href: string;
  icon: typeof CheckSquare;
  title: string;
  sub: string;
  accent?: "default" | "teal" | "orange";
}) {
  const ring = {
    default: "border-tat-charcoal/10",
    teal:    "border-tat-teal/40",
    orange:  "border-tat-orange/40",
  }[accent];
  return (
    <Link href={href} className={`rounded-card border ${ring} bg-white px-4 py-4 shadow-soft hover:shadow-soft-lg transition-shadow flex items-start gap-3 group`}>
      <span className="grid place-items-center h-9 w-9 rounded-md bg-tat-cream/60">
        <Icon className="h-4 w-4 text-tat-charcoal" />
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-base text-tat-charcoal">{title}</h3>
        <p className="text-xs text-tat-slate mt-0.5">{sub}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-tat-slate group-hover:translate-x-0.5 transition-transform mt-1" />
    </Link>
  );
}

function Card({
  title, cta, icon: Icon, children,
}: {
  title: string;
  cta?: { href: string; label: string };
  icon?: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft overflow-hidden">
      <header className="px-4 py-3 border-b border-tat-charcoal/8 flex items-center justify-between gap-2">
        <h3 className="font-display text-sm uppercase tracking-[0.16em] text-tat-charcoal/85 inline-flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 text-tat-slate" />}
          {title}
        </h3>
        {cta && (
          <Link href={cta.href} className="text-[11px] font-semibold text-tat-teal hover:text-tat-teal-deep underline-offset-2 hover:underline">
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

function StatusChip({ status }: { status: string }) {
  const cls = {
    created:   "bg-tat-cream-warm/80 text-tat-charcoal",
    paid:      "bg-tat-teal-mist/60 text-tat-teal-deep",
    verified:  "bg-tat-teal text-white",
    refunded:  "bg-tat-slate/30 text-tat-charcoal",
    cancelled: "bg-tat-orange-soft/30 text-tat-orange",
  }[status] ?? "bg-tat-paper text-tat-charcoal";
  return (
    <span className={`ml-2 inline-block rounded-pill px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}
