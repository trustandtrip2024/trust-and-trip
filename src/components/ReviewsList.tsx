"use client";

import { useEffect, useState } from "react";
import { Star, ThumbsUp, MapPin, Calendar } from "lucide-react";

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_location?: string;
  rating: number;
  title?: string;
  body: string;
  travel_type?: string;
  travel_date?: string;
  helpful_count: number;
  created_at: string;
}

interface Props {
  packageSlug: string;
  initialCount?: number;
  initialRating?: number;
}

export default function ReviewsList({ packageSlug, initialCount = 0, initialRating }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState<string | null>(initialRating ? String(initialRating) : null);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(true);
  const [helpedIds, setHelpedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/reviews?slug=${packageSlug}`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews ?? []);
        if (d.avg) setAvg(d.avg);
        setCount(d.count ?? 0);
      })
      .finally(() => setLoading(false));
  }, [packageSlug]);

  const markHelpful = async (id: string) => {
    if (helpedIds.has(id)) return;
    setHelpedIds((s) => new Set([...s, id]));
    setReviews((rs) => rs.map((r) => r.id === id ? { ...r, helpful_count: r.helpful_count + 1 } : r));
    await fetch("/api/reviews/helpful", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-tat-charcoal/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-tat-paper rounded-2xl p-8 border border-tat-charcoal/5 text-center">
        <p className="text-tat-charcoal/40 text-sm">No reviews yet — be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      {avg && (
        <div className="flex items-center gap-5 bg-tat-paper rounded-2xl p-5 border border-tat-charcoal/5">
          <div className="text-center">
            <p className="font-display text-5xl font-medium text-tat-gold">{avg}</p>
            <div className="flex gap-0.5 mt-1 justify-center">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(Number(avg)) ? "fill-tat-gold text-tat-gold" : "text-tat-charcoal/20"}`} />
              ))}
            </div>
            <p className="text-[11px] text-tat-charcoal/40 mt-1">{count} review{count !== 1 ? "s" : ""}</p>
          </div>

          {/* Rating distribution */}
          <div className="flex-1 space-y-1">
            {[5,4,3,2,1].map((s) => {
              const n = reviews.filter((r) => r.rating === s).length;
              const pct = count ? Math.round((n / count) * 100) : 0;
              return (
                <div key={s} className="flex items-center gap-2">
                  <span className="text-[11px] text-tat-charcoal/40 w-3">{s}</span>
                  <Star className="h-3 w-3 fill-tat-gold text-tat-gold shrink-0" />
                  <div className="flex-1 h-1.5 bg-tat-charcoal/8 rounded-full overflow-hidden">
                    <div className="h-full bg-tat-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] text-tat-charcoal/40 w-6 text-right">{n}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review cards */}
      {reviews.map((r) => (
        <div key={r.id} className="bg-white rounded-2xl p-5 border border-tat-charcoal/6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-tat-gold/15 flex items-center justify-center shrink-0">
                <span className="font-display font-semibold text-tat-gold text-sm">
                  {r.reviewer_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm text-tat-charcoal">{r.reviewer_name}</p>
                <div className="flex items-center gap-2 text-[11px] text-tat-charcoal/40 mt-0.5">
                  {r.reviewer_location && (
                    <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{r.reviewer_location}</span>
                  )}
                  {r.travel_type && <span>· {r.travel_type}</span>}
                  {r.travel_date && (
                    <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />{r.travel_date}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-0.5 shrink-0">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-tat-gold text-tat-gold" : "text-tat-charcoal/15"}`} />
              ))}
            </div>
          </div>

          {r.title && <p className="font-medium text-sm text-tat-charcoal mb-1">{r.title}</p>}
          <p className="text-sm text-tat-charcoal/70 leading-relaxed">{r.body}</p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-tat-charcoal/5">
            <span className="text-[11px] text-tat-charcoal/35">
              {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <button
              onClick={() => markHelpful(r.id)}
              disabled={helpedIds.has(r.id)}
              className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                helpedIds.has(r.id)
                  ? "bg-tat-gold/10 border-tat-gold/30 text-tat-gold"
                  : "border-tat-charcoal/10 text-tat-charcoal/40 hover:border-tat-charcoal/25 hover:text-tat-charcoal"
              }`}
            >
              <ThumbsUp className="h-3 w-3" />
              Helpful {r.helpful_count > 0 && `(${r.helpful_count})`}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
