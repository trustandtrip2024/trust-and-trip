"use client";

import { useState } from "react";
import { Star, Check, X, Clock } from "lucide-react";

type Review = {
  id: string;
  package_slug: string;
  package_title?: string;
  reviewer_name: string;
  reviewer_email: string;
  reviewer_location?: string;
  rating: number;
  title?: string;
  body: string;
  travel_type?: string;
  travel_date?: string;
  status: string;
  helpful_count: number;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-600",
};

export default function ReviewsAdmin({ reviews: initial }: { reviews: Review[] }) {
  const [reviews, setReviews] = useState(initial);
  const [filter, setFilter] = useState("pending");

  const filtered = reviews.filter((r) => filter === "all" || r.status === filter);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) setReviews((rs) => rs.map((r) => r.id === id ? { ...r, status } : r));
  };

  return (
    <>
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === s ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
            No {filter} reviews
          </div>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <span className="font-semibold text-gray-900">{r.reviewer_name}</span>
                  <span className="text-xs text-gray-400">{r.reviewer_email}</span>
                  {r.reviewer_location && <span className="text-xs text-gray-400">· {r.reviewer_location}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status]}`}>
                    {r.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{r.package_title ?? r.package_slug}</span>
                  {r.travel_type && <span className="text-xs text-gray-400">· {r.travel_type}</span>}
                  {r.travel_date && <span className="text-xs text-gray-400">· {r.travel_date}</span>}
                </div>

                {r.title && <p className="font-medium text-gray-800 text-sm mb-1">{r.title}</p>}
                <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(r.created_at).toLocaleString("en-IN")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                {r.status !== "approved" && (
                  <button onClick={() => updateStatus(r.id, "approved")}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                    <Check className="h-3.5 w-3.5" />Approve
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button onClick={() => updateStatus(r.id, "rejected")}
                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                    <X className="h-3.5 w-3.5" />Reject
                  </button>
                )}
                {r.status !== "pending" && (
                  <button onClick={() => updateStatus(r.id, "pending")}
                    className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                    <Clock className="h-3.5 w-3.5" />Pending
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
