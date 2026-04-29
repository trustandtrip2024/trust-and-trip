import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LeadRow {
  id: string;
  created_at: string;
  status: string | null;
  tier: "A" | "B" | "C" | null;
  assigned_planner: string | null;
  assigned_at: string | null;
  first_responded_at: string | null;
  email: string | null;
  phone: string | null;
}
interface BookingRow {
  status: string | null;
  deposit_amount: number | null;
  customer_email: string | null;
  customer_phone: string | null;
  lead_id: string | null;
}

function admin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function pct(n: number, d: number): string {
  if (!d) return "—";
  return ((n / d) * 100).toFixed(1) + "%";
}

function fmtINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

interface PlannerStats {
  planner: string;
  leads: number;
  tierA: number;
  contacted: number;
  qualified: number;
  bookedLeads: number;
  bookedValue: number;
  avgTimeToContactMs: number | null;
  avgTimeToContactSamples: number;
}

export default async function PlannersPage({
  searchParams,
}: {
  searchParams?: { window?: string };
}) {
  const sb = admin();
  if (!sb) return <main className="p-8">Supabase not configured.</main>;

  const days = Number(searchParams?.window) || 30;
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

  const [leadsRes, bookingsRes] = await Promise.all([
    sb
      .from("leads")
      .select("id, created_at, status, tier, assigned_planner, assigned_at, first_responded_at, email, phone")
      .gte("created_at", since)
      .not("assigned_planner", "is", null)
      .order("created_at", { ascending: false })
      .limit(5000),
    sb
      .from("bookings")
      .select("status, deposit_amount, customer_email, customer_phone, lead_id")
      .eq("status", "verified")
      .gte("created_at", since)
      .limit(5000),
  ]);

  if (leadsRes.error) return <main className="p-8 text-tat-danger-fg">Leads error: {leadsRes.error.message}</main>;
  if (bookingsRes.error) return <main className="p-8 text-tat-danger-fg">Bookings error: {bookingsRes.error.message}</main>;

  const leads = (leadsRes.data ?? []) as LeadRow[];
  const bookings = (bookingsRes.data ?? []) as BookingRow[];

  // Map: lead_id → booking deposit (only verified)
  const bookingByLead = new Map<string, number>();
  for (const b of bookings) {
    if (b.lead_id) bookingByLead.set(b.lead_id, (bookingByLead.get(b.lead_id) ?? 0) + (b.deposit_amount ?? 0));
  }

  // Aggregate per planner.
  const map = new Map<string, PlannerStats>();
  for (const l of leads) {
    if (!l.assigned_planner) continue;
    const e = map.get(l.assigned_planner) ?? {
      planner: l.assigned_planner,
      leads: 0,
      tierA: 0,
      contacted: 0,
      qualified: 0,
      bookedLeads: 0,
      bookedValue: 0,
      avgTimeToContactMs: null,
      avgTimeToContactSamples: 0,
    };
    e.leads++;
    if (l.tier === "A") e.tierA++;
    if (l.status === "contacted" || l.status === "qualified" || l.status === "booked") e.contacted++;
    if (l.status === "qualified" || l.status === "booked") e.qualified++;

    const dep = bookingByLead.get(l.id) ?? 0;
    if (dep > 0) {
      e.bookedLeads++;
      e.bookedValue += dep;
    }

    if (l.assigned_at && l.first_responded_at) {
      const dt = new Date(l.first_responded_at).getTime() - new Date(l.assigned_at).getTime();
      if (dt >= 0) {
        const prevSum = (e.avgTimeToContactMs ?? 0) * e.avgTimeToContactSamples;
        e.avgTimeToContactSamples++;
        e.avgTimeToContactMs = (prevSum + dt) / e.avgTimeToContactSamples;
      }
    }

    map.set(l.assigned_planner, e);
  }

  const rows = Array.from(map.values()).sort(
    (a, b) => b.bookedValue - a.bookedValue || b.leads - a.leads
  );

  function fmtDuration(ms: number | null): string {
    if (ms == null) return "—";
    if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600_000) return `${Math.round(ms / 60_000)}m`;
    return `${(ms / 3600_000).toFixed(1)}h`;
  }

  // Unassigned (action-needed) count.
  const { count: unassignedCount } = await sb
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since)
    .is("assigned_planner", null)
    .eq("status", "new");

  return (
    <main className="container-custom py-10 max-w-6xl">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[12px] tracking-[0.15em] uppercase font-semibold text-tat-gold">
            Admin · Planners
          </p>
          <h1 className="mt-2 font-display text-display-md text-tat-charcoal">
            Per-planner performance · {days}d
          </h1>
          <p className="mt-1 text-meta text-tat-slate max-w-3xl">
            Leads handled, conversion to verified booking, deposit value brought in, avg
            time-to-first-contact (between assigned_at and first_responded_at).
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

      {/* Action banner */}
      {unassignedCount && unassignedCount > 0 && (
        <div className="mt-6 rounded-card border border-tat-warning-fg/30 bg-tat-warning-bg p-4">
          <p className="text-tat-charcoal">
            <strong>{unassignedCount}</strong> new leads in this window have <em>no planner assigned</em>.
            Open <a href="/admin/leads" className="underline hover:text-tat-orange">/admin/leads</a> to
            assign them.
          </p>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="mt-12 text-tat-slate">
          No leads have been assigned to planners yet in this window.
        </p>
      ) : (
        <section className="mt-8 overflow-x-auto rounded-card border border-tat-charcoal/10">
          <table className="w-full text-[13px]">
            <thead className="bg-tat-cream-warm/30 text-left text-tag uppercase text-tat-slate">
              <tr>
                <th className="px-3 py-2.5">Planner</th>
                <th className="px-3 py-2.5 text-right">Leads</th>
                <th className="px-3 py-2.5 text-right">Tier A</th>
                <th className="px-3 py-2.5 text-right">Contacted</th>
                <th className="px-3 py-2.5 text-right">Qualified</th>
                <th className="px-3 py-2.5 text-right">Booked</th>
                <th className="px-3 py-2.5 text-right">Booked %</th>
                <th className="px-3 py-2.5 text-right">Deposit value</th>
                <th className="px-3 py-2.5 text-right">Avg time-to-contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tat-charcoal/8">
              {rows.map((r) => (
                <tr key={r.planner}>
                  <td className="px-3 py-2.5 font-medium text-tat-charcoal">{r.planner}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{r.leads}</td>
                  <td className="px-3 py-2.5 text-right text-tat-success-fg tabular-nums">{r.tierA}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{r.contacted}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{r.qualified}</td>
                  <td className="px-3 py-2.5 text-right text-violet-700 tabular-nums">{r.bookedLeads}</td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{pct(r.bookedLeads, r.leads)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmtINR(r.bookedValue)}</td>
                  <td className="px-3 py-2.5 text-right text-tat-slate tabular-nums">
                    {fmtDuration(r.avgTimeToContactMs)}
                    {r.avgTimeToContactSamples > 0 && (
                      <span className="text-[10px] text-tat-slate/60 ml-1">
                        n={r.avgTimeToContactSamples}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
