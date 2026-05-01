export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { sanityClient } from "@/lib/sanity";

export const metadata = { title: "Health · Trust and Trip Admin" };

type Status = "ok" | "degraded" | "down" | "unknown";

type ServiceProbe = {
  key: string;
  label: string;
  status: Status;
  latencyMs: number | null;
  detail: string;
  link: { href: string; label: string };
};

type CronRow = {
  job_path: string;
  last_run_at: string;
  status: "ok" | "error";
  duration_ms: number | null;
  detail: string | null;
};

type PingRow = {
  service: string;
  status: "ok" | "degraded" | "down";
  pinged_at: string;
};

const KNOWN_CRONS: { path: string; schedule: string; label: string }[] = [
  { path: "/api/cron/price-drops",          schedule: "0 3 * * *",  label: "Price drops" },
  { path: "/api/cron/cart-abandonment",     schedule: "30 10 * * *", label: "Cart abandonment" },
  { path: "/api/cron/review-request",       schedule: "0 9 * * *",  label: "Review request" },
  { path: "/api/cron/escalate-stale-leads", schedule: "0 4 * * *",  label: "Escalate stale leads" },
  { path: "/api/cron/founder-digest",       schedule: "30 2 * * *", label: "Founder digest" },
  { path: "/api/cron/refresh-creatives",    schedule: "0 4 * * 1",  label: "Refresh creatives (weekly)" },
];

async function probeSupabase(): Promise<ServiceProbe> {
  const t0 = Date.now();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      key: "supabase", label: "Supabase",
      status: "down", latencyMs: null,
      detail: "Env missing",
      link: { href: "https://supabase.com/dashboard", label: "Open" },
    };
  }
  try {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await sb.from("leads").select("id", { count: "exact", head: true });
    const ms = Date.now() - t0;
    return {
      key: "supabase", label: "Supabase",
      status: error ? "down" : ms > 1500 ? "degraded" : "ok",
      latencyMs: ms,
      detail: error ? error.message : `1 cheap query · ${ms}ms`,
      link: { href: "https://supabase.com/dashboard", label: "Open" },
    };
  } catch (e) {
    return {
      key: "supabase", label: "Supabase",
      status: "down", latencyMs: Date.now() - t0,
      detail: (e as Error).message,
      link: { href: "https://supabase.com/dashboard", label: "Open" },
    };
  }
}

async function probeSanity(): Promise<ServiceProbe> {
  const t0 = Date.now();
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return {
      key: "sanity", label: "Sanity",
      status: "down", latencyMs: null,
      detail: "Env missing",
      link: { href: "https://www.sanity.io/manage", label: "Open" },
    };
  }
  try {
    await sanityClient.fetch<number>(`count(*[_type == "destination"])`);
    const ms = Date.now() - t0;
    return {
      key: "sanity", label: "Sanity CMS",
      status: ms > 2000 ? "degraded" : "ok",
      latencyMs: ms,
      detail: `count query · ${ms}ms`,
      link: { href: "https://www.sanity.io/manage", label: "Open" },
    };
  } catch (e) {
    return {
      key: "sanity", label: "Sanity CMS",
      status: "down", latencyMs: Date.now() - t0,
      detail: (e as Error).message,
      link: { href: "https://www.sanity.io/manage", label: "Open" },
    };
  }
}

function probeEnv(
  key: string,
  label: string,
  envs: string[],
  href: string,
): ServiceProbe {
  const present = envs.every((e) => !!process.env[e]);
  return {
    key, label,
    status: present ? "ok" : "down",
    latencyMs: null,
    detail: present
      ? `${envs.length} env var${envs.length === 1 ? "" : "s"} present`
      : `Missing: ${envs.filter((e) => !process.env[e]).join(", ")}`,
    link: { href, label: "Open" },
  };
}

async function recordPings(probes: ServiceProbe[]): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    await sb.from("health_pings").insert(
      probes
        .filter((p) => p.status !== "unknown")
        .map((p) => ({
          service: p.key,
          status: p.status,
          latency_ms: p.latencyMs,
          detail: p.detail.slice(0, 500),
        })),
    );
  } catch (e) {
    console.error("[health] ping write failed", e);
  }
}

async function loadCronRuns(): Promise<CronRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data } = await sb
      .from("cron_runs")
      .select("job_path, last_run_at, status, duration_ms, detail");
    return (data ?? []) as CronRow[];
  } catch {
    return [];
  }
}

