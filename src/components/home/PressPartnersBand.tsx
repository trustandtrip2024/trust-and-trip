import SectionHeader from "@/components/ui/SectionHeader";

// TODO: Replace with real partner / press logos. Until assets exist, render
// neutral text-tile placeholders. We never invent press quotes.
const PLACEHOLDER_LOGOS = [
  "Press Logo 1", "Press Logo 2", "Press Logo 3", "Press Logo 4",
  "Tourism Board 1", "Tourism Board 2", "Tourism Board 3", "Tourism Board 4",
];

export default function PressPartnersBand() {
  return (
    <section
      aria-labelledby="press-title"
      className="py-18 md:py-22 bg-stone-50/60 border-y border-stone-200/70"
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-6xl">
        <div className="text-center">
          <SectionHeader
            eyebrow="As featured in"
            title="Trusted,"
            italicTail="on record."
            lede="A note from the press, and the tourism boards we work with directly."
            align="center"
          />
        </div>

        <ul
          aria-label="Featured publications and tourism partners"
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-70"
        >
          {PLACEHOLDER_LOGOS.map((label) => (
            <li
              key={label}
              className="h-8 px-4 inline-flex items-center justify-center rounded-md border border-stone-300 text-tag uppercase text-stone-500 grayscale"
            >
              {label}
            </li>
          ))}
        </ul>

        <blockquote className="mt-12 max-w-3xl mx-auto text-center font-serif italic text-h3 text-stone-700">
          {/* TODO: insert real press quote when sourced. Never invent press quotes. */}
          <span className="text-stone-400">Press quote pending — awaiting publisher sign-off.</span>
        </blockquote>
      </div>
    </section>
  );
}
