"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Wallet, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import type { PayoutSummary, Payout } from "./page";

const fmtINR = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_BADGE: Record<Payout["status"], string> = {
  pending: "bg-tat-warning-bg text-tat-warning-fg",
  processing: "bg-tat-info-bg text-tat-info-fg",
  paid: "bg-tat-success-bg text-tat-success-fg",
  failed: "bg-tat-danger-bg text-tat-danger-fg",
};

export default function PayoutsAdminClient({ initial }: { initial: PayoutSummary[] }) {
  const [rows, setRows] = useState<PayoutSummary[]>(initial);
  const [busyId, setBusyId] = useState("");
  const [released, setReleased] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const totalPayable = rows.reduce((s, r) => s + r.payable_paise, 0);
  const totalPending = rows.reduce((s, r) => s + r.pending_paise, 0);
  const eligibleCreators = rows.filter((r) => r.payable_paise > 0).length;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const releaseAll = async () => {
    if (!confirm("Release all pending earnings older than 14 days to payable?\n\nThis moves earnings into the next payout cycle.")) return;
    setBusyId("release");
    try {
      const res = await fetch("/api/admin/earnings/release", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed to release"); return; }
      setReleased(data.released ?? 0);
      // refresh
      window.location.reload();
    } finally {
      setBusyId("");
    }
  };

  const createPayout = async (r: PayoutSummary) => {
    if (!confirm(`Create a payout of ${fmtINR(r.payable_paise)} for ${r.full_name}?\n\nMethod: ${r.payout_method ?? "—"} ${r.payout_details_raw ?? ""}\n\nThis bundles all payable earnings into one payout. Mark it 'paid' once you've sent the money.`)) return;
    setBusyId(r.id);
    try {
      const res = await fetch(`/api/admin/creators/${r.id}/payouts`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed to create payout"); return; }
      window.location.reload();
    } finally {
      setBusyId("");
    }
  };

  const markPaid = async (r: PayoutSummary, p: Payout) => {
    const txnRef = prompt(`Enter the transaction reference / UTR for ${r.full_name}'s ${fmtINR(p.amount_paise)} payout.\n\nLeave blank if you don't have one yet.`);
    if (txnRef === null) return; // cancelled
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/admin/creators/${r.id}/payouts/${p.id}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txn_ref: txnRef.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed to mark paid"); return; }
      // Optimistic update
      setRows((prev) => prev.map((row) => {
        if (row.id !== r.id) return row;
        return {
          ...row,
          payable_paise: 0, // earnings now flipped to paid
          total_paid_paise: row.total_paid_paise + p.amount_paise,
          payouts: row.payouts.map((x) => x.id === p.id ? { ...x, status: "paid" as const, paid_at: data.paid_at, txn_ref: txnRef.trim() || null } : x),
        };
      }));
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="min-h-screen bg-tat-paper p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-tat-slate hover:text-tat-charcoal mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to admin
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="h-5 w-5 text-tat-success-fg" />
          <h1 className="text-2xl font-semibold text-tat-charcoal">Creator Payouts</h1>
        </div>
        <p className="text-sm text-tat-slate mb-6">{rows.length} creators · {eligibleCreators} ready to pay</p>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <Card label="Payable now" value={fmtINR(totalPayable)} tone="emerald" />
          <Card label="Still pending (in cool-off)" value={fmtINR(totalPending)} tone="amber" />
          <Card label="Creators eligible" value={String(eligibleCreators)} tone="slate" />
          <Card label="Total active" value={String(rows.length)} tone="slate" />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={releaseAll}
            disabled={busyId === "release"}
            className="inline-flex items-center gap-2 bg-white border border-tat-charcoal/12 text-tat-charcoal hover:border-tat-charcoal/20 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            {busyId === "release" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Release pending earnings (cool-off elapsed)
          </button>
          {released !== null && (
            <span className="text-xs text-tat-teal font-medium">{released} earning{released === 1 ? "" : "s"} released to payable</span>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-tat-charcoal/12 divide-y divide-gray-100 overflow-hidden">
          {rows.length === 0 && (
            <div className="p-10 text-center text-sm text-tat-slate">No active creators yet.</div>
          )}
          {rows.map((r) => {
            const open = expanded.has(r.id);
            return (
              <div key={r.id}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-tat-charcoal">{r.full_name}</p>
                        <span className="text-xs font-mono text-tat-slate">{r.ref_code}</span>
                      </div>
                      <p className="mt-1 text-xs text-tat-slate">{r.email}</p>
                      <p className="mt-1.5 text-[11px] text-tat-slate/70">
                        Payout: {r.payout_method ?? "—"} {r.payout_details_raw ?? ""}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                        <span className="px-2 py-1 rounded bg-tat-success-bg text-tat-success-fg font-semibold">
                          Payable: {fmtINR(r.payable_paise)}
                        </span>
                        {r.pending_paise > 0 && (
                          <span className="px-2 py-1 rounded bg-tat-warning-bg text-tat-warning-fg font-medium">
                            Pending: {fmtINR(r.pending_paise)}
                          </span>
                        )}
                        <span className="text-tat-slate">Lifetime paid: {fmtINR(r.total_paid_paise)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {r.payable_paise > 0 && (
                        <button
                          onClick={() => createPayout(r)}
                          disabled={busyId === r.id}
                          className="inline-flex items-center gap-1.5 bg-tat-teal hover:bg-tat-teal-deep text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                        >
                          {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wallet className="h-3.5 w-3.5" />}
                          Create payout
                        </button>
                      )}
                      {r.payouts.length > 0 && (
                        <button
                          onClick={() => toggleExpand(r.id)}
                          className="inline-flex items-center gap-1 text-xs text-tat-slate hover:text-tat-charcoal px-2 py-1.5"
                        >
                          History {r.payouts.length}
                          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {open && r.payouts.length > 0 && (
                  <div className="bg-tat-paper px-5 py-4 border-t border-tat-charcoal/8">
                    <p className="text-[10px] uppercase tracking-widest text-tat-slate font-semibold mb-2">Payout history</p>
                    <div className="space-y-2">
                      {r.payouts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-3 bg-white rounded-lg p-3 border border-tat-charcoal/8">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-tat-charcoal">{fmtINR(p.amount_paise)}</span>
                              <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold ${STATUS_BADGE[p.status]}`}>
                                {p.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-tat-slate mt-0.5">
                              Period: {fmtDate(p.period_start)} → {fmtDate(p.period_end)} · Created {fmtDate(p.created_at)}
                              {p.paid_at ? ` · Paid ${fmtDate(p.paid_at)}` : ""}
                            </p>
                            {p.txn_ref && <p className="text-[11px] text-tat-slate font-mono mt-0.5">UTR: {p.txn_ref}</p>}
                          </div>
                          {p.status === "processing" && (
                            <button
                              onClick={() => markPaid(r, p)}
                              disabled={busyId === p.id}
                              className="inline-flex items-center gap-1 bg-tat-charcoal hover:bg-tat-charcoal/90 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60 shrink-0"
                            >
                              {busyId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                              Mark paid
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: string; tone: "emerald" | "amber" | "slate" }) {
  const toneCls = tone === "emerald" ? "text-tat-success-fg" : tone === "amber" ? "text-tat-warning-fg" : "text-tat-charcoal";
  return (
    <div className="bg-white border border-tat-charcoal/12 rounded-xl p-4">
      <p className="text-[10px] uppercase tracking-widest text-tat-slate font-semibold">{label}</p>
      <p className={`text-xl font-semibold mt-1 ${toneCls}`}>{value}</p>
    </div>
  );
}
