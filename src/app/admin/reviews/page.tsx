export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import ReviewsAdmin from "./ReviewsAdmin";

async function getReviews() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}

export default async function AdminReviewsPage() {
  const reviews = await getReviews();
  const pending = reviews.filter((r) => r.status === "pending").length;
  const approved = reviews.filter((r) => r.status === "approved").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-tat-charcoal">Reviews Moderation</h1>
            <p className="text-tat-slate text-sm mt-1">Approve or reject customer reviews</p>
          </div>
          <div className="flex gap-3">
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium">
              {pending} pending
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
              {approved} approved
            </span>
          </div>
        </div>
        <ReviewsAdmin reviews={reviews} />
      </div>
    </div>
  );
}
