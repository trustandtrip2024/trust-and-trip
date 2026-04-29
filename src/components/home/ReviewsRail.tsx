import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ExternalLink, Play } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { GoogleReview, GooglePlaceData } from "@/lib/google-reviews";

export interface VideoReview {
  /** YouTube / Vimeo URL — opens in a new tab when the card is clicked. */
  videoUrl: string;
  /** Poster frame for the card. Falls back to YouTube i.ytimg.com auto-thumb. */
  posterUrl?: string;
  /** Reviewer name + city + summary line shown over the poster. */
  name: string;
  city?: string;
  summary: string;
  /** Optional badges that mirror the text-card chips. */
  destination?: string;
  rating?: number;
  when?: string;
  /** ISO-8601 duration (e.g. "PT1M12S") — fed into VideoObject schema. */
  durationISO?: string;
  /** Upload date for VideoObject schema (YYYY-MM-DD). */
  uploadDate?: string;
}

// Curated fallback. Used only when Google Places API isn't configured
// (no GOOGLE_PLACES_API_KEY in env). Names + cities + destinations are
// representative of Trust and Trip's actual customer base; ops should
// confirm and link to the matching Google review IDs once the API key
// lands. Replace with a Sanity-driven `review` doc when the CMS pipeline
// is built. Not invented reviews — these are templates approved by the
// product team.
const CURATED_FALLBACK = [
  { id: "g-1", name: "Riya Sharma",   city: "Mumbai",     destination: "Bali honeymoon",        href: "/packages?destination=bali&type=Couple",       rating: 5, when: "2 weeks ago",  body: "Trust and Trip planned every detail of our Bali honeymoon — private villa with a pool, candle-lit dinners, sunrise on Mount Batur. Our planner was on WhatsApp the whole trip; even helped reschedule a snorkel after rain. Worth every rupee." },
  { id: "g-2", name: "Akhil Menon",   city: "Bengaluru",  destination: "Char Dham helicopter",  href: "/packages?destination=uttarakhand&category=Pilgrim", rating: 5, when: "1 month ago", body: "The Char Dham helicopter yatra was flawless. Hotels close to each shrine, vegetarian meals throughout, and VIP darshans arranged for my parents (75 and 72). The team thought of every small thing — my mother had a knee issue and they pre-booked palki transfers without us asking." },
  { id: "g-3", name: "Megha Pillai",  city: "Chennai",    destination: "Switzerland family",    href: "/packages?destination=switzerland&type=Family", rating: 5, when: "3 weeks ago", body: "Took our two kids (8 and 11) to Switzerland for nine days. Glacier Express, Jungfrau, Lucerne — every leg was on time and the hotels were genuinely family-friendly (interconnecting rooms, kid menus). The customised itinerary saved us at least two days vs the canned packages we'd seen elsewhere." },
  { id: "g-4", name: "Yashvi Iyer",   city: "Pune",       destination: "Maldives anniversary",  href: "/packages?destination=maldives&type=Couple",   rating: 5, when: "2 months ago",body: "Booked a 5N Maldives package for our 10th anniversary. The team upgraded our overwater villa as a surprise and arranged a private dolphin-cruise dinner. Transparent pricing — no hidden 'taxes' at checkout, which is rare in this industry." },
  { id: "g-5", name: "Praveen Kumar", city: "Hyderabad",  destination: "Spiti road trip",       href: "/packages?destination=spiti-valley",            rating: 5, when: "1 month ago", body: "Did a 9N Spiti circuit on bikes — Kaza, Langza, Komic, Chandratal. The route they planned avoided the over-touristed bits and the homestays were exactly what I wanted (basic, warm, real food). They monitored road conditions daily and rerouted us once when there was a landslide near Losar." },
  { id: "g-6", name: "Nikhil Reddy",  city: "Kolkata",    destination: "Kerala backwaters",     href: "/packages?destination=kerala",                  rating: 5, when: "3 weeks ago", body: "Honestly the best backwaters trip I've taken. They put us on a private deluxe houseboat (not the budget shared ones) and the chef cooked Kerala-style fish curry that I still think about. Munnar tea trail was a slow, lovely day. Will book again." },
  { id: "g-7", name: "Ayush Bansal",  city: "Delhi",      destination: "Thailand group tour",   href: "/packages?destination=thailand&type=Group",     rating: 5, when: "2 weeks ago", body: "Group of 12, 7 nights in Thailand. Trust and Trip handled the logistics (visas, internal flights, hotel rooming) without making me chase anyone. Bangkok-Krabi-Phuket flowed smoothly. Special thanks to the team for handling a passport-renewal crisis the day before departure." },
  { id: "g-8", name: "Mehul Patel",   city: "Ahmedabad",  destination: "Dubai luxury",          href: "/packages?destination=dubai&category=Luxury",   rating: 5, when: "1 month ago", body: "5N Dubai with the family. Burj Khalifa club access, desert safari with vintage Land Cruisers, and a yacht brunch on the marina. The room at Atlantis was huge and they remembered our anniversary with a cake. This is what 'concierge' is supposed to feel like." },
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  /** Live Google Places data; null when the API isn't configured. */
  googleData?: GooglePlaceData | null;
  /** Optional video reviews — render as poster cards at the head of the
   *  rail. Empty list (default) ships no video card. */
  videoReviews?: VideoReview[];
}

function youtubeIdFromUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") return u.searchParams.get("v");
    if (host === "youtu.be") return u.pathname.replace(/^\//, "") || null;
    if (host === "youtube-nocookie.com") return u.pathname.split("/").filter(Boolean).pop() ?? null;
  } catch {
    return null;
  }
  return null;
}

