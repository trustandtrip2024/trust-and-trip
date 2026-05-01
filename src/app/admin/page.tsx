export const dynamic = "force-dynamic";

import Link from "next/link";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import {
  CheckSquare, Map as MapIcon, BarChart3, Megaphone, Palette, Activity,
  Users, ShoppingBag, Star, ArrowRight,
} from "lucide-react";
import { DAILY_CHECK_ITEMS, todayIST } from "@/lib/daily-checks";
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

async function loadHomeData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const yesterday = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
  const stuckCutoff = new Date(Date.now() - 30 * 60_000).toISOString();
  const today = todayIST();

  // Each call individually try/caught so a missing table (pre-migration)
  // doesn't 500 the whole admin home — degraded values render instead.
  const tryRun = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try { return await fn(); } catch { return fallback; }
  };

  const [
    leads24,
    tierAOpen,
    stuck,
    pendingReviews,
    recentLeads,
    recentBookings,
    dailyRows,
    roadmapStatus,
  ] = await Promise.all([
    tryRun(async () => (await supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", yesterday)).count ?? 0, 0),
    tryRun(async () => (await supabase.from("leads").select("id", { count: "exact", head: true }).eq("tier", "A").neq("status", "booked")).count ?? 0, 0),
    tryRun(async () => (await supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "created").lt("created_at", stuckCutoff)).count ?? 0, 0),
    tryRun(async () => (await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending")).count ?? 0, 0),
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
  ]);

  return {
    leads24,
    tierAOpen,
    stuck,
    pendingReviews,
    recentLeads,
    recentBookings,
    dailyDone: dailyRows.filter((r) => r.completed).length,
    roadmapStatus,
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

export default async function AdminHome() {
  const repoRoot = path.resolve(process.cwd());
  const [data, tasks] = await Promise.all([loadHomeData(), parseAllRoadmapTasks(repoRoot)]);
  const statusByHash = new Map(data.roadmapStatus.map((r) => [r.hash, r.status]));
  const p1 = tasks.filter((t) => t.priority === "P1");
  const p1Open = p1.filter((t) => {
    const s = statusByHash.get(t.hash);
    return s !== "done" && !(s === undefined && t.doneInDoc);
  }).length;

  const dailyTotal = DAILY_CHECK_ITEMS.length;
  const dailyComplete = data.dailyDone === dailyTotal;

  return (
    <div className="min-h-screen bg-tat-paper">
      <div className="max-w-[1400px] mx-auto px-4 py-10">

        <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-slate">
              Admin · {todayIST()}
            </p>
            <h1 className="font-display text-3xl text-tat-charcoal mt-1">Today at Trust and Trip</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill
              href="/admin/daily"
              label={`Daily ${data.dailyDone}/${dailyTotal}`}
              tone={dailyComplete ? "teal" : "orange"}
            />
            <Pill
              href="/admin/roadmap"
              label={`P1 open ${p1Open}`}
              tone={p1Open === 0 ? "teal" : "orange"}
            />
          </div>
        </header>

        {/* Attention strip — anything > 0 nudges the founder */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Attn
            label="New leads · 24h"
            value={data.leads24}
            href="/admin/leads"
            tone={data.leads24 > 0 ? "teal" : "default"}
          />
          <Attn
            label="🔥 Tier A open"
            value={data.tierAOpen}
            href="/admin/leads"
            tone={data.tierAOpen > 0 ? "warn" : "default"}
          />
          <Attn
            label="Stuck bookings"
            value={data.stuck}
            href="/admin/bookings"
            tone={data.stuck > 0 ? "danger" : "default"}
          />
          <Attn
            label="Reviews pending"
            value={data.pendingReviews}
            href="/admin/reviews"
            tone={data.pendingReviews > 0 ? "warn" : "default"}
          />
        </section>

        {/* Section tiles */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          <Tile
            href="/admin/daily"
            icon={CheckSquare}
            title="Daily checks"
            sub="5 mandatory items · resets midnight IST"
            accent={dailyComplete ? "teal" : "orange"}
          />
          <Tile
            href="/admin/roadmap"
            icon={MapIcon}
            title="Roadmap"
            sub="Kanban from MD docs · velocity + blockers"
          />
          <Tile
            href="/admin/insights"
            icon={BarChart3}
            title="Insights"
            sub="What's working / not · 7d & 30d KPIs"
          />
          <Tile
            href="/admin/marketing"
            icon={Megaphone}
            title="Marketing direction"
            sub="This-month focus · banners · source mix"
          />
          <Tile
            href="/admin/brand"
            icon={Palette}
            title="Brand guideline"
            sub="Palette · type · media specs · copy voice"
          />
          <Tile
            href="/admin/health"
            icon={Activity}
            title="System health"
            sub="Live probes · cron jobs · 14d uptime · external dashboards"
          />
          <Tile
            href="/admin/leads"
            icon={Users}
            title="Leads CRM"
            sub="Assignment, scoring, status"
          />
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

function Pill({ href, label, tone }: { href: string; label: string; tone: "teal" | "orange" }) {
  const cls = tone === "teal" ? "bg-tat-teal text-white" : "bg-tat-orange text-white";
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-xs font-semibold ${cls} hover:opacity-90 transition`}
    >
      {label}
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

function Attn({
  label,
  value,
  href,
  tone,
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
    <Link
      href={href}
      className={`rounded-card border ${cls} px-4 py-3 shadow-soft hover:shadow-soft-lg transition-shadow group`}
    >
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
    <Link
      href={href}
      className={`rounded-card border ${ring} bg-white px-4 py-4 shadow-soft hover:shadow-soft-lg transition-shadow flex items-start gap-3 group`}
    >
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
