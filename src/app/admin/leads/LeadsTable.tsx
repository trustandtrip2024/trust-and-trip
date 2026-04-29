"use client";

import { useState, useMemo } from "react";
import { Phone, Mail, MessageCircle, ExternalLink, Download, ChevronUp, ChevronDown, ChevronsUpDown, CheckSquare, Square, Loader2 } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  package_title?: string;
  destination?: string;
  travel_type?: string;
  travel_date?: string;
  num_travellers?: string;
  budget?: string;
  source: string;
  status: string;
  created_at: string;
  utm_source?: string;
  page_url?: string;
  score?: number | null;
  tier?: "A" | "B" | "C" | null;
  assigned_planner?: string | null;
};

type SortKey = "created_at" | "name" | "status";
type SortDir = "asc" | "desc";

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-tat-warning-bg text-tat-warning-fg",
  contacted: "bg-tat-info-bg text-tat-info-fg",
  qualified: "bg-tat-cream-warm/40 text-tat-charcoal",
  booked:    "bg-tat-success-bg text-tat-success-fg",
  lost:      "bg-tat-charcoal/5 text-tat-slate",
};

const SOURCE_LABELS: Record<string, string> = {
  package_enquiry:    "Package",
  contact_form:       "Contact",
  trip_planner:       "Planner",
  exit_intent:        "Exit Pop",
  newsletter:         "Newsletter",
  itinerary_generator:"AI Plan",
};

const WA = "918115999588";
const STATUSES = ["new","contacted","qualified","booked","lost"];

