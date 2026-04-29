import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  Mountain,
  HeartHandshake,
  UtensilsCrossed,
  ShieldCheck,
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import PackageCardUI, { type PackageCardProps } from "@/components/ui/PackageCard";

const FEATURE_IMAGE =
  "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1600&q=75&auto=format&fit=crop";

const YATRA_PROOFS = [
  { icon: Mountain,        label: "600+",  sub: "yatris this season" },
  { icon: HeartHandshake,  label: "VIP",   sub: "darshan assistance" },
  { icon: UtensilsCrossed, label: "Veg-only", sub: "food planning" },
  { icon: ShieldCheck,     label: "48 h",  sub: "free changes window" },
];

const FEATURE_CHIPS = [
  "Helicopter darshans",
  "Calm road transfers",
  "Hotels close to temples",
  "Palki & medical support",
  "Senior-citizen safe",
];

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  yatras?: PackageCardProps[];
  /** When part of a Browse cluster, drop top padding + top border so the
   *  band reads as a continuation of the section above. */
  tightTop?: boolean;
}

export default function PilgrimFeatureBand({
  eyebrow = "A special kind of journey",
  titleStart = "Yatras, walked with",
  titleItalic = "quiet care.",
  lede = "Helicopter darshans, calm transfers, vegetarian planning, and hotels close to the temples. We've shepherded 600+ yatris this season — and our planners know which queue moves fastest at Kedarnath.",
  yatras: yatrasProp,
  tightTop = false,
}: Props = {}) {
  const yatras = (yatrasProp ?? []).slice(0, 3);

  const WHATSAPP_HREF =
    "https://wa.me/918115999588?text=" +
    encodeURIComponent("Hi Trust and Trip — I'd like help planning a yatra.");

  return (
    <section
      aria-labelledby="pilgrim-title"
      className={`${tightTop ? "pt-4 md:pt-6 pb-18 md:pb-22 border-b" : "py-18 md:py-22 border-y"} bg-tat-cream-warm/30 border-tat-orange/25 dark:bg-tat-charcoal/40 dark:border-tat-orange/30`}
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        {/* Header — full width, centered for breathing room */}
        <div className="max-w-3xl">
          <SectionHeader
            eyebrow={eyebrow}
            title={titleStart}
            italicTail={titleItalic}
            lede={lede}
          />
        </div>

        {/* Feature chips */}
        <ul className="mt-6 flex flex-wrap gap-2">
          {FEATURE_CHIPS.map((c) => (
            <li
              key={c}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-pill border border-tat-orange/30 bg-white/70 text-tat-charcoal/80 dark:bg-white/10 dark:text-white/85 dark:border-tat-orange/40"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-tat-gold" aria-hidden />
              {c}
            </li>
          ))}
        </ul>

        {/* Two-up: image with overlay quote · proof + cards */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
          {/* Image w/ overlay */}
          <div className="lg:col-span-5">
            <div className="relative h-full min-h-[360px] md:min-h-[440px] rounded-card overflow-hidden bg-tat-charcoal/15">
              <Image
                src={FEATURE_IMAGE}
                alt="A temple at dawn, lit by the first light."
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                quality={70}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/85 via-tat-charcoal/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <p className="font-serif text-h3 text-white leading-snug">
                  &ldquo;The Char Dham helicopter yatra was flawless. VIP
                  darshans for my parents, palki transfers without us
                  asking.&rdquo;
                </p>
                <p className="mt-3 text-meta text-white/80">
                  Akhil Menon · Bengaluru · Char Dham 2025
                </p>
              </div>
            </div>
          </div>

          {/* Right: proof + yatras */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Proof tiles */}
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {YATRA_PROOFS.map(({ icon: Icon, label, sub }) => (
                <li
                  key={label}
                  className="rounded-card border border-tat-orange/20 bg-white/80 px-4 py-4 dark:bg-white/5 dark:border-white/10"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-tat-gold/15 text-tat-gold">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <p className="mt-2.5 font-display font-medium text-h3 text-tat-charcoal dark:text-white leading-none">
                    {label}
                  </p>
                  <p className="mt-1 text-tag uppercase text-tat-slate dark:text-white/60">
                    {sub}
                  </p>
                </li>
              ))}
            </ul>

            {/* Yatra cards */}
            {yatras.length > 0 && (
              <ul className="flex flex-col gap-4">
                {yatras.map((p) => (
                  <li key={p.href}>
                    <PackageCardUI
                      {...p}
                      layout="horizontal"
                      density="compact"
                    />
                  </li>
                ))}
              </ul>
            )}

            {/* CTAs */}
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center">
              <Link
                href="/destinations/uttarakhand"
                className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-pill bg-tat-charcoal text-tat-paper text-body-sm font-medium hover:bg-tat-charcoal/90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
              >
                See all yatras
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-pill border border-tat-success-fg/40 bg-white text-tat-success-fg text-body-sm font-medium hover:bg-tat-success-bg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 dark:bg-white/10 dark:text-tat-success-fg dark:border-tat-success-fg/40"
              >
                <MessageCircle className="h-4 w-4" />
                Speak to our yatra desk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
