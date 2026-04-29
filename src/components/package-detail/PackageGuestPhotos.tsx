import Image from "next/image";
import Link from "next/link";
import { Camera, Instagram } from "lucide-react";
import type { UgcPost } from "@/lib/sanity-queries";

interface Props {
  posts: UgcPost[];
  destinationName: string;
}

const TILTS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-3", "rotate-3"];
const tiltFor = (i: number) => TILTS[i % TILTS.length];

/**
 * Real traveler photos from the same destination — pulled from Sanity
 * ugcPost docs filtered by destination match. Polaroid-style tilt + first
 * name + Instagram handle. Returns null when no posts so we don't render
 * an empty rail. Uses real social proof to back up the planner-curated
 * itinerary on every detail page.
 */
export default function PackageGuestPhotos({ posts, destinationName }: Props) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
      <span className="eyebrow inline-flex items-center gap-1.5">
        <Camera className="h-3.5 w-3.5 text-tat-gold" />
        Real travelers
      </span>
      <h2 className="heading-section mt-2 mb-2 text-balance">
        From travelers who&rsquo;ve
        <span className="italic text-tat-gold font-light"> been to {destinationName}.</span>
      </h2>
      <p className="text-tat-charcoal/65 mb-6 text-sm leading-relaxed max-w-xl">
        Photographs shared with permission by travelers who took our trips.
        No stock images, no filters added by us.
      </p>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {posts.slice(0, 8).map((p, i) => (
          <li key={i} className={`bg-white p-2.5 pb-3 rounded-md shadow-card ${tiltFor(i)} hover:rotate-0 transition-transform duration-300 hover:shadow-rail`}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-tat-charcoal/8">
              <Image
                src={p.image}
                alt={`${p.firstName}'s photo from ${p.destination}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="mt-2 px-0.5">
              <p className="text-[12px] font-medium text-tat-charcoal leading-tight">
                {p.firstName} <span className="text-tat-charcoal/45">· {p.destination}</span>
              </p>
              {p.caption && (
                <p className="text-[11px] text-tat-charcoal/60 italic mt-0.5 line-clamp-2 leading-snug">
                  {p.caption}
                </p>
              )}
              {p.instagramHandle && (
                <Link
                  href={`https://instagram.com/${p.instagramHandle.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-tat-charcoal/55 hover:text-tat-gold transition-colors"
                >
                  <Instagram className="h-3 w-3" />
                  @{p.instagramHandle.replace(/^@/, "")}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
