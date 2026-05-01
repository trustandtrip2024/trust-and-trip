export const revalidate = 600;

import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Backpack, MapPin, Sparkles, Phone, Wallet, HeartHandshake } from "lucide-react";
import { getPackages } from "@/lib/sanity-queries";
import PackageCard, { type PackageCardProps } from "@/components/PackageCard";
import PackageCardSkeleton from "@/components/PackageCardSkeleton";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import type { Package } from "@/lib/data";

export const metadata = {
  title: "Essentials Tier — Pocket-Friendly Trips, Same Standard · Trust and Trip",
  description: "Char Dham yatras, Kerala 5N6D, weekend Goa, family hill trips. Same human planning as our higher tiers, on a budget. Real ground partners — not OTA leftovers. From ₹15k per person.",
  alternates: { canonical: "https://trustandtrip.com/essentials" },
  openGraph: {
    title: "Trust and Trip — Essentials Tier",
    description: "Pocket-friendly trips planned by humans. Yatras, weekend getaways, family group trips — same standard, on a budget.",
  },
};

const ESSENTIALS_CEILING = 50000;

function toCardProps(p: Package): PackageCardProps {
  return {
    title: p.title,
    slug: p.slug,
    image: p.image,
    duration: p.duration,
    price: p.price,
    rating: p.rating,
    reviews: p.reviews,
    destinationName: p.destinationName,
    travelType: p.travelType,
    trending: p.trending,
    limitedSlots: p.limitedSlots,
    highlights: p.highlights,
    inclusions: p.inclusions,
    categories: p.categories,
  };
}

const VALUE_PROPS = [
  {
    icon: Wallet,
    title: "Pocket-friendly, never cheap",
    body: "Same hotel-vetting standard as our Signature tier — we just pick the 3-star and clean homestay end of the catalogue. No 'budget' code for unwashed sheets, no 18-hour bus rides hidden in the fine print.",
  },
  {
    icon: HeartHandshake,
    title: "Yatra-ready, family-ready",
    body: "Char Dham, Vaishno Devi, Tirupati, Sabarimala — we run dozens of yatra trips a year. Senior-friendly pacing, vegetarian meals, ladies-only groups on request, palki/pony bookings handled in advance.",
  },
  {
    icon: Backpack,
    title: "Real ground partners",
    body: "Pickyourtrail, EaseMyTrip Holidays sell OTA leftover hotels at a markup. We use our own ground partners in Kerala, Goa, Himachal, Uttarakhand, Karnataka — same people we send Signature trips to, on a smaller room.",
  },
  {
    icon: Sparkles,
    title: "Human planning at every price",
    body: "Veena's budget tour locks you on a fixed-departure coach. Ours is your group, your dates — even at ₹15k. Same planner replies on WhatsApp whether your trip is ₹15k or ₹15L.",
  },
];

const ESSENTIALS_FAQS = [
  {
    q: "Is Essentials really cheap, or just budget-coded marketing?",
    a: "Genuinely pocket-friendly. Char Dham yatras start at ~₹15k per person, Kerala 5N6D from ~₹25k, Goa weekends from ~₹12k, hill-station family trips from ~₹18k. We get there by using 3-star hotels, group transfers, and our own ground-partner network — not by hiding costs.",
  },
  {
    q: "How is this different from a Veena World or SOTC budget tour?",
    a: "Their budget tier is a fixed-departure coach with 35 strangers, a tour leader with a flag, and a 4:30am wake-up call. Our Essentials is your family or friend-group only — your dates, your pace, your departure city. Same hotel category, no coach lock-in.",
  },
  {
    q: "What about Pickyourtrail / EaseMyTrip Holidays / MakeMyTrip?",
    a: "Those are OTA inventory dressed up as 'planning'. The 3-star hotel they sell you is whatever's available on the public booking engine. We use ground partners we've worked with for years — when something goes sideways at 11pm in Munnar, we know who to call. They send a chatbot.",
  },
  {
    q: "Can elderly parents do a Char Dham or Vaishno Devi yatra with you?",
    a: "Yes — Essentials is built for this. We pre-book palki/dandi/pony where the trail demands it, pace shorter walking days for seniors, ensure pure-veg satvik meals throughout, and pair groups with Hindi-speaking drivers who know the route. We also flag medical-clearance requirements on yatras above 12,000 ft.",
  },
  {
    q: "What's actually included at this price point?",
    a: "3-star or quality homestay accommodation (with breakfast on most trips), all transfers in private vehicles (not coaches), sightseeing per the itinerary, and our planner's time. Internal flights are added when the route really needs them — otherwise we use trains where they're faster and cheaper. Every quote is line-item transparent.",
  },
];

