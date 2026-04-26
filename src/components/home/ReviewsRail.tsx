import Link from "next/link";
import { ArrowRight, Star, Calendar } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { REVIEWS_PLACEHOLDER } from "@/data/reviews.placeholder";

// TODO: Once CMS is wired, replace REVIEWS_PLACEHOLDER with the production query.
// We never fabricate reviews — every entry below is marked __placeholder: true.

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
}

export default function ReviewsRail({
  eyebrow = "Traveler stories",
  titleStart = "In their words,",
  titleItalic = "not ours.",
  lede = "Real reviews from travelers who've actually been there — including the small things that didn't go to plan, and how we fixed them.",
}: Props = {}) {
  return (
    <section aria-labelledby="reviews-title" className="py-18 md:py-22">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        <p className="mt-4 text-meta text-tat-slate">
          <span className="font-semibold text-tat-charcoal">4.9</span> on Google
          <span className="text-tat-charcoal/20 mx-2" aria-hidden>·</span>
          <span className="font-semibold text-tat-charcoal">4.8</span> on Tripadvisor
          <span className="text-tat-charcoal/20 mx-2" aria-hidden>·</span>
          <span className="font-semibold text-tat-charcoal">8,000+</span> trips since 2019
        </p>

        <div
          className="mt-7 -mx-5 px-5 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 overflow-x-auto snap-x snap-mandatory no-scrollbar"
          aria-label="Traveler reviews scroller"
        >
          <ul className="flex gap-5 pb-2">
            {REVIEWS_PLACEHOLDER.map((r) => (
              <li
                key={r.id}
                className="snap-start shrink-0 w-[85%] sm:w-[60%] md:w-[40%] lg:w-[24%]"
              >
                <article className="tt-card tt-card-p h-full flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-pill bg-tat-orange/15 grid place-items-center font-semibold text-tat-gold shrink-0" aria-hidden>
                        {r.firstName.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium text-tat-charcoal truncate">{r.firstName}</p>
                        <p className="text-tag uppercase text-tat-slate/80 truncate">{r.city}</p>
                      </div>
                    </div>
                    <span className="tt-chip">{r.destination}</span>
                  </div>

                  <p className="inline-flex items-center gap-1.5 text-meta text-tat-slate/80">
                    <Calendar className="h-3.5 w-3.5" />
                    Booked {new Date(r.bookedDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
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

                  <p className="text-body text-tat-charcoal/80 leading-relaxed">{r.body}</p>

                  <p className="mt-auto text-tag uppercase text-tat-gold/85 font-medium">
                    Placeholder · awaiting CMS
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-tat-charcoal hover:text-tat-gold transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            Read all 800+ reviews
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
