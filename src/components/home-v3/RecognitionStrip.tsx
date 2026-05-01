// Recognition + tourism-partner marquee.
//
// Each partner renders as a brand-tinted chip: emblematic lucide icon
// in the partner's brand colour + bold wordmark + tagline. Ships
// without any external logo assets so the strip looks polished from
// day one, with zero risk of trademarked-logo-in-repo issues.
//
// To swap in real logos later: drop /public/partners/{slug}.svg and
// switch the chip render to <Image> — see README in that folder.

"use client";

import {
  Plane, ShieldCheck, Award, Globe2, Star, Mountain, Palmtree,
  Sun, Waves, Building2, Landmark, Anchor, Leaf, Flower2, Compass,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Partner = {
  /** Short display name shown in bold on the chip. */
  name: string;
  /** kebab-case slug — used as React key + future asset filename. */
  slug: string;
  /** One-line supporting tagline below the wordmark. */
  sub: string;
  /** Lucide icon emblematic of the partner. */
  Icon: LucideIcon;
  /** Brand accent colour. Used for the icon, the top hairline, and
   *  the chip ring on hover. */
  accent: string;
};

// Brand colours pulled from each org's public visual identity. Used
// for the icon + the colour hairline at the top of the chip. Kept
// muted enough that 17 chips don't fight each other in the marquee.
const PARTNERS: Partner[] = [
  // Trade bodies / accreditations
  { name: "IATA", slug: "iata", sub: "Accredited Travel Agent",
    Icon: Plane,       accent: "#0066B2" },
  { name: "PATA", slug: "pata", sub: "Pacific Asia Travel Assoc.",
    Icon: Globe2,      accent: "#0F766E" },
  { name: "SATA", slug: "sata", sub: "South Asian Travel Assoc.",
    Icon: ShieldCheck, accent: "#1E40AF" },
  { name: "ASTA", slug: "asta", sub: "American Society of Travel Advisors",
    Icon: Award,       accent: "#047857" },

  // Government tourism boards (India)
  { name: "Incredible India",    slug: "ministry-of-tourism", sub: "Ministry of Tourism · Govt of India",
    Icon: Star,        accent: "#F97316" },
  { name: "Uttarakhand Tourism", slug: "uttarakhand-tourism", sub: "Simply Heaven",
    Icon: Mountain,    accent: "#15803D" },
  { name: "Kerala Tourism",      slug: "kerala-tourism",      sub: "God's Own Country",
    Icon: Palmtree,    accent: "#047857" },
  { name: "Rajasthan Tourism",   slug: "rajasthan-tourism",   sub: "Padharo Mhare Desh",
    Icon: Sun,         accent: "#C2410C" },
  { name: "Goa Tourism",         slug: "goa-tourism",         sub: "Sunshine state of India",
    Icon: Waves,       accent: "#0EA5E9" },

  // Government tourism boards (international)
  { name: "Amazing Thailand",   slug: "thailand-tourism",   sub: "Tourism Authority of Thailand",
    Icon: Flower2,    accent: "#B91C1C" },
  { name: "Visit Vietnam",      slug: "vietnam-tourism",    sub: "Timeless Charm",
    Icon: Anchor,     accent: "#DC2626" },
  { name: "Visit Dubai",        slug: "dubai-tourism",      sub: "Experience Dubai",
    Icon: Building2,  accent: "#C8932A" },
  { name: "Go Türkiye",         slug: "turkey-tourism",     sub: "Türkiye Tourism Board",
    Icon: Landmark,   accent: "#B91C1C" },
  { name: "Visit Maldives",     slug: "maldives-tourism",   sub: "Sunny Side of Life",
    Icon: Waves,      accent: "#0891B2" },
  { name: "MySwitzerland",      slug: "switzerland-tourism", sub: "Switzerland Tourism",
    Icon: Mountain,   accent: "#DC2626" },
  { name: "Visit Singapore",    slug: "singapore-tourism",  sub: "Passion Made Possible",
    Icon: Compass,    accent: "#BE123C" },
  { name: "So Sri Lanka",       slug: "sri-lanka-tourism",  sub: "Sri Lanka Tourism",
    Icon: Leaf,       accent: "#15803D" },
];

export default function RecognitionStrip() {
  return (
    <section
      aria-labelledby="recognition-title"
      className="relative bg-tat-paper border-y border-tat-charcoal/8 py-10 md:py-14 overflow-hidden"
    >
      {/* Edge fade — softens the marquee edges so chips don't slam
          into the viewport edges. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-tat-paper to-transparent z-10"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-tat-paper to-transparent z-10"
      />

      <div className="container-custom mb-7 md:mb-9">
        <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold text-center">
          Recognised &amp; trusted by
        </p>
        <h2
          id="recognition-title"
          className="mt-2 font-display font-normal text-[22px] md:text-[28px] leading-tight text-tat-charcoal text-center text-balance max-w-3xl mx-auto"
        >
          Accredited agency. Tourism-board{" "}
          <em className="not-italic font-display italic text-tat-gold">partner across 16+ destinations.</em>
        </h2>
        <p className="mt-2.5 text-[13px] text-tat-charcoal/60 text-center max-w-2xl mx-auto">
          IATA-affiliated, in active partnership with national and regional tourism boards we send travelers to.
        </p>
      </div>

      {/* Marquee track — duplicate the list so the -50% translate
          loops without a visible jump. Hover pauses the animation so
          users can read individual chips. */}
      <div className="relative">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none gap-4 md:gap-5">
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <PartnerChip key={`${p.slug}-${i}`} partner={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerChip({ partner }: { partner: Partner }) {
  const { Icon, accent } = partner;
  return (
    <div
      className="group/chip relative shrink-0 inline-flex items-center gap-3 pl-3 pr-5 h-16 md:h-[72px] min-w-[230px] md:min-w-[250px] rounded-2xl bg-white border border-tat-charcoal/8 hover:border-tat-charcoal/20 shadow-soft hover:shadow-soft-lg transition-all duration-300"
      title={`${partner.name} — ${partner.sub}`}
      style={{
        // CSS var so Tailwind can drive border-on-hover via inline style.
        ["--chip-accent" as string]: accent,
      }}
    >
      {/* Top accent hairline — bleeds past the rounded corner via inset-x. */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 inset-x-3 h-[3px] rounded-b-full opacity-90 group-hover/chip:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(to right, transparent, ${accent}, transparent)`,
        }}
      />

      {/* Icon disc — soft tinted bg + the partner's brand colour. */}
      <span
        aria-hidden
        className="grid place-items-center h-11 w-11 md:h-12 md:w-12 rounded-xl shrink-0 transition-transform duration-300 group-hover/chip:scale-105"
        style={{
          backgroundColor: `${accent}15`,
          color: accent,
          boxShadow: `inset 0 0 0 1px ${accent}25`,
        }}
      >
        <Icon className="h-5 w-5 md:h-[22px] md:w-[22px]" strokeWidth={2} />
      </span>

      {/* Wordmark + tagline */}
      <span className="flex flex-col items-start leading-tight min-w-0">
        <span className="font-display text-[15px] md:text-[16px] font-semibold tracking-tight text-tat-charcoal whitespace-nowrap">
          {partner.name}
        </span>
        <span className="mt-0.5 text-[10.5px] md:text-[11px] uppercase tracking-[0.14em] font-medium text-tat-charcoal/55 whitespace-nowrap">
          {partner.sub}
        </span>
      </span>
    </div>
  );
}
