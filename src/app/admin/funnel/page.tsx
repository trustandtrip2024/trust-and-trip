import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LeadRow {
  id: string;
  created_at: string;
  source: string | null;
  tier: "A" | "B" | "C" | null;
  email: string | null;
  phone: string | null;
  utm_source: string | null;
}

interface BookingRow {
  id: string;
  created_at: string;
  customer_email: string | null;
  customer_phone: string | null;
  package_price: number | null;
  deposit_amount: number | null;
  status: string | null;
  lead_id: string | null;
  lead_tier: string | null;
  utm_source: string | null;
  cancelled_at: string | null;
  refund_amount: number | null;
}

function admin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function pct(n: number, d: number): string {
  if (!d) return "—";
  return ((n / d) * 100).toFixed(1) + "%";
}

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export default async function FunnelPage({
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
      .select("id, created_at, source, tier, email, phone, utm_source")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000),
    sb
      .from("bookings")
      .select("id, created_at, customer_email, customer_phone, package_price, deposit_amount, status, lead_id, lead_tier, utm_source, cancelled_at, refund_amount")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000),
  ]);

  if (leadsRes.error) return <main className="p-8 text-tat-danger-fg">Leads error: {leadsRes.error.message}</main>;
  if (bookingsRes.error) return <main className="p-8 text-tat-danger-fg">Bookings error: {bookingsRes.error.message}</main>;

  const leads = (leadsRes.data ?? []) as LeadRow[];
  const bookings = (bookingsRes.data ?? []) as BookingRow[];

  // ── Funnel stages ───────────────────────────────────────────────────────
  const totalLeads = leads.length;
  const tierA = leads.filter((l) => l.tier === "A").length;
  const tierB = leads.filter((l) => l.tier === "B").length;
  const tierC = leads.filter((l) => l.tier === "C").length;

  const verified = bookings.filter((b) => b.status === "verified");
  const created  = bookings.filter((b) => b.status === "created");
  const cancelled = bookings.filter((b) => b.status === "cancelled" || b.status === "refunded");
  const totalBookings = verified.length;
  const pendingBookings = created.length;
  const netBookings = totalBookings;        // verified excludes cancelled by status filter
  const cancelRate = (totalBookings + cancelled.length) > 0
    ? cancelled.length / (totalBookings + cancelled.length)
    : 0;
  const totalRefunded = cancelled.reduce((s, b) => s + (b.refund_amount ?? 0), 0);

  // Lead → booking conversion: prefer exact lead_id join (post-migration 017),
  // fall back to email/phone match for bookings created before the column existed.
  const leadIds = new Set(leads.map((l) => l.id));
  const leadEmails = new Set(leads.map((l) => l.email?.trim().toLowerCase()).filter(Boolean) as string[]);
  const leadPhones = new Set(
    leads
      .map((l) => (l.phone ?? "").replace(/\D/g, "").replace(/^91/, ""))
      .filter((p) => p.length >= 10)
  );

  const leadToBooking = bookings.filter((b) => {
    if (b.lead_id && leadIds.has(b.lead_id)) return true;
    const e = b.customer_email?.trim().toLowerCase();
    const p = (b.customer_phone ?? "").replace(/\D/g, "").replace(/^91/, "");
    return (e && leadEmails.has(e)) || (p && leadPhones.has(p));
  });
  const leadConversionN = leadToBooking.filter((b) => b.status === "verified").length;

  const grossDeposit = verified.reduce((s, b) => s + (b.deposit_amount ?? 0), 0);
  const grossPackage = verified.reduce((s, b) => s + (b.package_price ?? 0), 0);
  const aov = verified.length ? Math.round(grossPackage / verified.length) : 0;

  // ── By UTM source funnel ────────────────────────────────────────────────
  type SrcRow = { src: string; leads: number; tierA: number; verified: number };
  const bySource = new Map<string, SrcRow>();
  for (const l of leads) {
    const src = l.utm_source ?? "direct/organic";
    const e = bySource.get(src) ?? { src, leads: 0, tierA: 0, verified: 0 };
    e.leads++;
    if (l.tier === "A") e.tierA++;
    bySource.set(src, e);
  }
  // Match bookings back to source: prefer the booking's own utm_source
  // (populated at create-order time from the matched lead), fall back to
  // best-effort email/phone match for legacy bookings.
  for (const b of verified) {
    let src: string | null = b.utm_source ?? null;
    if (!src && b.lead_id) {
      const lead = leads.find((l) => l.id === b.lead_id);
      src = lead?.utm_source ?? null;
    }
    if (!src) {
      const e = b.customer_email?.trim().toLowerCase();
      const p = (b.customer_phone ?? "").replace(/\D/g, "").replace(/^91/, "");
      const matched = leads.find((l) => {
        const le = l.email?.trim().toLowerCase();
        const lp = (l.phone ?? "").replace(/\D/g, "").replace(/^91/, "");
        return (e && le === e) || (p && lp === p);
      });
      src = matched?.utm_source ?? null;
    }
    const key = src ?? "direct/organic";
    const row = bySource.get(key);
    if (row) row.verified++;
  }
  const sourceRows = Array.from(bySource.values()).sort((a, b) => b.leads - a.leads);

  return (
    <main className="container-custom py-10 max-w-7xl">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[12px] tracking-[0.15em] uppercase font-semibold text-tat-gold">
            Admin · Funnel
          </p>
          <h1 className="mt-2 font-display text-display-md text-tat-charcoal">
            Lead → Booking funnel · {days}d
          </h1>
          <p className="mt-1 text-meta text-tat-slate max-w-3xl">
            Best-effort match by email / phone. Bookings table doesn&rsquo;t store lead_id, so we resolve
            via contact match — assumes user used the same phone or email both places.
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

      {/* Funnel stages */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-3">
        <Stage label="Leads"      value={totalLeads}       sub="all sources" />
        <Stage label="Tier A"     value={tierA}            sub={pct(tierA, totalLeads)} accent="emerald" />
        <Stage label="Bookings created" value={pendingBookings} sub="awaiting payment" accent="amber" />
        <Stage label="Bookings verified" value={totalBookings}  sub="paid 30%" accent="green" />
        <Stage label="Lead → Booking" value={leadConversionN}    sub={pct(leadConversionN, totalLeads)} accent="violet" />
      </section>

      {/* Revenue */}
      <section className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stage label="Gross deposit collected" value={formatINR(grossDeposit)} sub={`${verified.length} bookings`} large />
        <Stage label="Gross package value"     value={formatINR(grossPackage)} sub="full quoted price"            large />
        <Stage label="Avg order value"         value={formatINR(aov)}          sub="per booking"                  large />
      </section>

      {/* Cancellations */}
      <section className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <Stage label="Cancelled / refunded" value={cancelled.length} sub={pct(cancelled.length, totalBookings + cancelled.length)} accent="amber" />
        <Stage label="Cancel rate" value={(cancelRate * 100).toFixed(1) + "%"} sub="of all paid bookings" />
        <Stage label="Total refunded" value={formatINR(totalRefunded)} sub="₹ refunded" />
        <Stage label="Net bookings" value={netBookings} sub="paid & not cancelled" accent="green" />
      </section>

      {/* By UTM source */}
      <section className="mt-10">
        <h2 className="font-display text-h3 text-tat-charcoal">Funnel by UTM source</h2>
        <div className="mt-4 overflow-x-auto rounded-card border border-tat-charcoal/10">
          <table className="w-full text-[13px]">
            <thead className="bg-tat-cream-warm/30 text-left text-tag uppercase text-tat-slate">
              <tr>
                <th className="px-3 py-2.5">Source</th>
                <th className="px-3 py-2.5 text-right">Leads</th>
                <th className="px-3 py-2.5 text-right">Tier A</th>
                <th className="px-3 py-2.5 text-right">Tier A%</th>
                <th className="px-3 py-2.5 text-right">Verified bookings</th>
                <th className="px-3 py-2.5 text-right">Lead→Book%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tat-charcoal/8">
              {sourceRows.map((r) => (
                <tr key={r.src}>
                  <td className="px-3 py-2 truncate max-w-[280px] text-tat-charcoal">{r.src}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.leads}</td>
                  <td className="px-3 py-2 text-right text-tat-success-fg tabular-nums">{r.tierA}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{pct(r.tierA, r.leads)}</td>
                  <td className="px-3 py-2 text-right text-violet-700 tabular-nums">{r.verified}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{pct(r.verified, r.leads)}</td>
                </tr>
              ))}
              {sourceRows.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-tat-slate" colSpan={6}>
                    No leads in this window yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tier breakdown */}
      <section className="mt-10">
        <h2 className="font-display text-h3 text-tat-charcoal">Lead tier breakdown</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <TierCard label="A · hot"  count={tierA} total={totalLeads} accent="emerald" />
          <TierCard label="B · warm" count={tierB} total={totalLeads} accent="amber" />
          <TierCard label="C · cold" count={tierC} total={totalLeads} accent="slate" />
        </div>
      </section>
    </main>
  );
}

