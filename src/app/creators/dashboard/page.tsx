"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MousePointerClick, Megaphone, IndianRupee, Wallet, ArrowRight, Loader2,
  Copy, Check, Sparkles, Share2, TrendingUp, TrendingDown, Crown,
  Lightbulb, Coffee, Sun, Moon, Send, Instagram,
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

interface LeadLite {
  id: string;
  name: string | null;
  destination: string | null;
  package_title: string | null;
  status: string | null;
  created_at: string;
}

const fmtINR = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// Creator tiers — earn-based gamification. Lifetime earnings (paise).
const CREATOR_TIERS = [
  { key: "rookie",    label: "Rookie",    min: 0,         color: "bg-tat-paper text-tat-charcoal/65",  accent: "text-tat-charcoal/65" },
  { key: "rising",    label: "Rising",    min: 1_000_00,  color: "bg-tat-teal-mist/40 text-tat-teal-deep", accent: "text-tat-teal-deep" },
  { key: "trusted",   label: "Trusted",   min: 10_000_00, color: "bg-tat-gold/20 text-tat-gold",       accent: "text-tat-gold" },
  { key: "platinum",  label: "Platinum",  min: 50_000_00, color: "bg-tat-charcoal text-tat-gold",      accent: "text-tat-gold" },
];

function getTier(earnedPaise: number) {
  return [...CREATOR_TIERS].reverse().find((t) => earnedPaise >= t.min) ?? CREATOR_TIERS[0];
}

function nextCreatorTier(earnedPaise: number) {
  return CREATOR_TIERS.find((t) => earnedPaise < t.min);
}

function timeOfDayGreeting(): { greeting: string; Icon: typeof Sun } {
  const istHour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getHours();
  if (istHour < 5)  return { greeting: "Late night",     Icon: Moon };
  if (istHour < 12) return { greeting: "Good morning",   Icon: Coffee };
  if (istHour < 17) return { greeting: "Good afternoon", Icon: Sun };
  if (istHour < 21) return { greeting: "Good evening",   Icon: Sun };
  return { greeting: "Good night", Icon: Moon };
}

const SHARE_CAPTIONS = {
  default: (link: string) =>
    `Plan your next trip with @trustandtrip — they handcraft real itineraries with hand-picked stays. Use my link for the best rates: ${link}`,
  story: (link: string) =>
    `Travel done right ✈️\nReal humans, real itineraries, no chatbot fluff.\n→ ${link}`,
  tweet: (link: string) =>
    `If you're planning a trip — Trust and Trip is the only agency I trust to handcraft itineraries. Hand-picked stays, real planners. ${link}`,
};

