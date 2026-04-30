import type { ReactNode } from "react";

interface Props {
  id?: string;
  eyebrow: string;
  title: string;
  italicTail?: string;
  lede?: string;
  count?: number;
  children?: ReactNode;
}

export default function SectionStub({ id, eyebrow, title, italicTail, lede, count = 4, children }: Props) {
  return (
    <section id={id} className="py-14 md:py-20 bg-tat-paper dark:bg-tat-charcoal scroll-mt-44 lg:scroll-mt-32">
      <div className="container-custom">
        <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">{eyebrow}</p>
        <h2 className="mt-2 font-display font-normal text-[26px] md:text-[36px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance">
          {title}{" "}
          {italicTail && (
            <em className="not-italic font-display italic text-tat-gold">{italicTail}</em>
          )}
        </h2>
        {lede && (
          <p className="mt-3 text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70 max-w-2xl">
            {lede}
          </p>
        )}
        {children ?? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-xl bg-tat-charcoal/5 dark:bg-white/5 border border-dashed border-tat-charcoal/15 dark:border-white/15 grid place-items-center text-meta text-tat-charcoal/40 dark:text-tat-paper/40"
              >
                Coming in Phase B
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
