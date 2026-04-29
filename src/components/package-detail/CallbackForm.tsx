"use client";

import { useState } from "react";
import { Phone, Loader2, CheckCircle2 } from "lucide-react";
import { submitLead } from "@/lib/submit-lead";

interface Props {
  packageTitle: string;
  packageSlug: string;
}

/**
 * Compact "Want us to call you?" panel — pinned inside the package detail
 * as a low-commitment lead capture. Submits through the standard
 * /api/leads pipeline so the lead lands in Supabase + Bitrix + alerting,
 * tagged with source `package_enquiry` and the package context.
 */
export default function CallbackForm({ packageTitle, packageSlug }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setBusy(true);
    setErr(null);
    const res = await submitLead({
      name: name.trim(),
      email: "",
      phone: phone.trim(),
      package_title: packageTitle,
      package_slug: packageSlug,
      source: "package_enquiry",
      message: `Callback requested for ${packageTitle}`,
    }).catch(() => ({ ok: false, error: "Network error" } as const));
    setBusy(false);
    if (res.ok) setDone(true);
    else setErr(res.error ?? "Could not submit. Please try again.");
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-400/30 p-5 flex items-center gap-3">
        <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
        <div>
          <p className="font-medium text-green-800 dark:text-green-200">
            Got it — a planner will call you shortly.
          </p>
          <p className="text-xs text-green-700/80 dark:text-green-200/70 mt-0.5">
            8 AM – 10 PM, 6 days a week. Usually within 30 minutes during work hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-tat-charcoal/8 dark:border-white/10 bg-white dark:bg-white/5 p-5 md:p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-3">
        <span className="grid place-items-center h-9 w-9 rounded-full bg-tat-gold/10 dark:bg-tat-gold/15">
          <Phone className="h-4 w-4 text-tat-gold dark:text-tat-gold" />
        </span>
        <div>
          <p className="font-display text-[16px] md:text-[17px] font-medium text-tat-charcoal dark:text-tat-paper leading-tight">
            Want us to call you?
          </p>
          <p className="text-[11px] text-tat-charcoal/55 dark:text-tat-paper/55">
            A planner — not a call centre.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.16em] text-tat-charcoal/55 dark:text-tat-paper/55 font-medium mb-1">
            Full name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your full name"
            className="w-full bg-tat-charcoal/[0.04] dark:bg-white/8 border border-tat-charcoal/10 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tat-gold/40 dark:focus:ring-tat-gold/40"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-[0.16em] text-tat-charcoal/55 dark:text-tat-paper/55 font-medium mb-1">
            Mobile no.
          </label>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-3 rounded-xl bg-tat-charcoal/[0.04] dark:bg-white/8 border border-tat-charcoal/10 dark:border-white/15 text-sm text-tat-charcoal/70 dark:text-tat-paper/75 font-medium">
              🇮🇳 +91
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              type="tel"
              inputMode="tel"
              placeholder="98765 43210"
              className="flex-1 bg-tat-charcoal/[0.04] dark:bg-white/8 border border-tat-charcoal/10 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tat-gold/40 dark:focus:ring-tat-gold/40"
            />
          </div>
        </div>
        {err && <p className="text-xs text-red-500">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 bg-tat-teal text-white font-semibold py-3 rounded-xl hover:bg-tat-teal-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Phone className="h-4 w-4" />
              Request callback
            </>
          )}
        </button>
        <p className="text-[10.5px] text-tat-charcoal/45 dark:text-tat-paper/50 text-center">
          By submitting you agree to our privacy policy. No spam, no card needed.
        </p>
      </form>
    </div>
  );
}
