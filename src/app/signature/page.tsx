export const revalidate = 600;

import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Compass, MapPin, Sparkles, Phone, ShieldCheck, Users } from "lucide-react";
import { getPackages } from "@/lib/sanity-queries";
import PackageCard, { type PackageCardProps } from "@/components/PackageCard";
import PackageCardSkeleton from "@/components/PackageCardSkeleton";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import type { Package } from "@/lib/data";

export const metadata = {
  title: "Signature Tier — Premium Trips Built for You · Trust and Trip",
  description: "The right tier for most trips. 4-star anchors, your group only, source-city pickup, and a real planner on WhatsApp — not a fixed-departure coach. From ₹50k per person.",
  alternates: { canonical: "https://trustandtrip.com/signature" },
  openGraph: {
    title: "Trust and Trip — Signature Tier",
    description: "Premium trips with 4-star hotels, your own group, and a real planner. The right tier for most travellers.",
  },
};

const SIGNATURE_FLOOR = 50000;
const SIGNATURE_CEILING = 150000;

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
    icon: ShieldCheck,
    title: "4-star anchors, vetted in person",
    body: "Most Signature trips run on 4-star city hotels and verified boutique stays in the hills. We've slept in them before recommending them — no surprise downgrades when you arrive at midnight.",
  },
  {
    icon: Users,
    title: "Your group only — never a coach tour",
    body: "Veena, Thomas Cook, SOTC sell the same hotel inside a 35-person bus. We give you the same hotel with your family or friends only. Your dates, your pace, no buffet schedule.",
  },
  {
    icon: Compass,
    title: "Source-city pickup, end-to-end",
    body: "Pickup from your home airport or station, not just the destination. We handle internal flights, transfers, and the awkward 4am hand-offs at hill-station bus stands.",
  },
  {
    icon: Sparkles,
    title: "Human planning, not a booking widget",
    body: "Pickyourtrail and HappyEasyGo are widgets — pick a card, pay, hope. We change the route when monsoons hit Coorg early, when Manali's blocked, or when your kid runs a fever.",
  },
];

const SIGNATURE_FAQS = [
  {
    q: "How is Signature different from Private?",
    a: "Private is for travellers who want a dedicated trip director, 5-star city hotels, and private guides on every leg — typically ₹2.5L+ per person. Signature is the same human planning and ground partners, but on 4-star hotels, group transfers within the destination, and a shared planner. Most travellers don't need Private — Signature is the right tier for ~70% of our trips.",
  },
  {
    q: "Why not just book this on Pickyourtrail or MakeMyTrip Holidays?",
    a: "They're booking widgets dressed up with a chat button. The 'planner' is a sales script, the inventory is OTA leftovers, and if your flight cancels at 11pm, you're emailing a ticket queue. Our planners are real people with relationships at the hotels — and they pick up after hours when something goes sideways.",
  },
  {
    q: "What's actually included in the price?",
    a: "Hotels (with breakfast), all transfers, sightseeing per the itinerary, internal flights or trains where the route needs them, and our planner's time. Excluded: international flights to your gateway, lunches/dinners, optional activities, and visa fees where applicable. Every quote spells it out line-by-line — no surprise add-ons.",
  },
  {
    q: "Can I customise a Signature trip — change hotels, add a day?",
    a: "Yes. Every Signature itinerary on this page is a starting point, not a fixed package. Want a 4-night Kerala instead of 6? Want to swap a city hotel for a homestay? Want to add Munnar to the Kerala loop? Tell us — the planner will rebuild and re-quote. No 'you must pick from these 3' nonsense.",
  },
  {
    q: "How fast do you reply once I share my dates?",
    a: "Median response time is under 9 minutes during business hours (9am–9pm IST), and within 90 minutes after that. You'll get a named planner — same person from quote to homecoming, not a round-robin.",
  },
];

