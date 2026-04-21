"use client";

import { useState } from "react";
import { Gift, Copy, Check, Share2, MessageCircle, Users, IndianRupee } from "lucide-react";

export default function ReferPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const referralUrl = code ? `https://trustandtrip.com?ref=${code}` : "";

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/referral", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.code) setCode(data.code);
    else setError(data.error ?? "Failed to generate code.");
    setLoading(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const waShare = `https://wa.me/?text=${encodeURIComponent(`Hey! 🌍 I'm using Trust and Trip for my next vacation — they craft amazing handpicked trips!\n\nUse my link and get ₹500 off your first booking:\n${referralUrl}`)}`;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="container-custom max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="h-16 w-16 rounded-2xl bg-gold/15 flex items-center justify-center mx-auto mb-5">
            <Gift className="h-8 w-8 text-gold" />
          </div>
          <span className="eyebrow">Referral Program</span>
          <h1 className="mt-3 font-display text-display-md font-medium text-balance">
            Share the joy of travel,
            <span className="italic text-gold font-light"> earn rewards.</span>
          </h1>
          <p className="mt-4 text-ink/60 leading-relaxed max-w-md mx-auto">
            Refer a friend to Trust and Trip. When they book, you both get ₹500 off — no limit on referrals.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: Share2, step: "1", title: "Get your link", desc: "Create your unique referral link below" },
            { icon: Users, step: "2", title: "Share it", desc: "Send to friends via WhatsApp, chat, or socials" },
            { icon: IndianRupee, step: "3", title: "Both save ₹500", desc: "You and your friend get ₹500 off next booking" },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="bg-white rounded-2xl p-5 border border-ink/6 text-center">
              <div className="h-10 w-10 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-3">
                <Icon className="h-5 w-5 text-gold" />
              </div>
              <p className="font-display text-lg font-medium">{title}</p>
              <p className="text-xs text-ink/50 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {!code ? (
          <div className="bg-white rounded-2xl border border-ink/8 p-7">
            <h2 className="font-display text-xl font-medium mb-5">Get your referral link</h2>
            <form onSubmit={generate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-ink/50 block mb-1.5">Full Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Rahul Mehta" className="input-travel" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-ink/50 block mb-1.5">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com" className="input-travel" />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-ink/50 block mb-1.5">Phone (optional)</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210" className="input-travel" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3.5">
                {loading ? "Generating…" : "Generate My Link"}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-ink/8 p-7">
            <div className="text-center mb-6">
              <p className="text-sm text-ink/50 mb-1">Your referral code</p>
              <p className="font-display text-4xl font-medium text-gold tracking-wider">{code}</p>
            </div>

            <div className="bg-cream rounded-xl p-4 border border-ink/6 mb-4">
              <p className="text-xs text-ink/40 mb-1.5">Your referral link</p>
              <p className="text-sm font-medium text-ink break-all">{referralUrl}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={copy}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors border ${
                  copied ? "bg-green-50 border-green-200 text-green-700" : "border-ink/15 text-ink hover:bg-ink/5"
                }`}>
                {copied ? <><Check className="h-4 w-4" />Copied!</> : <><Copy className="h-4 w-4" />Copy Link</>}
              </button>
              <a href={waShare} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[#25D366] text-white hover:bg-[#20ba5a] transition-colors">
                <MessageCircle className="h-4 w-4 fill-white" />Share on WhatsApp
              </a>
            </div>

            <p className="text-center text-xs text-ink/40 mt-4">
              Share this link with friends. When they book, you both save ₹500!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
