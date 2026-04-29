import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Star, ExternalLink, MapPin, Calendar, MessageCircleHeart, ShieldCheck, Award } from "lucide-react";
import { fetchGoogleReviews, type GoogleReview } from "@/lib/google-reviews";
import { createClient } from "@supabase/supabase-js";
import IntentAnchor from "@/components/IntentAnchor";

export const revalidate = 1800; // 30 min — refresh as new approved reviews land

const SITE = "https://trustandtrip.com";

export const metadata: Metadata = {
  title: "Reviews — 4.9★ from 8,000+ travelers · Trust and Trip",
  description:
    "Real stories from travelers we've crafted trips for — Bali, Maldives, Kerala, Switzerland, Char Dham, and 18 more destinations. 4.9 on Google · 200+ verified reviews.",
  alternates: { canonical: `${SITE}/reviews` },
  openGraph: {
    type: "website",
    url: `${SITE}/reviews`,
    title: "Reviews — Trust and Trip",
    description: "4.9★ from 8,000+ travelers since 2019. Read what they say.",
    siteName: "Trust and Trip",
    images: [{ url: `${SITE}/og/reviews.jpg`, width: 1200, height: 630, alt: "Trust and Trip — verified reviews" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reviews — Trust and Trip",
    description: "4.9★ from 8,000+ travelers. Read every review.",
    images: [`${SITE}/og/reviews.jpg`],
  },
};

interface DbReview {
  id: string;
  package_slug: string;
  package_title: string | null;
  reviewer_name: string;
  reviewer_location: string | null;
  rating: number;
  title: string | null;
  body: string;
  travel_type: string | null;
  travel_date: string | null;
  created_at: string;
}

async function fetchApprovedReviews(): Promise<DbReview[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return [];

  const supa = createClient(url, anon);
  const { data, error } = await supa
    .from("reviews")
    .select("id, package_slug, package_title, reviewer_name, reviewer_location, rating, title, body, travel_type, travel_date, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    console.error("[reviews] supabase fetch failed:", error.message);
    return [];
  }
  return (data ?? []) as DbReview[];
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${cls} ${s <= rating ? "fill-tat-gold text-tat-gold" : "fill-tat-charcoal/10 text-tat-charcoal/10"}`} />
      ))}
    </div>
  );
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.max(1, Math.round((Date.now() - then) / 86_400_000));
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 30) return `${Math.round(days / 7)} week${days < 14 ? "" : "s"} ago`;
  if (days < 365) return `${Math.round(days / 30)} month${days < 60 ? "" : "s"} ago`;
  return `${Math.round(days / 365)} year${days < 730 ? "" : "s"} ago`;
}

export default async function ReviewsPage() {
  const [google, db] = await Promise.all([fetchGoogleReviews(), fetchApprovedReviews()]);

  const googleReviews: GoogleReview[] = google?.reviews ?? [];
  const googleRating = google?.rating ?? 4.9;
  const googleTotal = google?.user_ratings_total ?? 200;

  const totalReviews = googleTotal + db.length;
  const avgRating =
    db.length === 0
      ? googleRating
      : ((googleRating * googleTotal + db.reduce((s, r) => s + r.rating, 0)) / (googleTotal + db.length)).toFixed(1);

  // AggregateRating JSON-LD — drives Google rich snippets for the org.
  const orgWithRating = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Trust and Trip",
    url: SITE,
    image: `${SITE}/og/reviews.jpg`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: typeof avgRating === "string" ? avgRating : avgRating.toFixed(1),
      reviewCount: totalReviews,
      bestRating: 5,
      worstRating: 1,
    },
    review: db.slice(0, 12).map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      author: { "@type": "Person", name: r.reviewer_name },
      datePublished: new Date(r.created_at).toISOString().slice(0, 10),
      reviewBody: r.body,
      ...(r.title ? { name: r.title } : {}),
    })),
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Trust and Trip — Reviews",
    url: `${SITE}/reviews`,
    description: metadata.description,
    isPartOf: { "@type": "WebSite", url: SITE, name: "Trust and Trip" },
  };

  // Merge reviews chronologically — rough sort: GoogleReview.time is unix seconds.
  type Mixed =
    | (DbReview & { kind: "db"; ts: number })
    | (GoogleReview & { kind: "google"; ts: number; id: string });

  const mixed: Mixed[] = [
    ...db.map((r) => ({ ...r, kind: "db" as const, ts: new Date(r.created_at).getTime() / 1000 })),
    ...googleReviews.map((r, i) => ({
      ...r,
      kind: "google" as const,
      ts: r.time,
      id: `g-${r.time}-${i}`,
    })),
  ].sort((a, b) => b.ts - a.ts);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgWithRating) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 bg-tat-paper">
        <div className="container-custom max-w-4xl">
          <span className="eyebrow">Verified reviews</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] text-balance">
            Real travelers,
            <span className="italic text-tat-gold font-light"> real stories.</span>
          </h1>
          <p className="mt-5 text-tat-charcoal/65 max-w-2xl leading-relaxed">
            We've crafted trips for {totalReviews.toLocaleString("en-IN")}+ travelers since 2019.
            Every review you'll read here is from a real person who paid for and finished their trip.
          </p>

          {/* Summary card */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            <div className="rounded-2xl border border-tat-charcoal/8 bg-white p-5 flex flex-col gap-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-medium text-tat-charcoal">
                  {typeof avgRating === "string" ? avgRating : avgRating.toFixed(1)}
                </span>
                <Star className="h-4 w-4 fill-tat-gold text-tat-gold" />
              </div>
              <p className="text-xs text-tat-charcoal/55 uppercase tracking-wider">Average rating</p>
            </div>
            <div className="rounded-2xl border border-tat-charcoal/8 bg-white p-5 flex flex-col gap-1.5">
              <span className="font-display text-3xl font-medium text-tat-charcoal">{totalReviews.toLocaleString("en-IN")}+</span>
              <p className="text-xs text-tat-charcoal/55 uppercase tracking-wider">Reviews</p>
            </div>
            <div className="rounded-2xl border border-tat-charcoal/8 bg-white p-5 flex flex-col gap-1.5">
              <span className="font-display text-3xl font-medium text-tat-charcoal">8,000+</span>
              <p className="text-xs text-tat-charcoal/55 uppercase tracking-wider">Travelers since 2019</p>
            </div>
            <div className="rounded-2xl border border-tat-charcoal/8 bg-white p-5 flex flex-col gap-1.5">
              <span className="font-display text-3xl font-medium text-tat-charcoal">23</span>
              <p className="text-xs text-tat-charcoal/55 uppercase tracking-wider">Destinations</p>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-tat-charcoal/55">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-tat-gold" /> Verified after travel completes</span>
            <span className="inline-flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-tat-gold" /> Featured on Google + TripAdvisor</span>
            <a
              href="https://www.google.com/maps/search/Trust+And+Trip+Experiences+PVT+LTD"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-tat-charcoal underline-offset-4 hover:underline"
            >
              View on Google <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Reviews grid */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container-custom">
          {mixed.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16">
              <p className="font-display text-2xl text-tat-charcoal mb-3">Reviews are loading…</p>
              <p className="text-tat-charcoal/60">Check back shortly. Or <Link href="/" className="underline">browse our trips</Link>.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {mixed.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-tat-charcoal/8 bg-white p-6 flex flex-col gap-3 shadow-soft hover:shadow-hover transition-shadow"
                >
                  {/* Reviewer */}
                  <div className="flex items-center gap-3">
                    {r.kind === "google" && r.profile_photo_url ? (
                      <Image
                        src={r.profile_photo_url}
                        alt={r.author_name}
                        width={36}
                        height={36}
                        className="rounded-full ring-2 ring-tat-gold/15 object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-tat-gold/15 grid place-items-center font-display font-semibold text-tat-gold ring-2 ring-tat-gold/15">
                        {(r.kind === "google" ? r.author_name : r.reviewer_name).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-tat-charcoal truncate">
                        {r.kind === "google" ? r.author_name : r.reviewer_name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-tat-charcoal/45">
                        <span>{r.kind === "google" ? r.relative_time_description : relativeTime(r.created_at)}</span>
                        {r.kind === "db" && r.reviewer_location ? (
                          <>
                            <span aria-hidden>·</span>
                            <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" />{r.reviewer_location}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    {r.kind === "google" ? (
                      <span className="shrink-0 text-[10px] uppercase tracking-wider text-tat-slate font-medium">Google</span>
                    ) : null}
                  </div>

                  <StarRow rating={r.kind === "google" ? r.rating : r.rating} size="sm" />

                  {r.kind === "db" && r.title ? (
                    <p className="font-display text-base font-medium text-tat-charcoal leading-snug">{r.title}</p>
                  ) : null}

                  <p className="text-sm text-tat-charcoal/75 leading-relaxed line-clamp-6">
                    {r.kind === "google" ? r.text : r.body}
                  </p>

                  {/* Footer meta */}
                  {r.kind === "db" ? (
                    <div className="mt-auto pt-3 border-t border-tat-charcoal/6 flex flex-wrap items-center gap-3 text-[11px] text-tat-charcoal/55">
                      {r.package_slug ? (
                        <Link href={`/packages/${r.package_slug}`} className="inline-flex items-center gap-1 hover:text-tat-gold underline-offset-4 hover:underline">
                          {r.package_title ?? r.package_slug.replace(/-/g, " ")} →
                        </Link>
                      ) : null}
                      {r.travel_date ? (
                        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{r.travel_date}</span>
                      ) : null}
                      {r.travel_type ? (
                        <span className="inline-flex items-center gap-1 text-tat-charcoal/55">{r.travel_type}</span>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-tat-charcoal text-tat-paper py-14">
        <div className="container-custom max-w-3xl text-center">
          <span className="eyebrow text-tat-gold">Your trip next</span>
          <h2 className="mt-3 font-display text-display-md font-medium leading-tight text-balance">
            Become the next
            <span className="italic text-tat-gold font-light"> 5-star story.</span>
          </h2>
          <p className="mt-4 text-tat-paper/70 leading-relaxed">
            A real planner builds your itinerary in 24 hours. Free until you're sure.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/customize-trip" className="btn-primary">Plan my trip — free</Link>
            <IntentAnchor
              href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I%20just%20read%20your%20reviews%20and%20want%20to%20plan%20a%20trip."
              target="_blank"
              rel="noopener noreferrer"
              intent="whatsapp_click"
              metadata={{ note: "Reviews page — bottom CTA" }}
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3.5 rounded-full text-sm font-semibold transition-colors"
            >
              <MessageCircleHeart className="h-4 w-4" />
              Talk to a planner
            </IntentAnchor>
          </div>
          <p className="mt-5 text-xs text-tat-paper/45">
            8,000+ travelers since 2019 · {totalReviews.toLocaleString("en-IN")}+ verified reviews · 4.9★ on Google
          </p>
        </div>
      </section>
    </>
  );
}
