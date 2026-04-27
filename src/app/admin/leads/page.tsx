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
    <div className="min-h-screen bg-gray-50">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <LeadsTable leads={leads} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    green: "bg-green-50 text-green-700 border-green-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-3xl font-semibold mt-1">{value}</p>
    </div>
  );
}
