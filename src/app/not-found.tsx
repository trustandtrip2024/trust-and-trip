import Link from "next/link";
import { MapPin, Search, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-cream px-4">
      <div className="text-center max-w-2xl py-20">
        {/* Big decorative 404 */}
        <p className="font-display font-medium leading-none select-none text-gold/15"
          style={{ fontSize: "clamp(6rem, 22vw, 16rem)" }}>
          404
        </p>

        <h1 className="font-display text-3xl md:text-4xl font-medium text-ink -mt-4 text-balance">
          This page took a detour.
        </h1>
        <p className="mt-4 text-ink/60 leading-relaxed max-w-md mx-auto">
          Some of the best trips begin with a wrong turn — but this isn&apos;t
          one of them. Let&apos;s get you somewhere worth going.
        </p>

        {/* Quick links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <Link href="/packages" className="btn-outline">
            Browse Packages
          </Link>
          <Link href="/contact" className="btn-ghost">
            Talk to a planner
          </Link>
        </div>

        {/* Popular destinations row */}
        <div className="mt-14 pt-10 border-t border-ink/8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-ink/40 mb-5 flex items-center justify-center gap-2">
            <MapPin className="h-3 w-3" /> Popular destinations
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Bali", "Maldives", "Kerala", "Goa", "Dubai", "Thailand", "Manali", "Ladakh"].map((d) => (
              <Link
                key={d}
                href={`/destinations/${d.toLowerCase()}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink/5 hover:bg-gold/15 hover:text-ink transition-colors text-sm text-ink/70 group"
              >
                {d}
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
