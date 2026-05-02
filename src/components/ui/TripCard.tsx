import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

export interface TripCardProps {
  href: string;
  image: string;
  destination: string;
  title: string;
  duration?: string;
  priceFrom: number;
  layout?: "rail" | "feature";
}

/**
 * Minimal trip card. Two layouts:
 *  - rail:    image (16:10) + 4 lines of text + 1 CTA target (the whole card).
 *  - feature: full-bleed image, title overlaid, single "View trip" affordance.
 *
 * Replaces PackageCard on the homepage. PackageCard stays for /packages and
 * /packages/[slug] where its 18-element surface is justified by intent. On
 * the home rail the visitor isn't deciding to book — they're browsing.
 */
export default function TripCard({
  href,
  image,
  destination,
  title,
  duration,
  priceFrom,
  layout = "rail",
}: TripCardProps) {
  if (layout === "feature") {
    return (
      <Link
        href={href}
        className="group relative block h-full w-full overflow-hidden rounded-3xl bg-tat-charcoal/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
      >
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 text-white">
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-white/85">
            {destination}
          </p>
          <h3 className="font-display text-[26px] md:text-[34px] leading-[1.05] mt-1.5 max-w-[18ch] text-balance">
            {title}
          </h3>
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 group-hover:underline">
            View trip
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white border border-tat-charcoal/8 hover:border-tat-charcoal/25 hover:shadow-soft transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-tat-charcoal/10">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 768px) 80vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-charcoal/55">
          <MapPin className="h-3 w-3 text-tat-gold" aria-hidden />
          {destination}
        </p>
        <h3 className="font-display text-[17px] md:text-[18px] font-medium text-tat-charcoal leading-snug line-clamp-2 min-h-[44px]">
          {title}
        </h3>
        <p className="mt-auto pt-2 text-[13px] text-tat-charcoal/75 flex items-center justify-between">
          <span>{duration ?? ""}</span>
          <span className="font-semibold text-tat-charcoal">
            from ₹{priceFrom.toLocaleString("en-IN")}
          </span>
        </p>
      </div>
    </Link>
  );
}
