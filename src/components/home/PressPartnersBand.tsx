import Image from "next/image";
import Link from "next/link";
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

export default function PressPartnersBand({
  eyebrow = "As featured in",
  titleStart = "Trusted,",
  titleItalic = "on record.",
  lede = "A note from the press, and the tourism boards we work with directly.",
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
        ) : (
          <p className="mt-10 text-center text-meta text-tat-slate/60">
            {/* TODO: add partner / press logos in Sanity (Partner / accreditation logos). */}
            Partner logos pending — add via Sanity Studio.
          </p>
        )}

        {quote ? (
          <figure className="mt-12 max-w-3xl mx-auto text-center">
            <blockquote className="font-display text-h3 text-tat-charcoal/80">
              &ldquo;{quote.quote}&rdquo;
            </blockquote>
            {quote.attribution && (
              <figcaption className="mt-3 text-meta text-tat-slate/80">
                {quote.sourceUrl ? (
                  <Link href={quote.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-tat-charcoal underline-offset-4 hover:underline">
                    {quote.attribution}
                  </Link>
                ) : (
                  quote.attribution
                )}
              </figcaption>
            )}
          </figure>
        ) : (
          <blockquote className="mt-12 max-w-3xl mx-auto text-center font-display text-h3 text-tat-slate/60">
            {/* TODO: feature a real press quote in Sanity (Press quotes → featured: true). */}
            Press quote pending — add via Sanity Studio.
          </blockquote>
        )}
      </div>
    </section>
  );
}
