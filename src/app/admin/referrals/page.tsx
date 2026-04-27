export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { Gift, TrendingUp, Users, IndianRupee, ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getReferrals() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export default async function ReferralsPage() {
  const referrals = await getReferrals();

  const totalClicks = referrals.reduce((s, r) => s + r.clicks, 0);
  const totalConversions = referrals.reduce((s, r) => s + r.conversions, 0);
  const totalRewards = referrals.filter((r) => r.status === "redeemed").reduce((s, r) => s + r.reward_amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-1.5 text-sm text-tat-slate hover:text-tat-charcoal transition-colors">
            <ArrowLeft className="h-4 w-4" /> Admin
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-semibold text-tat-charcoal flex items-center gap-2">
            <Gift className="h-5 w-5 text-tat-gold" /> Referrals
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Referrers", value: referrals.length, icon: Users, color: "text-blue-500" },
            { label: "Total Clicks", value: totalClicks, icon: TrendingUp, color: "text-purple-500" },
            { label: "Conversions", value: totalConversions, icon: Gift, color: "text-green-500" },
            { label: "Rewards Paid", value: `₹${totalRewards.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-tat-gold" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-tat-slate">{label}</p>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-2xl font-semibold text-tat-charcoal">{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-tat-charcoal">{referrals.length} referrers</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Name", "Email", "Phone", "Code", "Clicks", "Conversions", "Status", "Joined"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-tat-slate uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">No referrals yet.</td>
                  </tr>
                ) : (
                  referrals.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-tat-charcoal whitespace-nowrap">{r.referrer_name}</td>
                      <td className="px-4 py-3 text-tat-slate max-w-[180px] truncate">{r.referrer_email}</td>
                      <td className="px-4 py-3 text-tat-slate whitespace-nowrap">{r.referrer_phone ?? "—"}</td>
                      <td className="px-4 py-3">
                        <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-tat-charcoal">{r.code}</code>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-tat-charcoal">{r.clicks}</td>
                      <td className="px-4 py-3 text-center font-semibold text-green-600">{r.conversions}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          r.status === "active" ? "bg-green-100 text-green-700" :
                          r.status === "redeemed" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-tat-slate"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                        {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
