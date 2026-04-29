import { createClient } from "@supabase/supabase-js";

export interface ApprovedReview {
  id: string;
  reviewer_name: string;
  reviewer_location?: string | null;
  rating: number;
  title?: string | null;
  body: string;
  travel_type?: string | null;
  travel_date?: string | null;
  created_at: string;
}

let _client: ReturnType<typeof createClient> | null = null;
function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _client ??= createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

/**
 * Server-side fetcher used for JSON-LD seeding on the package detail page.
 * Returns at most `limit` approved reviews. Returns [] when Supabase env
 * vars are absent or the query fails — never throws.
 */
export async function getApprovedReviewsForSchema(
  packageSlug: string,
  limit = 8
): Promise<ApprovedReview[]> {
  const c = client();
  if (!c) return [];
  try {
    const { data, error } = await c
      .from("reviews")
      .select("id, reviewer_name, reviewer_location, rating, title, body, travel_type, travel_date, created_at")
      .eq("package_slug", packageSlug)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data as ApprovedReview[]) ?? [];
  } catch {
    return [];
  }
}
