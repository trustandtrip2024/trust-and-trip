"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, User, Lock, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

export default function ProfilePage() {
  const { user } = useUserStore();
  const [name, setName] = useState(user?.user_metadata?.full_name ?? "");
  const [phone, setPhone] = useState(user?.user_metadata?.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileOk, setProfileOk] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwOk, setPwOk] = useState(false);
  const [pwError, setPwError] = useState("");

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await supabase.auth.updateUser({ data: { full_name: name, phone } });
    setSavingProfile(false);
    setProfileOk(true);
    setTimeout(() => setProfileOk(false), 3000);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (newPw.length < 6) { setPwError("Password must be at least 6 characters."); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSavingPw(false);
    if (error) setPwError(error.message);
    else { setPwOk(true); setCurrentPw(""); setNewPw(""); setTimeout(() => setPwOk(false), 3000); }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-tat-charcoal/40 mb-1">Dashboard</p>
        <h1 className="font-display text-h2 font-medium text-tat-charcoal">Profile & Settings</h1>
        <p className="text-sm text-tat-charcoal/50 mt-1">Manage your account details.</p>
      </div>

      <div className="space-y-4">
        {/* Profile info */}
        <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 rounded-xl bg-tat-gold/10 flex items-center justify-center">
              <User className="h-4 w-4 text-tat-gold" />
            </div>
            <p className="text-sm font-semibold text-tat-charcoal">Personal Information</p>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 rounded-xl border border-tat-charcoal/15 bg-tat-paper text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl border border-tat-charcoal/15 bg-tat-paper text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-tat-charcoal/10 bg-tat-charcoal/3 text-sm text-tat-charcoal/50 cursor-not-allowed"
                />
                <p className="text-[11px] text-tat-charcoal/35 mt-1">Email cannot be changed.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 px-5 py-2.5 bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              >
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Changes
              </button>
              {profileOk && (
                <span className="flex items-center gap-1.5 text-sm text-tat-success-fg">
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-tat-charcoal/8 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 rounded-xl bg-tat-info-bg flex items-center justify-center">
              <Lock className="h-4 w-4 text-tat-info-fg" />
            </div>
            <p className="text-sm font-semibold text-tat-charcoal">Change Password</p>
          </div>

          <form onSubmit={changePassword} className="space-y-4 max-w-sm">
            <div>
              <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 6 characters"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-tat-charcoal/15 bg-tat-paper text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
              />
            </div>
            {pwError && <p className="text-xs text-tat-danger-fg">{pwError}</p>}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={savingPw}
                className="flex items-center gap-2 px-5 py-2.5 bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              >
                {savingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Update Password
              </button>
              {pwOk && (
                <span className="flex items-center gap-1.5 text-sm text-tat-success-fg">
                  <CheckCircle2 className="h-4 w-4" /> Updated
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-tat-danger-fg/15 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl bg-tat-danger-bg flex items-center justify-center">
              <Trash2 className="h-4 w-4 text-tat-danger-fg" />
            </div>
            <p className="text-sm font-semibold text-tat-charcoal">Danger Zone</p>
          </div>
          <p className="text-sm text-tat-charcoal/50 mb-4">
            To delete your account or request data export, contact us at{" "}
            <a href="mailto:hello@trustandtrip.com" className="text-tat-gold hover:underline">
              hello@trustandtrip.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
