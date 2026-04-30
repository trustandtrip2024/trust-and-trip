import Link from "next/link";
import type { Destination } from "@/lib/data";

interface Props {
  destinations: Destination[];
}

const TOPIC_LINKS: { label: string; href: string }[] = [
  { label: "Honeymoon packages",        href: "/packages?style=Honeymoon" },
  { label: "Family holidays",           href: "/packages?style=Family" },
  { label: "Solo travel",               href: "/packages?style=Solo" },
  { label: "Group tours",               href: "/packages?style=Group" },
  { label: "Pilgrim journeys",          href: "/packages?theme=yatra" },
  { label: "Char Dham Yatra",           href: "/packages?destination=char-dham" },
  { label: "Vaishno Devi",              href: "/packages?destination=vaishno-devi" },
  { label: "Tirupati Balaji",           href: "/packages?destination=tirupati" },
  { label: "Visa-free for Indians",     href: "/packages?theme=visa-free" },
  { label: "Trips under ₹50,000",       href: "/packages?budget=under-50k" },
  { label: "Adventure trips",           href: "/packages?style=Adventure" },
  { label: "Wellness retreats",         href: "/packages?style=Wellness" },
  { label: "Luxury escapes",            href: "/packages?style=Luxury" },
  { label: "Beach holidays",            href: "/packages?theme=beach" },
  { label: "Mountain trips",            href: "/packages?theme=mountain" },
  { label: "Best in May",               href: "/packages?month=may" },
];

export default function SeoContent({ destinations }: Props) {
  const tops = destinations.slice(0, 18);

  return (
    <section
      aria-labelledby="seo-content-title"
      className="py-12 md:py-16 bg-tat-charcoal text-tat-paper/85"
    >
      <div className="container-custom">
        <h2
          id="seo-content-title"
          className="font-display font-normal text-[20px] md:text-[24px] leading-tight text-tat-paper"
        >
          Plan a holiday from India with{" "}
          <em className="not-italic font-display italic text-tat-gold">Trust and Trip.</em>
        </h2>
        <p className="mt-3 max-w-4xl text-[13px] md:text-[14px] leading-relaxed text-tat-paper/70">
          Trust and Trip Experiences is a Made-in-India travel agency that designs custom
          holiday packages for couples, families, solo travelers, groups, and pilgrim
          journeys. A real travel planner reads your brief and sends a full itinerary
          within 24 hours — destinations, hotels, day-by-day flow, line-item pricing —
          free until you decide to book. Since 2019 we&apos;ve handled over 8,000 trips
          across India and 60+ international destinations, with a 4.9★ rating on Google.
          We specialise in honeymoon trips to Bali, Maldives, Switzerland, and Santorini;
          family holidays in Kerala, Singapore, Dubai, and Thailand; pilgrim yatras to
          Char Dham, Vaishno Devi, Tirupati, and Amarnath with VIP darshan and helicopter
          transfers; and visa-free escapes for Indian passport holders to Thailand,
          Indonesia, Sri Lanka, Nepal, Bhutan, and Mauritius. Every booking includes
          24×7 emergency support, a doctor-on-call on Yatra trips, line-item billing
          (no inflated MRPs), and one named planner from quote to homecoming.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          <SeoBlock title="Top destinations">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
              {tops.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/destinations/${d.slug}`}
                    prefetch={false}
                    className="text-tat-paper/65 hover:text-tat-gold transition-colors"
                  >
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </SeoBlock>

          <SeoBlock title="Popular categories">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
              {TOPIC_LINKS.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    prefetch={false}
                    className="text-tat-paper/65 hover:text-tat-gold transition-colors"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </SeoBlock>

          <SeoBlock title="About Trust and Trip">
            <ul className="space-y-1.5 text-[12px]">
              <li><Link href="/about" prefetch={false} className="text-tat-paper/65 hover:text-tat-gold">About us</Link></li>
              <li><Link href="/reviews" prefetch={false} className="text-tat-paper/65 hover:text-tat-gold">Customer reviews</Link></li>
              <li><Link href="/blog" prefetch={false} className="text-tat-paper/65 hover:text-tat-gold">Travel journal</Link></li>
              <li><Link href="/customize-trip" prefetch={false} className="text-tat-paper/65 hover:text-tat-gold">Customise a trip</Link></li>
              <li><Link href="/offers" prefetch={false} className="text-tat-paper/65 hover:text-tat-gold">Live offers &amp; deals</Link></li>
              <li><Link href="/contact" prefetch={false} className="text-tat-paper/65 hover:text-tat-gold">Contact a planner</Link></li>
              <li><Link href="/refer" prefetch={false} className="text-tat-paper/65 hover:text-tat-gold">Refer a friend</Link></li>
              <li><Link href="/wishlist" prefetch={false} className="text-tat-paper/65 hover:text-tat-gold">Saved trips</Link></li>
            </ul>
            <p className="mt-4 text-[11px] text-tat-paper/45 leading-relaxed">
              Operating from India · IATA-affiliated agents · Razorpay-secured payments.
            </p>
          </SeoBlock>
        </div>
      </div>
    </section>
  );
}

function SeoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display font-medium text-[14px] uppercase tracking-[0.18em] text-tat-gold">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
