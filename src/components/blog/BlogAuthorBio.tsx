"use client";

import { MessageCircle, Phone } from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";

interface Props {
  authorName: string;
  category: string;
  waNumber?: string;
}

/**
 * End-of-article author block. Even when the author is just a string
 * field on the CMS, we humanize it with an initials avatar and tie it
 * back to the brand promise (real planner) so the reader has a clear
 * next step.
 */
export default function BlogAuthorBio({
  authorName, category, waNumber = "918115999588",
}: Props) {
  const { open: openPlanner } = useTripPlanner();
  const initials = authorName.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase() || "TT";
  const isPlanner = !/^trust\s*and\s*trip$/i.test(authorName);

  const waMessage = encodeURIComponent(
    `Hi! I just read ${authorName}'s article on ${category}. Could we talk about planning a similar trip?`
  );
  const waHref = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <section className="mt-10 pt-8 border-t border-tat-charcoal/10">
      <div className="rounded-3xl bg-tat-paper ring-1 ring-tat-charcoal/8 p-5 md:p-6 flex flex-col sm:flex-row items-start gap-4 md:gap-5">
        <div className="relative shrink-0">
          <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-tat-teal text-white grid place-items-center font-display text-xl md:text-2xl font-medium ring-2 ring-tat-gold/40">
            {initials}
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-tat-success-bg ring-2 ring-tat-paper"
            aria-label="Online"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
            About the author
          </p>
          <h3 className="mt-1 font-display text-[18px] md:text-[20px] font-medium text-tat-charcoal leading-tight">
            {authorName}
          </h3>
          <p className="mt-2 text-[13px] md:text-[14px] text-tat-charcoal/70 leading-relaxed">
            {isPlanner
              ? `${authorName} writes from the road for Trust and Trip — turning real planner notes into stories you can actually use. They also draft custom itineraries for travelers like you.`
              : `Trust and Trip writes from the road — turning real planner notes into stories you can actually use. We also draft custom itineraries shaped around what you've read.`}
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => openPlanner()}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full bg-tat-teal hover:bg-tat-teal-deep text-white text-[13px] font-semibold"
            >
              <Phone className="h-3.5 w-3.5" />
              Plan a trip with us
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full bg-whatsapp hover:bg-whatsapp-deep text-white text-[13px] font-semibold transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-white" />
              WhatsApp the team
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
