"use client";

import { useEffect, useState } from "react";
import { Loader2, IndianRupee, Wallet, ArrowDownToLine, Clock, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

interface BookingMini {
  package_title?: string;
  customer_name?: string;
  num_travellers?: number;
  travel_date?: string | null;
}

interface Earning {
  id: string;
  gross_amount_paise: number;
  commission_pct: number;
  commission_amount_paise: number;
  status: "pending" | "payable" | "paid" | "reversed";
  created_at: string;
  bookings: BookingMini | null;
}

interface Payout {
  id: string;
  amount_paise: number;
  status: "pending" | "processing" | "paid" | "failed";
  paid_at: string | null;
  period_start: string | null;
  period_end: string | null;
  txn_ref: string | null;
  notes: string | null;
}

const STATUS_CFG: Record<Earning["status"], { label: string; cls: string; icon: typeof Clock }> = {
  pending:  { label: "Pending", cls: "text-amber-700 bg-amber-50 border-amber-100", icon: Clock },
  payable:  { label: "Payable", cls: "text-blue-700 bg-blue-50 border-blue-100", icon: ArrowDownToLine },
  paid:     { label: "Paid",    cls: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
  reversed: { label: "Reversed", cls: "text-ink/55 bg-ink/5 border-ink/10", icon: XCircle },
};

const fmtINR = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function CreatorEarningsPage() {
  const { user } = useUserStore();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const sess = await supabase.auth.getSession();
      const token = sess.data.session?.access_token;
      if (!token) { setLoading(false); return; }
      const res = await fetch("/api/creator/earnings", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setEarnings(d.earnings ?? []);
        setPayouts(d.payouts ?? []);
      }
      setLoading(false);
    })();
  }, [user]);

  const totals = earnings.reduce((acc, e) => {
    acc.gross += e.gross_amount_paise;
    acc.commission += e.commission_amount_paise;
    if (e.status === "pending" || e.status === "payable") acc.outstanding += e.commission_amount_paise;
    if (e.status === "paid") acc.paid += e.commission_amount_paise;
    return acc;
  }, { gross: 0, commission: 0, outstanding: 0, paid: 0 });

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-ink/30" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Creator dashboard</p>
        <h1 className="font-display text-2xl font-medium text-ink">Earnings & payouts</h1>
        <p className="text-sm text-ink/55 mt-1">Every commission, every payout. Settled monthly via your chosen method.</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card label="Gross trip value" value={fmtINR(totals.gross)} icon={IndianRupee} />
        <Card label="Total commission" value={fmtINR(totals.commission)} icon={Wallet} accent />
        <Card label="Outstanding" value={fmtINR(totals.outstanding)} icon={Clock} />
        <Card label="Paid" value={fmtINR(totals.paid)} icon={CheckCircle2} good />
      </div>

      {/* Earnings list */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-ink mb-3">Commission per booking</h2>
        {earnings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ink/8 p-8 text-center">
            <p className="text-sm text-ink/55">No bookings yet from your link. Once your audience books, commissions appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-ink/8 divide-y divide-ink/8 overflow-hidden">
            {earnings.map((e) => {
              const cfg = STATUS_CFG[e.status];
              const Icon = cfg.icon;
              return (
                <div key={e.id} className="p-4 md:p-5 flex items-center gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink line-clamp-1">
                      {e.bookings?.package_title ?? "Booking"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink/55 flex-wrap">
                      <span>Trip total: {fmtINR(e.gross_amount_paise)}</span>
                      <span className="text-ink/25">·</span>
                      <span>{e.commission_pct}% commission</span>
                      <span className="text-ink/25">·</span>
                      <span>{new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-base font-medium text-ink">{fmtINR(e.commission_amount_paise)}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border mt-1 ${cfg.cls}`}>
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Payouts */}
      <section>
        <h2 className="text-sm font-semibold text-ink mb-3">Payout history</h2>
        {payouts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ink/8 p-8 text-center">
            <p className="text-sm text-ink/55">No payouts yet. We settle monthly once you have payable commissions.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-ink/8 divide-y divide-ink/8 overflow-hidden">
            {payouts.map((p) => (
              <div key={p.id} className="p-4 flex items-center gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{fmtINR(p.amount_paise)}</p>
                  <p className="text-[11px] text-ink/55 mt-0.5">
                    {p.period_start && p.period_end
                      ? `${new Date(p.period_start).toLocaleDateString("en-IN")} – ${new Date(p.period_end).toLocaleDateString("en-IN")}`
                      : "Custom period"}
                    {p.txn_ref && <span className="ml-2 font-mono text-ink/35">· {p.txn_ref}</span>}
                  </p>
                </div>
                <span className={`inline-flex items-center text-[10px] font-medium px-2.5 py-1 rounded-full border ${
                  p.status === "paid" ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                  : p.status === "failed" ? "text-red-700 bg-red-50 border-red-100"
                  : "text-amber-700 bg-amber-50 border-amber-100"
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Card({ label, value, icon: Icon, accent, good }: {
  label: string; value: string; icon: typeof Clock; accent?: boolean; good?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "bg-gold/10 border-gold/25" : good ? "bg-emerald-50/60 border-emerald-100" : "bg-white border-ink/8"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${accent ? "text-gold" : good ? "text-emerald-600" : "text-ink/45"}`} />
        <p className="text-[10px] uppercase tracking-widest text-ink/55">{label}</p>
      </div>
      <p className="font-display text-xl md:text-2xl font-medium text-ink">{value}</p>
    </div>
  );
}
