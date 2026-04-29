export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import LeadsTable from "./LeadsTable";

async function getLeads() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from("leads")
    .select("*, assigned_planner")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function LeadsPage() {
  const leads = await getLeads();

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    booked: leads.filter((l) => l.status === "booked").length,
    todayCount: leads.filter((l) => {
      const d = new Date(l.created_at);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length,
    tierA: leads.filter((l) => l.tier === "A").length,
  };

  return (
    <div className="min-h-screen bg-tat-paper">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-tat-charcoal">Leads Dashboard</h1>
          <p className="text-tat-slate text-sm mt-1">Trust and Trip — Enquiries CRM</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <StatCard label="Total Leads" value={stats.total} color="blue" />
          <StatCard label="🔥 Tier A" value={stats.tierA} color="emerald" />
          <StatCard label="New" value={stats.new} color="yellow" />
          <StatCard label="Contacted" value={stats.contacted} color="purple" />
          <StatCard label="Booked" value={stats.booked} color="green" />
          <StatCard label="Today" value={stats.todayCount} color="indigo" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-tat-charcoal/12 overflow-hidden">
          <LeadsTable leads={leads} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-tat-info-bg text-tat-info-fg border-tat-info-fg/15",
    yellow: "bg-tat-warning-bg text-tat-warning-fg border-tat-warning-fg/15",
    purple: "bg-tat-cream-warm/40 text-tat-charcoal border-tat-cream-warm",
    green: "bg-tat-success-bg text-tat-success-fg border-tat-success-fg/15",
    indigo: "bg-tat-gold/10 text-tat-charcoal border-tat-gold/20",
    emerald: "bg-tat-success-bg text-tat-success-fg border-tat-success-fg/25",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-3xl font-semibold mt-1">{value}</p>
    </div>
  );
}
