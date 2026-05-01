"use client";

import { useState } from "react";
import Image from "next/image";
import { Grid2x2, Images } from "lucide-react";
import Lightbox from "./Lightbox";

interface Props {
  images: string[];
  title: string;
}

export default function PackageGallery({ images, title }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const open = (i: number) => setLightboxIndex(i);
  const close = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length));
  const next = () => setLightboxIndex((i) => (i === null ? 0 : (i + 1) % images.length));

  if (!images.length) return null;

  const [main, ...rest] = images;
  const shown = rest.slice(0, 4);
  const remaining = images.length - 5;

  return (
    <>
      <div className="mb-16">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="eyebrow">Photo Gallery</span>
            <h2 className="heading-section mt-1 text-balance">
              See it
              <span className="italic text-tat-gold font-light"> before you go.</span>
            </h2>
          </div>
          <button
            onClick={() => open(0)}
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-tat-charcoal/60 hover:text-tat-charcoal transition-colors"
          >
            <Grid2x2 className="h-4 w-4" />
            View all {images.length} photos
          </button>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-3xl overflow-hidden">
          {/* Main large image */}
          <button
            type="button"
            onClick={() => open(0)}
            aria-label={`Open photo gallery — ${images.length} photos of ${title}`}
            className="col-span-2 row-span-2 relative aspect-[4/3] md:aspect-auto md:h-full min-h-[200px] cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
          >
            <Image
              src={main}
              alt={`${title} — main photo`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-tat-charcoal/0 group-hover:bg-tat-charcoal/20 transition-colors duration-300" />
          </button>

          {/* Side thumbnails */}
          {shown.map((img, i) => {
            const isLast = i === shown.length - 1 && remaining > 0;
            return (
              <button
                type="button"
                key={i}
                aria-label={isLast && remaining > 0 ? `View ${remaining} more photos in lightbox` : `Open photo ${i + 2} of ${images.length} in lightbox`}
                className="relative aspect-square cursor-pointer group overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
                onClick={() => open(i + 1)}
              >
                <Image
                  src={img}
                  alt={`${title} — photo ${i + 2}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-tat-charcoal/0 group-hover:bg-tat-charcoal/20 transition-colors duration-300" />
                {isLast && remaining > 0 && (
                  <div className="absolute inset-0 bg-tat-charcoal/60 flex flex-col items-center justify-center text-tat-paper" aria-hidden="true">
                    <Images className="h-6 w-6 mb-1 opacity-80" />
                    <span className="text-lg font-display font-medium">+{remaining}</span>
                    <span className="text-[11px] opacity-70">more photos</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile view all */}
        <button
          onClick={() => open(0)}
          className="md:hidden mt-3 w-full py-3 rounded-xl border border-tat-charcoal/12 text-sm font-medium text-tat-charcoal/70 hover:border-tat-charcoal/30 hover:text-tat-charcoal transition-colors flex items-center justify-center gap-2"
        >
          <Grid2x2 className="h-4 w-4" />
          View all {images.length} photos
        </button>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          title={title}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}
