// Recognition + tourism-partner marquee.
//
// Renders a single horizontally-scrolling strip of trust marks: trade
// bodies (IATA, PATA, SATA, ASTA), the Indian Ministry of Tourism, and
// the destination-tourism boards we actively pitch (Uttarakhand, Kerala,
// Thailand, Vietnam, Dubai, Turkey, etc.).
//
// Each partner ships with both a `slug` and a stylised `wordmark`. The
// component prefers a real logo at /public/partners/{slug}.svg, falls
// back to a typographic wordmark when the asset is missing — so the
// strip looks intentional today and upgrades automatically the moment
// real logos are dropped into /public/partners/.
//
// Marquee uses the existing `animate-marquee` keyframe (40s linear
// translateX 0 → -50%) and the duplicate-track pattern: render the
// list twice inside the track so the loop is seamless.

"use client";

import { useState } from "react";
import Image from "next/image";

type Partner = {
  /** Short display name. Used as wordmark fallback + alt text. */
  name: string;
  /** kebab-case slug. Looks up /public/partners/{slug}.svg. */
  slug: string;
  /** Optional supporting line under the wordmark. */
  sub?: string;
};

const PARTNERS: Partner[] = [
  // Trade bodies / accreditations
  { name: "IATA",  slug: "iata",  sub: "Accredited agent" },
  { name: "PATA",  slug: "pata",  sub: "Pacific Asia Travel Assoc." },
  { name: "SATA",  slug: "sata",  sub: "South Asian Travel Assoc." },
  { name: "ASTA",  slug: "asta",  sub: "American Society of Travel Advisors" },
  // Government tourism boards (India)
  { name: "Incredible India",     slug: "ministry-of-tourism", sub: "Ministry of Tourism" },
  { name: "Uttarakhand Tourism",  slug: "uttarakhand-tourism", sub: "Simply Heaven" },
  { name: "Kerala Tourism",       slug: "kerala-tourism",      sub: "God's Own Country" },
  { name: "Rajasthan Tourism",    slug: "rajasthan-tourism",   sub: "Padharo Mhare Desh" },
  { name: "Goa Tourism",          slug: "goa-tourism" },
  // Government tourism boards (international)
  { name: "Amazing Thailand",     slug: "thailand-tourism",    sub: "TAT · Tourism Authority of Thailand" },
  { name: "Visit Vietnam",        slug: "vietnam-tourism",     sub: "Timeless Charm" },
  { name: "Visit Dubai",          slug: "dubai-tourism",       sub: "Experience Dubai" },
  { name: "Go Türkiye",           slug: "turkey-tourism",      sub: "Türkiye Tourism" },
  { name: "Visit Maldives",       slug: "maldives-tourism",    sub: "Sunny Side of Life" },
  { name: "Switzerland Tourism",  slug: "switzerland-tourism", sub: "MySwitzerland" },
  { name: "Singapore Tourism",    slug: "singapore-tourism",   sub: "Passion Made Possible" },
  { name: "Sri Lanka Tourism",    slug: "sri-lanka-tourism",   sub: "So Sri Lanka" },
];

export default function RecognitionStrip() {
  return (
    <section
      aria-labelledby="recognition-title"
      className="relative bg-tat-paper border-y border-tat-charcoal/8 py-9 md:py-11 overflow-hidden"
    >
      {/* Edge fade — softens the marquee edges so logos don't slam into
          the viewport edges. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-tat-paper to-transparent z-10"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-tat-paper to-transparent z-10"
      />

      <div className="container-custom mb-6 md:mb-7">
        <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold text-center">
          Recognised &amp; trusted by
        </p>
        <h2
          id="recognition-title"
          className="mt-2 font-display font-normal text-[20px] md:text-[26px] leading-tight text-tat-charcoal text-center text-balance"
        >
          Accredited agency. Tourism-board{" "}
          <em className="not-italic font-display italic text-tat-gold">partner across 16+ destinations.</em>
        </h2>
      </div>

      {/* Marquee track — duplicate the list so the -50% translate
          loops without a visible jump. Hover pauses the animation so
          users can read individual marks. */}
      <div className="relative">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none gap-6 md:gap-10">
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <PartnerMark key={`${p.slug}-${i}`} partner={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerMark({ partner }: { partner: Partner }) {
  const [imgOk, setImgOk] = useState(true);
  const src = `/partners/${partner.slug}.svg`;

  return (
    <div
      className="shrink-0 inline-flex items-center justify-center gap-3 px-4 md:px-6 h-14 md:h-16 min-w-[160px] md:min-w-[200px] rounded-xl bg-white border border-tat-charcoal/8 hover:border-tat-gold/40 transition-colors"
      title={partner.sub ? `${partner.name} — ${partner.sub}` : partner.name}
    >
      {imgOk ? (
        <Image
          src={src}
          alt={partner.name}
          width={120}
          height={36}
          className="max-h-9 md:max-h-10 w-auto object-contain opacity-85 hover:opacity-100 transition-opacity"
          onError={() => setImgOk(false)}
          unoptimized
        />
      ) : (
        // Wordmark fallback — used until /public/partners/{slug}.svg
        // exists. Styled so the strip never looks broken when assets
        // are still being collected.
        <span className="flex flex-col items-center leading-tight text-center">
          <span className="font-display text-[14px] md:text-[15px] font-semibold tracking-tight text-tat-charcoal whitespace-nowrap">
            {partner.name}
          </span>
          {partner.sub && (
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.16em] text-tat-charcoal/55 font-medium whitespace-nowrap mt-0.5">
              {partner.sub}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
