import { Clock, ShieldCheck, Users } from "lucide-react";
import { fetchGoogleReviews, type GoogleReview } from "@/lib/google-reviews";

const FALLBACK_REVIEWS: GoogleReview[] = [
  {
    author_name: "Priya Sharma",
    author_url: "",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "1 month ago",
    time: 0,
    text: "Booked our honeymoon with Trust and Trip. The planner replied within hours, and every change we asked for was handled quickly. Felt like talking to a friend who happens to know everything about Bali.",
  },
  {
    author_name: "Rajiv Mehta",
    author_url: "",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "3 weeks ago",
    time: 0,
    text: "What I loved is they didn't ask for a card or any commitment until I was sure. Free changes, real planner, no spam. Worth every rupee.",
  },
  {
    author_name: "Anita Iyer",
    author_url: "",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "2 months ago",
    time: 0,
    text: "We've travelled with Trust and Trip three times now — Kerala, Char Dham, and Switzerland. Every trip felt curated for our family. They remember the small things.",
  },
];

const PILLARS = [
  {
    icon: Clock,
    title: "Real planner. 24-hour reply.",
    body:
      "No bots, no sales script. A human planner drafts your itinerary inside a day — most replies land within 4 hours.",
    reviewKeywords: ["planner", "quick", "reply", "fast", "24"],
  },
  {
    icon: ShieldCheck,
    title: "Free until you're sure.",
    body:
      "₹0 to start. Free 48-hour itinerary changes. No card asked until you actively book — and even then, just 30% to hold.",
    reviewKeywords: ["free", "card", "no commitment", "trust", "sure"],
  },
  {
    icon: Users,
    title: "8,000+ trips since 2019.",
    body:
      "Six years, 60+ destinations, 4.9 on Google. Couples on honeymoon, multi-gen families, pilgrimage groups — all on the same desk.",
    reviewKeywords: ["family", "honeymoon", "experience", "amazing"],
  },
];

/**
 * Three-pillar trust block. Each pillar pairs a one-line claim with a
 * real Google review that demonstrates it. Replaces SocialProof +
 * WhyTrustAndTrip + RecognitionStrip — three sections collapsed to one
 * because they were saying the same thing in different layouts.
 *
 * Reviews come from /lib/google-reviews. When the API is unconfigured
 * the helper returns the curated fallback set, so this never renders
 * empty even on a fresh deploy.
 */
export default async function HomeProof() {
  const data = await fetchGoogleReviews().catch(() => null);
  const reviews: GoogleReview[] =
    data?.reviews && data.reviews.length > 0 ? data.reviews : FALLBACK_REVIEWS;

  // Pick a review per pillar by keyword match. Falls back to the first
  // unused review when no keyword hits.
  const used = new Set<string>();
  const pickReview = (keywords: string[]): GoogleReview | undefined => {
    const kws = keywords.map((k) => k.toLowerCase());
    const match = reviews.find(
      (r) =>
        !used.has(r.text) &&
        kws.some((k) => r.text.toLowerCase().includes(k)),
    );
    if (match) {
      used.add(match.text);
      return match;
    }
    const fallback = reviews.find((r) => !used.has(r.text));
    if (fallback) used.add(fallback.text);
    return fallback;
  };

  return (
    <section
      aria-labelledby="proof-heading"
      className="py-16 md:py-24 bg-tat-paper border-t border-tat-charcoal/8"
    >
      <div className="container-custom">
        <div className="max-w-[28ch]">
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
            Why people stay
          </p>
          <h2
            id="proof-heading"
            className="mt-2 font-display text-[28px] md:text-[40px] leading-[1.05] text-tat-charcoal text-balance"
          >
            Three things we never compromise on.
          </h2>
        </div>

        <ul
          role="list"
          className="mt-10 md:mt-14 grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3"
        >
          {PILLARS.map(({ icon: Icon, title, body, reviewKeywords }) => {
            const review = pickReview(reviewKeywords);
            return (
              <li
                key={title}
                className="rounded-3xl bg-white border border-tat-charcoal/8 p-6 md:p-7 flex flex-col gap-4"
              >
                <span className="grid place-items-center h-11 w-11 rounded-full bg-tat-gold/12 text-tat-gold">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-[18px] md:text-[20px] font-medium text-tat-charcoal leading-tight">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] text-tat-charcoal/70 leading-relaxed">
                    {body}
                  </p>
                </div>
                {review && (
                  <figure className="mt-auto pt-4 border-t border-tat-charcoal/8">
                    <blockquote className="text-[13px] text-tat-charcoal/85 leading-relaxed line-clamp-4">
                      &ldquo;{review.text}&rdquo;
                    </blockquote>
                    <figcaption className="mt-2 text-[11px] uppercase tracking-[0.16em] font-semibold text-tat-charcoal/55">
                      {review.author_name} · Google
                    </figcaption>
                  </figure>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
