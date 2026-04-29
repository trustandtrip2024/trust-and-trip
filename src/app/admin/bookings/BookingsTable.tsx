"use client";

import { useState } from "react";
import { Loader2, Phone, Mail, X, Check } from "lucide-react";

interface Booking {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  package_title: string | null;
  package_slug: string | null;
  package_price: number | null;
  deposit_amount: number | null;
  status: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  travel_date: string | null;
  num_travellers: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  refund_amount: number | null;
  refund_ref: string | null;
  lead_tier: string | null;
  utm_source: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  created:   "bg-tat-charcoal/5 text-tat-slate",
  pending:   "bg-tat-warning-bg text-tat-warning-fg",
  verified:  "bg-tat-success-bg text-tat-success-fg",
  cancelled: "bg-tat-warning-bg text-tat-warning-fg",
  refunded:  "bg-tat-danger-bg text-tat-danger-fg",
  completed: "bg-tat-info-bg text-tat-info-fg",
};

function fmtINR(n: number | null | undefined): string {
  if (n == null) return "—";
  return "₹" + n.toLocaleString("en-IN");
}

export default function BookingsTable({ bookings: initial }: { bookings: Booking[] }) {
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div>
      <div className="flex items-center gap-2 px-5 py-3 border-b border-tat-charcoal/8 flex-wrap">
        {["all", "verified", "created", "cancelled", "refunded"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-2.5 py-1 rounded-full border ${
              filter === s
                ? "bg-tat-charcoal text-tat-paper border-tat-charcoal"
                : "border-tat-charcoal/12 text-tat-slate hover:border-tat-charcoal/20"
            }`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs text-tat-slate">{filtered.length} rows</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-tat-paper text-left text-tag uppercase text-tat-slate">
            <tr>
              <th className="px-5 py-2.5">Customer</th>
              <th className="px-5 py-2.5">Package</th>
              <th className="px-5 py-2.5 text-right">Deposit</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5">Source</th>
              <th className="px-5 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((b) => (
              <Row key={b.id} b={b} onUpdate={(updated) => setRows((rs) => rs.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)))} />
            ))}
            {filtered.length === 0 && (
              <tr><td className="px-5 py-8 text-center text-tat-slate" colSpan={6}>No bookings.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  b,
  onUpdate,
}: {
  b: Booking;
  onUpdate: (b: Partial<Booking> & { id: string }) => void;
}) {
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState("");
  const [refundAmt, setRefundAmt] = useState<string>("");
  const [refundRef, setRefundRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: b.id,
          reason: reason || undefined,
          refundAmount: refundAmt ? Number(refundAmt.replace(/\D/g, "")) || undefined : undefined,
          refundRef: refundRef || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      onUpdate({
        id: b.id,
        status: data.booking?.status ?? "cancelled",
        cancelled_at: data.booking?.cancelled_at ?? new Date().toISOString(),
        cancel_reason: reason || null,
        refund_amount: refundAmt ? Number(refundAmt.replace(/\D/g, "")) : 0,
      });
      setShowCancel(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const isCancelled = b.status === "cancelled" || b.status === "refunded";

  return (
    <>
      <tr>
        <td className="px-5 py-3 align-top">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-tat-charcoal">{b.customer_name ?? "—"}</p>
            {b.lead_tier && (
              <span
                title={`Lead tier ${b.lead_tier}`}
                className={
                  "inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold " +
                  (b.lead_tier === "A"
                    ? "bg-tat-success-bg text-tat-success-fg ring-1 ring-tat-success-fg/30"
                    : b.lead_tier === "B"
                    ? "bg-tat-warning-bg text-tat-warning-fg"
                    : "bg-tat-charcoal/5 text-tat-slate")
                }
              >
                {b.lead_tier}
              </span>
            )}
          </div>
          {b.customer_phone && (
            <a href={`tel:${b.customer_phone}`} className="text-xs text-tat-slate flex items-center gap-1 mt-0.5">
              <Phone className="h-3 w-3" /> {b.customer_phone}
            </a>
          )}
          {b.customer_email && (
            <a href={`mailto:${b.customer_email}`} className="text-xs text-tat-slate/70 flex items-center gap-1 mt-0.5">
              <Mail className="h-3 w-3" /> {b.customer_email}
            </a>
          )}
        </td>
        <td className="px-5 py-3 align-top">
          <p className="text-tat-charcoal truncate max-w-[200px]">{b.package_title ?? b.package_slug ?? "—"}</p>
          {b.travel_date && <p className="text-[11px] text-tat-slate mt-0.5">{b.travel_date}</p>}
          {b.num_travellers && <p className="text-[11px] text-tat-slate">{b.num_travellers} pax</p>}
        </td>
        <td className="px-5 py-3 align-top text-right tabular-nums">
          <p className="text-tat-charcoal font-medium">{fmtINR(b.deposit_amount)}</p>
          <p className="text-[11px] text-tat-slate">of {fmtINR(b.package_price)}</p>
          {b.refund_amount && b.refund_amount > 0 && (
            <p className="text-[11px] text-tat-danger-fg">-{fmtINR(b.refund_amount)} refunded</p>
          )}
        </td>
        <td className="px-5 py-3 align-top">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.status ?? ""] ?? "bg-tat-charcoal/5 text-tat-slate"}`}>
            {b.status ?? "—"}
          </span>
          {b.cancel_reason && (
            <p className="text-[11px] text-tat-slate mt-1 max-w-[180px] truncate" title={b.cancel_reason}>
              {b.cancel_reason}
            </p>
          )}
        </td>
        <td className="px-5 py-3 align-top text-[11px] text-tat-slate">
          {b.utm_source ?? "—"}
        </td>
        <td className="px-5 py-3 align-top text-right">
          {!isCancelled ? (
            <button
              onClick={() => setShowCancel(true)}
              className="text-xs text-tat-danger-fg hover:text-tat-danger-fg hover:underline"
            >
              Cancel / refund
            </button>
          ) : (
            <span className="text-[11px] text-tat-slate inline-flex items-center gap-1">
              <Check className="h-3 w-3" /> done
            </span>
          )}
        </td>
      </tr>
      {showCancel && (
        <tr className="bg-tat-warning-bg/40">
          <td className="px-5 py-4" colSpan={6}>
            <div className="grid md:grid-cols-3 gap-3 max-w-3xl">
              <input
                placeholder="Cancellation reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-9 px-3 rounded border border-tat-warning-fg/25 bg-white text-sm outline-none"
              />
              <input
                placeholder="Refund ₹ (0 = forfeit deposit)"
                value={refundAmt}
                inputMode="numeric"
                onChange={(e) => setRefundAmt(e.target.value)}
                className="h-9 px-3 rounded border border-tat-warning-fg/25 bg-white text-sm outline-none"
              />
              <input
                placeholder="Razorpay refund_id (optional)"
                value={refundRef}
                onChange={(e) => setRefundRef(e.target.value)}
                className="h-9 px-3 rounded border border-tat-warning-fg/25 bg-white text-sm outline-none"
              />
            </div>
            {error && <p className="mt-2 text-meta text-tat-danger-fg">{error}</p>}
            <div className="mt-3 flex gap-2">
              <button
                onClick={cancel}
                disabled={busy}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-pill bg-tat-danger-fg text-white text-xs font-medium hover:bg-tat-danger-fg/90 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                Confirm cancel
              </button>
              <button
                onClick={() => setShowCancel(false)}
                className="text-xs text-tat-slate hover:text-tat-charcoal"
              >
                Close
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
