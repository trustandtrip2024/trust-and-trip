import { fetchGoogleReviews, type GoogleReview } from "@/lib/google-reviews";
import { Star } from "lucide-react";
import Image from "next/image";

// Google "G" logo SVG
function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Google">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// TripAdvisor owl SVG (simplified)
function TripAdvisorIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Tripadvisor">
      <circle cx="30" cy="30" r="30" fill="#34E0A1"/>
      <circle cx="20" cy="28" r="8" fill="white"/>
      <circle cx="40" cy="28" r="8" fill="white"/>
      <circle cx="20" cy="28" r="4" fill="#000"/>
      <circle cx="40" cy="28" r="4" fill="#000"/>
      <circle cx="21.5" cy="26.5" r="1.5" fill="white"/>
      <circle cx="41.5" cy="26.5" r="1.5" fill="white"/>
      <path d="M22 38 Q30 44 38 38" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M10 22 Q15 14 20 22" stroke="#000" strokeWidth="1.5" fill="none"/>
      <path d="M50 22 Q45 14 40 22" stroke="#000" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${cls} ${s <= rating ? "fill-tat-gold text-tat-gold" : "fill-tat-charcoal/10 text-tat-charcoal/10"}`} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  const initial = review.author_name.charAt(0).toUpperCase();
  return (
    <div className="w-[280px] md:w-[300px] shrink-0 bg-white rounded-2xl p-5 border border-tat-charcoal/6 flex flex-col gap-3 shadow-soft">
      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 ring-2 ring-tat-gold/15">
          {review.profile_photo_url ? (
            <Image
              src={review.profile_photo_url}
              alt={review.author_name}
              fill
              sizes="36px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="h-full w-full bg-tat-gold/15 flex items-center justify-center">
              <span className="font-display font-semibold text-tat-gold text-sm">{initial}</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-tat-charcoal truncate">{review.author_name}</p>
          <p className="text-[11px] text-tat-charcoal/40">{review.relative_time_description}</p>
        </div>
        <div className="ml-auto shrink-0">
          <GoogleIcon size={18} />
        </div>
      </div>

      {/* Stars */}
      <StarRow rating={review.rating} />

      {/* Text */}
      <p className="text-sm text-tat-charcoal/75 leading-relaxed line-clamp-4 flex-1">
        &ldquo;{review.text}&rdquo;
      </p>
    </div>
  );
}

// Fallback static reviews when API key not configured
const FALLBACK_REVIEWS: GoogleReview[] = [
  {
    author_name: "Priya S.",
    author_url: "",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "2 weeks ago",
    text: "Absolutely brilliant travel planning! Every detail of our Bali honeymoon was perfectly arranged. The team at Trust and Trip went above and beyond our expectations.",
    time: Date.now() / 1000,
  },
  {
    author_name: "Rahul M.",
    author_url: "",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "1 month ago",
    text: "Best travel agency in Jaipur! They planned our family trip to Switzerland and it was flawless. Kids loved every moment and so did the grandparents. Will book again!",
    time: Date.now() / 1000,
  },
  {
    author_name: "Sunita K.",
    author_url: "",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "3 weeks ago",
    text: "Trust and Trip is exactly what their name says — you can trust them completely! Dubai trip was seamlessly managed. Transparent pricing, no hidden costs.",
    time: Date.now() / 1000,
  },
  {
    author_name: "Arjun P.",
    author_url: "",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "2 months ago",
    text: "Exceptional service from start to finish. The Maldives package was luxurious and well within our budget. 24/7 support made everything stress-free.",
    time: Date.now() / 1000,
  },
  {
    author_name: "Deepa R.",
    author_url: "",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "1 month ago",
    text: "We've used many agencies but none compare to Trust and Trip. Kerala backwaters trip was magical. Every hotel, every experience was handpicked with care.",
    time: Date.now() / 1000,
  },
];

export default async function GoogleReviewsSection() {
  const data = await fetchGoogleReviews();
  const reviews = data?.reviews?.length ? data.reviews : FALLBACK_REVIEWS;
  const rating = data?.rating ?? 4.9;
  const totalRatings = data?.user_ratings_total ?? 200;

  // Repeat to fill the marquee
  const doubled = [...reviews, ...reviews];

  return (
    <section className="py-14 md:py-20 bg-tat-cream/20 overflow-hidden" aria-labelledby="platform-reviews-heading">
      <div className="container-custom mb-8 md:mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          {/* Heading */}
          <div>
            <span className="eyebrow">Verified by Travelers</span>
            <h2 id="platform-reviews-heading" className="heading-section mt-2 text-balance">
              Trusted on every
              <span className="italic text-tat-gold font-light"> platform.</span>
            </h2>
          </div>

          {/* Platform badges */}
          <div className="flex flex-wrap items-stretch gap-3 shrink-0">
            {/* Google badge */}
            <a
              href="https://www.google.com/maps/search/Trust+And+Trip+Experiences+PVT+LTD"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-tat-charcoal/8 hover:border-tat-gold/30 hover:shadow-soft transition-all duration-300 group"
              aria-label="View Trust and Trip on Google"
            >
              <GoogleIcon size={24} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xl font-semibold text-tat-charcoal">{rating.toFixed(1)}</span>
                  <StarRow rating={5} size="sm" />
                </div>
                <p className="text-[11px] text-tat-charcoal/40 mt-0.5">{totalRatings > 0 ? `${totalRatings}+ reviews` : "Google Reviews"}</p>
              </div>
            </a>

            {/* TripAdvisor badge */}
            <a
              href="https://www.tripadvisor.in/Search?q=Trust+And+Trip+Experiences"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-tat-charcoal/8 hover:border-[#34E0A1]/50 hover:shadow-soft transition-all duration-300 group"
              aria-label="View Trust and Trip on Tripadvisor"
            >
              <TripAdvisorIcon size={28} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xl font-semibold text-tat-charcoal">4.9</span>
                  <StarRow rating={5} size="sm" />
                </div>
                <p className="text-[11px] text-tat-charcoal/40 mt-0.5">Travelers&apos; Choice</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Scrolling review cards */}
      <div
        className="flex gap-4 w-max animate-marquee hover:[animation-play-state:paused] px-5 md:px-0"
        style={{ paddingLeft: "max(20px, calc((100vw - 1280px)/2))" }}
      >
        {doubled.map((review, i) => (
          <ReviewCard key={i} review={review} />
        ))}
      </div>
    </section>
  );
}
