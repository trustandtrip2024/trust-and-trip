"use client";

import { useState, useEffect } from "react";
import { Gift, Copy, Check, MessageCircle, IndianRupee, Loader2, Users, TrendingUp } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

interface ReferralData {
  code: string;
  clicks: number;
  conversions: number;
  reward_amount: number;
  status: string;
  created_at: string;
}

export default function ReferralDashboardPage() {
  const { user } = useUserStore();
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Traveller";
  const referralUrl = referral ? `https://trustandtrip.com?ref=${referral.code}` : "";

  useEffect(() => {
    const email = user?.email;
    if (!email) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/referral?email=${encodeURIComponent(email)}`);
      if (res.ok && !cancelled) {
        const data = await res.json();
        if (data.referral) setReferral(data.referral);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  async function generate() {
    setGenerating(true); setError("");
    const res = await fetch("/api/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: displayName,
        email: user!.email,
        phone: user?.user_metadata?.phone ?? "",
      }),
    });
    const data = await res.json();
    if (data.code) setReferral({ code: data.code, clicks: 0, conversions: 0, reward_amount: 500, status: "active", created_at: new Date().toISOString() });
    else setError(data.error ?? "Failed to generate referral code.");
    setGenerating(false);
  }

  const copy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const waShare = referralUrl
    ? `https://wa.me/?text=${encodeURIComponent(`Hey! 🌍 I'm using Trust and Trip for my next vacation — they craft amazing handpicked trips!\n\nUse my referral link and get ₹500 off your first booking:\n${referralUrl}`)}`
    : "";

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Dashboard</p>
        <h1 className="font-display text-2xl font-medium text-ink">Refer & Earn</h1>
        <p className="text-sm text-ink/50 mt-1">Refer friends, earn ₹500 for every successful booking.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-ink/30" />
        </div>
      ) : !referral ? (
        /* Generate code */
        <div className="bg-white rounded-2xl border border-ink/8 p-8 text-center max-w-md mx-auto">
          <div className="h-14 w-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <Gift className="h-7 w-7 text-gold" />
          </div>
          <h2 className="font-display text-xl font-medium text-ink mb-2">Get your referral link</h2>
          <p className="text-sm text-ink/50 mb-6 leading-relaxed">
            Share with friends. You earn ₹500 for every friend who books with Trust and Trip.
          </p>
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-ink hover:bg-gold text-cream hover:text-ink rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
            Generate My Referral Link
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Link Clicks", value: referral.clicks, icon: TrendingUp, color: "bg-blue-50 text-blue-600" },
              { label: "Conversions", value: referral.conversions, icon: Users, color: "bg-green-50 text-green-600" },
              { label: "Earned", value: `₹${(referral.conversions * referral.reward_amount).toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-gold/10 text-amber-700" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-ink/8 p-4 text-center">
                <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="font-display text-xl font-medium text-ink">{value}</p>
                <p className="text-xs text-ink/45 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Referral link */}
          <div className="bg-white rounded-2xl border border-ink/8 p-5 md:p-6">
            <p className="text-sm font-semibold text-ink mb-4">Your Referral Link</p>
            <div className="flex items-center gap-2 bg-cream rounded-xl border border-ink/10 px-4 py-3 mb-4">
              <p className="text-sm text-ink/70 flex-1 truncate">{referralUrl}</p>
              <button onClick={copy} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink text-cream text-xs font-medium hover:bg-gold hover:text-ink transition-all">
                {copied ? <><Check className="h-3.5 w-3.5" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-ink/45 mr-1">Share via:</p>
              <a href={waShare} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366]/10 text-[#1a9e4e] border border-[#25D366]/20 text-xs font-medium hover:bg-[#25D366]/20 transition-colors">
                <MessageCircle className="h-3.5 w-3.5 fill-[#25D366] text-[#25D366]" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gold/5 border border-gold/15 rounded-2xl p-5">
            <p className="text-sm font-semibold text-ink mb-3">How it works</p>
            <div className="space-y-2">
              {[
                "Share your link with friends",
                "Friend visits Trust and Trip via your link",
                "Friend books any package",
                "You both get ₹500 off — automatically applied",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="h-5 w-5 rounded-full bg-gold/20 text-ink text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-ink/65">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
