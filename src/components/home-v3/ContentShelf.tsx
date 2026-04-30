import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PackageCard, { type PackageCardProps } from "@/components/ui/PackageCard";

interface Props {
  id?: string;
  eyebrow: string;
  title: string;
  italicTail?: string;
  lede?: string;
  ctaHref: string;
  ctaLabel?: string;
  packages: PackageCardProps[];
  bg?: "paper" | "cream";
}

const BG_CLASS = {
  paper: "bg-tat-paper dark:bg-tat-charcoal",
  cream: "bg-tat-cream-warm/30 dark:bg-tat-charcoal/95",
} as const;

export default function ContentShelf({
  id, eyebrow, title, italicTail, lede,
  ctaHref, ctaLabel = "See all", packages, bg = "paper",
}: Props) {
  if (!packages.length) return null;
  const items = packages.slice(0, 10);

  return (
    <section
      id={id}
      aria-labelledby={`shelf-${id ?? eyebrow}-title`}
      className={`py-12 md:py-16 ${BG_CLASS[bg]} scroll-mt-44 lg:scroll-mt-32`}
    >
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
              {eyebrow}
            </p>
            <h2
              id={`shelf-${id ?? eyebrow}-title`}
              className="mt-2 font-display font-normal text-[22px] md:text-[30px] leading-tight text-tat-charcoal dark:text-tat-paper text-balance"
            >
              {title}
              {italicTail && (
                <>
                  {" "}
                  <em className="not-italic font-display italic text-tat-gold">{italicTail}</em>
                </>
              )}
            </h2>
            {lede && (
              <p className="mt-2 text-body-sm text-tat-charcoal/70 dark:text-tat-paper/70 max-w-2xl">
                {lede}
              </p>
            )}
          </div>
          <Link
            href={ctaHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 -mx-5 px-5 lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
          <ul className="flex gap-4 lg:gap-5 pb-2 pr-5 lg:pr-0 items-stretch">
            {items.map((p) => (
              <li
                key={p.href}
                className="shrink-0 snap-start flex w-[80%] sm:w-[55%] md:w-[40%] lg:w-[28%] xl:w-[22%]"
              >
                <PackageCard {...p} density="compact" />
              </li>
            ))}
          </ul>
        </div>

        <div className="sm:hidden mt-5 text-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold hover:underline underline-offset-4"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
