import Link from "next/link";
import { MessageCircle, MapPinned, Plane, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: MessageCircle,
    title: "Tell us your vibe",
    body: "Chat with a real planner on WhatsApp or use our AI builder. Share your dates, vibe, budget — not a long form.",
    color: "from-rose-500/10 to-rose-500/5 text-rose-600",
  },
  {
    icon: MapPinned,
    title: "We craft your plan",
    body: "A human planner drafts a day-by-day itinerary within 24 hours. Want it tweaked? Unlimited revisions — at no cost.",
    color: "from-amber-500/10 to-amber-500/5 text-amber-600",
  },
  {
    icon: Plane,
    title: "Pack. Go. Relax.",
    body: "Book with 30% deposit. We handle hotels, transfers, guides, permits. On-trip support round the clock — 2am calls included.",
    color: "from-emerald-500/10 to-emerald-500/5 text-emerald-600",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-sand/25" aria-labelledby="how-heading">
      <div className="container-custom">
        <div className="max-w-xl mb-12 md:mb-16">
          <p className="eyebrow">How it works</p>
          <h2 id="how-heading" className="heading-section mt-2 text-balance">
            Three steps. One planner.
            <span className="italic text-gold font-light"> Zero stress.</span>
          </h2>
          <p className="mt-4 text-ink/60 leading-relaxed">
            No tour-group feeling. No hidden fees. Just a trip that fits, backed by
            humans who answer their phones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-[68px] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-ink/15 to-transparent" aria-hidden="true" />

          {STEPS.map(({ icon: Icon, title, body, color }, i) => (
            <div
              key={i}
              className="relative bg-white rounded-2xl md:rounded-3xl border border-ink/8 p-6 md:p-7 hover:shadow-soft transition-all"
            >
              {/* Step number */}
              <div className="absolute -top-3 left-6 bg-cream border border-ink/8 text-[10px] uppercase tracking-widest text-ink/50 px-2.5 py-0.5 rounded-full">
                Step {i + 1}
              </div>

              <div
                className={`h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 ${color}`}
              >
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="font-display text-xl font-medium text-ink leading-tight mb-2.5">
                {title}
              </h3>
              <p className="text-sm text-ink/60 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 bg-ink text-cream hover:bg-gold hover:text-ink px-6 py-3 rounded-full text-sm font-semibold transition-all group"
          >
            Start planning free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
