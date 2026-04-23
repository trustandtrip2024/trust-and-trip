"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

export interface Traveller {
  id?: string;
  full_name: string;
  relation: string;
  dob: string;
  gender: string;
  nationality: string;
  passport_number: string;
  passport_expiry: string;
  notes: string;
}

interface Props {
  existing?: Traveller | null;
  onClose: () => void;
  onSaved: (t: Traveller) => void;
}

const RELATIONS = ["self", "spouse", "child", "parent", "sibling", "friend", "colleague"];
const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function TravellerForm({ existing, onClose, onSaved }: Props) {
  const { user } = useUserStore();
  const [form, setForm] = useState<Traveller>(existing ?? {
    full_name: "",
    relation: "self",
    dob: "",
    gender: "",
    nationality: "Indian",
    passport_number: "",
    passport_expiry: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof Traveller>(k: K, v: Traveller[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.full_name.trim()) { setError("Name is required."); return; }
    setError("");
    setSaving(true);

    const payload = {
      user_id: user.id,
      full_name: form.full_name.trim(),
      relation: form.relation || null,
      dob: form.dob || null,
      gender: form.gender || null,
      nationality: form.nationality || null,
      passport_number: form.passport_number || null,
      passport_expiry: form.passport_expiry || null,
      notes: form.notes || null,
    };

    if (existing?.id) {
      const { data, error } = await supabase
        .from("user_travellers")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
      setSaving(false);
      if (error) { setError(error.message); return; }
      onSaved(data);
    } else {
      const { data, error } = await supabase
        .from("user_travellers")
        .insert(payload)
        .select()
        .single();
      setSaving(false);
      if (error) { setError(error.message); return; }
      onSaved(data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-soft-lg max-w-lg w-full max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-ink/8 sticky top-0 bg-white z-10">
          <h2 className="font-display text-lg font-medium text-ink">
            {existing ? "Edit traveller" : "Add a traveller"}
          </h2>
          <button onClick={onClose} aria-label="Close" className="h-8 w-8 rounded-full bg-ink/5 hover:bg-ink/10 flex items-center justify-center text-ink/60">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={save} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink/65 mb-1.5">Full name *</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="As on passport / ID"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/65 mb-1.5">Relation</label>
              <select
                value={form.relation}
                onChange={(e) => set("relation", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
              >
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/65 mb-1.5">Date of birth</label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => set("dob", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/65 mb-1.5">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
              >
                <option value="">Select…</option>
                {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/65 mb-1.5">Nationality</label>
              <input
                type="text"
                value={form.nationality}
                onChange={(e) => set("nationality", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
              />
            </div>
          </div>

          <div className="border-t border-ink/8 pt-4">
            <p className="text-xs font-semibold text-ink/60 uppercase tracking-wider mb-3">Passport (optional)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink/65 mb-1.5">Passport number</label>
                <input
                  type="text"
                  value={form.passport_number}
                  onChange={(e) => set("passport_number", e.target.value.toUpperCase())}
                  placeholder="K12345678"
                  className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink/65 mb-1.5">Expiry date</label>
                <input
                  type="date"
                  value={form.passport_expiry}
                  onChange={(e) => set("passport_expiry", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink/65 mb-1.5">Notes <span className="text-ink/35">(dietary, medical, preferences)</span></label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder="Vegetarian · lactose-intolerant · wheelchair-accessible…"
              className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-ink hover:bg-gold text-cream hover:text-ink py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {existing ? "Save changes" : "Add traveller"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-sm font-medium text-ink/60 hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
