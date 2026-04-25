import Link from "next/link";
import {
  Heart, Users, Mountain, Backpack, Crown, Sunset, Compass,
  Star, TreePine, ArrowRight,
} from "lucide-react";

const ITEMS = [
  { label: "Honeymoon",  href: "/experiences/honeymoon",  icon: Heart,    accent: "from-rose-500/12 to-rose-500/4   text-rose-500" },
  { label: "Family",     href: "/experiences/family",     icon: Users,    accent: "from-sky-500/12 to-sky-500/4     text-sky-500" },
  { label: "Pilgrim",    href: "/experiences/pilgrim",    icon: Mountain, accent: "from-amber-500/15 to-amber-500/5 text-amber-600" },
  { label: "Adventure",  href: "/experiences/adventure",  icon: Backpack, accent: "from-tat-orange/15 to-tat-orange/5         text-tat-orange" },
  { label: "Luxury",     href: "/experiences/luxury",     icon: Crown,    accent: "from-tat-gold/20 to-tat-gold/5           text-tat-gold" },
  { label: "Wellness",   href: "/experiences/wellness",   icon: Sunset,   accent: "from-teal-500/12 to-teal-500/4   text-teal-500" },
  { label: "Solo",       href: "/experiences/solo",       icon: Compass,  accent: "from-purple-500/12 to-purple-500/4 text-purple-500" },
  { label: "Group",      href: "/experiences/group",      icon: Star,     accent: "from-tat-orange/15 to-tat-orange/4     text-tat-orange" },
  { label: "Weekend",    href: "/experiences/weekend",    icon: TreePine, accent: "from-emerald-500/12 to-emerald-500/4 text-emerald-600" },
];

export default function ExperienceVectorGrid() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="exp-grid-heading">
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <p className="eyebrow-ember">How to travel</p>
            <h2 id="exp-grid-heading" className="heading-section mt-2 max-w-md text-balance">
              Travel the way
              <span className="italic text-gradient-passion font-light"> you feel it.</span>
            </h2>
            <p className="text-sm text-tat-charcoal/55 mt-3 max-w-sm leading-relaxed">
              Every journey is different. Pick the mood you&apos;re in.
            </p>
          </div>
          <Link
            href="/experiences"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-tat-charcoal/65 hover:text-tat-orange transition-colors group shrink-0"
          >
            All experiences
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3 x 3 grid — light, vector-only */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {ITEMS.map(({ label, href, icon: Icon, accent }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col items-center justify-center gap-3 aspect-square md:aspect-[4/3] rounded-2xl md:rounded-3xl bg-tat-paper border border-tat-charcoal/8 hover:border-tat-orange/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white shadow-soft flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-4deg]">
                <Icon className={`h-5 w-5 md:h-6 md:w-6 ${accent.split(" ").pop()}`} />
              </div>
              <p className="relative text-[11px] md:text-sm font-display font-semibold text-tat-charcoal tracking-tight text-center leading-tight">
                {label}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex md:hidden justify-center">
          <Link href="/experiences" className="text-sm font-medium text-tat-charcoal/65 hover:text-tat-orange transition-colors inline-flex items-center gap-1.5">
            All experiences <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
