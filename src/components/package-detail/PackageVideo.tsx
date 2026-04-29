"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import JsonLd from "@/components/JsonLd";

interface Props {
  url: string;
  poster: string;
  title: string;
}

// YouTube/Vimeo URL → embed URL with autoplay. Returns null when the URL
// isn't a recognised provider — caller hides the section in that case.
function parseEmbed(raw: string): { embed: string; videoId: string; provider: "youtube" | "vimeo" } | null {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return { embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`, videoId: id, provider: "youtube" };
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) return { embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`, videoId: id, provider: "youtube" };
    }
    if (host === "youtube-nocookie.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return { embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`, videoId: id, provider: "youtube" };
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) return { embed: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`, videoId: id, provider: "vimeo" };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Inline video block — poster + play button, opens an iframe lightbox on
 * click. Used on packages where Sanity has a youtubeUrl set. Auto-derives
 * the YouTube poster (i.ytimg.com) when the package's heroImage isn't a
 * great match for the video thumbnail; passed-in poster wins.
 */
export default function PackageVideo({ url, poster, title }: Props) {
  const [open, setOpen] = useState(false);
  const parsed = parseEmbed(url);
  if (!parsed) return null;

  // Prefer the YouTube auto-thumbnail when no explicit poster — sharper
  // and matches the actual video frame.
  const finalPoster =
    parsed.provider === "youtube"
      ? `https://i.ytimg.com/vi/${parsed.videoId}/maxresdefault.jpg`
      : poster;

  // VideoObject JSON-LD — modest SEO win, especially for review-rich pages.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${title} — Trust and Trip walkthrough`,
    description: `Watch a real planner walk through the ${title} itinerary.`,
    thumbnailUrl: finalPoster,
    contentUrl: url,
    embedUrl: parsed.embed,
    uploadDate: new Date().toISOString().split("T")[0],
  };

  return (
    <section className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
      <JsonLd data={jsonLd} />
      <span className="eyebrow">Watch the trip</span>
      <h2 className="heading-section mt-2 mb-5 text-balance">
        See what
        <span className="italic text-tat-gold font-light"> the days actually look like.</span>
      </h2>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden rounded-2xl bg-tat-charcoal aspect-video focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
        aria-label={`Play ${title} video`}
      >
        <Image
          src={finalPoster}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 760px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/60 via-tat-charcoal/15 to-transparent" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="grid place-items-center h-16 w-16 md:h-20 md:w-20 rounded-full bg-tat-gold text-tat-charcoal shadow-lg group-hover:scale-110 transition-transform">
            <Play className="h-7 w-7 ml-1" fill="currentColor" />
          </span>
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} video`}
          className="fixed inset-0 z-[100] bg-black/85 grid place-items-center p-4 md:p-8"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 grid place-items-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={parsed.embed}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </section>
  );
}
