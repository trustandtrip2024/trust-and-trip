import Image from "next/image";
import { ArrowRight, Instagram } from "lucide-react";
import { testimonials, type Testimonial } from "@/lib/data";
import {
  fetchGoogleReviews,
  type GoogleReview,
} from "@/lib/google-reviews";
import ReviewsCarousel, { type NormalizedReview } from "./ReviewsCarousel";

const INSTAGRAM_HANDLE = "@trustandtrip";
const INSTAGRAM_URL = "https://www.instagram.com/trustandtrip/";

const POLAROIDS = [
  { src: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=70", caption: "Bali · honeymoon villa" },
  { src: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=70", caption: "Maldives · overwater" },
  { src: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=70", caption: "Kerala · backwaters" },
  { src: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=70", caption: "Switzerland · Lucerne" },
  { src: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=70", caption: "Rajasthan · Udaipur" },
  { src: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=70", caption: "Ladakh · Pangong" },
  { src: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=70", caption: "Thailand · Krabi" },
  { src: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=600&q=70", caption: "Char Dham · Kedarnath" },
];

function normalizeGoogle(r: GoogleReview): NormalizedReview {
  return {
    name: r.author_name,
    location: r.relative_time_description,
    rating: r.rating,
    text: r.text,
    image: r.profile_photo_url,
    source: "google",
  };
}

function normalizeSite(t: Testimonial): NormalizedReview {
  return {
    name: t.name,
    location: t.location,
    trip: t.trip,
    rating: t.rating,
    text: t.quote,
    image: t.image,
    source: "site",
  };
}

export default async function SocialProof() {
  const data = await fetchGoogleReviews();
  const reviews: NormalizedReview[] = data?.reviews?.length
    ? data.reviews.slice(0, 6).map(normalizeGoogle)
    : testimonials.map(normalizeSite);
  const rating = data?.rating ?? 4.9;
  const total = data?.user_ratings_total ?? 8000;

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="py-12 md:py-16 bg-tat-cream-warm/30 dark:bg-tat-charcoal/95 scroll-mt-28 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Loved by travelers
            </p>
            <h2
              id="reviews-title"
              className="mt-2 font-display font-normal text-[24px] md:text-[30px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              {rating.toFixed(1)}★ across{" "}
              <em className="not-italic font-display italic text-tat-gold">
                {total.toLocaleString("en-IN")}+ trips planned.
              </em>
            </h2>
            <p className="mt-3 text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70 max-w-2xl">
              Real Google reviews from travelers we&apos;ve sent away — and the postcards they bring home.
            </p>
          </div>
          <a
            href="https://www.google.com/search?q=Trust+And+Trip+Experiences+reviews"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            Read all on Google
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <ReviewsCarousel reviews={reviews} />

        <div className="mt-12 md:mt-14 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              Postcards from travelers
            </p>
            <h3 className="mt-2 font-display font-normal text-[20px] md:text-[26px] leading-tight text-tat-charcoal dark:text-tat-paper">
              Tagged us on{" "}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="not-italic font-display italic text-tat-gold hover:underline underline-offset-4"
              >
                {INSTAGRAM_HANDLE}
              </a>
            </h3>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            <Instagram className="h-4 w-4" />
            Follow on Instagram
          </a>
        </div>

        <div className="mt-5 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar">
          <ul className="flex gap-3 lg:gap-4 pb-2 pr-5 lg:pr-0">
            {POLAROIDS.map((p, i) => (
              <li
                key={i}
                className="shrink-0 w-[150px] sm:w-[170px] md:w-[180px]"
              >
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group block rounded-lg overflow-hidden bg-white dark:bg-white/5 ring-1 ring-tat-charcoal/10 dark:ring-white/10 shadow-soft hover:shadow-soft-lg transition-shadow"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={p.src}
                      alt=""
                      fill
                      sizes="180px"
                      quality={65}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
                    />
                  </div>
                  <p className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-tat-charcoal/60 dark:text-tat-paper/60 truncate">
                    {p.caption}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

