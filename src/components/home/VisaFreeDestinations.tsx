import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plane, ShieldCheck } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

interface VisaFreeItem {
  name: string;
  country: string;
  rule: string;
  whisper: string;
  image: string;
  href: string;
}

const ITEMS: VisaFreeItem[] = [
  {
    name: "Thailand",
    country: "Southeast Asia",
    rule: "Visa-free · 60 days",
    whisper: "Beaches, temples, street-food at midnight.",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=70",
    href: "/packages?destination=thailand",
  },
  {
    name: "Bali",
    country: "Indonesia",
    rule: "Visa-on-arrival · 30 days",
    whisper: "Green, gentle, full of surprises.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=70",
    href: "/destinations/bali",
  },
  {
    name: "Maldives",
    country: "Indian Ocean",
    rule: "Visa-on-arrival · 30 days",
    whisper: "Where the floor is the ocean.",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=70",
    href: "/destinations/maldives",
  },
  {
    name: "Sri Lanka",
    country: "South Asia",
    rule: "Free e-visa · 30 days",
    whisper: "Hill country tea, southern coast surf.",
    image: "https://images.unsplash.com/photo-1546708973-b9c4ed11577d?auto=format&fit=crop&w=900&q=70",
    href: "/packages?destination=sri-lanka",
  },
  {
    name: "Bhutan",
    country: "Himalayas",
    rule: "Visa-free for Indians",
    whisper: "Slow valleys, monasteries above the clouds.",
    image: "https://images.unsplash.com/photo-1558005530-a7958896ec60?auto=format&fit=crop&w=900&q=70",
    href: "/packages?destination=bhutan",
  },
  {
    name: "Mauritius",
    country: "Indian Ocean",
    rule: "Visa-free · 90 days",
    whisper: "Volcanic beaches and creole afternoons.",
    image: "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&w=900&q=70",
    href: "/packages?destination=mauritius",
  },
];

export default function VisaFreeDestinations() {
  return (
    <section
      aria-labelledby="visa-free-title"
      className="relative py-18 md:py-22 bg-gradient-to-b from-tat-cream-warm/40 via-tat-paper to-tat-paper"
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <SectionHeader
            eyebrow="No visa, no wait"
            title="Indian passport welcome —"
            italicTail="pack and go."
            lede="Six destinations you can fly to without a consulate appointment. Visa-free or visa-on-arrival for Indian passport holders."
          />
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-tat-burnt/10 border border-tat-burnt/30 text-tat-burnt text-[12px] font-medium uppercase tracking-[0.12em]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            For Indian passports
          </span>
        </div>

        <ul className="mt-8 flex flex-nowrap gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {ITEMS.map((d) => (
            <li
              key={d.name}
              className="shrink-0 snap-start w-[78%] sm:w-[58%] md:w-auto"
            >
              <Link
                href={d.href}
                className="group relative block aspect-[4/5] rounded-card overflow-hidden bg-tat-charcoal shadow-card transition duration-200 hover:shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-burnt focus-visible:ring-offset-2"
              >
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 33vw"
                  quality={70}
                  className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tat-charcoal/85 via-tat-charcoal/30 to-transparent" />

                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-tat-burnt text-tat-paper text-[11px] font-medium uppercase tracking-[0.1em]">
                  <Plane className="h-3 w-3" aria-hidden />
                  {d.rule}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 text-white">
                  <p className="text-tag uppercase text-white/65">{d.country}</p>
                  <h3 className="mt-1 font-display font-normal text-h3 text-white leading-tight">
                    {d.name}
                  </h3>
                  <p className="mt-1.5 text-meta text-white/80 line-clamp-2">
                    {d.whisper}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-meta text-white/85 group-hover:text-tat-burnt transition duration-120">
                    Explore packages
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex items-center justify-between flex-wrap gap-4">
          <p className="text-meta text-tat-charcoal/65 max-w-2xl">
            Visa rules updated for Indian passports as of 2025. Always verify on the official embassy site before booking.
          </p>
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-tat-charcoal hover:text-tat-burnt transition duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-burnt focus-visible:ring-offset-2 rounded-sm"
          >
            See all international packages
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
