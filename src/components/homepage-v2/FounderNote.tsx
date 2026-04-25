"use client";

import Image from "next/image";
import Link from "next/link";
import { Quote, ArrowRight } from "lucide-react";
import { captureIntent } from "@/lib/capture-intent";

export default function FounderNote() {
  return (
    <section className="py-20 md:py-28 bg-tat-cream/25" aria-labelledby="founder-heading">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
          {/* Photo — 5 cols */}
          <div className="md:col-span-5 order-1 md:order-none">
            <div className="relative aspect-[4/5] max-w-sm mx-auto md:mx-0 rounded-3xl overflow-hidden bg-tat-charcoal/5">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=85&auto=format&fit=crop"
                alt="Founder of Trust and Trip"
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                className="object-cover"
              />
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
            <h2 className="font-display text-2xl md:text-4xl leading-[1.15] font-medium text-tat-charcoal text-balance">
              We started Trust and Trip because{" "}
              <span className="italic text-tat-gold font-light">
                travel shouldn&apos;t feel transactional.
              </span>
            </h2>
            <div className="mt-6 space-y-4 text-tat-charcoal/70 text-base leading-relaxed max-w-2xl">
              <p>
                Every itinerary goes through a real human — not a template. We ask
                about your anniversary, your grandma&apos;s knee, whether you&apos;d
                rather sleep in a homestay or a palace. And we adjust.
              </p>
              <p>
                No tour guide gang-tows, no forced shopping stops, no hidden charges.
                Just a trip that fits — crafted with care, backed by people who pick
                up the phone at 2am.
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
