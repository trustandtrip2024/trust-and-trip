"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Quote, ArrowRight } from "lucide-react";
import { captureIntent } from "@/lib/capture-intent";

const FOUNDER_PHOTO = "/akash-mishra.jpg";

export default function FounderNote() {
  const [photoOk, setPhotoOk] = useState(true);

  return (
    <section className="py-20 md:py-28 bg-tat-cream/25" aria-labelledby="founder-heading">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
          {/* Photo — 5 cols */}
          <div className="md:col-span-5 order-1 md:order-none">
            <div className="relative aspect-[4/5] max-w-sm mx-auto md:mx-0 rounded-3xl overflow-hidden bg-tat-charcoal/5">
              {photoOk ? (
                <Image
                  src={FOUNDER_PHOTO}
                  alt="Akash Mishra, Founder of Trust and Trip"
                  fill
                  sizes="(max-width: 768px) 90vw, 400px"
                  quality={85}
                  className="object-cover"
                  onError={() => setPhotoOk(false)}
                />
              ) : (
                <div
                  aria-label="Akash Mishra portrait placeholder"
                  className="absolute inset-0 grid place-items-center bg-gradient-to-br from-tat-teal-deep via-tat-teal to-tat-gold"
                >
                  <span className="font-display text-display-xl text-tat-paper/95 tracking-tight">AM</span>
                </div>
              )}
              {/* Warm overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/20 via-transparent to-transparent" />
              {/* Floating card */}
              <div className="absolute bottom-4 left-4 right-4 bg-tat-paper/95 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-tat-gold/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-tat-charcoal">AM</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-tat-charcoal leading-tight truncate">
                    Akash Mishra
                  </p>
                  <p className="text-[11px] text-tat-charcoal/55 truncate">Founder, Trust and Trip</p>
                </div>
              </div>
            </div>
          </div>

          {/* Note — 7 cols */}
          <div className="md:col-span-7">
            <p id="founder-heading" className="eyebrow mb-4">
              A note from the founder
            </p>
            <Quote className="h-8 w-8 text-tat-gold mb-5 opacity-60" />
            <h2 className="heading-section leading-[1.15] text-tat-charcoal text-balance">
              Every itinerary{" "}
              <span className="italic text-tat-gold font-light">
                touches my desk before it ships.
              </span>
            </h2>
            <div className="mt-6 space-y-4 text-tat-charcoal/70 text-base leading-relaxed max-w-2xl">
              <p>
                We started Trust and Trip because travel shouldn&apos;t feel transactional.
                Whether you&apos;re booking a ₹15,000 Char Dham yatra or a ₹3-lakh Seychelles honeymoon,
                a real human builds your plan — not a template, not a chatbot, not a comparison engine.
              </p>
              <p>
                Pocket-friendly to private, India to 30+ countries, solo to multi-gen family —
                same agency, same standard. We work with our own ground partners, run our own
                pilgrim concierge with doctor on call, and pick up the phone at 2 am if your
                trip needs us. That&apos;s the promise.
              </p>
              <p className="text-tat-charcoal/85 italic font-medium">
                — Akash Mishra
              </p>
            </div>
            <div className="mt-8 flex items-center gap-5 flex-wrap">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-tat-charcoal hover:text-tat-gold transition-colors group"
              >
                Read our story
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <span className="h-4 w-px bg-tat-charcoal/15" />
              <a
                href="https://wa.me/918115999588?text=Hi%20Akash!%20I%27d%20love%20to%20chat%20about%20a%20trip."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => captureIntent("whatsapp_click", { note: "About page — Founder note (chat with Akash)" })}
                className="inline-flex items-center gap-2 text-sm font-medium text-tat-charcoal/65 hover:text-tat-gold transition-colors"
              >
                Chat with me on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
