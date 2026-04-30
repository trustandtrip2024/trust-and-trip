import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";

const WHATSAPP_HREF =
  "https://wa.me/918115999588?text=" +
  encodeURIComponent("Hi Akash — I'd like help planning my trip.");
const PHONE_HREF = "tel:+918115999588";

const FOUNDER_PHOTO_DEFAULT = "";

interface Props {
  name?: string;
  role?: string;
  photo?: string;
  oneLiner?: string;
  /** Anchor href for the "About me" link. */
  bioHref?: string;
  /** Trips planned to date — drives the credibility line in the card. */
  tripsPlanned?: number;
  /** When part of a Why-us cluster, drop top padding to flow tight. */
  tightTop?: boolean;
}

/**
 * Small horizontal card introducing the named human behind the trip.
 * Sits between the WhyNotAggregators rail and the Pillars section. Keeps
 * the founder's full bio on /about — this card is conversion-focused
 * (face + WhatsApp), not editorial.
 */
export default function HomePlannerCard({
  name = "Akash Mishra",
  role = "Founder & lead planner",
  photo = FOUNDER_PHOTO_DEFAULT,
  oneLiner = "I read every form myself. Tell me your dates and I'll send your itinerary in 24 hours.",
  bioHref = "/about",
  tripsPlanned = 8000,
  tightTop = false,
}: Props = {}) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const usePhoto = !!photo && photo.length > 0;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: role,
    image: usePhoto ? `https://trustandtrip.com${photo.startsWith("/") ? photo : `/${photo}`}` : undefined,
    url: `https://trustandtrip.com${bioHref}`,
    worksFor: {
      "@type": "TravelAgency",
      name: "Trust and Trip",
      url: "https://trustandtrip.com",
    },
    sameAs: ["https://www.linkedin.com/company/trustandtrip"],
  };

  return (
    <section
      aria-labelledby="planner-card-title"
      className={`${tightTop ? "pt-4 md:pt-6 pb-16 md:pb-24" : "py-16 md:py-24"} bg-tat-cream-warm/30 dark:bg-tat-charcoal/95`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <div className="container-custom max-w-5xl">
        <div className="rounded-card bg-white dark:bg-white/[0.04] ring-1 ring-tat-charcoal/8 dark:ring-white/10 shadow-card overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] gap-0">
            {/* Photo */}
            <div className="relative aspect-square sm:aspect-auto sm:min-h-[260px] bg-tat-charcoal/15">
              {usePhoto ? (
                <Image
                  src={photo}
                  alt={`${name}, ${role}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 240px"
                  quality={75}
                  className="object-cover"
                />
              ) : (
                <div
                  aria-label={`${name} portrait placeholder`}
                  className="absolute inset-0 grid place-items-center bg-gradient-to-br from-tat-teal-deep via-tat-teal to-tat-gold"
                >
                  <span className="font-display text-display text-tat-paper/95 tracking-tight">{initials}</span>
                </div>
              )}
              {/* Verified-human badge */}
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-white/95 text-tat-charcoal text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-pill shadow-card">
                <span className="h-1.5 w-1.5 rounded-full bg-tat-teal animate-pulse" />
                Online now
              </span>
            </div>

            {/* Text */}
            <div className="p-5 md:p-7 flex flex-col justify-center">
              <p className="text-eyebrow uppercase font-semibold text-tat-gold dark:text-tat-gold">
                Meet your planner
              </p>
              <h2
                id="planner-card-title"
                className="mt-2 font-display font-normal text-h2 text-tat-charcoal dark:text-tat-paper text-balance"
              >
                Hi, I&apos;m {name.split(" ")[0]}.
              </h2>
              <p className="mt-3 text-lead text-tat-charcoal/75 dark:text-tat-paper/75 max-w-prose">
                {oneLiner}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-pill bg-whatsapp hover:bg-[#1da851] text-white font-semibold text-body-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp me
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={PHONE_HREF}
                  className="inline-flex items-center gap-2 text-body-sm font-semibold text-tat-charcoal dark:text-tat-paper hover:text-tat-gold dark:hover:text-tat-gold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
                >
                  <Phone className="h-4 w-4" />
                  Call +91 8115 999 588
                </a>
                <span aria-hidden className="hidden md:inline-block w-px h-4 bg-tat-charcoal/20" />
                <Link
                  href={bioHref}
                  className="text-body-sm font-medium text-tat-slate hover:text-tat-charcoal dark:text-tat-paper/65 dark:hover:text-tat-paper underline-offset-4 hover:underline"
                >
                  About me →
                </Link>
              </div>

              <p className="mt-4 text-meta text-tat-slate/80 dark:text-tat-paper/55">
                {role} · {tripsPlanned.toLocaleString("en-IN")}+ trips planned · Replies under 5 min, 10 AM – 8 PM IST.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
