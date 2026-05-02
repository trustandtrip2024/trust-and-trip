import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone, ChevronDown, User } from "lucide-react";

interface Props {
  /** Optional founder photo path. Falls back to an initials chip if absent. */
  founderImage?: string;
}

const WA = "918115999588";
const WA_TEXT = encodeURIComponent(
  "Hi Trust and Trip — I'd like to talk to a planner about my trip.",
);

const FAQS = [
  {
    q: "Why is the itinerary free?",
    a: "Because we'd rather you say yes after seeing real options than commit to anything in the first call. The first plan, all changes within 48 hours, and a planner's time — all free. We earn when you book.",
  },
  {
    q: "How fast does a planner get back to me?",
    a: "First reply lands within 4 hours during work hours (8 AM – 10 PM IST, Mon–Sat). The full draft itinerary lands within 24 hours. We work to your timezone if you're abroad.",
  },
  {
    q: "What does it cost to hold a trip?",
    a: "30% of the total, capped at ₹5,000 minimum. Refundable up to 21 days before departure with no questions asked. Full payment is due 15 days before travel.",
  },
];

/**
 * Personal closing CTA. Founder photo, name, WhatsApp + Call buttons,
 * and three real questions answered honestly. Replaces FaqAndCTA's
 * 12-question accordion with a tight 3-question version since visitor
 * fatigue at this scroll depth is high.
 */
export default function HomePlannerCTA({ founderImage }: Props = {}) {
  return (
    <section
      aria-labelledby="planner-cta-heading"
      className="py-16 md:py-24 bg-tat-charcoal text-tat-paper"
    >
      <div className="container-custom grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-start">
        {/* Left: founder + CTAs */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
            Talk to a planner
          </p>
          <h2
            id="planner-cta-heading"
            className="mt-2 font-display text-[32px] md:text-[44px] leading-[1.05] text-tat-paper text-balance max-w-[18ch]"
          >
            Reach Akash directly. Today.
          </h2>
          <p className="mt-4 text-[15px] text-tat-paper/80 max-w-[44ch] leading-relaxed">
            No call centre, no junior handler. The founder reads every inbound
            message and routes it to the planner who knows the destination
            best — usually within four hours.
          </p>

          <div className="mt-7 flex items-center gap-4">
            {founderImage ? (
              <Image
                src={founderImage}
                alt="Akash Mishra, founder of Trust and Trip"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-tat-gold/40"
              />
            ) : (
              <span
                aria-hidden
                className="grid place-items-center h-16 w-16 rounded-full bg-tat-gold/15 ring-2 ring-tat-gold/40 text-tat-gold"
              >
                <User className="h-7 w-7" />
              </span>
            )}
            <div>
              <p className="font-display text-[18px] font-medium leading-tight">
                Akash Mishra
              </p>
              <p className="text-[12px] uppercase tracking-[0.18em] text-tat-paper/60">
                Founder · planner since 2019
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${WA}?text=${WA_TEXT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-5 rounded-xl bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2 focus-visible:ring-offset-tat-charcoal"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp now
            </a>
            <a
              href={`tel:+${WA}`}
              className="inline-flex items-center gap-2 h-12 px-5 rounded-xl bg-tat-paper text-tat-charcoal font-semibold hover:bg-tat-paper/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2 focus-visible:ring-offset-tat-charcoal"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Call +91 81159 99588
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 h-12 px-5 rounded-xl border border-tat-paper/25 text-tat-paper font-semibold hover:bg-tat-paper/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2 focus-visible:ring-offset-tat-charcoal"
            >
              Email instead
            </Link>
          </div>
        </div>

        {/* Right: FAQs */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold/85">
            Most-asked, before saying yes
          </p>
          <ul className="mt-4 divide-y divide-tat-paper/12 border-y border-tat-paper/12">
            {FAQS.map(({ q, a }) => (
              <li key={q}>
                <details className="group">
                  <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2 focus-visible:ring-offset-tat-charcoal rounded-sm">
                    <span className="font-display text-[16px] md:text-[18px] font-medium text-tat-paper leading-snug">
                      {q}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 text-tat-paper/55 transition-transform group-open:rotate-180 shrink-0"
                      aria-hidden
                    />
                  </summary>
                  <p className="pb-4 text-[14px] text-tat-paper/75 leading-relaxed">
                    {a}
                  </p>
                </details>
              </li>
            ))}
          </ul>
          <Link
            href="/faqs"
            className="mt-5 inline-flex text-[13px] font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            All 30+ questions answered →
          </Link>
        </div>
      </div>
    </section>
  );
}
