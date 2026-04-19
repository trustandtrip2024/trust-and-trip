import Image from "next/image";
import CTASection from "@/components/CTASection";
import { stats } from "@/lib/data";
import { Compass, Handshake, HeartHandshake, Sparkles } from "lucide-react";

export const metadata = {
  title: "About — Trust and Trip",
  description: "The story behind Trust and Trip — why we design travel differently.",
};

const values = [
  {
    icon: Compass,
    title: "Originality",
    description:
      "Every itinerary is handcrafted. We don't resell tour templates — we design from scratch.",
  },
  {
    icon: Handshake,
    title: "Trust",
    description:
      "What we quote is what you pay. No hidden fees, no upsells. Your price is locked the moment you confirm.",
  },
  {
    icon: HeartHandshake,
    title: "Human Care",
    description:
      "Real planners, real replies, real-time support. Reachable 24/7 wherever you are in the world.",
  },
  {
    icon: Sparkles,
    title: "Detail",
    description:
      "From a rose-petal turndown to the right regional wine — we sweat details so you don't.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 bg-cream">
        <div className="container-custom grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <span className="eyebrow">About us</span>
            <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] text-balance">
              We design travel
              <span className="italic text-gold font-light"> that listens.</span>
            </h1>
            <p className="mt-6 text-ink/70 text-lg leading-relaxed">
              Trust and Trip was born in Noida — built by travelers who were tired of
              cookie-cutter packages and hidden costs. We set out to do one thing differently:
              make travel genuinely worry-free.
            </p>
            <p className="mt-4 text-ink/60 leading-relaxed">
              Today we craft journeys across 60+ destinations — from Ladakh to the Maldives,
              Kashmir to Cappadocia — for families, couples, and groups who want to travel
              with trust, not issues.
            </p>
          </div>
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=85&auto=format&fit=crop"
              alt="Travel moment"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-ink text-cream py-14">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-4xl md:text-6xl text-gold leading-none">
                {s.value}
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-cream/60">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <div className="max-w-2xl mb-12 md:mb-16">
            <span className="eyebrow">What we stand for</span>
            <h2 className="heading-section mt-3 text-balance">
              Four values, lived every day.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-cream rounded-3xl p-7 border border-ink/5 hover:shadow-soft transition-shadow"
              >
                <div className="h-12 w-12 rounded-full bg-gold/20 text-gold flex items-center justify-center mb-5">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-medium mb-2">{v.title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial quote */}
      <section className="py-20 md:py-28 bg-sand/40">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <p className="font-display text-3xl md:text-5xl italic font-light leading-tight text-balance">
            "The best trips aren't the ones you <span className="text-gold">plan</span>. <br className="hidden md:block" />
            They're the ones that are <span className="text-gold">planned for you</span>."
          </p>
          <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-ink/50">
            — A belief we live by, since day one
          </p>
        </div>
      </section>

      <CTASection />
    </>
  );
}
