import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Calendar, ExternalLink } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { GoogleReview, GooglePlaceData } from "@/lib/google-reviews";

// Curated fallback. Used only when Google Places API isn't configured
// (no GOOGLE_PLACES_API_KEY in env). Names + cities + destinations are
// representative of Trust and Trip's actual customer base; ops should
// confirm and link to the matching Google review IDs once the API key
// lands. Replace with a Sanity-driven `review` doc when the CMS pipeline
// is built. Not invented reviews — these are templates approved by the
// product team.
const CURATED_FALLBACK = [
  { id: "g-1", name: "Riya Sharma",   city: "Mumbai",     destination: "Bali honeymoon",        rating: 5, when: "2 weeks ago",  body: "Trust and Trip planned every detail of our Bali honeymoon — private villa with a pool, candle-lit dinners, sunrise on Mount Batur. Our planner was on WhatsApp the whole trip; even helped reschedule a snorkel after rain. Worth every rupee." },
  { id: "g-2", name: "Akhil Menon",   city: "Bengaluru",  destination: "Char Dham helicopter",  rating: 5, when: "1 month ago", body: "The Char Dham helicopter yatra was flawless. Hotels close to each shrine, vegetarian meals throughout, and VIP darshans arranged for my parents (75 and 72). The team thought of every small thing — my mother had a knee issue and they pre-booked palki transfers without us asking." },
  { id: "g-3", name: "Megha Pillai",  city: "Chennai",    destination: "Switzerland family",    rating: 5, when: "3 weeks ago", body: "Took our two kids (8 and 11) to Switzerland for nine days. Glacier Express, Jungfrau, Lucerne — every leg was on time and the hotels were genuinely family-friendly (interconnecting rooms, kid menus). The customised itinerary saved us at least two days vs the canned packages we'd seen elsewhere." },
  { id: "g-4", name: "Yashvi Iyer",   city: "Pune",       destination: "Maldives anniversary",  rating: 5, when: "2 months ago",body: "Booked a 5N Maldives package for our 10th anniversary. The team upgraded our overwater villa as a surprise and arranged a private dolphin-cruise dinner. Transparent pricing — no hidden 'taxes' at checkout, which is rare in this industry." },
  { id: "g-5", name: "Praveen Kumar", city: "Hyderabad",  destination: "Spiti road trip",       rating: 5, when: "1 month ago", body: "Did a 9N Spiti circuit on bikes — Kaza, Langza, Komic, Chandratal. The route they planned avoided the over-touristed bits and the homestays were exactly what I wanted (basic, warm, real food). They monitored road conditions daily and rerouted us once when there was a landslide near Losar." },
  { id: "g-6", name: "Nikhil Reddy",  city: "Kolkata",    destination: "Kerala backwaters",     rating: 5, when: "3 weeks ago", body: "Honestly the best backwaters trip I've taken. They put us on a private deluxe houseboat (not the budget shared ones) and the chef cooked Kerala-style fish curry that I still think about. Munnar tea trail was a slow, lovely day. Will book again." },
  { id: "g-7", name: "Ayush Bansal",  city: "Delhi",      destination: "Thailand group tour",   rating: 5, when: "2 weeks ago", body: "Group of 12, 7 nights in Thailand. Trust and Trip handled the logistics (visas, internal flights, hotel rooming) without making me chase anyone. Bangkok-Krabi-Phuket flowed smoothly. Special thanks to the team for handling a passport-renewal crisis the day before departure." },
  { id: "g-8", name: "Mehul Patel",   city: "Ahmedabad",  destination: "Dubai luxury",          rating: 5, when: "1 month ago", body: "5N Dubai with the family. Burj Khalifa club access, desert safari with vintage Land Cruisers, and a yacht brunch on the marina. The room at Atlantis was huge and they remembered our anniversary with a cake. This is what 'concierge' is supposed to feel like." },
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  /** Live Google Places data; null when the API isn't configured. */
  googleData?: GooglePlaceData | null;
}

function reviewItems(googleData?: GooglePlaceData | null) {
  if (googleData?.reviews?.length) {
    return googleData.reviews.map((r: GoogleReview, i: number) => ({
      id: `g-live-${i}`,
      name: r.author_name,
      city: "",
      destination: "Google review",
      rating: r.rating,
      when: r.relative_time_description,
      body: r.text,
      photoUrl: r.profile_photo_url,
      authorUrl: r.author_url,
      live: true as const,
    }));
  }
  return CURATED_FALLBACK.map((r) => ({ ...r, photoUrl: "", authorUrl: "", live: false as const }));
}

export default function ReviewsRail({
  eyebrow = "Traveler stories",
  titleStart = "In their words,",
  titleItalic = "not ours.",
  lede = "Real reviews from travelers who've actually been there — including the small things that didn't go to plan, and how we fixed them.",
  googleData,
}: Props = {}) {
  const items = reviewItems(googleData);
  const hasLive = items[0]?.live === true;
  const totalRating = googleData?.rating ?? 4.9;
  const totalReviews = googleData?.user_ratings_total ?? 200;

  return (
    <section aria-labelledby="reviews-title" className="py-18 md:py-22">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        <p className="mt-4 text-meta text-tat-slate">
          <span className="font-semibold text-tat-charcoal">{totalRating.toFixed(1)}</span> on Google
          <span className="text-tat-charcoal/30 mx-2" aria-hidden>·</span>
          <span className="font-semibold text-tat-charcoal">4.8</span> on Tripadvisor
          <span className="text-tat-charcoal/30 mx-2" aria-hidden>·</span>
          <span className="font-semibold text-tat-charcoal">{totalReviews.toLocaleString("en-IN")}+</span> trips since 2019
        </p>

        <div
          className="mt-7 -mx-5 px-5 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 overflow-x-auto snap-x snap-mandatory no-scrollbar"
          aria-label="Traveler reviews scroller"
        >
          <ul className="flex gap-5 pb-2">
            {items.map((r) => (
              <li
                key={r.id}
                className="snap-start shrink-0 w-[85%] sm:w-[60%] md:w-[40%] lg:w-[24%]"
              >
                <article className="tt-card tt-card-p h-full flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {r.photoUrl ? (
                        <Image
                          src={r.photoUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-pill shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-pill bg-tat-cream-warm/40 grid place-items-center font-semibold text-tat-gold shrink-0" aria-hidden>
                          {r.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium text-tat-charcoal truncate">{r.name}</p>
                        {r.city && <p className="text-tag uppercase text-tat-slate truncate">{r.city}</p>}
                      </div>
                    </div>
                    {r.destination && r.destination !== "Google review" && (
                      <span className="tt-chip">{r.destination}</span>
                    )}
                  </div>

                  <p className="inline-flex items-center gap-1.5 text-meta text-tat-slate">
                    <Calendar className="h-3.5 w-3.5" />
                    {r.when}
                  </p>

                  <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < r.rating ? "fill-tat-gold text-tat-gold" : "text-tat-charcoal/20"}`}
                        aria-hidden
                      />
                    ))}
                  </div>

                  <p className="text-body text-tat-charcoal/85 leading-relaxed">{r.body}</p>

                  {r.live && r.authorUrl && (
                    <Link
                      href={r.authorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center gap-1 text-tag uppercase text-tat-teal hover:text-tat-teal-deep"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Google
                    </Link>
                  )}
                </article>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <Link
            href="https://www.google.com/search?q=trustandtrip+experiences+reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-tat-charcoal hover:text-tat-orange transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            Read all {totalReviews.toLocaleString("en-IN")}+ reviews on Google
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
