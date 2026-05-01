import Link from "next/link";

export const metadata = { title: "Brand · Trust and Trip Admin" };

const PALETTE = [
  { token: "tat-teal",        hex: "#0E7C7B", role: "Primary brand" },
  { token: "tat-teal-deep",   hex: "#094948", role: "Hover, dark surfaces" },
  { token: "tat-teal-mist",   hex: "#B5D4D4", role: "Highlights, subtle backdrops" },
  { token: "tat-cream",       hex: "#F5E6D3", role: "Canvas, hero base" },
  { token: "tat-cream-warm",  hex: "#EFD9BD", role: "Secondary canvas" },
  { token: "tat-paper",       hex: "#FBF7F1", role: "Card background" },
  { token: "tat-gold",        hex: "#C8932A", role: "Price tags, accents" },
  { token: "tat-orange",      hex: "#E87B3D", role: "Urgency, flash deals" },
  { token: "tat-orange-soft", hex: "#F4A876", role: "Softer urgency" },
  { token: "tat-charcoal",    hex: "#2A2A2A", role: "Body text" },
  { token: "tat-slate",       hex: "#6B7280", role: "Meta text" },
];

const MEDIA_SPECS = [
  { asset: "Hero (destination / package)", size: "1920×1080", format: "WebP", maxKB: "400" },
  { asset: "Card (listing)",                size: "800×600",   format: "WebP", maxKB: "150" },
  { asset: "Gallery slot",                  size: "1600×1067", format: "WebP", maxKB: "300" },
  { asset: "Blog cover",                    size: "1600×900",  format: "WebP", maxKB: "250" },
  { asset: "Author avatar",                 size: "200×200",   format: "WebP", maxKB: "40"  },
  { asset: "Press logo",                    size: "320×120",   format: "PNG/SVG transparent", maxKB: "30" },
  { asset: "OG share image",                size: "1200×630",  format: "PNG", maxKB: "200" },
  { asset: "Favicon",                       size: "512×512",   format: "PNG", maxKB: "50"  },
];

const COPY_DO = [
  '"Crafted journeys", "handpicked", "honest pricing"',
  "Numbers must be verifiable (Supabase / Sanity / Google source)",
  '"We" not "I" (founder note is the one exception)',
  "Itinerary days written in active voice — what *you* will do, not what *the trip* offers",
];
const COPY_DONT = [
  '"Best", "cheapest", "guaranteed" (legal + credibility risk)',
  "Vibe numbers — every stat needs a source line",
  "Generic openers — \"Experience the magic of…\" ban",
  "Lorem ipsum / TODO markers in production",
];