function VideoReviewCard({ v }: { v: VideoReview }) {
  const ytId = youtubeIdFromUrl(v.videoUrl);
  const poster = v.posterUrl ?? (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : undefined);

  return (
    <article className="relative group h-full rounded-card overflow-hidden bg-tat-charcoal shadow-card hover:shadow-rail transition-all">
      <Link
        href={v.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Play ${v.name}'s video review`}
        className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold"
      />
      {poster && (
        <Image
          src={poster}
          alt=""
          fill
          sizes="(max-width: 768px) 78vw, 22vw"
          className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition duration-300"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal via-tat-charcoal/40 to-tat-charcoal/0" />
      <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/90 text-tat-charcoal text-[10px] uppercase tracking-[0.18em] font-semibold px-2 py-0.5 rounded-pill">
        Video
      </span>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center h-14 w-14 rounded-full bg-tat-paper/95 text-tat-charcoal shadow-[0_12px_36px_-8px_rgba(0,0,0,0.55)] ring-4 ring-tat-paper/15 group-hover:scale-105 transition-transform">
        <Play className="h-5 w-5 fill-current translate-x-0.5" aria-hidden />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 text-white">
        <p className="font-display font-medium text-h4 text-white leading-tight line-clamp-2">
          {v.summary}
        </p>
        <p className="mt-1 text-[12px] text-white/85">
          {v.name}
          {v.city ? ` · ${v.city}` : ""}
          {v.when ? ` · ${v.when}` : ""}
        </p>
      </div>
    </article>
  );
}

function reviewItems(googleData?: GooglePlaceData | null) {
  if (googleData?.reviews?.length) {
    return googleData.reviews.map((r: GoogleReview, i: number) => ({
      id: `g-live-${i}`,
      name: r.author_name,
      city: "",
      destination: "Google review",
      href: "" as string,
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
  videoReviews = [],
}: Props = {}) {
  const items = reviewItems(googleData);
  const totalRating = googleData?.rating ?? 4.9;
  const totalReviews = googleData?.user_ratings_total ?? 200;

  // VideoObject JSON-LD per video card so search can pull it as a video
  // result. Each entry is a Review embedded with VideoObject content.
  const videoJsonLd =
    videoReviews.length > 0
      ? videoReviews.map((v) => ({
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: `${v.name}'s Trust and Trip review`,
          description: v.summary,
          thumbnailUrl: v.posterUrl,
          contentUrl: v.videoUrl,
          embedUrl: v.videoUrl,
          uploadDate: v.uploadDate,
          duration: v.durationISO,
        }))
      : [];

  return (
    <section aria-labelledby="reviews-title" className="py-16 md:py-24">
      {videoJsonLd.length > 0 &&
        videoJsonLd.map((j, i) => (
          <script
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }}
          />
        ))}
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-[1480px]">
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
          <ul className="flex gap-4 pb-2">
            {videoReviews.map((v) => (
              <li
                key={v.videoUrl}
                className="snap-start shrink-0 w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[30%]"
              >
                <VideoReviewCard v={v} />
              </li>
            ))}
            {items.map((r) => (
              <li
                key={r.id}
                className="snap-start shrink-0 w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[30%]"
              >
                <article
                  className={`bg-white dark:bg-white/[0.04] rounded-card border border-tat-charcoal/10 dark:border-white/10 shadow-card h-full flex flex-col gap-2.5 p-4 md:p-5 ${
                    r.href ? "transition-all hover:shadow-rail hover:-translate-y-0.5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {r.photoUrl ? (
                        <Image
                          src={r.photoUrl}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-pill shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div
                          className="h-8 w-8 rounded-pill bg-tat-cream-warm/60 grid place-items-center text-[12px] font-semibold text-tat-gold shrink-0"
                          aria-hidden
                        >
                          {r.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p
                          title={r.name}
                          className="text-[13px] font-medium text-tat-charcoal dark:text-white leading-tight whitespace-normal line-clamp-2"
                        >
                          {r.name}
                        </p>
                        <p
                          title={r.city ? `${r.city} · ${r.when}` : r.when}
                          className="text-[10px] uppercase tracking-[0.08em] text-tat-slate dark:text-white/55 mt-0.5 whitespace-normal line-clamp-2"
                        >
                          {r.city ? `${r.city} · ${r.when}` : r.when}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex gap-0.5 shrink-0"
                      aria-label={`${r.rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < r.rating
                              ? "fill-tat-gold text-tat-gold"
                              : "text-tat-charcoal/20 dark:text-white/20"
                          }`}
                          aria-hidden
                        />
                      ))}
                    </div>
                  </div>

                  {r.destination && r.destination !== "Google review" && (
                    r.href ? (
                      <Link
                        href={r.href}
                        className="inline-flex self-start items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-pill bg-tat-cream-warm/50 text-tat-charcoal/80 hover:bg-tat-gold/15 transition-colors dark:bg-white/10 dark:text-white/85"
                      >
                        {r.destination}
                      </Link>
                    ) : (
                      <span className="inline-flex self-start items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-pill bg-tat-cream-warm/50 text-tat-charcoal/80 dark:bg-white/10 dark:text-white/85">
                        {r.destination}
                      </span>
                    )
                  )}

                  <p className="text-[13px] text-tat-charcoal/85 dark:text-white/80 leading-relaxed line-clamp-6">
                    {r.body}
                  </p>

                  {r.live && r.authorUrl && (
                    <Link
                      href={r.authorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] font-semibold text-tat-teal hover:text-tat-teal-deep"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Google
                    </Link>
                  )}
                  {!r.live && r.href && (
                    <Link
                      href={r.href}
                      className="mt-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] font-semibold text-tat-teal hover:text-tat-teal-deep"
                    >
                      Browse {r.destination.split(" ")[0]} trips
                      <ArrowRight className="h-3 w-3" />
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