async function EssentialsGrid() {
  const all = await getPackages();
  const essentialsPool = all
    .filter((p) => {
      const cats = p.categories ?? [];
      return p.price < ESSENTIALS_CEILING || cats.includes("Budget");
    })
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  const listLd = essentialsPool.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trust and Trip — Essentials-tier journeys",
    numberOfItems: essentialsPool.length,
    itemListElement: essentialsPool.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://trustandtrip.com/packages/${p.slug}`,
      name: p.title,
    })),
  } : null;

  if (essentialsPool.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="container-custom max-w-2xl text-center">
          <p className="text-tat-charcoal/65 mb-4">
            We&rsquo;re refreshing the Essentials catalogue. Tell us your dates and budget — we&rsquo;ll build it.
          </p>
          <Link
            href="/customize-trip?tier=essentials"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-charcoal text-tat-paper font-semibold text-sm hover:bg-tat-charcoal/90"
          >
            Plan my trip <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {listLd && <JsonLd data={listLd} />}
      <section id="trips" className="py-12 md:py-16 scroll-mt-32">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
            <div>
              <span className="eyebrow">Essentials-tier journeys</span>
              <h2 className="heading-section mt-2 text-balance">
                {essentialsPool.length} pocket-friendly trips,
                <span className="italic text-tat-gold font-light"> human-planned.</span>
              </h2>
            </div>
            <Link
              href="/packages?tier=essentials"
              className="text-sm font-semibold text-tat-charcoal/70 hover:text-tat-gold inline-flex items-center gap-1"
            >
              See all Essentials packages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {essentialsPool.slice(0, 24).map((p) => (
              <PackageCard key={p.slug} {...toCardProps(p)} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function GridSkeleton() {
  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {Array.from({ length: 6 }).map((_, i) => <PackageCardSkeleton key={i} />)}
        </div>
      </div>
    </section>
  );
}

export default function EssentialsPage() {
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Essentials-tier travel — Trust and Trip",
    description: "Pocket-friendly trips with the same human-planning standard as our higher tiers. Yatras, weekend getaways, family group trips.",
    url: "https://trustandtrip.com/essentials",
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ESSENTIALS_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={collectionLd} />
      <JsonLd data={faqLd} />

      <section className="relative pt-28 md:pt-36 pb-14 md:pb-20 bg-tat-charcoal text-tat-paper overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-0 opacity-[0.18]"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(14,124,123,0.5) 0%, transparent 60%)",
          }}
        />
        <div className="container-custom relative">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tat-gold/15 border border-tat-gold/30 text-tat-gold text-[11px] font-semibold uppercase tracking-[0.2em]">
            <Backpack className="h-3 w-3" />
            Trust and Trip · Essentials tier
          </p>
          <h1 className="mt-4 font-display text-display-lg md:text-display-xl font-medium leading-[1.02] max-w-4xl text-balance">
            Pocket-friendly,
            <span className="italic text-tat-gold font-light"> never cheap.</span>
          </h1>
          <p className="mt-6 text-tat-paper/75 max-w-2xl leading-relaxed text-base md:text-lg">
            Char Dham yatras from ₹15k. Kerala 5N6D from ₹25k. Weekend Goa, family hill trips,
            Vaishno Devi pilgrimages. Same human planning, same ground partners as our higher
            tiers — without the coach-tour lock-in.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/customize-trip?tier=essentials"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-sm hover:bg-tat-gold/90"
            >
              Plan my trip <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/918115999588?text=Hi!%20I'd%20like%20to%20plan%20an%20Essentials-tier%20trip."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-paper/10 hover:bg-tat-paper/15 text-tat-paper border border-tat-paper/20 font-semibold text-sm"
            >
              <Phone className="h-4 w-4" />
              WhatsApp us
            </a>
          </div>

          <ul className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 text-[12px] md:text-[13px]">
            {[
              { k: "From", v: "₹15k / person" },
              { k: "Hotels", v: "3-star + homestays" },
              { k: "Group size", v: "Yours only" },
              { k: "Yatras", v: "Char Dham ready" },
            ].map((s) => (
              <li key={s.k} className="rounded-2xl bg-tat-paper/5 border border-tat-paper/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-tat-paper/50 font-semibold">{s.k}</p>
                <p className="mt-1 text-tat-paper font-display text-base md:text-lg">{s.v}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-tat-paper">
        <div className="container-custom">
          <span className="eyebrow">Why Essentials with us</span>
          <h2 className="heading-section mt-2 mb-10 max-w-3xl text-balance">
            Budget-tier price,
            <span className="italic text-tat-gold font-light"> full-tier care.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {VALUE_PROPS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl bg-tat-cream-warm/40 border border-tat-charcoal/8 p-6">
                <div className="h-10 w-10 rounded-full bg-tat-gold/15 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-tat-gold" />
                </div>
                <h3 className="font-display text-lg md:text-xl font-medium text-tat-charcoal">{title}</h3>
                <p className="mt-2 text-sm text-tat-charcoal/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Suspense fallback={<GridSkeleton />}>
        <EssentialsGrid />
      </Suspense>

      <section className="py-14 md:py-20 bg-tat-cream-warm/30">
        <div className="container-custom max-w-3xl">
          <span className="eyebrow">Common questions</span>
          <h2 className="heading-section mt-2 mb-6 text-balance">
            What yatra-goers and weekenders ask{" "}
            <span className="italic text-tat-gold font-light">before booking.</span>
          </h2>
          <div className="divide-y divide-tat-charcoal/8 rounded-2xl bg-tat-paper border border-tat-charcoal/8">
            {ESSENTIALS_FAQS.map((f, i) => (
              <details key={i} className="group p-5 md:p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-start justify-between gap-4 cursor-pointer">
                  <h3 className="font-display text-base md:text-lg font-medium text-tat-charcoal">{f.q}</h3>
                  <span className="shrink-0 mt-1 h-6 w-6 rounded-full bg-tat-gold/15 text-tat-gold flex items-center justify-center group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-tat-charcoal/70 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-tat-charcoal text-tat-paper p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-tat-gold font-semibold">Ready to plan?</p>
              <p className="font-display text-xl md:text-2xl mt-1">A planner replies within 9 minutes.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/customize-trip?tier=essentials" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-sm">
                Start planning <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/packages?tier=essentials" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-tat-paper/10 hover:bg-tat-paper/15 border border-tat-paper/20 font-semibold text-sm">
                <MapPin className="h-4 w-4" /> See all
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
