"use client";

import { useState } from "react";
import { Star, Send, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  packageSlug: string;
  packageTitle: string;
}

export default function ReviewForm({ packageSlug, packageTitle }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    reviewer_name: "",
    reviewer_email: "",
    reviewer_location: "",
    title: "",
    review_body: "",
    travel_type: "",
    travel_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setErrorMsg("Please select a rating."); return; }
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rating, package_slug: packageSlug, package_title: packageTitle }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error ?? "Failed to submit."); setState("error"); return; }
      setState("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="bg-cream rounded-2xl p-8 border border-ink/5 text-center">
        <CheckCircle2 className="h-10 w-10 text-gold mx-auto mb-3" />
        <h3 className="font-display text-xl font-medium mb-2">Thank you for your review!</h3>
        <p className="text-sm text-ink/60">It will appear after a quick review by our team (usually within 24 hours).</p>
      </div>
    );
  }

  return (
    <div className="bg-cream rounded-2xl border border-ink/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-ink/2 transition-colors"
      >
        <div>
          <p className="font-display text-lg font-medium">Write a Review</p>
          <p className="text-sm text-ink/50 mt-0.5">Share your experience to help other travelers</p>
        </div>
        <span className={`text-gold transition-transform duration-200 text-lg ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 border-t border-ink/6 pt-5">
          {/* Star rating */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.15em] text-ink/50 mb-2">Your Rating *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-110">
                  <Star className={`h-8 w-8 transition-colors ${s <= (hover || rating) ? "fill-gold text-gold" : "text-ink/20"}`} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-ink/50 mt-1">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Your Name *">
              <input required value={form.reviewer_name} onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })}
                placeholder="Rahul Mehta" className="input-travel" />
            </Field>
            <Field label="Email * (not shown publicly)">
              <input required type="email" value={form.reviewer_email} onChange={(e) => setForm({ ...form, reviewer_email: e.target.value })}
                placeholder="you@example.com" className="input-travel" />
            </Field>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Your City">
              <input value={form.reviewer_location} onChange={(e) => setForm({ ...form, reviewer_location: e.target.value })}
                placeholder="Mumbai, India" className="input-travel" />
            </Field>
            <Field label="Travel Type">
              <select value={form.travel_type} onChange={(e) => setForm({ ...form, travel_type: e.target.value })} className="input-travel">
                <option value="">Select</option>
                {["Couple", "Family", "Group", "Solo"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Month of Travel">
              <input value={form.travel_date} onChange={(e) => setForm({ ...form, travel_date: e.target.value })}
                placeholder="e.g. Jan 2026" className="input-travel" />
            </Field>
          </div>

          <Field label="Review Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Best honeymoon trip ever!" className="input-travel" />
          </Field>

          <Field label="Your Review *">
            <textarea required rows={4} minLength={20} value={form.review_body}
              onChange={(e) => setForm({ ...form, review_body: e.target.value })}
              placeholder="Tell others about your experience — the highlights, hotels, food, service..."
              className="input-travel resize-none" />
            <p className="text-[10px] text-ink/35 mt-1">Min. 20 characters · {form.review_body.length} typed</p>
          </Field>

          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

          <button type="submit" disabled={state === "loading"}
            className="btn-primary w-full justify-center !py-3.5">
            {state === "loading" ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>
            ) : (
              <><Send className="h-4 w-4" />Submit Review</>
            )}
          </button>
          <p className="text-[11px] text-ink/40 text-center">Reviews are moderated before publishing (24–48 hrs).</p>
        </form>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.15em] text-ink/50 font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}