async function SignatureGrid() {
  const all = await getPackages();
  const signaturePool = all
    .filter((p) => {
      const cats = p.categories ?? [];
      if (cats.includes("Luxury") || cats.includes("Budget")) return false;
      return p.price >= SIGNATURE_FLOOR && p.price < SIGNATURE_CEILING;
    })
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  const listLd = signaturePool.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trust and Trip — Signature-tier journeys",
    numberOfItems: signaturePool.length,
    itemListElement: signaturePool.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://trustandtrip.com/packages/${p.slug}`,
      name: p.title,
    })),
  } : null;

  if (signaturePool.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="container-custom max-w-2xl text-center">
          <p className="text-tat-charcoal/65 mb-4">
            We&rsquo;re refreshing the Signature catalogue. Tell us your dates and we&rsquo;ll build it for you.
          </p>
          <Link
            href="/customize-trip?tier=signature"
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
              <span className="eyebrow">Signature-tier journeys</span>
              <h2 className="heading-section mt-2 text-balance">
                {signaturePool.length} ready trips,
                <span className="italic text-tat-gold font-light"> tailorable on request.</span>
              </h2>
            </div>
            <Link
              href="/packages?tier=signature"
              className="text-sm font-semibold text-tat-charcoal/70 hover:text-tat-gold inline-flex items-center gap-1"
            >
              See all Signature packages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {signaturePool.slice(0, 24).map((p) => (
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

export default function SignaturePage() {
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Signature-tier travel — Trust and Trip",
    description: "Premium 4-star trips with human planning, your group only, and source-city pickup. The right tier for most travellers.",
    url: "https://trustandtrip.com/signature",
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SIGNATURE_FAQS.map((f) => ({
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
              "radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(14,124,123,0.45) 0%, transparent 60%)",
          }}
        />
        <div className="container-custom relative">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tat-gold/15 border border-tat-gold/30 text-tat-gold text-[11px] font-semibold uppercase tracking-[0.2em]">
            <Compass className="h-3 w-3" />
            Trust and Trip · Signature tier
          </p>
          <h1 className="mt-4 font-display text-display-lg md:text-display-xl font-medium leading-[1.02] max-w-4xl text-balance">
            The right tier
            <span className="italic text-tat-gold font-light"> for most trips.</span>
          </h1>
          <p className="mt-6 text-tat-paper/75 max-w-2xl leading-relaxed text-base md:text-lg">
            4-star anchors. Your group only — no coach tour. Source-city pickup, internal flights,
            and a real planner on WhatsApp from quote to homecoming. Built for couples, families,
            and friend-groups who want the trip done well, not done expensively.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/customize-trip?tier=signature"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-sm hover:bg-tat-gold/90"
            >
              Plan my trip <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/918115999588?text=Hi!%20I'd%20like%20to%20plan%20a%20Signature-tier%20trip."
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
              { k: "From", v: "₹50k / person" },
              { k: "Hotels", v: "Mostly 4-star" },
              { k: "Group size", v: "Yours only" },
              { k: "Reply time", v: "~9 minutes" },
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
          <span className="eyebrow">Why Signature with us</span>
          <h2 className="heading-section mt-2 mb-10 max-w-3xl text-balance">
            Premium without the
            <span className="italic text-tat-gold font-light"> coach-tour compromise.</span>
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
        <SignatureGrid />
      </Suspense>

      <section className="py-14 md:py-20 bg-tat-cream-warm/30">
        <div className="container-custom max-w-3xl">
          <span className="eyebrow">Common questions</span>
          <h2 className="heading-section mt-2 mb-6 text-balance">
            What most travellers ask{" "}
            <span className="italic text-tat-gold font-light">before booking Signature.</span>
          </h2>
          <div className="divide-y divide-tat-charcoal/8 rounded-2xl bg-tat-paper border border-tat-charcoal/8">
            {SIGNATURE_FAQS.map((f, i) => (
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
              <Link href="/customize-trip?tier=signature" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-sm">
                Start planning <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/packages?tier=signature" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-tat-paper/10 hover:bg-tat-paper/15 border border-tat-paper/20 font-semibold text-sm">
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
