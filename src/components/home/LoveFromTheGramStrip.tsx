import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { UgcPost } from "@/lib/sanity-queries";

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  posts?: UgcPost[];
}

export default function LoveFromTheGramStrip({
  eyebrow = "From real trips",
  titleStart = "Postcards from our travelers.",
  titleItalic = "No filters needed.",
  lede = "Shared by travelers, with permission. The kind of photographs you only get when someone actually had a good time.",
  posts,
}: Props = {}) {
  const items = posts ?? [];

  return (
    <section aria-labelledby="ugc-title" className="py-18 md:py-22 bg-tat-paper">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        {items.length > 0 ? (
          <div
            className="mt-7 -mx-5 px-5 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 overflow-x-auto snap-x snap-mandatory no-scrollbar"
            aria-label="Traveler photographs"
          >
            <ul className="flex gap-3 md:gap-4 pb-2">
              {items.map((u, i) => (
                <li
                  key={`${u.firstName}-${i}`}
                  className="snap-start shrink-0 w-[60%] sm:w-[40%] md:w-[24%] lg:w-[18%] aspect-[4/5] relative rounded-card overflow-hidden bg-tat-charcoal/15"
                >
                  <Image
                    src={u.image}
                    alt={u.caption ?? `${u.firstName} in ${u.destination}`}
                    fill
                    sizes="(max-width: 640px) 60vw, (max-width: 1024px) 40vw, 18vw"
                    quality={70}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/70 via-transparent" />
                  <p className="absolute inset-x-0 bottom-0 px-3 py-2 text-meta text-white">
                    {u.firstName} <span className="text-white/65">· {u.destination}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-7 text-meta text-tat-slate/80">
            {/* TODO: add UGC photos in Sanity Studio (Traveler photographs).
                Only entries with permissionGranted = true will appear here. */}
            No traveler photographs yet — add them in Sanity to populate this rail.
          </p>
        )}

        <div className="mt-8">
          <Link
            href="https://instagram.com/trust_and_trip"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-body-sm font-medium text-tat-charcoal hover:text-tat-gold transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            <Instagram className="h-4 w-4" />
            Share yours — tag @trustandtrip on Instagram
          </Link>
        </div>
      </div>
    </section>
  );
}
