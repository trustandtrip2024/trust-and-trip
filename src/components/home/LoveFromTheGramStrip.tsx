import Link from "next/link";
import { Instagram } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { UGC_PLACEHOLDER } from "@/data/ugc.placeholder";

export default function LoveFromTheGramStrip() {
  return (
    <section aria-labelledby="ugc-title" className="py-18 md:py-22 bg-stone-50/60">
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <SectionHeader
          eyebrow="From real trips"
          title="Postcards from our travelers."
          italicTail="No filters needed."
          lede="Shared by travelers, with permission. The kind of photographs you only get when someone actually had a good time."
        />

        <div
          className="mt-7 -mx-5 px-5 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 overflow-x-auto snap-x snap-mandatory no-scrollbar"
          aria-label="Traveler photographs"
        >
          <ul className="flex gap-3 md:gap-4 pb-2">
            {UGC_PLACEHOLDER.map((u) => (
              <li
                key={u.id}
                className="snap-start shrink-0 w-[60%] sm:w-[40%] md:w-[24%] lg:w-[18%] aspect-[4/5] relative rounded-card overflow-hidden bg-stone-200"
              >
                {/* TODO: replace with real Image once UGC files exist in /public/img/ugc */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${u.image})` }}
                  role="presentation"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent" />
                <p className="absolute inset-x-0 bottom-0 px-3 py-2 text-meta text-white">
                  {u.firstName} <span className="text-white/65">· {u.destination}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <Link
            href="https://instagram.com/trust_and_trip"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-body-sm font-medium text-stone-900 hover:text-amber-700 transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 rounded-sm"
          >
            <Instagram className="h-4 w-4" />
            Share yours — tag @trustandtrip on Instagram
          </Link>
        </div>
      </div>
    </section>
  );
}
