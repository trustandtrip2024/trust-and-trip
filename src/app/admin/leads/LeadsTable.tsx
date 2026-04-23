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
};

type SortKey = "created_at" | "name" | "status";
type SortDir = "asc" | "desc";

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-yellow-100 text-yellow-800",
  contacted: "bg-blue-100 text-blue-800",
  qualified: "bg-purple-100 text-purple-800",
  booked:    "bg-green-100 text-green-800",
  lost:      "bg-gray-100 text-gray-500",
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
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
        <input
          type="text" placeholder="Search name, phone, email…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <div className="flex gap-1.5 flex-wrap">
          {["all", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >{s}</button>
          ))}
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 ml-auto">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
        <span className="text-xs text-gray-400">{filtered.length} leads</span>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-blue-800">{selected.size} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="text-xs border border-blue-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Change status to…</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={bulkUpdate}
            disabled={!bulkStatus || bulkUpdating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {bulkUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
            Apply
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-blue-600 hover:underline ml-1">
            Deselect all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="pl-5 py-3 w-8">
                <button onClick={toggleAll}>
                  {allSelected ? <CheckSquare className="h-4 w-4 text-blue-600" /> : <Square className="h-4 w-4 text-gray-400" />}
                </button>
              </th>
              <th className="px-5 py-3 text-left">
                <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-gray-800">
                  Lead <SortIcon k="name" />
                </button>
              </th>
              <th className="px-5 py-3 text-left">Trip Details</th>
              <th className="px-5 py-3 text-left">Source</th>
              <th className="px-5 py-3 text-left">
                <button onClick={() => toggleSort("status")} className="flex items-center gap-1 hover:text-gray-800">
                  Status <SortIcon k="status" />
                </button>
              </th>
              <th className="px-5 py-3 text-left">
                <button onClick={() => toggleSort("created_at")} className="flex items-center gap-1 hover:text-gray-800">
                  Date <SortIcon k="created_at" />
                </button>
              </th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">No leads found</td></tr>
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
    <tr className={`hover:bg-gray-50 transition-colors ${selected ? "bg-blue-50/40" : ""}`}>
      <td className="pl-5 py-4 w-8">
        <button onClick={onToggle}>
          {selected ? <CheckSquare className="h-4 w-4 text-blue-600" /> : <Square className="h-4 w-4 text-gray-300 hover:text-gray-500" />}
        </button>
      </td>
      <td className="px-5 py-4">
        <p className="font-semibold text-gray-900">{lead.name}</p>
        <a href={`tel:${lead.phone}`} className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 mt-0.5">
          <Phone className="h-3 w-3" />{lead.phone}
        </a>
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 mt-0.5">
            <Mail className="h-3 w-3" />{lead.email}
          </a>
        )}
      </td>
      <td className="px-5 py-4">
        {lead.package_title && <p className="text-xs font-medium text-gray-800 truncate max-w-[180px]">{lead.package_title}</p>}
        {lead.destination && <p className="text-xs text-gray-500 mt-0.5">{lead.destination}</p>}
        <div className="flex gap-1.5 mt-1 flex-wrap">
          {lead.travel_type && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{lead.travel_type}</span>}
          {lead.num_travellers && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{lead.num_travellers} pax</span>}
          {lead.budget && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{lead.budget}</span>}
          {lead.travel_date && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{lead.travel_date}</span>}
        </div>
        {lead.message && <p className="text-[11px] text-gray-400 mt-1 truncate max-w-[180px]" title={lead.message}>{lead.message}</p>}
      </td>
      <td className="px-5 py-4">
        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
          {SOURCE_LABELS[lead.source] ?? lead.source}
        </span>
        {lead.utm_source && <p className="text-[10px] text-gray-400 mt-1">{lead.utm_source}</p>}
      </td>
      <td className="px-5 py-4">
        <select
          value={status} onChange={(e) => updateStatus(e.target.value)} disabled={updating}
          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {updating && <Loader2 className="h-3 w-3 animate-spin inline ml-1 text-gray-400" />}
      </td>
      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
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
            className="h-8 w-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
            <Phone className="h-4 w-4 text-blue-600" />
          </a>
          {lead.page_url && (
            <a href={lead.page_url} target="_blank" rel="noopener noreferrer" title="View page"
              className="h-8 w-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}
