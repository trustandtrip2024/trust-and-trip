"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";

interface Props {
  /** YouTube/Vimeo embed URL or a self-hosted MP4. When absent the
   *  component renders the poster + play button but the button only
   *  expands a "coming soon" inline note instead of opening a player. */
  videoUrl?: string;
  poster?: string;
  eyebrow?: string;
  title?: string;
  italicTail?: string;
  lede?: string;
  /** Caption shown below the poster — sets up what the viewer is about to watch. */
  caption?: string;
}

export default function HomeBrandReel({
  videoUrl,
  poster = "https://images.unsplash.com/photo-1530841344095-502e9bb29024?w=1600&q=80&auto=format&fit=crop",
  eyebrow = "60 seconds with us",
  title = "Watch how we",
  italicTail = "actually plan a trip.",
  lede = "Real planner, real itinerary, real customer call. No marketing voiceover.",
  caption = "Filmed at our Noida studio · 0:58",
}: Props = {}) {
  const [open, setOpen] = useState(false);
  const hasVideo = Boolean(videoUrl);

  return (
    <section
      aria-labelledby="reel-title"
      className="py-14 md:py-20 bg-tat-paper dark:bg-tat-charcoal"
    >
      <div className="container-custom max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <p className="tt-eyebrow">{eyebrow}</p>
          <h2
            id="reel-title"
            className="mt-2 font-display font-normal text-h2 text-tat-charcoal dark:text-tat-paper text-balance"
          >
            {title}{" "}
            <em className="not-italic font-display italic text-tat-burnt dark:text-tat-gold">
              {italicTail}
            </em>
          </h2>
          <p className="mt-3 text-lead text-tat-charcoal/75 dark:text-tat-paper/75">
            {lede}
          </p>
        </div>

        <button
          type="button"
          onClick={() => hasVideo && setOpen(true)}
          aria-label={hasVideo ? "Play brand video" : "Brand video coming soon"}
          disabled={!hasVideo}
          className="group relative block w-full aspect-video rounded-card overflow-hidden bg-tat-charcoal shadow-card transition duration-200 hover:shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 disabled:cursor-default"
        >
          <Image
            src={poster}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 960px"
            quality={75}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/70 via-tat-charcoal/15 to-transparent" />
          <span
            className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
              hasVideo ? "" : "opacity-80"
            }`}
          >
            <span className="grid h-16 w-16 md:h-20 md:w-20 place-items-center rounded-full bg-white/95 text-tat-burnt shadow-card transition duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100">
              <Play className="h-7 w-7 md:h-8 md:w-8 fill-tat-burnt translate-x-0.5" />
            </span>
          </span>
          <span className="absolute bottom-4 left-4 right-4 text-left text-white/85 text-meta">
            {hasVideo ? caption : "Brand reel · uploading soon"}
          </span>
        </button>

        {open && hasVideo && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Brand video"
            className="fixed inset-0 z-[80] grid place-items-center bg-tat-charcoal/85 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              aria-label="Close video"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange"
            >
              <X className="h-5 w-5" />
            </button>
            <div
              className="w-full max-w-4xl aspect-video bg-black rounded-card overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/youtube|vimeo/.test(videoUrl ?? "") ? (
                <iframe
                  src={videoUrl}
                  title="Trust and Trip — brand video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
