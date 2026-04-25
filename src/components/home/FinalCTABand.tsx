import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

const WHATSAPP_HREF =
  "https://wa.me/918115999588?text=" +
  encodeURIComponent("Hi Trust and Trip — I'd like to plan a trip.");

export default function FinalCTABand() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="bg-stone-900 text-white py-18 md:py-22"
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-3xl text-center">
        <p className="text-eyebrow uppercase font-medium text-amber-300/90">Your turn</p>
        <h2 id="final-cta-title" className="mt-2 font-serif text-h1 md:text-display text-white text-balance">
          Let&apos;s build something{" "}
          <em className="not-italic font-serif italic text-amber-300">worth remembering.</em>
        </h2>
        <p className="mt-3 text-lead text-white/75 max-w-xl mx-auto">
          A 2-minute form. A 24-hour reply. A trip you&apos;ll talk about for years.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/plan" className="tt-cta !w-auto !min-w-[220px]">
            Plan my trip — free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-white/85 hover:text-amber-300 transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 rounded-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Or message a planner on WhatsApp
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-6 text-tag uppercase text-white/55">
          Free until you&apos;re sure. No card needed to start.
        </p>
      </div>
    </section>
  );
}
