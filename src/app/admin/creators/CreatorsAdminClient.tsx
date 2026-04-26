"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Copy, Check, ExternalLink, Sparkles, ShieldCheck, Save } from "lucide-react";

interface Creator {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  instagram_handle: string | null;
  audience_size: number | null;
  audience_size_verified: number | null;
  audience_verified_at: string | null;
  audience_source: string | null;
  ref_code: string;
  commission_pct: number;
  status: "pending" | "active" | "paused" | "rejected" | "banned";
  user_id: string | null;
  payout_method: string | null;
  payout_details: { raw?: string } | null;
  notes: string | null;
  total_earned_paise: number;
  total_paid_paise: number;
  created_at: string;
}

const STATUS_CFG: Record<Creator["status"], string> = {
  pending:  "bg-amber-100 text-amber-800",
  active:   "bg-emerald-100 text-emerald-800",
  paused:   "bg-slate-100 text-slate-700",
  rejected: "bg-red-100 text-red-700",
  banned:   "bg-red-200 text-red-800",
};

export default function CreatorsAdminClient({ initialCreators }: { initialCreators: Creator[] }) {
  const [creators, setCreators] = useState<Creator[]>(initialCreators);
  const [filter, setFilter] = useState<"" | Creator["status"]>("");
  const [busyId, setBusyId] = useState<string>("");
  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string>("");
  const [editingAudience, setEditingAudience] = useState<string>("");
  const [audienceDraft, setAudienceDraft] = useState<string>("");
  const [savingAudience, setSavingAudience] = useState<string>("");

  const visible = filter ? creators.filter((c) => c.status === filter) : creators;

  const approve = async (c: Creator) => {
    if (!confirm(`Approve ${c.full_name} (@${c.instagram_handle})?\n\nThis creates a creator login and activates their referral link.`)) return;
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/admin/creators/${c.id}/approve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed to approve"); return; }
      setCreators((prev) => prev.map((x) => x.id === c.id ? { ...x, status: "active", user_id: data.user_id } : x));
      if (data.temp_password) {
        setTempPasswords((prev) => ({ ...prev, [c.id]: data.temp_password }));
      }
    } finally {
      setBusyId("");
    }
  };

  const reject = async (c: Creator) => {
    if (!confirm(`Reject ${c.full_name}?`)) return;
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/admin/creators/${c.id}/reject`, { method: "POST" });
      if (res.ok) {
        setCreators((prev) => prev.map((x) => x.id === c.id ? { ...x, status: "rejected" } : x));
      }
    } finally {
      setBusyId("");
    }
  };

  const copyText = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const startEditAudience = (c: Creator) => {
    setEditingAudience(c.id);
    setAudienceDraft(c.audience_size_verified ? String(c.audience_size_verified) : "");
  };

  const saveAudience = async (c: Creator) => {
    const n = audienceDraft.trim() === "" ? 0 : Number(audienceDraft.replace(/,/g, ""));
    if (!Number.isFinite(n) || n < 0) { alert("Enter a non-negative number, or 0 to clear."); return; }
    setSavingAudience(c.id);
    try {
      const res = await fetch(`/api/admin/creators/${c.id}/verify-audience`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: n }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Failed to save"); return; }
      setCreators((prev) => prev.map((x) => x.id === c.id ? {
        ...x,
        audience_size_verified: n === 0 ? null : n,
        audience_verified_at: n === 0 ? null : new Date().toISOString(),
        audience_source: n === 0 ? null : "manual",
      } : x));
      setEditingAudience("");
    } finally {
      setSavingAudience("");
    }
  };

  const counts = {
    all: creators.length,
    pending: creators.filter((c) => c.status === "pending").length,
    active: creators.filter((c) => c.status === "active").length,
    rejected: creators.filter((c) => c.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-tat-slate hover:text-tat-charcoal mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to admin
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h1 className="text-2xl font-bold text-tat-charcoal">Creator Program</h1>
        </div>
        <p className="text-sm text-tat-slate mb-6">{counts.all} total · {counts.pending} pending · {counts.active} active</p>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            { k: "", label: "All", count: counts.all },
            { k: "pending", label: "Pending", count: counts.pending },
            { k: "active", label: "Active", count: counts.active },
            { k: "rejected", label: "Rejected", count: counts.rejected },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setFilter(t.k as "" | Creator["status"])}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                filter === t.k ? "bg-gray-900 text-white border-gray-900" : "bg-white text-tat-slate border-gray-200 hover:border-gray-300"
              }`}
            >
              {t.label} <span className="text-xs opacity-60">({t.count})</span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {visible.length === 0 && (
            <div className="p-10 text-center text-sm text-tat-slate">No creators in this view.</div>
          )}
          {visible.map((c) => {
            const tempPw = tempPasswords[c.id];
            return (
              <div key={c.id} className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold text-tat-charcoal">{c.full_name}</p>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${STATUS_CFG[c.status]}`}>
                        {c.status}
                      </span>
                      <span className="text-xs font-mono text-tat-slate">{c.ref_code}</span>
                      <span className="text-xs text-gray-400">{c.commission_pct}%</span>
                    </div>
                    <div className="mt-1 text-xs text-tat-slate flex items-center gap-3 flex-wrap">
                      <span>{c.email}</span>
                      <span>·</span>
                      <span>{c.phone}</span>
                      {c.instagram_handle && (
                        <>
                          <span>·</span>
                          <a
                            href={`https://instagram.com/${c.instagram_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline inline-flex items-center gap-1"
                          >
                            @{c.instagram_handle}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </>
                      )}
                      {c.audience_size && (
                        <>
                          <span>·</span>
                          <span>{c.audience_size.toLocaleString("en-IN")}+ self-reported</span>
                        </>
                      )}
                      {c.audience_size_verified !== null && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <ShieldCheck className="h-3 w-3" />
                            {c.audience_size_verified.toLocaleString("en-IN")} verified
                          </span>
                        </>
                      )}
                    </div>

                    {/* Audience verification editor */}
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      {editingAudience === c.id ? (
                        <>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={audienceDraft}
                            onChange={(e) => setAudienceDraft(e.target.value)}
                            placeholder="e.g. 24500 (or 0 to clear)"
                            className="w-44 px-2 py-1 border border-gray-200 rounded text-xs"
                            autoFocus
                          />
                          <button
                            onClick={() => saveAudience(c)}
                            disabled={savingAudience === c.id}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[11px] font-semibold disabled:opacity-60"
                          >
                            {savingAudience === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            Save
                          </button>
                          <button
                            onClick={() => setEditingAudience("")}
                            className="text-tat-slate hover:text-tat-charcoal px-2 py-1 text-[11px]"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEditAudience(c)}
                          className="inline-flex items-center gap-1 text-tat-slate hover:text-tat-charcoal underline decoration-dotted underline-offset-2"
                        >
                          <ShieldCheck className="h-3 w-3" />
                          {c.audience_size_verified === null ? "Verify audience size" : "Update verified"}
                        </button>
                      )}
                    </div>
                    {c.notes && (
                      <p className="mt-2 text-xs text-tat-slate whitespace-pre-line bg-gray-50 rounded-lg p-2.5 max-w-2xl">{c.notes}</p>
                    )}
                    {c.payout_method && (
                      <p className="mt-1.5 text-[11px] text-gray-400">
                        Payout: {c.payout_method} {c.payout_details?.raw ?? ""}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {c.status === "pending" && (
                      <>
                        <button
                          onClick={() => approve(c)}
                          disabled={busyId === c.id}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                        >
                          {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Approve
                        </button>
                        <button
                          onClick={() => reject(c)}
                          disabled={busyId === c.id}
                          className="inline-flex items-center gap-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </>
                    )}
                    {c.status === "active" && (
                      <button
                        onClick={() => copyText(c.id, `https://trustandtrip.com/?ref=${c.ref_code}`)}
                        className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-tat-charcoal hover:border-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        {copied === c.id ? <><Check className="h-3.5 w-3.5 text-tat-teal" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy link</>}
                      </button>
                    )}
                  </div>
                </div>

                {/* Temp password disclosure */}
                {tempPw && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-[11px] uppercase tracking-wider text-amber-700 font-semibold mb-1">⚠ Temp password — share securely</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm text-amber-900 bg-white px-2 py-1 rounded">{tempPw}</code>
                      <button
                        onClick={() => copyText(`pw-${c.id}`, tempPw)}
                        className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900"
                      >
                        {copied === `pw-${c.id}` ? <><Check className="h-3 w-3" />copied</> : <><Copy className="h-3 w-3" />copy</>}
                      </button>
                    </div>
                    <p className="text-[10px] text-amber-700 mt-2">Send to {c.email} via secure channel. Password disappears when you reload this page.</p>
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
