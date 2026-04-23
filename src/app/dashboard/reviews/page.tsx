"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, CheckCircle2, Loader2, PenLine } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

interface Booking {
  id: string;
  package_slug: string;
  package_title: string;
  status: string;
}

interface FormState {
  rating: number;
  title: string;
  body: string;
  location: string;
  travel_type: string;
  travel_date: string;
}

export default function ReviewsPage() {
  const { user } = useUserStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string>("");
  const [form, setForm] = useState<FormState>({ rating: 5, title: "", body: "", location: "", travel_type: "", travel_date: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    async function load() {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) { setLoading(false); return; }
      const res = await fetch("/api/user/bookings", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const verified = (data.bookings ?? []).filter((b: Booking) => b.status === "verified");
      setBookings(verified);
      setLoading(false);
    }
    load();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent, booking: Booking) => {
    e.preventDefault();
    if (form.body.trim().length < 20) { setError("Review must be at least 20 characters."); return; }
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package_slug: booking.package_slug,
        package_title: booking.package_title,
        reviewer_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Traveller",
        reviewer_email: user?.email ?? "",
        reviewer_location: form.location,
        rating: form.rating,
        title: form.title,
        review_body: form.body,
        travel_type: form.travel_type,
        travel_date: form.travel_date,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      setSubmitted((s) => new Set([...s, booking.package_slug]));
      setActiveSlug("");
      setForm({ rating: 5, title: "", body: "", location: "", travel_type: "", travel_date: "" });
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to submit review.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">Dashboard</p>
        <h1 className="font-display text-2xl font-medium text-ink">My Reviews</h1>
        <p className="text-sm text-ink/50 mt-1">Share your experience — only confirmed bookings eligible.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-ink/30" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink/8 p-10 text-center">
          <PenLine className="h-10 w-10 text-ink/20 mx-auto mb-3" />
          <p className="font-medium text-ink">No confirmed bookings yet</p>
          <p className="text-sm text-ink/45 mt-1 mb-5">Reviews are available after your booking is confirmed.</p>
          <Link href="/packages" className="inline-flex items-center gap-2 bg-ink text-cream px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gold hover:text-ink transition-all">
            Browse experiences
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const done = submitted.has(booking.package_slug);
            const open = activeSlug === booking.package_slug;
            return (
              <div key={booking.id} className="bg-white rounded-2xl border border-ink/8 overflow-hidden">
                <div className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-base font-medium text-ink">{booking.package_title}</h3>
                    {done && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-green-600 mt-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Review submitted (pending approval)
                      </span>
                    )}
                  </div>
                  {!done && (
                    <button
                      onClick={() => setActiveSlug(open ? "" : booking.package_slug)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-ink/15 text-sm font-medium text-ink/70 hover:bg-ink hover:text-cream hover:border-ink transition-all shrink-0"
                    >
                      <PenLine className="h-4 w-4" />
                      {open ? "Cancel" : "Write Review"}
                    </button>
                  )}
                </div>

                {open && !done && (
                  <form onSubmit={(e) => handleSubmit(e, booking)} className="px-5 pb-5 border-t border-ink/5 pt-4 space-y-4">
                    {/* Star rating */}
                    <div>
                      <label className="block text-xs font-medium text-ink/60 mb-2">Rating *</label>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((n) => (
                          <button key={n} type="button" onClick={() => setForm((f) => ({ ...f, rating: n }))}>
                            <Star className={`h-7 w-7 transition-colors ${n <= form.rating ? "fill-gold text-gold" : "text-ink/20"}`} />
                          </button>
                        ))}
                        <span className="ml-2 text-sm font-medium text-ink">{form.rating}/5</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-ink/60 mb-1.5">Review Title</label>
                        <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                          placeholder="Summarise your experience"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink/60 mb-1.5">Your City</label>
                        <input type="text" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                          placeholder="e.g. Delhi"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink/60 mb-1.5">Travel Type</label>
                        <select value={form.travel_type} onChange={(e) => setForm((f) => ({ ...f, travel_type: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition">
                          <option value="">Select…</option>
                          {["Couple","Family","Solo","Group","Friends"].map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-ink/60 mb-1.5">Your Review *</label>
                        <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                          rows={4} placeholder="Tell others about your experience — what you loved, tips, highlights…"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition resize-none" />
                        <p className="text-[11px] text-ink/35 mt-1">{form.body.length}/min 20 characters</p>
                      </div>
                    </div>

                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <button type="submit" disabled={submitting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-ink hover:bg-gold text-cream hover:text-ink rounded-xl text-sm font-semibold transition-all disabled:opacity-60">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Submit Review
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
