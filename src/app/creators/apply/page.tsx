"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import OAuthButtons from "@/components/OAuthButtons";

const AUDIENCE_BUCKETS = [
  "< 1k",
  "1k – 10k",
  "10k – 50k",
  "50k – 100k",
  "100k – 500k",
  "500k +",
];

const PAYOUT_OPTIONS = ["UPI", "Bank transfer", "PayPal (international)"];

export default function CreatorApplyPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    instagram_handle: "",
    audience_size: "",
    primary_content: "",
    why: "",
    payout_method: "UPI",
    payout_details: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim() || !form.instagram_handle.trim()) {
      setError("Name, email, phone and Instagram handle are required.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/creators/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setSubmitting(false);
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setSubmitting(false);
      setError("Network error. Try again.");
    }
  };

  if (done) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center bg-tat-paper px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-3xl border border-tat-charcoal/8 p-8 md:p-10 text-center shadow-soft">
          <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="font-display text-2xl font-medium text-tat-charcoal mb-2">Application received</h1>
          <p className="text-sm text-tat-charcoal/60 leading-relaxed mb-6">
            We&apos;ll review your audience and Instagram and get back within <strong>48 hours</strong>.
            If approved, you&apos;ll get your unique referral link + onboarding call invite.
          </p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-tat-gold hover:underline">
            Back to home <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[80vh] bg-tat-paper py-12 md:py-20">
      <div className="container-custom max-w-2xl">
        <Link href="/creators" className="inline-flex items-center gap-1.5 text-sm text-tat-charcoal/55 hover:text-tat-charcoal mb-6 group">
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to program
        </Link>

        <p className="eyebrow flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-tat-gold" />
          Creator application
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-medium text-tat-charcoal mt-2 leading-[1.1] mb-3">
          Tell us a bit about you.
        </h1>
        <p className="text-sm text-tat-charcoal/60 mb-8">
          Takes 2 minutes. Approval in 48 hours. We don&apos;t share your details with third parties.
        </p>

        {/* OAuth fast-path — pre-fills name/email from provider, marks the
            user role=creator so post-signup they land in /creators/dashboard. */}
        <div className="bg-white rounded-3xl border border-tat-charcoal/8 p-6 md:p-7 shadow-soft mb-5">
          <p className="text-[12px] uppercase tracking-[0.12em] text-tat-charcoal/55 mb-3">
            Skip the form — sign up in one click
          </p>
          <OAuthButtons
            next="/creators/dashboard"
            signUpMetadata={{ role: "creator" }}
          />
          <p className="mt-3 text-[11px] text-tat-charcoal/45 text-center">
            We&apos;ll still ask for your audience details once inside.
          </p>
        </div>

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-tat-charcoal/10" />
          <span className="text-[11px] uppercase tracking-[0.12em] text-tat-charcoal/40">
            or apply with full form
          </span>
          <span className="h-px flex-1 bg-tat-charcoal/10" />
        </div>

        <form onSubmit={submit} className="space-y-5 bg-white rounded-3xl border border-tat-charcoal/8 p-6 md:p-8 shadow-soft">
          {/* Personal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name *">
              <input type="text" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required className={INPUT} />
            </Field>
            <Field label="Phone / WhatsApp *">
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" required className={INPUT} />
            </Field>
            <Field label="Email *" full>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@inbox.com" required className={INPUT} />
            </Field>
          </div>

          {/* Instagram */}
          <div className="border-t border-tat-charcoal/8 pt-5">
            <p className="text-xs font-semibold text-tat-charcoal/60 uppercase tracking-wider mb-4">Instagram</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Handle *">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tat-charcoal/40 text-sm">@</span>
                  <input
                    type="text"
                    value={form.instagram_handle}
                    onChange={(e) => set("instagram_handle", e.target.value.replace(/^@/, ""))}
                    placeholder="yourhandle"
                    required
                    className={INPUT + " pl-7"}
                  />
                </div>
              </Field>
              <Field label="Audience size">
                <select value={form.audience_size} onChange={(e) => set("audience_size", e.target.value)} className={INPUT}>
                  <option value="">Select…</option>
                  {AUDIENCE_BUCKETS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="What do you mostly post?" full>
                <input
                  type="text"
                  value={form.primary_content}
                  onChange={(e) => set("primary_content", e.target.value)}
                  placeholder="e.g. solo backpacking · honeymoon vlogs · luxury reviews"
                  className={INPUT}
                />
              </Field>
            </div>
          </div>

          {/* Pitch */}
          <Field label="Why work with Trust and Trip? (optional)" full>
            <textarea
              value={form.why}
              onChange={(e) => set("why", e.target.value)}
              rows={3}
              placeholder="Anything you'd like us to know about your audience or how you'd promote us…"
              className={INPUT + " resize-none"}
            />
          </Field>

          {/* Payout */}
          <div className="border-t border-tat-charcoal/8 pt-5">
            <p className="text-xs font-semibold text-tat-charcoal/60 uppercase tracking-wider mb-4">Payout (we&apos;ll verify before first payment)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Method">
                <select value={form.payout_method} onChange={(e) => set("payout_method", e.target.value)} className={INPUT}>
                  {PAYOUT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label={form.payout_method === "UPI" ? "UPI ID" : form.payout_method === "PayPal (international)" ? "PayPal email" : "Account number"}>
                <input
                  type="text"
                  value={form.payout_details}
                  onChange={(e) => set("payout_details", e.target.value)}
                  placeholder={form.payout_method === "UPI" ? "name@upi" : form.payout_method === "PayPal (international)" ? "you@paypal.com" : "1234567890"}
                  className={INPUT}
                />
              </Field>
            </div>
            <p className="text-[11px] text-tat-charcoal/40 mt-2">You can update this later. Bank IFSC asked at first payout.</p>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2.5 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal py-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Submit application
          </button>
          <p className="text-center text-[11px] text-tat-charcoal/45">
            By submitting you agree to our partner T&amp;C — fair payout, no spam, mutual respect.
          </p>
        </form>
      </div>
    </section>
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
