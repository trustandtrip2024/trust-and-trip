import Link from "next/link";
import {
  Heart, Users, Mountain, Waves, Globe2, Zap, Sparkles, Building2,
  type LucideIcon,
} from "lucide-react";

interface Chip {
  label: string;
  icon: LucideIcon;
  /** Maps to a Sanity `categories` value — drives the /packages filter. */
  category: string;
  /** One-line "what's in here" hint shown under the label. */
  hint: string;
}

const CHIPS: Chip[] = [
  { label: "Honeymoon",     icon: Heart,     category: "Honeymoon",   hint: "Couple-only stays + slow pacing" },
  { label: "Family",        icon: Users,     category: "Family",      hint: "Multi-gen friendly, kid-tested" },
  { label: "Mountains",     icon: Mountain,  category: "Mountain",    hint: "Himalayas, snow, alpine drives" },
  { label: "Beaches",       icon: Waves,     category: "Beach",       hint: "Sand, water villas, sundowners" },
  { label: "Pilgrim",       icon: Sparkles,  category: "Pilgrim",     hint: "Char Dham, Tirupati, Varanasi" },
  { label: "Adventure",     icon: Zap,       category: "Adventure",   hint: "Trek, raft, surf, paraglide" },
  { label: "International", icon: Globe2,    category: "International", hint: "Bali, Maldives, Thailand, Dubai" },
  { label: "Quick trips",   icon: Building2, category: "Quick Trips", hint: "2-4 nights · long-weekend escapes" },
];

/**
 * Browse-by-style chip row shown under the hero. Each chip links straight
 * to the /packages catalogue pre-filtered by its `categories` value, so a
 * visitor who already knows the vibe ("we want a beach trip") can skip the
 * scroll-and-discover loop entirely.
 *
 * Server component — pure links, no client JS. Renders inside its own
 * landmark so screen reader users can jump past the hero into the
 * catalogue without scanning every shelf.
 */
export default function HomeQuickStyleChips() {
  return (
    <section
      aria-labelledby="quick-style-heading"
      className="bg-tat-cream/40 border-b border-tat-charcoal/8"
    >
      <div className="container-custom py-5 md:py-6">
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2
            id="quick-style-heading"
            className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-charcoal/60"
          >
            Browse by trip style
          </h2>
          <Link
            href="/packages"
            className="text-[12px] text-tat-charcoal/65 hover:text-tat-charcoal underline-offset-4 hover:underline"
          >
            All packages →
          </Link>
        </div>
        <ul
          role="list"
          className="flex gap-2 md:gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
        >
          {CHIPS.map(({ label, icon: Icon, category, hint }) => (
            <li key={category} className="shrink-0">
              <Link
                href={`/packages?category=${encodeURIComponent(category)}`}
                aria-label={`${label} packages — ${hint}`}
                className="group/chip inline-flex items-center gap-2.5 rounded-2xl border border-tat-charcoal/10 bg-white px-3.5 py-2.5 transition-all hover:border-tat-gold hover:bg-tat-gold/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold focus-visible:ring-offset-2"
              >
                <span className="grid place-items-center h-9 w-9 rounded-full bg-tat-gold/10 text-tat-gold transition-colors group-hover/chip:bg-tat-gold group-hover/chip:text-white">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[13px] font-semibold text-tat-charcoal">
                    {label}
                  </span>
                  <span className="text-[11px] text-tat-charcoal/55 hidden md:block">
                    {hint}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