const TYPE_RULES = [
  { rule: "Display / serif", value: "Fraunces", note: "var(--font-display) — used for h1, h2, hero, blockquote" },
  { rule: "Body / sans",     value: "Inter",    note: "var(--font-sans) — every other text surface" },
  { rule: "Mobile floor",    value: "12px",     note: "Anything below fails review. Lift to text-xs (12px) or text-sm (14px)." },
  { rule: "Eyebrow",         value: "0.75rem",  note: "Uppercase, 0.16em letter-spacing. Use sparingly." },
];

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-tat-paper">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">

        <header>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-tat-slate">
            Locked 2026-04-29 · single source of truth
          </p>
          <h1 className="font-display text-3xl text-tat-charcoal mt-1">Brand guideline</h1>
          <p className="text-sm text-tat-slate mt-1">
            Mirrors <code className="font-mono text-xs">OPERATOR_HANDBOOK.md §5</code> +{" "}
            <code className="font-mono text-xs">tailwind.config.ts</code>. Don't drift from this page —
            edit the handbook + tokens together.
          </p>
        </header>

        {/* Palette */}
        <section>
          <h2 className="font-display text-xl text-tat-charcoal mb-1">Palette</h2>
          <p className="text-sm text-tat-slate mb-4">
            Use only these tokens in code. Outside Tailwind contexts (email, PDF) read from{" "}
            <code className="font-mono text-xs">src/lib/brand-colors.ts</code>.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PALETTE.map((c) => (
              <div
                key={c.token}
                className="rounded-card overflow-hidden border border-tat-charcoal/10 bg-white shadow-soft"
              >
                <div
                  className="h-20"
                  style={{ background: c.hex }}
                  aria-label={`${c.token} swatch`}
                />
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <code className="font-mono text-xs text-tat-charcoal">{c.token}</code>
                    <code className="font-mono text-[11px] text-tat-slate">{c.hex}</code>
                  </div>
                  <p className="text-[12px] text-tat-charcoal/65 mt-1">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Type */}
        <section>
          <h2 className="font-display text-xl text-tat-charcoal mb-4">Typography</h2>
          <div className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft overflow-hidden">
            <div className="p-6 border-b border-tat-charcoal/8 bg-tat-cream/40">
              <p className="text-[10px] uppercase tracking-[0.2em] text-tat-slate">Display · Fraunces</p>
              <p className="font-display text-4xl text-tat-charcoal leading-tight mt-2">
                Trips planned by a real human.
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-tat-slate mt-6">Body · Inter</p>
              <p className="text-base text-tat-charcoal/80 mt-2 max-w-prose">
                Tell us your dates and what you love. A real travel planner drafts your itinerary —
                free until you're sure. No card, no commitment.
              </p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-tat-paper">
                <tr className="text-left text-[11px] uppercase tracking-wider text-tat-slate">
                  <th className="px-4 py-2">Rule</th>
                  <th className="px-4 py-2">Value</th>
                  <th className="px-4 py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {TYPE_RULES.map((r) => (
                  <tr key={r.rule} className="border-t border-tat-charcoal/8">
                    <td className="px-4 py-2 font-medium text-tat-charcoal">{r.rule}</td>
                    <td className="px-4 py-2 font-mono text-tat-charcoal">{r.value}</td>
                    <td className="px-4 py-2 text-tat-charcoal/70">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Media specs */}
        <section>
          <h2 className="font-display text-xl text-tat-charcoal mb-4">Media specs</h2>
          <div className="rounded-card border border-tat-charcoal/10 bg-white shadow-soft overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-tat-paper">
                <tr className="text-left text-[11px] uppercase tracking-wider text-tat-slate">
                  <th className="px-4 py-2">Asset</th>
                  <th className="px-4 py-2">Size</th>
                  <th className="px-4 py-2">Format</th>
                  <th className="px-4 py-2">Max KB</th>
                </tr>
              </thead>
              <tbody>
                {MEDIA_SPECS.map((m) => (
                  <tr key={m.asset} className="border-t border-tat-charcoal/8">
                    <td className="px-4 py-2 text-tat-charcoal">{m.asset}</td>
                    <td className="px-4 py-2 font-mono text-tat-charcoal">{m.size}</td>
                    <td className="px-4 py-2 text-tat-charcoal/75">{m.format}</td>
                    <td className="px-4 py-2 font-mono text-tat-charcoal/75">{m.maxKB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-tat-paper border-t border-tat-charcoal/8 text-xs text-tat-charcoal/65">
              Always set the alt text. Always pass through <code className="font-mono">next/image</code>.
              Compress with squoosh.app or <code className="font-mono">cwebp</code>. Strip EXIF.
            </div>
          </div>
        </section>

        {/* Copy voice */}
        <section>
          <h2 className="font-display text-xl text-tat-charcoal mb-4">Copy voice</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-card border border-tat-teal/30 bg-tat-teal-mist/15 p-4">
              <p className="font-display text-sm uppercase tracking-[0.18em] text-tat-teal-deep mb-2">
                Do
              </p>
              <ul className="space-y-1.5 text-sm text-tat-charcoal/85">
                {COPY_DO.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-tat-teal mt-0.5">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-card border border-tat-orange/30 bg-tat-orange-soft/15 p-4">
              <p className="font-display text-sm uppercase tracking-[0.18em] text-tat-orange mb-2">
                Don't
              </p>
              <ul className="space-y-1.5 text-sm text-tat-charcoal/85">
                {COPY_DONT.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-tat-orange mt-0.5">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Where things live */}
        <section>
          <h2 className="font-display text-xl text-tat-charcoal mb-4">Where things live</h2>
          <ul className="space-y-1.5 text-sm">
            <li><code className="font-mono text-xs">tailwind.config.ts</code> — design tokens</li>
            <li><code className="font-mono text-xs">src/lib/brand-colors.ts</code> — brand colors for non-Tailwind contexts</li>
            <li><code className="font-mono text-xs">src/app/layout.tsx</code> — font wiring</li>
            <li><code className="font-mono text-xs">OPERATOR_HANDBOOK.md</code> §5 — written rules</li>
            <li><code className="font-mono text-xs">DIRECTOR_AUDIT.md</code> §3 — current brand-related blockers</li>
            <li>
              <Link href="/admin/roadmap" className="text-tat-teal underline-offset-2 hover:underline">
                /admin/roadmap
              </Link>{" "}
              — open brand-related tasks
            </li>
          </ul>
        </section>

      </div>
    </div>
  );
}
