import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

interface Props {
  image: string;
  name: string;
  region: string;
  country?: string;
  whisper: string;
  packageCount?: number;
  priceFrom?: number;
  href: string;
}

export default function DestinationCardUI({
  image, name, region, country, whisper, packageCount, priceFrom, href,
}: Props) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[3/4] rounded-card overflow-hidden bg-tat-charcoal shadow-card transition duration-200 hover:shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2"
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        quality={70}
        className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/85 via-tat-charcoal/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 text-white">
        <div className="flex items-center gap-1.5 text-tag uppercase text-white/65">
          <MapPin className="h-3 w-3 text-tat-orange-soft" />
          <span>{country ?? region}</span>
        </div>
        <h3 className="mt-1 font-serif text-h3 text-white leading-tight">
          {name}
        </h3>
        <p className="mt-1.5 font-serif italic text-meta text-tat-orange/30/90 line-clamp-2">
          {whisper}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 text-meta">
          <span className="text-white/70">
            {packageCount && `${packageCount} packages`}
            {packageCount && priceFrom ? " · " : ""}
            {priceFrom && `from ₹${priceFrom.toLocaleString("en-IN")}`}
          </span>
          <span className="inline-flex items-center gap-1 text-white/85 group-hover:text-tat-orange-soft transition duration-120">
            Explore
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </span>
        </div>
      </div>
    </Link>
  );
}
