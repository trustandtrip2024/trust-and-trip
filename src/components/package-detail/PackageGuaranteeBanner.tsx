import { ShieldCheck, Calendar, Wallet, Headphones } from "lucide-react";

const GUARANTEES = [
  {
    icon: Wallet,
    title: "₹0 to start",
    body: "No card needed. Get a free, fully-customised quote within 24 hours — pay only when you say yes.",
  },
  {
    icon: Calendar,
    title: "Free changes for 48 hours",
    body: "Swap dates, hotels, even guest count after we send the itinerary. No fees, no questions.",
  },
  {
    icon: ShieldCheck,
    title: "30% deposit only",
    body: "Hold your booking with a 30% deposit (min ₹5,000). Balance due closer to travel — never upfront.",
  },
  {
    icon: Headphones,
    title: "One real planner, all trip long",
    body: "Same person from first call to last day on trip. WhatsApp answered in under 9 minutes.",
  },
];

/**
 * Bold trust banner placed before the reviews block. The four pillars
 * collapse the brand's risk-reversal promise into a single visual unit so
 * even the skim-reader gets it before they see social proof.
 */
export default function PackageGuaranteeBanner() {
  return (
    <section className="mb-12 scroll-mt-32 pt-10 border-t border-tat-charcoal/8">
      <div className="rounded-3xl bg-gradient-to-br from-tat-charcoal via-tat-charcoal to-tat-charcoal/95 text-tat-paper p-6 md:p-8 lg:p-10 ring-1 ring-tat-gold/15 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)]">
        <div className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-tat-gold">
            Our promise
          </p>
          <h2 className="mt-2 font-display text-[26px] md:text-[34px] font-medium leading-tight text-balance">
            Plan now,{" "}
            <span className="italic font-display font-light text-tat-gold">
              decide later.
            </span>
          </h2>
          <p className="mt-3 text-[14px] md:text-[15px] text-tat-paper/75 leading-relaxed">
            Four guarantees we put in writing, on every trip we plan.
          </p>
        </div>

        <ul role="list" className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {GUARANTEES.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 md:p-5"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-tat-gold/20 text-tat-gold">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-display text-[16px] md:text-[17px] font-medium leading-tight text-tat-paper">
                {title}
              </h3>
              <p className="mt-1.5 text-[12.5px] md:text-[13px] leading-relaxed text-tat-paper/65">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