export default function LeadsTable({ leads: initialLeads }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const filtered = useMemo(() => {
    let list = leads.filter((l) => {
      const matchStatus = filter === "all" || l.status === filter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.destination ?? "").toLowerCase().includes(q) ||
        (l.package_title ?? "").toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "created_at") cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [leads, filter, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronsUpDown className="h-3 w-3 opacity-30" />;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  const allSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const toggleAll = () => {
    if (allSelected) setSelected((s) => { const n = new Set(s); filtered.forEach((l) => n.delete(l.id)); return n; });
    else setSelected((s) => { const n = new Set(s); filtered.forEach((l) => n.add(l.id)); return n; });
  };
  const toggleOne = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const bulkUpdate = async () => {
    if (!bulkStatus || selected.size === 0) return;
    setBulkUpdating(true);
    await Promise.all([...selected].map((id) =>
      fetch("/api/leads/status", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: bulkStatus }) })
    ));
    setLeads((prev) => prev.map((l) => selected.has(l.id) ? { ...l, status: bulkStatus } : l));
    setSelected(new Set());
    setBulkStatus("");
    setBulkUpdating(false);
  };

  const exportCSV = () => {
    const rows = filtered.map((l) => [
      l.name, l.email, l.phone, l.destination ?? "", l.package_title ?? "",
      l.travel_type ?? "", l.travel_date ?? "", l.budget ?? "",
      l.source, l.status, new Date(l.created_at).toLocaleString("en-IN"),
    ]);
    const csv = [["Name","Email","Phone","Destination","Package","Travel Type","Date","Budget","Source","Status","Submitted"], ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: "leads.csv" });
    a.click();
  };

  return (
    <>
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-tat-charcoal/8 flex flex-wrap gap-3 items-center">
        <input
          type="text" placeholder="Search name, phone, email…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-tat-charcoal/12 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-tat-teal/30"
        />
        <div className="flex gap-1.5 flex-wrap">
          {["all", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === s ? "bg-tat-charcoal text-white" : "bg-tat-charcoal/5 text-tat-slate hover:bg-tat-charcoal/10"
              }`}
            >{s}</button>
          ))}
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-tat-info-bg text-tat-info-fg hover:bg-tat-info-bg ml-auto">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
        <span className="text-xs text-tat-slate/70">{filtered.length} leads</span>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="px-5 py-3 bg-tat-info-bg border-b border-tat-info-fg/15 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-tat-info-fg">{selected.size} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="text-xs border border-tat-info-fg/25 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-tat-teal/40"
          >
            <option value="">Change status to…</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={bulkUpdate}
            disabled={!bulkStatus || bulkUpdating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-tat-teal text-white hover:bg-tat-teal-deep disabled:opacity-50 transition-colors"
          >
            {bulkUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
            Apply
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-tat-info-fg hover:underline ml-1">
            Deselect all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-tat-paper text-xs text-tat-slate uppercase tracking-wide">
            <tr>
              <th className="pl-5 py-3 w-8">
                <button onClick={toggleAll}>
                  {allSelected ? <CheckSquare className="h-4 w-4 text-tat-info-fg" /> : <Square className="h-4 w-4 text-tat-slate/70" />}
                </button>
              </th>
              <th className="px-5 py-3 text-left">
                <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-tat-charcoal">
                  Lead <SortIcon k="name" />
                </button>
              </th>
              <th className="px-5 py-3 text-left">Trip Details</th>
              <th className="px-5 py-3 text-left">Source</th>
              <th className="px-5 py-3 text-left">
                <button onClick={() => toggleSort("status")} className="flex items-center gap-1 hover:text-tat-charcoal">
                  Status <SortIcon k="status" />
                </button>
              </th>
              <th className="px-5 py-3 text-left">
                <button onClick={() => toggleSort("created_at")} className="flex items-center gap-1 hover:text-tat-charcoal">
                  Date <SortIcon k="created_at" />
                </button>
              </th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-tat-slate/70">No leads found</td></tr>
            ) : (
              filtered.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  selected={selected.has(lead.id)}
                  onToggle={() => toggleOne(lead.id)}
                  onStatusChange={(s) => setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: s } : l))}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function LeadRow({ lead, selected, onToggle, onStatusChange }: {
  lead: Lead;
  selected: boolean;
  onToggle: () => void;
  onStatusChange: (s: string) => void;
}) {
  const [status, setStatus] = useState(lead.status);
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (s: string) => {
    setUpdating(true);
    const res = await fetch("/api/leads/status", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id, status: s }),
    });
    if (res.ok) { setStatus(s); onStatusChange(s); }
    setUpdating(false);
  };

  const waMsg = encodeURIComponent(`Hi ${lead.name}! 🙏\n\nThank you for your enquiry with Trust and Trip.${lead.package_title ? `\n\nWe noticed you were interested in *${lead.package_title}*.` : ""}\n\nWe'd love to help you plan your trip. When would be a good time to connect?`);

  return (
    <tr className={`hover:bg-tat-paper transition-colors ${selected ? "bg-tat-info-bg/40" : ""}`}>
      <td className="pl-5 py-4 w-8">
        <button onClick={onToggle}>
          {selected ? <CheckSquare className="h-4 w-4 text-tat-info-fg" /> : <Square className="h-4 w-4 text-tat-slate/50 hover:text-tat-slate" />}
        </button>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-tat-charcoal">{lead.name}</p>
          {lead.tier && (
            <span
              title={`Score ${lead.score ?? 0}/100`}
              className={
                "inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold " +
                (lead.tier === "A"
                  ? "bg-tat-success-bg text-tat-success-fg ring-1 ring-tat-success-fg/30"
                  : lead.tier === "B"
                  ? "bg-tat-warning-bg text-tat-warning-fg"
                  : "bg-tat-charcoal/5 text-tat-slate")
              }
            >
              {lead.tier}
            </span>
          )}
          {typeof lead.score === "number" && (
            <span className="text-[10px] text-tat-slate tabular-nums">{lead.score}</span>
          )}
        </div>
        <a href={`tel:${lead.phone}`} className="text-xs text-tat-slate hover:text-tat-info-fg flex items-center gap-1 mt-0.5">
          <Phone className="h-3 w-3" />{lead.phone}
        </a>
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="text-xs text-tat-slate/70 hover:text-tat-info-fg flex items-center gap-1 mt-0.5">
            <Mail className="h-3 w-3" />{lead.email}
          </a>
        )}
      </td>
      <td className="px-5 py-4">
        {lead.package_title && <p className="text-xs font-medium text-tat-charcoal truncate max-w-[180px]">{lead.package_title}</p>}
        {lead.destination && <p className="text-xs text-tat-slate mt-0.5">{lead.destination}</p>}
        <div className="flex gap-1.5 mt-1 flex-wrap">
          {lead.travel_type && <span className="text-[10px] bg-tat-charcoal/5 text-tat-slate px-1.5 py-0.5 rounded">{lead.travel_type}</span>}
          {lead.num_travellers && <span className="text-[10px] bg-tat-charcoal/5 text-tat-slate px-1.5 py-0.5 rounded">{lead.num_travellers} pax</span>}
          {lead.budget && <span className="text-[10px] bg-tat-charcoal/5 text-tat-slate px-1.5 py-0.5 rounded">{lead.budget}</span>}
          {lead.travel_date && <span className="text-[10px] bg-tat-info-bg text-tat-info-fg px-1.5 py-0.5 rounded">{lead.travel_date}</span>}
        </div>
        {lead.message && <p className="text-[11px] text-tat-slate/70 mt-1 truncate max-w-[180px]" title={lead.message}>{lead.message}</p>}
      </td>
      <td className="px-5 py-4">
        <span className="text-xs bg-tat-gold/10 text-tat-charcoal px-2 py-0.5 rounded-full font-medium">
          {SOURCE_LABELS[lead.source] ?? lead.source}
        </span>
        {lead.utm_source && <p className="text-[10px] text-tat-slate/70 mt-1">{lead.utm_source}</p>}
      </td>
      <td className="px-5 py-4">
        <select
          value={status} onChange={(e) => updateStatus(e.target.value)} disabled={updating}
          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-tat-charcoal/20 ${STATUS_COLORS[status] ?? "bg-tat-charcoal/5 text-tat-slate"}`}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {updating && <Loader2 className="h-3 w-3 animate-spin inline ml-1 text-tat-slate/70" />}
        <PlannerCell leadId={lead.id} initial={lead.assigned_planner ?? null} />
      </td>
      <td className="px-5 py-4 text-xs text-tat-slate whitespace-nowrap">
        {new Date(lead.created_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
        <br />
        {new Date(lead.created_at).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" title="Reply on WhatsApp"
            className="h-8 w-8 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center transition-colors">
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
          </a>
          <a href={`tel:${lead.phone}`} title="Call"
            className="h-8 w-8 rounded-lg bg-tat-info-bg hover:bg-tat-info-bg flex items-center justify-center transition-colors">
            <Phone className="h-4 w-4 text-tat-info-fg" />
          </a>
          {lead.page_url && (
            <a href={lead.page_url} target="_blank" rel="noopener noreferrer" title="View page"
              className="h-8 w-8 rounded-lg bg-tat-paper hover:bg-tat-charcoal/5 flex items-center justify-center transition-colors">
              <ExternalLink className="h-4 w-4 text-tat-slate/70" />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}

function PlannerCell({
  leadId,
  initial,
}: {
  leadId: string;
  initial: string | null;
}) {
  const [planner, setPlanner] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(next: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, planner: next || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setPlanner(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-1.5 flex items-center gap-1">
      <input
        type="text"
        value={planner}
        onChange={(e) => setPlanner(e.target.value)}
        onBlur={(e) => {
          if (e.target.value !== (initial ?? "")) void save(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder="planner"
        disabled={busy}
        className="text-[11px] px-2 py-0.5 rounded border border-tat-charcoal/12 w-20 outline-none focus:border-tat-orange/40 disabled:opacity-60"
      />
      {busy && <Loader2 className="h-3 w-3 animate-spin text-tat-slate/70" />}
      {error && <span className="text-[10px] text-tat-danger-fg" title={error}>!</span>}
    </div>
  );
}
