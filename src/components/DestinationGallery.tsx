"use client";

import { useState } from "react";
import Image from "next/image";
import { Images } from "lucide-react";
import Lightbox from "./Lightbox";

interface Props {
  images: string[];
  name: string;
}

export default function DestinationGallery({ images, name }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const open = (i: number) => setLightboxIndex(i);
  const close = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length));
  const next = () => setLightboxIndex((i) => (i === null ? 0 : (i + 1) % images.length));

  if (!images.length) return null;

  const shown = images.slice(0, 6);

  return (
    <>
      <section className="bg-ink py-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 md:px-0 md:container-custom">
          {shown.map((img, i) => {
            const isLast = i === shown.length - 1 && images.length > shown.length;
            const remaining = images.length - shown.length;
            return (
              <button
                key={i}
                onClick={() => open(i)}
                aria-label={`View ${name} photo ${i + 1}`}
                className="relative shrink-0 rounded-xl overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                style={{ width: i === 0 ? 280 : 160, height: "clamp(112px, 9vw, 144px)" }}
              >
                <Image
                  src={img}
                  alt={`${name} photo ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes={i === 0 ? "280px" : "160px"}
                />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors duration-300" />
                {isLast && remaining > 0 && (
                  <div className="absolute inset-0 bg-ink/60 flex flex-col items-center justify-center text-cream pointer-events-none">
                    <Images className="h-5 w-5 mb-1 opacity-80" />
                    <span className="text-sm font-display font-medium">+{remaining}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          title={name}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}