export default function CreatorOverview() {
  const { user } = useUserStore();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<LeadLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const { greeting, Icon: GreetIcon } = timeOfDayGreeting();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const sess = await supabase.auth.getSession();
      const token = sess.data.session?.access_token;
      if (!token) { setLoading(false); return; }

      const [meRes, leadsRes] = await Promise.all([
        fetch("/api/creator/me",    { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/creator/leads", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (meRes.ok) {
        const d = await meRes.json();
        setCreator(d.creator);
        setStats(d.stats);
      }
      if (leadsRes.ok) {
        const d = await leadsRes.json();
        setLeads(Array.isArray(d.leads) ? d.leads.slice(0, 200) : []);
      }
      setLoading(false);
    })();
  }, [user]);

  // Period analytics — derived from leads list (no extra round-trip)
  const periodMetrics = useMemo(() => {
    const now = Date.now();
    const d30 = now - 30 * 86_400_000;
    const d60 = now - 60 * 86_400_000;
    const d7  = now -  7 * 86_400_000;

    const last30  = leads.filter((l) => new Date(l.created_at).getTime() >= d30);
    const prev30  = leads.filter((l) => {
      const t = new Date(l.created_at).getTime();
      return t >= d60 && t < d30;
    });
    const last7   = leads.filter((l) => new Date(l.created_at).getTime() >= d7);

    // 14-day sparkline (leads per day)
    const days = 14;
    const buckets = new Array(days).fill(0) as number[];
    for (const l of leads) {
      const ageDays = Math.floor((now - new Date(l.created_at).getTime()) / 86_400_000);
      if (ageDays >= 0 && ageDays < days) buckets[days - 1 - ageDays]++;
    }

    // Top destinations from leads
    const destCounts = new Map<string, number>();
    for (const l of last30) {
      const k = l.destination || l.package_title || "(unspecified)";
      destCounts.set(k, (destCounts.get(k) ?? 0) + 1);
    }
    const topDests = Array.from(destCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);

    return { last30, prev30, last7, buckets, topDests };
  }, [leads]);

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
  const conversionRate = stats && stats.leads > 0 ? Math.round((stats.bookings / stats.leads) * 100) : 0;
  const tier = getTier(stats?.earned_paise ?? 0);
  const next = nextCreatorTier(stats?.earned_paise ?? 0);
  const tierProgress = next
    ? Math.min(100, ((stats?.earned_paise ?? 0) / next.min) * 100)
    : 100;

  const lastDelta = periodMetrics.prev30.length > 0
    ? Math.round(((periodMetrics.last30.length - periodMetrics.prev30.length) / periodMetrics.prev30.length) * 100)
    : null;

  const copyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const sparkMax = Math.max(...periodMetrics.buckets, 1);

  return (
    <div>
      {/* ─── Greeting ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-tat-charcoal/45 font-semibold mb-1 inline-flex items-center gap-1.5">
          <GreetIcon className="h-3 w-3 text-tat-gold" />
          {greeting} · creator dashboard
        </p>
        <h1 className="font-display text-h2 font-medium text-tat-charcoal">
          {creator.full_name.split(" ")[0]}
        </h1>
        <p className="text-sm text-tat-charcoal/55 mt-1">
          Earnings update real-time. Tier perks unlock as you grow.
        </p>
      </div>

      {/* ─── Tier badge ───────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-2xl border border-tat-charcoal/8 p-5 mb-5 ${tier.color}`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-tat-paper/40 backdrop-blur flex items-center justify-center">
              <Crown className={`h-4 w-4 ${tier.accent}`} />
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-[0.18em] font-semibold ${tier.accent}`}>
                {tier.label} creator · {creator.commission_pct}% commission
              </p>
              <p className="font-display text-lg mt-0.5">
                {fmtINR(stats?.earned_paise ?? 0)} lifetime earned
              </p>
            </div>
          </div>
          {next && (
            <div className="text-right text-[11px]">
              <p>Next: <strong>{next.label}</strong></p>
              <p className="opacity-70">{fmtINR(next.min - (stats?.earned_paise ?? 0))} to go</p>
            </div>
          )}
        </div>
        {next && (
          <div className="mt-3 h-1.5 bg-tat-paper/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-tat-gold to-tat-orange rounded-full"
              style={{ width: `${tierProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* ─── Ref link card ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-tat-charcoal to-tat-charcoal/95 text-tat-paper rounded-2xl p-5 md:p-6 mb-5">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-tat-gold/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-tat-teal/15 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.18em] text-tat-gold font-semibold mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Your referral link
          </p>
          <div className="flex items-center gap-2 bg-tat-paper/8 backdrop-blur-sm border border-tat-paper/15 rounded-xl px-4 py-3 mb-3">
            <p className="text-sm text-tat-paper/95 flex-1 truncate font-mono">{refUrl}</p>
            <button
              onClick={() => copyText(refUrl, "url")}
              className="shrink-0 inline-flex items-center gap-1.5 bg-tat-gold text-tat-charcoal px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-tat-gold/90 transition-all"
            >
              {copied === "url" ? <><Check className="h-3.5 w-3.5" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
            </button>
          </div>

          {/* Multi-platform share */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <p className="text-[10px] uppercase tracking-wider text-tat-paper/55 mr-1">Share on</p>
            <ShareBtn
              icon={Share2}
              label="WhatsApp"
              href={`https://wa.me/?text=${encodeURIComponent(SHARE_CAPTIONS.default(refUrl))}`}
            />
            <ShareBtn
              icon={Send}
              label="Telegram"
              href={`https://t.me/share/url?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent(SHARE_CAPTIONS.default(""))}`}
            />
            <ShareBtn
              icon={Send}
              label="Twitter"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_CAPTIONS.tweet(refUrl))}`}
            />
            <button
              onClick={() => copyText(SHARE_CAPTIONS.story(refUrl), "ig")}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-pill bg-tat-paper/10 hover:bg-tat-paper/20 text-tat-paper transition"
            >
              <Instagram className="h-3.5 w-3.5" />
              {copied === "ig" ? "Caption copied" : "Instagram caption"}
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs text-tat-paper/65">
            <span>Code: <strong className="text-tat-gold font-mono">{creator.ref_code}</strong></span>
            <span>·</span>
            <span>Commission: <strong className="text-tat-paper">{creator.commission_pct}%</strong></span>
          </div>
        </div>
      </div>

      {/* ─── KPIs ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <KpiCard icon={MousePointerClick} label="Link clicks" value={stats?.attributions ?? 0} tone="teal" />
        <KpiCard
          icon={Megaphone}
          label="Leads · 30d"
          value={periodMetrics.last30.length}
          tone="orange"
          delta={lastDelta}
          sub={lastDelta !== null ? `vs ${periodMetrics.prev30.length} prev` : undefined}
        />
        <KpiCard
          icon={IndianRupee}
          label="Bookings"
          value={stats?.bookings ?? 0}
          tone="gold"
          sub={stats && stats.leads > 0 ? `${conversionRate}% convert` : undefined}
        />
        <KpiCard icon={Wallet} label="Earned (lifetime)" value={fmtINR(stats?.earned_paise ?? 0)} tone="teal-deep" />
      </div>

      {/* ─── Sparkline + Top destinations ─────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-tat-charcoal/65">
              Daily lead flow · 14d
            </p>
            <p className="text-[11px] text-tat-charcoal/45">{periodMetrics.last7.length} this week</p>
          </div>
          <div className="flex items-end gap-1 h-20">
            {periodMetrics.buckets.map((c, i) => (
              <div
                key={i}
                className="flex-1 bg-tat-teal rounded-t transition-all hover:bg-tat-teal-deep"
                style={{ height: `${Math.max(4, (c / sparkMax) * 100)}%`, minHeight: 4 }}
                title={`${c} lead${c === 1 ? "" : "s"} · ${14 - 1 - i}d ago`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-tat-charcoal/65 mb-3">
            Top destinations · 30d
          </p>
          {periodMetrics.topDests.length === 0 ? (
            <p className="text-xs text-tat-charcoal/45 italic">No leads yet — share your link to get started.</p>
          ) : (
            <ul className="space-y-2">
              {periodMetrics.topDests.map(([dest, n]) => {
                const max = periodMetrics.topDests[0][1];
                const w = (n / max) * 100;
                return (
                  <li key={dest}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-tat-charcoal truncate flex-1">{dest}</span>
                      <span className="font-semibold text-tat-charcoal tabular-nums">{n}</span>
                    </div>
                    <div className="h-1.5 bg-tat-paper rounded-full overflow-hidden">
                      <div className="h-full bg-tat-gold rounded-full" style={{ width: `${w}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ─── Pending vs paid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-5">
          <p className="text-[10px] text-tat-charcoal/55 uppercase tracking-[0.16em] font-semibold mb-2">
            Pending payout
          </p>
          <p className="font-display text-3xl font-medium text-tat-charcoal tabular-nums">{fmtINR(stats?.pending_paise ?? 0)}</p>
          <p className="text-[11px] text-tat-charcoal/40 mt-1">Released 7 days after trip is confirmed.</p>
        </div>
        <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-5">
          <p className="text-[10px] text-tat-charcoal/55 uppercase tracking-[0.16em] font-semibold mb-2">
            Paid out
          </p>
          <p className="font-display text-3xl font-medium text-tat-teal-deep tabular-nums">{fmtINR(stats?.paid_paise ?? 0)}</p>
          <p className="text-[11px] text-tat-charcoal/40 mt-1">Settled to your bank.</p>
        </div>
      </div>

      {/* ─── Tips card ────────────────────────────────────────────────── */}
      <div className="bg-tat-cream-warm/40 border border-tat-gold/25 rounded-2xl p-5 mb-5">
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-tat-gold mb-2 inline-flex items-center gap-1.5">
          <Lightbulb className="h-3 w-3" />
          What&apos;s working for top creators
        </p>
        <ul className="text-sm text-tat-charcoal space-y-1.5">
          <li className="flex gap-2"><span className="text-tat-gold">•</span> Share a real story — your last trip with Trust and Trip beats every generic caption.</li>
          <li className="flex gap-2"><span className="text-tat-gold">•</span> Pin a &ldquo;Plan your next trip&rdquo; highlight on Instagram with your link in bio.</li>
          <li className="flex gap-2"><span className="text-tat-gold">•</span> Mention specific destinations — &ldquo;Bali itinerary&rdquo; converts 3× better than generic &ldquo;travel&rdquo;.</li>
          <li className="flex gap-2"><span className="text-tat-gold">•</span> Reply to DMs — most leads ask one question before booking.</li>
        </ul>
      </div>

      {/* ─── Quick links ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-5 md:p-6">
        <p className="text-sm font-semibold text-tat-charcoal mb-4">Jump to</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: "/creators/dashboard/leads",    label: "Lead activity",      desc: "Every visitor who came via your link", icon: Megaphone,   tone: "orange" },
            { href: "/creators/dashboard/earnings", label: "Earnings & payouts", desc: "Commission journey, paid history",      icon: IndianRupee, tone: "gold"   },
            { href: "/creators/dashboard/profile",  label: "Profile & payout",   desc: "Update bank details, KYC",              icon: Wallet,      tone: "teal"   },
          ].map(({ href, label, desc, icon: Icon, tone }) => {
            const cls = {
              orange: "bg-tat-orange-soft/30 text-tat-orange",
              gold:   "bg-tat-gold/15 text-tat-gold",
              teal:   "bg-tat-teal-mist/40 text-tat-teal-deep",
            }[tone];
            return (
              <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-tat-cream/40 group transition-colors">
                <div className={`h-9 w-9 rounded-xl ${cls} flex items-center justify-center shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-tat-charcoal group-hover:text-tat-gold transition-colors">{label}</p>
                  <p className="text-[11px] text-tat-charcoal/45">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-tat-charcoal/35 group-hover:text-tat-gold transition-colors ml-auto shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, tone, sub, delta,
}: {
  icon: typeof Megaphone;
  label: string;
  value: number | string;
  tone: "teal" | "orange" | "gold" | "teal-deep";
  sub?: string;
  delta?: number | null;
}) {
  const cls = {
    teal:        "bg-tat-teal-mist/40 text-tat-teal-deep",
    orange:      "bg-tat-orange-soft/30 text-tat-orange",
    gold:        "bg-tat-gold/15 text-tat-gold",
    "teal-deep": "bg-tat-success-bg text-tat-teal-deep",
  }[tone];
  const Trend = delta == null ? null : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : null;
  const deltaCls = delta == null ? "" : delta > 0 ? "text-tat-success-fg" : delta < 0 ? "text-tat-danger-fg" : "text-tat-charcoal/45";
  return (
    <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-4 md:p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`h-9 w-9 rounded-xl ${cls} flex items-center justify-center`}>
          <Icon className="h-4 w-4" />
        </div>
        {Trend && delta != null && (
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${deltaCls}`}>
            <Trend className="h-3 w-3" />
            {delta > 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <p className="font-display text-h2 font-medium text-tat-charcoal tabular-nums">{value}</p>
      <p className="text-xs text-tat-charcoal/65 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-tat-charcoal/40 mt-0.5">{sub}</p>}
    </div>
  );
}

function ShareBtn({ icon: Icon, label, href }: { icon: typeof Share2; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-pill bg-tat-paper/10 hover:bg-tat-paper/20 text-tat-paper transition"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}
