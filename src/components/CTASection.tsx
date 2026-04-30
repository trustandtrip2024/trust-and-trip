"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, MessageCircle, Clock } from "lucide-react";
import { captureIntent } from "@/lib/capture-intent";

interface Props {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  image?: string;
  /** Optional WhatsApp pre-filled message override. */
  waMessage?: string;
}

const WA_NUMBER = "918115999588";

export default function CTASection({
  title = "Tell us where your heart wants to go.",
  subtitle = "We'll design the rest. One conversation, one dedicated planner, one itinerary built entirely around you.",
  primaryLabel = "Customize My Trip",
  primaryHref = "/customize-trip",
  secondaryLabel = "Talk to a planner",
  secondaryHref = "/contact",
  image = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800&q=80&auto=format&fit=crop",
  waMessage = "Hi Trust and Trip! I'd like help planning my next trip.",
}: Props) {
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`;
  return (
    <section className="py-20 md:py-28 bg-tat-paper">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-tat-charcoal"
        >
          <div className="absolute inset-0">
            <Image
              src={image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-tat-charcoal/90 via-tat-charcoal/60 to-tat-charcoal/90" />
          </div>

          {/* Decorative circles */}
          <div aria-hidden className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-tat-gold/20" />
          <div aria-hidden className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-tat-gold/10" />

          <div className="relative px-6 py-14 md:px-16 md:py-20 lg:py-24 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-tat-paper/10 backdrop-blur-md border border-tat-paper/20 rounded-full px-4 py-1.5 text-tat-paper/80 text-[10px] uppercase tracking-[0.25em]">
              <Sparkles className="h-3 w-3 text-tat-gold" />
              Free Consultation
            </div>
            <h2 className="mt-6 font-display text-display-md text-tat-paper font-medium leading-[1.05] text-balance">
              {title}
            </h2>
            <p className="mt-6 text-tat-paper/70 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
              {subtitle}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href={primaryHref} className="btn-gold group">
                {primaryLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => captureIntent("whatsapp_click", { note: "CTASection — WhatsApp" })}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-whatsapp hover:bg-whatsapp-deep text-white text-[13px] font-semibold transition-colors"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                WhatsApp
              </a>
              <Link
                href={secondaryHref}
                className="inline-flex items-center gap-2 text-tat-paper/90 hover:text-tat-gold transition-colors text-sm font-medium underline-offset-4 hover:underline"
              >
                {secondaryLabel}
              </Link>
            </div>

            {/* Quiet response-time microcopy — settles the "but how long
                until someone replies?" objection without competing with
                the CTAs visually. */}
            <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-tat-paper/55 inline-flex items-center justify-center gap-1.5">
              <Clock className="h-3 w-3" />
              Avg. response under 9 minutes · ₹0 to start
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
