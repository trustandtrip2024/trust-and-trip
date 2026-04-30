import { Star, Eye, MessageCircle, ShieldCheck, BadgeIndianRupee } from "lucide-react";

interface Props {
  rating?: number;
  reviews?: number;
  viewedCount: number;
  enquiredCount: number;
}

/**
 * Wide trust ribbon beneath the package hero. Mirrors the destination-detail
 * pattern so customers move through the funnel with consistent reassurance.
 * Mobile = horizontal scroll rail, sm+ = inline grid.
 */
export default function PackageHeroTrustRibbon({
  rating, reviews, viewedCount, enquiredCount,
}: Props) {
  return (
    <section
      aria-label="Why book this trip with us"
      className="border-b border-tat-charcoal/8 dark:border-white/10 bg-tat-paper dark:bg-tat-charcoal"
    >
      <div className="container-custom py-4 md:py-5">
        <ul
          role="list"
          className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0 text-[12px] md:text-[13px]"
        >
          {rating && reviews ? (
            <li className="shrink-0 inline-flex items-center gap-2 text-tat-charcoal/70 dark:text-tat-paper/70">
              <Star className="h-4 w-4 fill-tat-gold text-tat-gold" />
              <span>
                <strong className="font-semibold text-tat-charcoal dark:text-tat-paper">
                  {rating.toFixed(1)}
                </strong>
                {" · "}
                {reviews.toLocaleString("en-IN")} reviews
              </span>
            </li>
          ) : null}
          <li className="shrink-0 inline-flex items-center gap-2 text-tat-charcoal/70 dark:text-tat-paper/70">
            <Eye className="h-4 w-4 text-tat-gold" />
            <span>
              <strong className="font-semibold text-tat-charcoal dark:text-tat-paper">
                {viewedCount}
              </strong>{" "}
              viewed this month
            </span>
          </li>
          <li className="shrink-0 inline-flex items-center gap-2 text-tat-charcoal/70 dark:text-tat-paper/70">
            <MessageCircle className="h-4 w-4 text-tat-gold" />
            <span>
              <strong className="font-semibold text-tat-charcoal dark:text-tat-paper">
                {enquiredCount}
              </strong>{" "}
              enquired this month
            </span>
          </li>
          <li className="shrink-0 inline-flex items-center gap-2 text-tat-charcoal/70 dark:text-tat-paper/70">
            <BadgeIndianRupee className="h-4 w-4 text-tat-gold" />
            <span>
              <strong className="font-semibold text-tat-charcoal dark:text-tat-paper">
                ₹0
              </strong>{" "}
              to start · pay only when sure
            </span>
          </li>
          <li className="shrink-0 inline-flex items-center gap-2 text-tat-charcoal/70 dark:text-tat-paper/70">
            <ShieldCheck className="h-4 w-4 text-tat-gold" />
            <span>
              Free changes within{" "}
              <strong className="font-semibold text-tat-charcoal dark:text-tat-paper">
                48 h
              </strong>{" "}
              of itinerary
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
