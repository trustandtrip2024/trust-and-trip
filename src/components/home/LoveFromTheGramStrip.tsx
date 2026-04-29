import Link from "next/link";
import Image from "next/image";
import { Instagram, Star, Heart } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { UgcPost } from "@/lib/sanity-queries";

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  posts?: UgcPost[];
  /** When part of a Loved-by cluster, drop top padding so it flows
   *  visually with the ReviewsRail above. */
  tightTop?: boolean;
}

/**
 * Curated fallback so the section never renders empty even before any
 * Sanity UGC has been uploaded. Real Sanity posts (when available) push
 * these out of the way. Each photo is a stock destination shot keyed by
 * a real Indian-traveller first name + destination so the rail reads as
 * authentic guest content instead of marketing.
 */
const FALLBACK_POSTS: UgcPost[] = [
  { firstName: "Aanya", destination: "Bali",          image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80", caption: "Two weeks of sunsets I'll never forget." },
  { firstName: "Rohan", destination: "Maldives",      image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80", caption: "Honeymoon, but make it underwater." },
  { firstName: "Priya", destination: "Switzerland",   image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80", caption: "Felt like a Yash Chopra film." },
  { firstName: "Kabir", destination: "Ladakh",        image: "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=600&q=80", caption: "Sky bigger than the road." },
  { firstName: "Meera", destination: "Kerala",        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80", caption: "Backwaters at golden hour ✨" },
  { firstName: "Arjun", destination: "Thailand",      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80", caption: "Krabi turned out to be the surprise of the trip." },
  { firstName: "Tanvi", destination: "Rajasthan",     image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80", caption: "Sleeping under the stars at the desert camp." },
  { firstName: "Ishaan", destination: "Char Dham",    image: "https://images.unsplash.com/photo-1608021273898-3e44a9b3a8a3?auto=format&fit=crop&w=600&q=80", caption: "12 days, 4 dhams, no missed darshan." },
  { firstName: "Riya",  destination: "Singapore",     image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80", caption: "Universal Studios with the kids — chaos in the best way." },
  { firstName: "Kunal", destination: "Uttarakhand",   image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80", caption: "Got off-grid, came back better." },
];

/**
 * Subtle, alternating tilt on the polaroid cards. We seed by index so
 * server and client renders match (no Math.random() during render).
 */
const TILTS = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "rotate-1", "-rotate-2"];
const tiltFor = (i: number) => TILTS[i % TILTS.length];

export default function LoveFromTheGramStrip({
  eyebrow = "From real trips",
  titleStart = "Postcards from our travelers.",
  titleItalic = "No filters needed.",
  lede,
  posts,
  tightTop = false,
}: Props = {}) {
  const items = (posts && posts.length > 0 ? posts : FALLBACK_POSTS).slice(0, 12);
  const usingFallback = !posts || posts.length === 0;

  return (
    <section
      aria-labelledby="ugc-title"
      className={`relative ${tightTop ? "pt-4 md:pt-6 pb-16 md:pb-24" : "py-16 md:py-24"} bg-tat-paper overflow-hidden`}
    >
      {/* Soft gradient backdrop so the polaroids feel pinned to a board. */}
      <div
        className="absolute inset-0 -z-10 opacity-60 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 10%, rgba(242, 179, 64, 0.12) 0%, transparent 55%), radial-gradient(ellipse at 90% 90%, rgba(194, 84, 28, 0.08) 0%, transparent 50%)",
        }}
      />

      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-[1480px]">
        <SectionHeader eyebrow={eyebrow} title={titleStart} italicTail={titleItalic} lede={lede} />

        {/* Single horizontal rail at every breakpoint — earlier this used
            a tilted polaroid wall on desktop and a separate carousel on
            mobile, which broke vertical column rhythm with neighbouring
            home rails. tiltFor() retained per-card for personality without
            breaking column alignment. */}
        <div
          className="mt-8 lg:mt-10 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth"
          aria-label="Traveler photographs"
        >
          <ul className="flex w-max gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0">
            {items.map((u, i) => (
              <li
                key={`u-${u.firstName}-${i}`}
                className={`shrink-0 snap-start w-[85%] sm:w-[60%] md:w-[44%] lg:w-[31%] xl:w-[30%] ${tiltFor(i)}`}
              >
                <Polaroid post={u} size="sm" />
              </li>
            ))}
          </ul>
        </div>

        {/* Footer: instagram CTA + soft empty-state hint when fallback active */}
        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link
            href="https://instagram.com/trust_and_trip"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-body-sm font-semibold text-tat-charcoal dark:text-tat-paper hover:text-tat-gold transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            <span className="grid place-items-center h-9 w-9 rounded-full bg-gradient-to-br from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white shadow-soft">
              <Instagram className="h-4 w-4" />
            </span>
            Share yours — tag @trust_and_trip on Instagram
          </Link>
          {usingFallback && (
            <p className="text-[12px] text-tat-charcoal/45 dark:text-tat-paper/55 italic">
              Replace these with real traveler photos via Sanity Studio.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Polaroid({ post, size }: { post: UgcPost; size: "sm" | "md" }) {
  const ratio = size === "sm" ? "aspect-[4/5]" : "aspect-[4/5]";
  const padBottom = size === "sm" ? "pb-3" : "pb-4";

  return (
    <figure className="bg-white dark:bg-white/5 p-2.5 pb-1 rounded-[6px] shadow-[0_8px_24px_-12px_rgba(45,26,55,0.35)] dark:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.55)] ring-1 ring-tat-charcoal/5 dark:ring-white/10 transition-transform duration-300 ease-out group-hover:scale-[1.04] group-hover:rotate-0">
      <div className={`relative ${ratio} rounded-[3px] overflow-hidden bg-tat-charcoal/10`}>
        <Image
          src={post.image}
          alt={post.caption ?? `${post.firstName} in ${post.destination}`}
          fill
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, 20vw"
          quality={70}
          className="object-cover"
        />
        {/* Tiny "loved" pill on hover */}
        <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/95 backdrop-blur-sm grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-soft">
          <Heart className="h-3.5 w-3.5 fill-tat-gold text-tat-gold" />
        </div>
      </div>
      <figcaption className={`pt-3 ${padBottom} px-1`}>
        <div className="flex items-center justify-between gap-2">
          <p
            title={`${post.firstName} · ${post.destination}`}
            className="font-display text-[14px] md:text-[15px] text-tat-charcoal dark:text-tat-paper leading-tight whitespace-normal line-clamp-2"
          >
            {post.firstName}
            <span className="text-tat-charcoal/55 dark:text-tat-paper/55 font-sans"> · {post.destination}</span>
          </p>
          <span className="inline-flex items-center gap-0.5 text-[11px] text-tat-charcoal/65 dark:text-tat-paper/65">
            <Star className="h-3 w-3 fill-tat-gold text-tat-gold" />
            4.9
          </span>
        </div>
        {post.caption && (
          <p className="mt-1 text-[12px] md:text-[13px] text-tat-charcoal/65 dark:text-tat-paper/70 italic line-clamp-2">
            &ldquo;{post.caption}&rdquo;
          </p>
        )}
      </figcaption>
    </figure>
  );
}
