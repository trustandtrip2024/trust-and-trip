import Link from "next/link";
import { headers } from "next/headers";
import { MapPin, Search, ArrowRight, Wand2 } from "lucide-react";

const KNOWN_PATHS: { path: string; label: string; group: string }[] = [
  { path: "/destinations/bali",        label: "Bali",        group: "Destinations" },
  { path: "/destinations/maldives",    label: "Maldives",    group: "Destinations" },
  { path: "/destinations/kerala",      label: "Kerala",      group: "Destinations" },
  { path: "/destinations/goa",         label: "Goa",         group: "Destinations" },
  { path: "/destinations/manali",      label: "Manali",      group: "Destinations" },
  { path: "/destinations/ladakh",      label: "Ladakh",      group: "Destinations" },
  { path: "/destinations/rajasthan",   label: "Rajasthan",   group: "Destinations" },
  { path: "/destinations/dubai",       label: "Dubai",       group: "Destinations" },
  { path: "/destinations/thailand",    label: "Thailand",    group: "Destinations" },
  { path: "/destinations/switzerland", label: "Switzerland", group: "Destinations" },
  { path: "/experiences/honeymoon",    label: "Honeymoon",   group: "Experiences" },
  { path: "/experiences/family",       label: "Family",      group: "Experiences" },
  { path: "/experiences/adventure",    label: "Adventure",   group: "Experiences" },
  { path: "/experiences/pilgrim",      label: "Pilgrim",     group: "Experiences" },
  { path: "/experiences/luxury",       label: "Luxury",      group: "Experiences" },
  { path: "/packages",                 label: "All packages",group: "Pages" },
  { path: "/destinations",             label: "All destinations", group: "Pages" },
  { path: "/experiences",              label: "All experiences",  group: "Pages" },
  { path: "/blog",                     label: "Journal",     group: "Pages" },
  { path: "/plan",                     label: "Plan a trip", group: "Pages" },
  { path: "/about",                    label: "About",       group: "Pages" },
  { path: "/contact",                  label: "Contact",     group: "Pages" },
];

// Lightweight token similarity — counts shared 3-char prefixes between
// the slug part of `requested` and each known path. Cheaper than full
// Levenshtein, deterministic, and good enough to surface close matches.
function score(requested: string, candidate: string): number {
  const a = requested.toLowerCase().replace(/[^a-z0-9]/g, "");
  const b = candidate.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!a) return 0;
  if (b.includes(a) || a.includes(b)) return 100;
  let s = 0;
  for (let i = 0; i < a.length - 2; i++) {
    if (b.includes(a.substring(i, i + 3))) s += 3;
  }
  return s;
}

function suggest(pathname: string) {
  const tail = pathname.split("/").filter(Boolean).pop() ?? "";
  if (!tail) return [];
  return KNOWN_PATHS
    .map((p) => ({ ...p, _score: score(tail, p.label) + score(tail, p.path) }))
    .filter((p) => p._score > 6)
    .sort((a, b) => b._score - a._score)
    .slice(0, 4);
}

export default function NotFound() {
  const requested = headers().get("x-invoke-path") ?? headers().get("referer") ?? "";
  const matches = suggest(requested);
  const best = matches[0];

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-tat-paper px-4">
      <div className="text-center max-w-2xl py-20">
        <p className="font-display font-medium leading-none select-none text-tat-gold/15"
          style={{ fontSize: "clamp(6rem, 22vw, 16rem)" }}>
          404
        </p>

        <h1 className="font-display text-3xl md:text-4xl font-medium text-tat-charcoal -mt-4 text-balance">
          This page took a detour.
        </h1>
        <p className="mt-4 text-tat-charcoal/65 leading-relaxed max-w-md mx-auto">
          Some of the best trips begin with a wrong turn — but this isn&apos;t
          one of them. Let&apos;s get you somewhere worth going.
        </p>

        {/* Smart suggestion — closest match */}
        {best && (
          <div className="mt-8 inline-flex items-center gap-3 bg-tat-gold/10 border border-tat-gold/30 rounded-full pl-4 pr-1.5 py-1.5 text-sm">
            <Wand2 className="h-3.5 w-3.5 text-tat-gold shrink-0" aria-hidden />
            <span className="text-tat-charcoal/70">Did you mean</span>
            <Link
              href={best.path}
              className="inline-flex items-center gap-1 bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              {best.label} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary">Back to Home</Link>
          <Link href="/packages" className="btn-outline">Browse Packages</Link>
          <Link href="/contact" className="btn-ghost">Talk to a planner</Link>
        </div>

        {/* Other close matches */}
        {matches.length > 1 && (
          <div className="mt-12 pt-8 border-t border-tat-charcoal/8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-tat-charcoal/55 mb-4 flex items-center justify-center gap-2">
              <Search className="h-3 w-3" /> Or try one of these
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {matches.slice(1).map((m) => (
                <Link
                  key={m.path}
                  href={m.path}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-tat-charcoal/5 hover:bg-tat-gold/15 text-sm text-tat-charcoal/75 transition-colors"
                >
                  {m.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Fallback popular destinations row when no match */}
        {matches.length === 0 && (
          <div className="mt-14 pt-10 border-t border-tat-charcoal/8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-tat-charcoal/55 mb-5 flex items-center justify-center gap-2">
              <MapPin className="h-3 w-3" /> Popular destinations
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Bali", "Maldives", "Kerala", "Goa", "Dubai", "Thailand", "Manali", "Ladakh"].map((d) => (
                <Link
                  key={d}
                  href={`/destinations/${d.toLowerCase()}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-tat-charcoal/5 hover:bg-tat-gold/15 hover:text-tat-charcoal transition-colors text-sm text-tat-charcoal/75 group"
                >
                  {d}
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
