"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MousePointerClick, Megaphone, IndianRupee, Wallet,
  ArrowRight, Loader2, Copy, Check, Sparkles, Share2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

interface Stats {
  attributions: number;
  leads: number;
  bookings: number;
  earned_paise: number;
  pending_paise: number;
  paid_paise: number;
}

interface Creator {
  id: string;
  ref_code: string;
  full_name: string;
  commission_pct: number;
  status: string;
}

const fmtINR = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function CreatorOverview() {
  const { user } = useUserStore();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const sess = await supabase.auth.getSession();
      const token = sess.data.session?.access_token;
      if (!token) { setLoading(false); return; }
      const res = await fetch("/api/creator/me", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setCreator(d.creator);
        setStats(d.stats);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-tat-charcoal/30" /></div>;
  }
  if (!creator) {
    return (
      <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-8 text-center">
        <p className="font-medium text-tat-charcoal">Creator profile not found.</p>
        <Link href="/creators/apply" className="text-sm text-tat-gold hover:underline mt-2 inline-block">Apply to join</Link>
      </div>
    );
  }

  const refUrl = `https://trustandtrip.com/?ref=${creator.ref_code}`;

  const copy = async () => {
    await navigator.clipboard.writeText(refUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const conversionRate = stats && stats.leads > 0 ? Math.round((stats.bookings / stats.leads) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-tat-charcoal/40 mb-1">Creator dashboard</p>
        <h1 className="font-display text-2xl md:text-3xl font-medium text-tat-charcoal">
          Hey {creator.full_name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-tat-charcoal/55 mt-1">
          Your performance at a glance. Earnings update in real time.
        </p>
      </div>

      {/* Ref link card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-tat-charcoal to-tat-charcoal/90 text-tat-paper rounded-2xl p-5 md:p-6 mb-6">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-tat-gold/15 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-widest text-tat-gold/80 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Your referral link
          </p>
          <div className="flex items-center gap-2 bg-tat-paper/8 backdrop-blur-sm border border-tat-paper/15 rounded-xl px-4 py-3 mb-3">
            <p className="text-sm text-tat-paper/90 flex-1 truncate font-mono">{refUrl}</p>
            <button onClick={copy} className="shrink-0 inline-flex items-center gap-1.5 bg-tat-gold text-tat-charcoal px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-tat-gold/90 transition-all">
              {copied ? <><Check className="h-3.5 w-3.5" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-xs text-tat-paper/65">
            <span>Code: <strong className="text-tat-gold font-mono">{creator.ref_code}</strong></span>
            <span>·</span>
            <span>Commission: <strong className="text-tat-paper">{creator.commission_pct}%</strong></span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Plan your next trip with @trustandtrip — they handcraft real itineraries. Use my link for the best rates: ${refUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 text-tat-paper hover:text-tat-gold transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" /> Share via WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <KpiCard icon={MousePointerClick} label="Link clicks" value={stats?.attributions ?? 0} color="bg-tat-info-bg text-tat-info-fg" />
        <KpiCard icon={Megaphone} label="Leads captured" value={stats?.leads ?? 0} color="bg-tat-danger-bg text-tat-danger-fg" sub={stats && stats.leads > 0 ? `${conversionRate}% convert` : undefined} />
        <KpiCard icon={IndianRupee} label="Bookings" value={stats?.bookings ?? 0} color="bg-tat-warning-bg text-tat-warning-fg" />
        <KpiCard icon={Wallet} label="Earned (lifetime)" value={fmtINR(stats?.earned_paise ?? 0)} color="bg-tat-success-bg text-tat-teal" />
      </div>

      {/* Pending vs paid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-5">
          <p className="text-xs text-tat-charcoal/55 uppercase tracking-widest mb-2">Pending payout</p>
          <p className="font-display text-3xl font-medium text-tat-charcoal">{fmtINR(stats?.pending_paise ?? 0)}</p>
          <p className="text-[11px] text-tat-charcoal/40 mt-1">Released after trip is confirmed.</p>
        </div>
        <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-5">
          <p className="text-xs text-tat-charcoal/55 uppercase tracking-widest mb-2">Paid out</p>
          <p className="font-display text-3xl font-medium text-tat-teal">{fmtINR(stats?.paid_paise ?? 0)}</p>
          <p className="text-[11px] text-tat-charcoal/40 mt-1">Settled to your account.</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-5 md:p-6">
        <p className="text-sm font-semibold text-tat-charcoal mb-4">Jump to</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: "/creators/dashboard/leads", label: "Lead activity", desc: "Every visitor who came via your link", icon: Megaphone, color: "bg-tat-danger-bg text-tat-danger-fg" },
            { href: "/creators/dashboard/earnings", label: "Earnings & payouts", desc: "Commission journey, paid history", icon: IndianRupee, color: "bg-tat-warning-bg text-tat-warning-fg" },
            { href: "/creators/dashboard/profile", label: "Profile & payout", desc: "Update payout method, KYC", icon: Wallet, color: "bg-tat-info-bg text-tat-info-fg" },
          ].map(({ href, label, desc, icon: Icon, color }) => (
            <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-tat-cream/40 group transition-colors">
              <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-tat-charcoal group-hover:text-tat-gold transition-colors">{label}</p>
                <p className="text-[11px] text-tat-charcoal/45">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-tat-charcoal/35 group-hover:text-tat-gold transition-colors ml-auto shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, color, sub,
}: {
  icon: typeof Megaphone;
  label: string;
  value: number | string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-4 md:p-5">
      <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-display text-2xl font-medium text-tat-charcoal">{value}</p>
      <p className="text-xs text-tat-charcoal/65 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-tat-charcoal/40 mt-0.5">{sub}</p>}
    </div>
  );
}
