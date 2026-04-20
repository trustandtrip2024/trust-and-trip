import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import { Compass, PenTool, Send, ThumbsUp } from "lucide-react";

export const metadata = {
  title: "Customize a Trip — Trust and Trip",
  description: "Tell us where your heart wants to go. We'll design a trip that feels entirely yours.",
};

const steps = [
  {
    icon: PenTool,
    title: "Share your dreams",
    description: "Fill the form. Voice-note us. WhatsApp a Pinterest board. Whatever works for you.",
  },
  {
    icon: Compass,
    title: "We craft your itinerary",
    description: "Within 24 hours, a planner returns with a hand-built proposal. We refine until it's yours.",
  },
  {
    icon: ThumbsUp,
    title: "You approve",
    description: "Love it as-is or tweak hotels, activities, pace. No pressure, no obligation.",
  },
  {
    icon: Send,
    title: "We take over",
    description: "Bookings, confirmations, transfers, 24/7 support. You pack. We handle the rest.",
  },
];

export default function CustomizeTripPage() {
  return (
    <>
      <section className="relative pt-28 md:pt-36 pb-12 md:pb-16 bg-cream overflow-hidden">
        <div
          aria-hidden
          className="absolute -right-40 -top-20 w-96 h-96 rounded-full bg-gold/10 blur-3xl"
        />
        <div className="container-custom max-w-5xl relative">
          <span className="eyebrow">Customize your trip</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] max-w-3xl text-balance">
            A trip so yours,
            <span className="italic text-gold font-light"> nobody else could take it.</span>
          </h1>
          <p className="mt-6 text-ink/60 max-w-xl leading-relaxed">
            Skip the templates. Tell us your idea, your budget, your people — and we'll build a
            journey that fits like a favorite jacket.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-5 md:gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="bg-cream rounded-3xl p-6 border border-ink/5 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-11 w-11 rounded-full bg-gold/20 text-gold flex items-center justify-center">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="font-display text-3xl text-ink/10">0{i + 1}</span>
                  </div>
                  <h3 className="font-display text-xl font-medium mb-2">{s.title}</h3>
                  <p className="text-sm text-ink/60 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 md:py-16 bg-sand/40">
        <div className="container-custom max-w-4xl">
          <LeadForm
            title="Get a free itinerary"
            subtitle="A few details to get us started. Your message opens directly in WhatsApp — a real planner replies within 2 hours."
            source="trip_planner"
          />
        </div>
      </section>

      {/* Reassurance band */}
      <section className="py-16 bg-ink text-cream">
        <div className="container-custom grid md:grid-cols-3 gap-10 text-center md:text-left">
          <div>
            <p className="eyebrow text-gold">No commitment</p>
            <p className="mt-3 font-display text-2xl">
              Proposals are always free. Pay only when you love it.
            </p>
          </div>
          <div>
            <p className="eyebrow text-gold">Always a human</p>
            <p className="mt-3 font-display text-2xl">
              You'll speak to a real planner who remembers your name.
            </p>
          </div>
          <div>
            <p className="eyebrow text-gold">Flexible to the end</p>
            <p className="mt-3 font-display text-2xl">
              Tweak and refine as many times as it takes.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
