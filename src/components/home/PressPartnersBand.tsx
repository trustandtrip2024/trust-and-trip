import Image from "next/image";
import Link from "next/link";
import { Building2, Plane, GraduationCap, Banknote, ShieldCheck, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { PartnerLogo, PressQuote } from "@/lib/sanity-queries";

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  logos?: PartnerLogo[];
  quote?: PressQuote | null;
}

/**
 * Corporate / institutional clients we've curated travel for. Logos are
 * sourced from Clearbit's public logo service where available. For
 * institutions without a Clearbit match (e.g. Indian Air Force) we render
 * a styled name pill so the strip never has gaps.
 *
 * To replace a Clearbit logo with the real partner asset later, swap the
 * `domain` field for `logo` (full URL). The component prefers `logo` when
 * present.
 */
interface CorporateClient {
  name: string;
  /** Domain used for `https://logo.clearbit.com/{domain}` fallback. */
  domain?: string;
  /** Override URL — wins over Clearbit if provided. */
  logo?: string;
  /** Used when no logo loads (Indian Air Force, public-sector etc). */
  icon?: LucideIcon;
  /** What kind of trip we ran for them (shown as eyebrow microcopy). */
  trip?: string;
}

const CORPORATE_CLIENTS: CorporateClient[] = [
  { name: "Swiggy",            domain: "swiggy.com",          trip: "Annual offsite", icon: Briefcase },
  { name: "Panasonic",         domain: "panasonic.com",       trip: "Sales kickoff",  icon: Briefcase },
  { name: "SBI Bank",          domain: "sbi.co.in",           trip: "Leadership AGM", icon: Banknote },
  { name: "Indian Air Force",  icon: ShieldCheck,             trip: "Veterans retreat" },
  { name: "Ericsson",          domain: "ericsson.com",        trip: "R&D offsite",    icon: Briefcase },
  { name: "Symbiosis",         domain: "symbiosis.ac.in",     trip: "Faculty AGM",    icon: GraduationCap },
  { name: "Delhi University",  domain: "du.ac.in",            trip: "Student tour",   icon: GraduationCap },
  { name: "GD Goenka School",  domain: "gdgoenka.com",        trip: "Class educational", icon: GraduationCap },
  { name: "TruChip",           domain: "truchip.com",         trip: "Engineering offsite", icon: Briefcase },
  { name: "IndiGo",            domain: "goindigo.in",         trip: "Crew layover plan", icon: Plane },
  { name: "Tata Consultancy",  domain: "tcs.com",             trip: "Quarter-end retreat", icon: Building2 },
  { name: "HCL Technologies",  domain: "hcltech.com",         trip: "Manager offsite", icon: Building2 },
];

function CorporateLogo({ client }: { client: CorporateClient }) {
  // Clearbit's public logo API has been retired / flaky for several
  // domains (e.g. panasonic.com, sbi.co.in returned ERR_NAME_NOT_RESOLVED
  // in production). Render an icon + brand name instead — when the user
  // uploads real partner SVGs into Sanity, swap to client.logo.
  const src = client.logo ?? null;
  const Icon = client.icon ?? Building2;

  return (
    <div
      className="group/logo shrink-0 flex flex-col items-center justify-center gap-2 px-6 md:px-8 min-w-[140px] md:min-w-[170px]"
      title={`${client.name}${client.trip ? ` — ${client.trip}` : ""}`}
    >
      <div className="h-12 md:h-14 flex items-center justify-center">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`${client.name} logo`}
            loading="lazy"
            className="max-h-12 md:max-h-14 max-w-[120px] md:max-w-[140px] object-contain grayscale opacity-70 group-hover/logo:grayscale-0 group-hover/logo:opacity-100 transition duration-300"
          />
        ) : (
          <Icon className="h-7 w-7 text-tat-charcoal/40 dark:text-tat-paper/50" />
        )}
      </div>
      <p className="text-[12px] md:text-[13px] font-medium text-tat-charcoal/70 dark:text-tat-paper/75 whitespace-nowrap">
        {client.name}
      </p>
      {client.trip && (
        <p className="text-[10px] uppercase tracking-[0.16em] text-tat-charcoal/40 dark:text-tat-paper/45 whitespace-nowrap">
          {client.trip}
        </p>
      )}
    </div>
  );
}

