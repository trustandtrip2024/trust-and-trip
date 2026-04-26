import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export default function EmptyState({ icon: Icon, title, description, ctaLabel, ctaHref }: Props) {
  return (
    <div className="text-center py-16 max-w-md mx-auto">
      <div className="h-14 w-14 mx-auto rounded-pill bg-tat-cream-warm/30 grid place-items-center text-tat-gold">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-serif text-h3 text-tat-charcoal">{title}</h3>
      <p className="mt-2 text-body text-tat-slate">{description}</p>
      <Link href={ctaHref} className="tt-cta mt-5 max-w-xs mx-auto">
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
