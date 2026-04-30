import { PenTool, HeartHandshake, ScrollText, BadgeIndianRupee } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import LottieIcon from "@/components/ui/LottieIcon";

interface Pillar {
  icon: LucideIcon;
  title: string;
  body: string;
  proof: string;
  lottie?: string;
}

const PILLARS: Pillar[] = [
  {
    icon: PenTool,
    title: "Original, never templated",
    body: "Every itinerary is built from a blank page for your group, your pace, your budget. No copy-paste tours.",
    proof: "8,000+ unique trips since 2019",
    lottie: "/lottie/sparkle.json",
  },
  {
    icon: HeartHandshake,
    title: "A real human, all trip long",
    body: "One planner stays with you from first call to homecoming. WhatsApp answered in minutes, not days.",
    proof: "Avg. response under 9 minutes",
    lottie: "/lottie/heart.json",
  },
  {
    icon: ScrollText,
    title: "The detail you'd miss yourself",
    body: "Visa nudges. SIM at airport. Connecting rooms for kids. The 100 small things that decide a trip.",
    proof: "47-point pre-flight checklist",
    lottie: "/lottie/pulse.json",
  },
  {
    icon: BadgeIndianRupee,
    title: "Honest, line-item pricing",
    body: "No inflated MRPs, no hidden markups. You see hotel category, flight class, every inclusion in writing.",
    proof: "Free quote · pay only when you say yes",
  },
];

export default function WhyTrustAndTrip() {
  return (
    <section
      id="why"
      aria-labelledby="why-title"
      className="py-14 md:py-20 bg-tat-paper dark:bg-tat-charcoal scroll-mt-44 lg:scroll-mt-32"
    >
      <div className="container-custom">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
            Why Trust and Trip
          </p>
          <h2
            id="why-title"
            className="mt-2 font-display font-normal text-[26px] md:text-[36px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
          >
            Four reasons travelers{" "}
            <em className="not-italic font-display italic text-tat-gold">come back.</em>
          </h2>
          <p className="mt-3 text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70">
            Originality. Human care. Detail. Honest pricing. The four things we refuse to compromise on.
          </p>
        </div>

        <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {PILLARS.map((p, i) => (
            <PillarTile key={i} pillar={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarTile({ pillar, index }: { pillar: Pillar; index: number }) {
  const Icon = pillar.icon;
  return (
    <article className="group relative flex flex-col gap-3 rounded-2xl p-5 md:p-6 bg-tat-cream-warm/40 dark:bg-white/[0.03] ring-1 ring-tat-charcoal/8 dark:ring-white/10 hover:ring-tat-gold/40 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-tat-gold/15 text-tat-gold">
          {pillar.lottie ? (
            <LottieIcon src={pillar.lottie} size={28} />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </span>
        <span className="font-display text-[34px] leading-none text-tat-charcoal/15 dark:text-white/15 select-none">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="font-display font-medium text-[18px] md:text-[20px] leading-tight text-tat-charcoal dark:text-tat-paper">
        {pillar.title}
      </h3>
      <p className="text-[13px] md:text-[14px] leading-relaxed text-tat-charcoal/70 dark:text-tat-paper/70">
        {pillar.body}
      </p>
      <p className="mt-auto pt-3 border-t border-tat-charcoal/10 dark:border-white/10 text-[11px] uppercase tracking-wider font-semibold text-tat-gold">
        {pillar.proof}
      </p>
    </article>
  );
}