function Stage({
  label,
  value,
  sub,
  accent,
  large,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: "emerald" | "amber" | "green" | "violet";
  large?: boolean;
}) {
  const tones: Record<string, string> = {
    emerald: "text-tat-success-fg",
    amber: "text-tat-warning-fg",
    green: "text-tat-success-fg",
    violet: "text-violet-700",
  };
  return (
    <div className="rounded-card border border-tat-charcoal/10 bg-white px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.12em] text-tat-slate">{label}</p>
      <p
        className={`mt-1 font-display ${large ? "text-h2" : "text-h3"} leading-none ${
          accent ? tones[accent] : "text-tat-charcoal"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-meta text-tat-slate">{sub}</p>}
    </div>
  );
}

function TierCard({
  label,
  count,
  total,
  accent,
}: {
  label: string;
  count: number;
  total: number;
  accent: "emerald" | "amber" | "slate";
}) {
  const palette: Record<string, { bg: string; text: string }> = {
    emerald: { bg: "bg-tat-success-bg border-tat-success-fg/25", text: "text-tat-success-fg" },
    amber:   { bg: "bg-tat-warning-bg border-tat-warning-fg/25",     text: "text-tat-warning-fg" },
    slate:   { bg: "bg-tat-paper border-tat-charcoal/12",     text: "text-tat-slate" },
  };
  return (
    <div className={`rounded-card border px-4 py-4 ${palette[accent].bg}`}>
      <p className={`text-[11px] uppercase tracking-[0.12em] ${palette[accent].text}`}>{label}</p>
      <p className={`mt-1 font-display text-h2 leading-none ${palette[accent].text}`}>{count}</p>
      <p className="mt-1 text-meta text-tat-charcoal/70">{pct(count, total)} of leads</p>
    </div>
  );
}
