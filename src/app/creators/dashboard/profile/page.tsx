"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, User, Wallet } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

interface Creator {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  instagram_handle: string | null;
  ref_code: string;
  commission_pct: number;
  payout_method: string | null;
  payout_details: { raw?: string } | null;
}

const PAYOUT_OPTIONS = ["UPI", "Bank transfer", "PayPal (international)"];

export default function CreatorProfilePage() {
  const { user } = useUserStore();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("UPI");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileOk, setProfileOk] = useState(false);

  const [newPw, setNewPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwOk, setPwOk] = useState(false);
  const [pwError, setPwError] = useState("");

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
        setFullName(d.creator.full_name ?? "");
        setPhone(d.creator.phone ?? "");
        setInstagram(d.creator.instagram_handle ?? "");
        setPayoutMethod(d.creator.payout_method ?? "UPI");
        setPayoutDetails(d.creator.payout_details?.raw ?? "");
      }
      setLoading(false);
    })();
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const sess = await supabase.auth.getSession();
    const token = sess.data.session?.access_token;
    if (!token) { setSavingProfile(false); return; }
    await fetch("/api/creator/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        full_name: fullName,
        phone,
        instagram_handle: instagram.replace(/^@/, ""),
        payout_method: payoutMethod,
        payout_details: payoutDetails || null,
      }),
    });
    setSavingProfile(false);
    setProfileOk(true);
    setTimeout(() => setProfileOk(false), 3000);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSavingPw(false);
    if (error) setPwError(error.message);
    else { setPwOk(true); setNewPw(""); setTimeout(() => setPwOk(false), 3000); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-tat-charcoal/30" /></div>;
  }
  if (!creator) return null;

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-tat-charcoal/40 mb-1">Creator dashboard</p>
        <h1 className="font-display text-2xl font-medium text-tat-charcoal">Profile & payout</h1>
        <p className="text-sm text-tat-charcoal/55 mt-1">Update your details and how you want to get paid.</p>
      </div>

      <div className="space-y-4">
        {/* Personal */}
        <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-tat-charcoal/8 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 rounded-xl bg-tat-gold/10 flex items-center justify-center">
              <User className="h-4 w-4 text-tat-gold" />
            </div>
            <p className="text-sm font-semibold text-tat-charcoal">Personal</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name">
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={INPUT} />
            </Field>
            <Field label="Phone / WhatsApp">
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} />
            </Field>
            <Field label="Email" full>
              <input type="email" value={creator.email} disabled className={INPUT + " opacity-60 cursor-not-allowed"} />
            </Field>
            <Field label="Instagram handle" full>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tat-charcoal/40 text-sm">@</span>
                <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))} className={INPUT + " pl-7"} />
              </div>
            </Field>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button type="submit" disabled={savingProfile} className="flex items-center gap-2 px-5 py-2.5 bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal rounded-xl text-sm font-semibold transition-all disabled:opacity-60">
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save changes
            </button>
            {profileOk && <span className="flex items-center gap-1.5 text-sm text-tat-teal"><CheckCircle2 className="h-4 w-4" />Saved</span>}
          </div>
        </form>

        {/* Payout */}
        <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-tat-charcoal/8 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-tat-teal" />
            </div>
            <p className="text-sm font-semibold text-tat-charcoal">Payout details</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Method">
              <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} className={INPUT}>
                {PAYOUT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label={payoutMethod === "UPI" ? "UPI ID" : payoutMethod === "PayPal (international)" ? "PayPal email" : "Account number"}>
              <input type="text" value={payoutDetails} onChange={(e) => setPayoutDetails(e.target.value)} className={INPUT + " font-mono"} />
            </Field>
          </div>
          <p className="text-[11px] text-tat-charcoal/45 mt-3">
            For bank transfers, IFSC + account name will be requested at first payout.
          </p>
        </form>

        {/* Ref code */}
        <div className="bg-tat-gold/8 border border-tat-gold/20 rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-tat-charcoal/55 mb-1">Your code</p>
          <p className="font-display text-2xl font-medium text-tat-charcoal font-mono">{creator.ref_code}</p>
          <p className="text-xs text-tat-charcoal/55 mt-1">{creator.commission_pct}% commission per booking · cannot be changed</p>
        </div>

        {/* Change password */}
        <form onSubmit={changePassword} className="bg-white rounded-2xl border border-tat-charcoal/8 p-5 md:p-6">
          <p className="text-sm font-semibold text-tat-charcoal mb-5">Change password</p>
          <div className="max-w-sm">
            <Field label="New password">
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 8 characters" required className={INPUT} />
            </Field>
            {pwError && <p className="text-xs text-red-500 mt-2">{pwError}</p>}
            <div className="mt-4 flex items-center gap-3">
              <button type="submit" disabled={savingPw} className="flex items-center gap-2 px-5 py-2.5 bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal rounded-xl text-sm font-semibold transition-all disabled:opacity-60">
                {savingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Update password
              </button>
              {pwOk && <span className="flex items-center gap-1.5 text-sm text-tat-teal"><CheckCircle2 className="h-4 w-4" />Updated</span>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const INPUT = "w-full px-4 py-2.5 rounded-xl border border-tat-charcoal/15 bg-tat-paper text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition";

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-medium text-tat-charcoal/65 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