async function loadPings14d(): Promise<PingRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const since = new Date(Date.now() - 14 * 86_400_000).toISOString();
    const { data } = await sb
      .from("health_pings")
      .select("service, status, pinged_at")
      .gte("pinged_at", since)
      .order("pinged_at", { ascending: true });
    return (data ?? []) as PingRow[];
  } catch {
    return [];
  }
}

function bucketByDay(pings: PingRow[]): Map<string, Map<string, "ok" | "degraded" | "down">> {
  // For each (service, day) keep the worst status.
  const rank = { ok: 0, degraded: 1, down: 2 } as const;
  const out = new Map<string, Map<string, "ok" | "degraded" | "down">>();
  for (const p of pings) {
    const day = p.pinged_at.slice(0, 10);
    if (!out.has(p.service)) out.set(p.service, new Map());
    const map = out.get(p.service)!;
    const prev = map.get(day);
    if (!prev || rank[p.status] > rank[prev]) map.set(day, p.status);
  }
  return out;
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function isOverdue(jobPath: string, lastRunAt: string | null | undefined): boolean {
  if (!lastRunAt) return true;
  const cron = KNOWN_CRONS.find((c) => c.path === jobPath);
  if (!cron) return false;
  // Weekly job (Mon) → 8 days. Daily → 36 hours.
  const limitMs = cron.schedule.includes("* * 1") ? 8 * 86_400_000 : 36 * 3_600_000;
  return Date.now() - new Date(lastRunAt).getTime() > limitMs;
}

export default async function HealthPage() {
  // Live probes — Supabase + Sanity hit real endpoints; others env-presence.
  const probes: ServiceProbe[] = await Promise.all([
    probeSupabase(),
    probeSanity(),
    Promise.resolve(probeEnv("razorpay", "Razorpay", ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"], "https://dashboard.razorpay.com/")),
    Promise.resolve(probeEnv("anthropic", "Anthropic (Aria)", ["ANTHROPIC_API_KEY"], "https://console.anthropic.com/usage")),
    Promise.resolve(probeEnv("bitrix", "Bitrix24", ["BITRIX24_WEBHOOK_URL"], "https://bitrix24.in/")),
    Promise.resolve(probeEnv("upstash", "Upstash Redis", ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"], "https://console.upstash.com/")),
    Promise.resolve(probeEnv("resend", "Resend (email)", ["RESEND_API_KEY"], "https://resend.com/")),
    Promise.resolve(probeEnv("admin", "Admin auth", ["ADMIN_SECRET"], "/admin")),
  ]);

  // Record this probe set into history (fire-and-forget, but awaited for
  // the next page load — cheap insert).
  await recordPings(probes);

  const [cronRuns, pings] = await Promise.all([loadCronRuns(), loadPings14d()]);
  const cronByPath = new Map(cronRuns.map((r) => [r.job_path, r]));
  const pingsBucketed = bucketByDay(pings);

  const liveStatus = probes.some((p) => p.status === "down")
    ? "down"
    : probes.some((p) => p.status === "degraded")
      ? "degraded"
      : "ok";

  const days14: string[] = [];
  for (let i = 13; i >= 0; i--) {
    days14.push(new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10));
  }

  return (
    <div className="min-h-screen bg-tat-paper">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-slate">
              Live · service probes run on every page load
            </p>
            <h1 className="font-display text-3xl text-tat-charcoal mt-1">System health</h1>
          </div>
          <StatusBadge status={liveStatus} />
        </header>

        {/* Live service probes */}
        <section>
          <h2 className="font-display text-sm uppercase tracking-[0.16em] text-tat-charcoal/85 mb-3">
            Service probes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {probes.map((p) => (
              <div
                key={p.key}
                className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-sm text-tat-charcoal">{p.label}</h3>
                  <Dot status={p.status} />
                </div>
                <p className="text-xs text-tat-charcoal/65 mt-1">{p.detail}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  {p.latencyMs !== null ? (
                    <span className="text-[10px] text-tat-slate font-mono tabular-nums">
                      {p.latencyMs}ms
                    </span>
                  ) : (
                    <span />
                  )}
                  <Link
                    href={p.link.href}
                    target={p.link.href.startsWith("http") ? "_blank" : undefined}
                    rel={p.link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-[11px] font-semibold text-tat-teal hover:text-tat-teal-deep underline-offset-2 hover:underline"
                  >
                    {p.link.label} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 14-day uptime graph */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="font-display text-sm uppercase tracking-[0.16em] text-tat-charcoal/85">
              Uptime · last 14 days
            </h2>
            <p className="text-[11px] text-tat-slate">
              {pings.length === 0 ? "No history yet — graph fills as probes run." : `${pings.length} pings`}
            </p>
          </div>
          <div className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft p-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-[10px] uppercase tracking-wider text-tat-slate font-semibold pb-2 pr-3">
                    Service
                  </th>
                  {days14.map((d) => (
                    <th key={d} className="text-center text-[9px] text-tat-slate font-medium pb-2 px-0.5">
                      {d.slice(8)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {probes.map((p) => {
                  const map = pingsBucketed.get(p.key);
                  return (
                    <tr key={p.key}>
                      <td className="py-1.5 pr-3 text-tat-charcoal whitespace-nowrap">{p.label}</td>
                      {days14.map((d) => {
                        const s = map?.get(d);
                        const cls = !s
                          ? "bg-tat-charcoal/8"
                          : s === "ok"
                            ? "bg-tat-teal"
                            : s === "degraded"
                              ? "bg-tat-gold"
                              : "bg-tat-orange";
                        return (
                          <td key={d} className="px-0.5 py-0.5">
                            <div
                              className={`h-5 w-full rounded ${cls}`}
                              title={`${d}: ${s ?? "no data"}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center gap-3 mt-3 text-[10px] text-tat-slate">
              <Legend swatch="bg-tat-teal" label="ok" />
              <Legend swatch="bg-tat-gold" label="degraded" />
              <Legend swatch="bg-tat-orange" label="down" />
              <Legend swatch="bg-tat-charcoal/8" label="no data" />
            </div>
          </div>
        </section>

        {/* Cron jobs */}
        <section>
          <h2 className="font-display text-sm uppercase tracking-[0.16em] text-tat-charcoal/85 mb-3">
            Cron jobs ({KNOWN_CRONS.length})
          </h2>
          <div className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-tat-paper">
                <tr className="text-left text-[11px] uppercase tracking-wider text-tat-slate">
                  <th className="px-4 py-2">Job</th>
                  <th className="px-4 py-2">Schedule</th>
                  <th className="px-4 py-2">Last run</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                {KNOWN_CRONS.map((c) => {
                  const r = cronByPath.get(c.path);
                  const overdue = isOverdue(c.path, r?.last_run_at);
                  return (
                    <tr key={c.path} className="border-t border-tat-charcoal/8">
                      <td className="px-4 py-2 text-tat-charcoal">
                        <span className="font-medium">{c.label}</span>
                        <code className="block font-mono text-[10px] text-tat-slate">{c.path}</code>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-tat-charcoal/75">{c.schedule}</td>
                      <td className="px-4 py-2 text-tat-charcoal/75">
                        {timeAgo(r?.last_run_at)}
                        {overdue && r && (
                          <span className="ml-2 inline-block rounded-pill bg-tat-orange/15 text-tat-orange px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            overdue
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {!r ? (
                          <span className="text-tat-slate text-xs italic">no record</span>
                        ) : r.status === "ok" ? (
                          <Dot status="ok" />
                        ) : (
                          <span className="inline-flex items-center gap-1 text-tat-orange text-xs font-semibold">
                            <Dot status="down" /> error
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 font-mono text-[11px] text-tat-charcoal/75 tabular-nums">
                        {r?.duration_ms ? `${r.duration_ms}ms` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-tat-paper border-t border-tat-charcoal/8 text-[11px] text-tat-charcoal/65">
              Cron rows populate when handlers wrap with{" "}
              <code className="font-mono">withCronLog()</code> from{" "}
              <code className="font-mono">src/lib/cron-log.ts</code>.{" "}
              <Link
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tat-teal hover:text-tat-teal-deep underline-offset-2 hover:underline"
              >
                Vercel cron dashboard
              </Link>{" "}
              is the ground truth for scheduling.
            </div>
          </div>
        </section>

        {/* External dashboards */}
        <section>
          <h2 className="font-display text-sm uppercase tracking-[0.16em] text-tat-charcoal/85 mb-3">
            External dashboards
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <DeepLink
              href="https://vercel.com/dashboard/analytics"
              title="Speed Insights"
              sub="Core Web Vitals · LCP / INP / CLS"
            />
            <DeepLink
              href="https://vercel.com/dashboard"
              title="Vercel deploys + logs"
              sub="Last build, runtime logs, errors"
            />
            <DeepLink
              href="https://sentry.io/"
              title="Sentry"
              sub="Errors, sessions, release health"
            />
            <DeepLink
              href="https://console.anthropic.com/usage"
              title="Anthropic usage"
              sub="Daily Claude Haiku spend · cost ceilings"
            />
            <DeepLink
              href="https://supabase.com/dashboard"
              title="Supabase dashboard"
              sub="Tables, logs, auth, backups, PITR"
            />
            <DeepLink
              href="https://www.sanity.io/manage"
              title="Sanity Studio admin"
              sub="Datasets, tokens, webhooks"
            />
            <DeepLink
              href="https://dashboard.razorpay.com/"
              title="Razorpay"
              sub="Orders, payments, webhooks"
            />
            <DeepLink
              href="https://console.upstash.com/"
              title="Upstash Redis"
              sub="Cache + rate-limit. Token rotation here breaks prod."
            />
            <DeepLink
              href="https://business.facebook.com/events_manager2/list/pixel"
              title="Meta Events Manager"
              sub="Pixel + CAPI dedup, lead match quality"
            />
          </div>
        </section>

        {/* Safety reminders */}
        <section>
          <h2 className="font-display text-sm uppercase tracking-[0.16em] text-tat-charcoal/85 mb-3">
            Things to keep in mind
          </h2>
          <ul className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft divide-y divide-tat-charcoal/8">
            <Reminder
              title="Upstash token drift"
              body="Rate limits silently fail-open if the Vercel-stored token is stale. Re-paste after every dashboard rotation."
            />
            <Reminder
              title="Anthropic spend ceiling"
              body="Set a monthly cap in Anthropic console. Aria + itinerary streaming + lead intent classifier all hit the same key."
            />
            <Reminder
              title="Vercel cron auth"
              body="Cron handlers should validate `Authorization: Bearer ${CRON_SECRET}` to block external invocation."
            />
            <Reminder
              title="Service-role key location"
              body="`SUPABASE_SERVICE_ROLE_KEY` lives only on server. Never NEXT_PUBLIC. Never imported into a 'use client' file."
            />
            <Reminder
              title="ADMIN_SECRET rotation"
              body="Rotate every 90 days. Update Vercel first → redeploy → only then update .env.local."
            />
            <Reminder
              title="Sanity webhooks"
              body="Set SANITY_REVALIDATE_SECRET + Sanity webhook to /api/revalidate to cut publish-to-live time from 10 min to instant."
            />
          </ul>
        </section>

      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const cls = {
    ok:        "bg-tat-teal text-white",
    degraded:  "bg-tat-gold text-white",
    down:      "bg-tat-orange text-white",
    unknown:   "bg-tat-slate/30 text-tat-charcoal",
  }[status];
  const label = status === "ok" ? "All systems go" : status === "degraded" ? "Degraded" : status === "down" ? "Service down" : "Unknown";
  return (
    <span className={`inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-xs font-semibold ${cls}`}>
      <Dot status={status} />
      {label}
    </span>
  );
}

function Dot({ status }: { status: Status }) {
  const cls = {
    ok:        "bg-tat-success-fg",
    degraded:  "bg-tat-gold",
    down:      "bg-tat-orange",
    unknown:   "bg-tat-slate/40",
  }[status];
  return <span className={`inline-block h-2 w-2 rounded-full ${cls}`} />;
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block h-2 w-3 rounded-sm ${swatch}`} />
      {label}
    </span>
  );
}

function DeepLink({ href, title, sub }: { href: string; title: string; sub: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft px-4 py-3 hover:shadow-soft-lg transition-shadow"
    >
      <p className="font-display text-sm text-tat-charcoal">{title}</p>
      <p className="text-[11px] text-tat-slate mt-0.5">{sub}</p>
    </Link>
  );
}

function Reminder({ title, body }: { title: string; body: string }) {
  return (
    <li className="px-4 py-2.5">
      <p className="text-sm font-semibold text-tat-charcoal">{title}</p>
      <p className="text-xs text-tat-charcoal/70 mt-0.5">{body}</p>
    </li>
  );
}
