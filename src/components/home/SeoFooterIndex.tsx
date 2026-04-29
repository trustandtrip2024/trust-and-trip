import Link from "next/link";
import {
  Globe2, Heart, Users, Church, Mountain, Crown, Phone,
  ArrowUpRight, MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// All links here resolve to a real SEO landing route — either a long-tail
// page from src/app/[...seo]/page.tsx, a /destinations/<slug>(/<travelType>)
// alias, or an /experiences/<slug> page. Don't add new entries without
// confirming the underlying route exists.
type LinkItem = { label: string; href: string };
type Column = {
  title: string;
  /** Eyebrow shown above the column title (compact descriptor). */
  blurb: string;
  icon: LucideIcon;
  links: LinkItem[];
};

const COLUMNS: Column[] = [
  {
    title: "Trending Destinations",
    blurb: "Where most of our trips fly.",
    icon: Globe2,
    links: [
      { label: "Bali",        href: "/destinations/bali" },
      { label: "Maldives",    href: "/destinations/maldives" },
      { label: "Switzerland", href: "/destinations/switzerland" },
      { label: "Thailand",    href: "/destinations/thailand" },
      { label: "Singapore",   href: "/destinations/singapore" },
      { label: "Dubai",       href: "/destinations/dubai" },
      { label: "Vietnam",     href: "/vietnam-tour-packages-from-india" },
      { label: "Sri Lanka",   href: "/destinations/sri-lanka" },
    ],
  },
  {
    title: "Honeymoon Specials",
    blurb: "Quiet rooms. Late checkouts.",
    icon: Heart,
    links: [
      { label: "Bali Honeymoon",         href: "/honeymoon-packages-bali" },
      { label: "Maldives Honeymoon",     href: "/honeymoon-packages-maldives" },
      { label: "Thailand Honeymoon",     href: "/honeymoon-packages-thailand" },
      { label: "Switzerland Honeymoon",  href: "/destinations/switzerland/honeymoon" },
      { label: "Santorini Honeymoon",    href: "/destinations/santorini/honeymoon" },
      { label: "Ha Long Bay Cruise",     href: "/ha-long-bay-tour-package" },
      { label: "All Honeymoon trips",    href: "/experiences/honeymoon" },
    ],
  },
  {
    title: "Family & Group",
    blurb: "Kid-aware. Group-friendly.",
    icon: Users,
    links: [
      { label: "Kerala Family",      href: "/family-tour-packages-kerala" },
      { label: "Dubai Family",       href: "/family-tour-packages-dubai" },
      { label: "Bali Family",        href: "/destinations/bali/family" },
      { label: "Singapore Family",   href: "/destinations/singapore/family" },
      { label: "Goa Group Trip",     href: "/group-tour-packages-goa" },
      { label: "Thailand Group",     href: "/destinations/thailand/group" },
      { label: "All Family trips",   href: "/experiences/family" },
      { label: "All Group trips",    href: "/experiences/group" },
    ],
  },
  {
    title: "Yatras & Pilgrim",
    blurb: "Sacred circuits, planned right.",
    icon: Church,
    links: [
      { label: "Char Dham Yatra",        href: "/char-dham-yatra-package" },
      { label: "Kedarnath Yatra",        href: "/kedarnath-yatra-package" },
      { label: "Kedarnath Helicopter",   href: "/kedarnath-helicopter-package" },
      { label: "Devbhumi Uttarakhand",   href: "/destinations/uttarakhand" },
      { label: "All Pilgrim journeys",   href: "/experiences/pilgrim" },
    ],
  },
  {
    title: "Adventure & Solo",
    blurb: "Treks, drives, and properly off-grid.",
    icon: Mountain,
    links: [
      { label: "Spiti Valley Tour",     href: "/spiti-valley-tour-packages" },
      { label: "Spiti Bike Trip",       href: "/spiti-valley-bike-trip" },
      { label: "Zanskar Valley",        href: "/zanskar-valley-tour-packages" },
      { label: "Chadar Trek",           href: "/chadar-trek-package" },
      { label: "Manali Solo",           href: "/solo-trip-packages-manali" },
      { label: "Bali Solo",             href: "/destinations/bali/solo" },
      { label: "All Adventure trips",   href: "/experiences/adventure" },
      { label: "All Solo trips",        href: "/experiences/solo" },
    ],
  },
  {
    title: "By Style & Budget",
    blurb: "Sort by mood, length, or rupees.",
    icon: Crown,
    links: [
      { label: "Luxury",                  href: "/experiences/luxury" },
      { label: "Wellness",                href: "/experiences/wellness" },
      { label: "Cultural",                href: "/experiences/cultural" },
      { label: "Weekend Getaways",       href: "/experiences/weekend" },
      { label: "Budget International",   href: "/budget-international-packages" },
      { label: "3–5 day trips",          href: "/packages?duration=3-5" },
      { label: "6–9 day trips",          href: "/packages?duration=6-9" },
      { label: "10+ day trips",          href: "/packages?duration=10-plus" },
    ],
  },
  {
    title: "About · Talk to us",
    blurb: "Real planners. Real numbers.",
    icon: Phone,
    links: [
      { label: "About Trust and Trip",     href: "/about" },
      { label: "Reviews",                  href: "/reviews" },
      { label: "Blog & Journal",           href: "/blog" },
      { label: "Customize a trip",         href: "/customize-trip" },
      { label: "Offers & deals",           href: "/offers" },
      { label: "Contact",                  href: "/contact" },
      { label: "WhatsApp +91 8115 999 588", href: "https://wa.me/918115999588" },
      { label: "plan@trustandtrip.com",    href: "mailto:plan@trustandtrip.com" },
    ],
  },
];

function isExternal(href: string): boolean {
  return href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
}

export default function SeoFooterIndex() {
  return (
    <section
      aria-labelledby="seo-footer-title"
      className="relative py-16 md:py-24 border-t border-tat-charcoal/12 dark:border-white/10 bg-tat-paper"
    >
      {/* Decorative gradient backdrop so the index reads as a curated index,
          not a footer dump. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-50 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 0% 0%, rgba(242, 179, 64, 0.10) 0%, transparent 45%), radial-gradient(ellipse at 100% 100%, rgba(14, 124, 123, 0.10) 0%, transparent 45%)",
        }}
      />

      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <header className="max-w-3xl">
          <p className="tt-eyebrow flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-tat-gold" />
            Explore the index
          </p>
          <h2
            id="seo-footer-title"
            className="mt-2 font-display text-2xl md:text-3xl lg:text-4xl font-medium text-tat-charcoal dark:text-tat-paper text-balance"
          >
            Every place we travel,{" "}
            <em className="not-italic font-display italic text-tat-gold dark:text-tat-gold">
              one tap away.
            </em>
          </h2>
        </header>

        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {COLUMNS.map((col) => {
            const Icon = col.icon;
            return (
              <li
                key={col.title}
                className="group relative rounded-2xl bg-white/90 dark:bg-white/5 backdrop-blur-[2px] ring-1 ring-tat-charcoal/8 dark:ring-white/10 shadow-soft hover:shadow-soft-lg transition-shadow duration-300 p-5 md:p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 grid place-items-center h-10 w-10 rounded-xl bg-tat-gold/10 dark:bg-tat-gold/15 text-tat-gold dark:text-tat-gold ring-1 ring-tat-gold/10 dark:ring-tat-gold/20 group-hover:scale-105 transition-transform duration-200">
                    <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-[17px] md:text-[18px] font-medium text-tat-charcoal dark:text-tat-paper leading-tight">
                      {col.title}
                    </h3>
                    <p className="mt-0.5 text-[12px] text-tat-charcoal/55 dark:text-tat-paper/60">
                      {col.blurb}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {col.links.map((l) => {
                    const ext = isExternal(l.href);
                    const cls =
                      "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-tat-charcoal/[0.04] dark:bg-white/8 hover:bg-tat-teal hover:text-white dark:hover:bg-tat-gold dark:hover:text-tat-charcoal text-[12px] font-medium text-tat-charcoal/80 dark:text-tat-paper/80 ring-1 ring-tat-charcoal/5 dark:ring-white/10 transition-colors duration-150 max-w-full";
                    const inner = (
                      <>
                        <span className="truncate">{l.label}</span>
                        {ext && <ArrowUpRight className="h-3 w-3 shrink-0 opacity-70" aria-hidden />}
                      </>
                    );
                    return (
                      <li key={l.label} className="max-w-full">
                        {ext ? (
                          <a
                            href={l.href}
                            target={l.href.startsWith("http") ? "_blank" : undefined}
                            rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className={cls}
                          >
                            {inner}
                          </a>
                        ) : (
                          <Link href={l.href} className={cls}>
                            {inner}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
