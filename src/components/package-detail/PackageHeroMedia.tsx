"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

interface Props {
  image: string;
  alt: string;
  videoUrl?: string;
}

interface ParsedVideo {
  embed: string;
  provider: "youtube" | "vimeo";
}

function parseVideoUrl(raw?: string): ParsedVideo | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return { embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`, provider: "youtube" };
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) return { embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`, provider: "youtube" };
    }
    if (host === "youtube-nocookie.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return { embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`, provider: "youtube" };
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) return { embed: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`, provider: "vimeo" };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Hero media slot for the package detail page.
 *
 * Default: ships the hero `<Image>` (priority + fill) as before.
 * When a YouTube / Vimeo URL is set on the package (`pkg.youtubeUrl`),
 * overlays a play button. Click swaps the still for an autoplay iframe —
 * that way LCP stays the static image and we don't pay a third-party
 * iframe cost on initial load.
 */
export default function PackageHeroMedia({ image, alt, videoUrl }: Props) {
  const parsed = parseVideoUrl(videoUrl);
  const [playing, setPlaying] = useState(false);

  return (
    <>
      {playing && parsed ? (
        <iframe
          src={parsed.embed}
          title={`${alt} — video`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <Image
          src={image}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}

      {parsed && !playing && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Play package preview video"
          className="absolute inset-0 z-10 grid place-items-center group focus-visible:outline-none"
        >
          <span className="grid place-items-center h-16 w-16 md:h-20 md:w-20 rounded-full bg-tat-paper/95 text-tat-charcoal shadow-[0_12px_36px_-8px_rgba(0,0,0,0.55)] ring-4 ring-tat-paper/15 group-hover:scale-105 group-focus-visible:ring-tat-orange/60 transition-transform">
            <Play className="h-6 w-6 md:h-7 md:w-7 fill-current translate-x-0.5" aria-hidden />
          </span>
        </button>
      )}
    </>
  );
}
