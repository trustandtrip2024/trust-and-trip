"use client";

import { useEffect, useState } from "react";
import { Loader2, Megaphone, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

interface Lead {
  id: string;
  name: string;
  source: string;
  destination: string | null;
  package_title: string | null;
  status: "new" | "contacted" | "qualified" | "booked" | "lost";
  created_at: string;
}

const STATUS_LABEL: Record<Lead["status"], { label: string; cls: string }> = {
  new:       { label: "New",        cls: "bg-tat-info-bg text-tat-info-fg border-tat-info-fg/15" },
  contacted: { label: "Contacted",  cls: "bg-tat-warning-bg text-tat-warning-fg border-tat-warning-fg/15" },
  qualified: { label: "Qualified",  cls: "bg-tat-gold/10 text-tat-charcoal border-tat-gold/20" },
  booked:    { label: "Booked",     cls: "bg-tat-success-bg text-tat-success-fg border-tat-success-fg/15" },
  lost:      { label: "Lost",       cls: "bg-tat-charcoal/5 text-tat-charcoal/55 border-tat-charcoal/10" },
};

const SOURCE_LABEL: Record<string, string> = {
  contact_form: "Contact form",
  package_enquiry: "Package enquiry",
  trip_planner: "Trip planner",
  exit_intent: "Exit popup",
  newsletter: "Newsletter",
  itinerary_generator: "AI plan",
  book_now_click: "Book Now click",
  call_click: "Call click",
  whatsapp_click: "WhatsApp click",
  customize_click: "Customize click",
  enquire_click: "Enquire click",
  schedule_call_click: "Schedule call",
};

export default function CreatorLeadsPage() {
  const { user } = useUserStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"" | Lead["status"]>("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const sess = await supabase.auth.getSession();
      const token = sess.data.session?.access_token;
      if (!token) { setLoading(false); return; }
      const res = await fetch("/api/creator/leads", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setLeads(d.leads ?? []);
      }
      setLoading(false);
    })();
  }, [user]);

  const visible = filter ? leads.filter((l) => l.status === filter) : leads;

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-tat-charcoal/40 mb-1">Creator dashboard</p>
        <h1 className="font-display text-h2 font-medium text-tat-charcoal">Lead activity</h1>
        <p className="text-sm text-tat-charcoal/55 mt-1">
          Every visitor who landed via your referral link and submitted a form. Names are partially masked for privacy.
        </p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <FilterBtn value="" current={filter} onClick={setFilter} count={leads.length}>All</FilterBtn>
        {(Object.keys(STATUS_LABEL) as Lead["status"][]).map((s) => (
          <FilterBtn key={s} value={s} current={filter} onClick={setFilter} count={leads.filter((l) => l.status === s).length}>
            {STATUS_LABEL[s].label}
          </FilterBtn>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-tat-charcoal/30" /></div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-10 text-center">
          <Megaphone className="h-10 w-10 text-tat-charcoal/20 mx-auto mb-3" />
          <p className="font-medium text-tat-charcoal">No leads yet</p>
          <p className="text-sm text-tat-charcoal/50 mt-1">
            Share your link in stories, posts, bio. Leads will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-tat-charcoal/8 divide-y divide-tat-charcoal/8 overflow-hidden">
          {visible.map((l) => {
            const cfg = STATUS_LABEL[l.status];
            return (
              <div key={l.id} className="p-4 md:p-5 flex items-center gap-4 flex-wrap">
                <div className="h-9 w-9 rounded-full bg-tat-gold/15 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-tat-charcoal">{l.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-tat-charcoal">{l.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-tat-charcoal/55 flex-wrap">
                    <span>{SOURCE_LABEL[l.source] ?? l.source}</span>
                    {l.destination && (
                      <>
                        <span className="text-tat-charcoal/25">·</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" />
                          {l.destination}
                        </span>
                      </>
                    )}
                    {l.package_title && (
                      <>
                        <span className="text-tat-charcoal/25">·</span>
                        <span className="truncate max-w-[200px]">{l.package_title}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center text-[10px] font-medium px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                  <p className="text-[10px] text-tat-charcoal/40 mt-1">
                    {new Date(l.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterBtn({
  value, current, onClick, count, children,
}: {
  value: "" | Lead["status"];
  current: "" | Lead["status"];
  onClick: (v: "" | Lead["status"]) => void;
  count: number;
  children: React.ReactNode;
}) {
  const active = value === current;
  return (
    <button
      onClick={() => onClick(value)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active ? "bg-tat-charcoal text-tat-paper border-tat-charcoal" : "bg-white text-tat-charcoal/60 border-tat-charcoal/15 hover:border-tat-charcoal/30"
      }`}
    >
      {children}
      <span className={`text-[10px] ${active ? "text-tat-paper/70" : "text-tat-charcoal/40"}`}>{count}</span>
    </button>
  );
}
