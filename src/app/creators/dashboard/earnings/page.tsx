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
  pending:  { label: "Pending", cls: "text-tat-warning-fg bg-tat-warning-bg border-tat-warning-fg/15", icon: Clock },
  payable:  { label: "Payable", cls: "text-tat-info-fg bg-tat-info-bg border-tat-info-fg/15", icon: ArrowDownToLine },
  paid:     { label: "Paid",    cls: "text-tat-success-fg bg-tat-success-bg border-tat-success-fg/15", icon: CheckCircle2 },
  reversed: { label: "Reversed", cls: "text-tat-charcoal/55 bg-tat-charcoal/5 border-tat-charcoal/10", icon: XCircle },
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
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-tat-charcoal/30" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-tat-charcoal/40 mb-1">Creator dashboard</p>
        <h1 className="font-display text-2xl font-medium text-tat-charcoal">Earnings & payouts</h1>
        <p className="text-sm text-tat-charcoal/55 mt-1">Every commission, every payout. Settled monthly via your chosen method.</p>
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
        <h2 className="text-sm font-semibold text-tat-charcoal mb-3">Commission per booking</h2>
        {earnings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-8 text-center">
            <p className="text-sm text-tat-charcoal/55">No bookings yet from your link. Once your audience books, commissions appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-tat-charcoal/8 divide-y divide-tat-charcoal/8 overflow-hidden">
            {earnings.map((e) => {
              const cfg = STATUS_CFG[e.status];
              const Icon = cfg.icon;
              return (
                <div key={e.id} className="p-4 md:p-5 flex items-center gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-tat-charcoal line-clamp-1">
                      {e.bookings?.package_title ?? "Booking"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-tat-charcoal/55 flex-wrap">
                      <span>Trip total: {fmtINR(e.gross_amount_paise)}</span>
                      <span className="text-tat-charcoal/25">·</span>
                      <span>{e.commission_pct}% commission</span>
                      <span className="text-tat-charcoal/25">·</span>
                      <span>{new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-base font-medium text-tat-charcoal">{fmtINR(e.commission_amount_paise)}</p>
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
        <h2 className="text-sm font-semibold text-tat-charcoal mb-3">Payout history</h2>
        {payouts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-8 text-center">
            <p className="text-sm text-tat-charcoal/55">No payouts yet. We settle monthly once you have payable commissions.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-tat-charcoal/8 divide-y divide-tat-charcoal/8 overflow-hidden">
            {payouts.map((p) => (
              <div key={p.id} className="p-4 flex items-center gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-tat-charcoal">{fmtINR(p.amount_paise)}</p>
                  <p className="text-[11px] text-tat-charcoal/55 mt-0.5">
                    {p.period_start && p.period_end
                      ? `${new Date(p.period_start).toLocaleDateString("en-IN")} – ${new Date(p.period_end).toLocaleDateString("en-IN")}`
                      : "Custom period"}
                    {p.txn_ref && <span className="ml-2 font-mono text-tat-charcoal/35">· {p.txn_ref}</span>}
                  </p>
                </div>
                <span className={`inline-flex items-center text-[10px] font-medium px-2.5 py-1 rounded-full border ${
                  p.status === "paid" ? "text-tat-success-fg bg-tat-success-bg border-tat-success-fg/15"
                  : p.status === "failed" ? "text-tat-danger-fg bg-tat-danger-bg border-tat-danger-fg/15"
                  : "text-tat-warning-fg bg-tat-warning-bg border-tat-warning-fg/15"
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
    <div className={`rounded-2xl border p-4 ${accent ? "bg-tat-gold/10 border-tat-gold/25" : good ? "bg-tat-success-bg/60 border-tat-success-fg/15" : "bg-white border-tat-charcoal/8"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${accent ? "text-tat-gold" : good ? "text-tat-teal" : "text-tat-charcoal/45"}`} />
        <p className="text-[10px] uppercase tracking-widest text-tat-charcoal/55">{label}</p>
      </div>
      <p className="font-display text-xl md:text-2xl font-medium text-tat-charcoal">{value}</p>
    </div>
  );
}