export default function PressPartnersBand({
  eyebrow = "As featured in",
  titleStart = "Trusted,",
  titleItalic = "on record.",
  lede,
  logos,
  quote,
}: Props = {}) {
  const items = logos ?? [];

  return (
    <section
      aria-labelledby="press-title"
      className="py-18 md:py-22 bg-tat-paper border-y border-tat-charcoal/12"
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-6xl">
        <div className="text-center">
          <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} align="center" />
        </div>

        {items.length > 0 ? (
          <ul
            aria-label="Featured publications and partners"
            className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-80"
          >
            {items.map((p) => {
              const logo = p.logo ? (
                <Image
                  src={p.logo}
                  alt={p.name}
                  width={120}
                  height={32}
                  className="h-7 w-auto grayscale hover:grayscale-0 transition duration-200"
                />
              ) : (
                <span className="h-8 px-4 inline-flex items-center justify-center rounded-md border border-tat-charcoal/20 text-tag uppercase text-tat-slate/80">
                  {p.name}
                </span>
              );
              return (
                <li key={p.name}>
                  {p.href ? (
                    <Link
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={p.name}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
                    >
                      {logo}
                    </Link>
                  ) : (
                    logo
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}

        {quote ? (
          <figure className="mt-12 max-w-3xl mx-auto text-center">
            <blockquote className="font-display text-h3 text-tat-charcoal/80 dark:text-tat-paper/85">
              &ldquo;{quote.quote}&rdquo;
            </blockquote>
            {quote.attribution && (
              <figcaption className="mt-3 text-meta text-tat-slate/80 dark:text-tat-paper/65">
                {quote.sourceUrl ? (
                  <Link href={quote.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-tat-charcoal dark:hover:text-tat-gold underline-offset-4 hover:underline">
                    {quote.attribution}
                  </Link>
                ) : (
                  quote.attribution
                )}
              </figcaption>
            )}
          </figure>
        ) : null}
      </div>

      {/* ─── Corporate clients marquee ────────────────────────────────────
          A separate band below the press section showcasing the institutional
          clients we've curated travel for: AGMs, leadership offsites, faculty
          retreats, student educational trips. Renders as an infinite-scroll
          strip with grayscale logos that colourise on hover.
          ──────────────────────────────────────────────────────────────── */}
      <div className="mt-16 md:mt-20 pt-12 border-t border-tat-charcoal/10 dark:border-white/10">
        <div className="container mx-auto px-5 md:px-8 max-w-6xl text-center">
          <p className="tt-eyebrow">Corporate &amp; institutional travel</p>
          <h3 className="mt-2 font-display text-h2 font-medium text-tat-charcoal dark:text-tat-paper text-balance">
            AGMs, faculty retreats, school tours —{" "}
            <em className="not-italic font-display italic text-tat-gold dark:text-tat-gold">
              curated by us.
            </em>
          </h3>
        </div>

        {/* Edge-fade mask so logos enter and exit smoothly. */}
        <div
          className="relative mt-8 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)",
          }}
        >
          <div
            className="flex animate-marquee hover:[animation-play-state:paused] py-4"
            aria-label="Corporate clients we have curated travel for"
          >
            {/* Render the list twice so the translateX(-50%) marquee
                produces a seamless loop. */}
            {[...CORPORATE_CLIENTS, ...CORPORATE_CLIENTS].map((c, i) => (
              <CorporateLogo key={`${c.name}-${i}`} client={c} />
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-[12px] text-tat-charcoal/45 dark:text-tat-paper/55 italic px-4">
          Logos belong to their respective owners. Group references available
          on request — <Link href="/contact" className="underline underline-offset-2 hover:text-tat-gold dark:hover:text-tat-gold">talk to us</Link>.
        </p>
      </div>
    </section>
  );
}
