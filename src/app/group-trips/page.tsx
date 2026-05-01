export const revalidate = 600;

import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight, Phone, MessageCircle, Users, MapPin, Calendar,
  ShieldCheck, Building2, GraduationCap, Heart, Backpack, Briefcase,
} from "lucide-react";
import { getPackages } from "@/lib/sanity-queries";
import PackageCard, { type PackageCardProps } from "@/components/PackageCard";
import PackageCardSkeleton from "@/components/PackageCardSkeleton";
import CTASection from "@/components/CTASection";
import JsonLd from "@/components/JsonLd";
import type { Package } from "@/lib/data";

export const metadata = {
  title: "Group Trips — Your Group Only, Not a 35-Stranger Coach · Trust and Trip",
  description: "58 group trip packages across India and 30 countries. Your group only — your dates, pace, and vehicle. Multi-gen families, friend cohorts, corporate offsites, school batches. From ₹15k per person.",
  alternates: { canonical: "https://trustandtrip.com/group-trips" },
  openGraph: {
    title: "Trust and Trip — Group Trips",
    description: "Group trips that aren't fixed-departure coaches. Your group, your dates, your pace.",
  },
};

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

function isGroup(p: Package): boolean {
  if (p.travelType === "Group") return true;
  const cats = (p.categories ?? []).map((c) => c.toLowerCase());
  if (cats.includes("groups") || cats.includes("group")) return true;
  return false;
}

const VALUE_PROPS = [
  {
    icon: Users,
    title: "Your group only — no strangers",
    body: "Every group trip runs your cohort end-to-end. Your friends, your family, your colleagues — that's the bus, that's the table at dinner, that's the boat on the lake. We don't fill seats with people you didn't invite.",
  },
  {
    icon: Calendar,
    title: "Your dates, your pace",
    body: "Coach tours leave on the dates printed in the brochure. We start the trip the day everyone in your group can travel — Tuesday, Friday, mid-festival, whatever. Pace adjusts too: slower mornings if half the group has kids, longer evenings if everyone's there to party.",
  },
  {
    icon: MapPin,
    title: "Pickup from your city",
    body: "Lucknow, Haridwar, Kanpur, Indore, Delhi, Mumbai, Chandigarh and more — group trips out of your home city instead of asking everyone to fly into the metro. Especially relevant for elder-heavy yatras and tier-2/3 family cohorts.",
  },
  {
    icon: ShieldCheck,
    title: "One trip director, all trip long",
    body: "The same planner who quoted your group is on WhatsApp during the trip. Group dynamics shift mid-itinerary — someone falls sick, the kids want a pool day, the in-laws change their mind about Day 4. One director who knows the group makes those calls cleanly.",
  },
];

const COHORTS = [
  {
    icon: Heart,
    name: "Multi-gen family trips",
    desc: "Grandparents, parents, kids in the same itinerary. Pace tuned for the eldest, activities tuned for the youngest. Adjoining rooms blocked, dietary tracked across three generations.",
  },
  {
    icon: Backpack,
    name: "Friend cohorts",
    desc: "10–15 friends, your dates, your party energy. Curated boat parties, late dinners, optional adventure add-ons. We'll quote per-head and adjust as people RSVP.",
  },
  {
    icon: Briefcase,
    name: "Corporate offsites",
    desc: "Annual planning, sales kickoff, team retreats. Conference rooms, AV setup, structured sessions in the morning + free time evenings. GST invoicing, single billing entity.",
  },
  {
    icon: Heart,
    name: "Wedding cohorts",
    desc: "Bachelorette / bachelor batches, post-wedding family unwind, multi-day destination wedding logistics. We've handled both the wedding and the honeymoon for the same family more than once.",
  },
  {
    icon: GraduationCap,
    name: "School & college batches",
    desc: "Class 9–12 educational tours, college fest cohorts, alumni reunions. Permissions, parent comms, supervisor ratios, age-appropriate itineraries.",
  },
  {
    icon: Building2,
    name: "Religious / community batches",
    desc: "Temple committee yatras, satsang batches, community pilgrimages. Pilgrim concierge SOPs apply — doctor on call, elder-friendly pacing, prasad arrangements.",
  },
];

const STATS = [
  { k: "Group packages", v: "58+" },
  { k: "Group sizes", v: "8 to 80+" },
  { k: "Reach", v: "India + 30 countries" },
  { k: "Custom batches", v: "Any date" },
];

const FAQS = [
  {
    q: "What's the difference vs a Veena World coach tour?",
    a: "Veena (and SOTC, Thomas Cook tours, IRCTC tours) sell fixed-departure seats — you buy a seat on a 30–35 person coach with strangers, on dates printed in their brochure. We sell the whole bus, your group only. Your dates, your pace, your dietary mix, your stop choices. Trade-off: usually 8–15% more than a per-seat coach price. Benefit: nobody you didn't invite, no waiting on 32 strangers at every photo stop.",
  },
  {
    q: "What's the minimum group size?",
    a: "Realistically 6–8 people for the per-head economics to work — below that we usually quote it as a Family/Couple trip with a private vehicle. Maximum is 80+ (we've run school batches up to 120 across two coaches with separate trip directors). Sweet spot is 12–25.",
  },
  {
    q: "Can we add a few people last-minute, or drop people?",
    a: "Yes, with caveats. Hotels block to your room count + 1 buffer; flights block separately. Adding within 14 days of departure is usually fine for hotels, harder for flights (depends on availability/fare class). Dropping people: deposit splits across the rest unless you cancel the whole trip. Trip director handles the math.",
  },
  {
    q: "Do you do international group trips?",
    a: "Yes — Bali, Thailand, Vietnam, Sri Lanka, Maldives, Switzerland, Dubai, Singapore are common cohorts. Visa support included (for the Indian passport holders in your group). Multi-country combos like Switzerland + Italy or Tanzania + Zanzibar are doable for groups of 10+ with enough lead time.",
  },
  {
    q: "How is pricing usually quoted for groups?",
    a: "Per-head on the actual group size, not per-seat on a fixed coach. As your group grows the per-head drops — 8 people in a 14-seater traveller costs more per head than 14 people. We quote a base per-head with a sliding scale, so the final number lands as your RSVP closes.",
  },
  {
    q: "Can different people in the group pay separately?",
    a: "Yes. We can issue split invoices, take payments from individual members, and reconcile on a master booking. Common for friend cohorts and college batches where one person doesn't want to front the whole trip.",
  },
];

async function GroupGrid() {
  const all = await getPackages();
  const pool = all.filter(isGroup).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  const listLd = pool.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trust and Trip — Group trip packages",
    numberOfItems: pool.length,
    itemListElement: pool.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://trustandtrip.com/packages/${p.slug}`,
      name: p.title,
    })),
  } : null;

  if (pool.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="container-custom max-w-2xl text-center">
          <p className="text-tat-charcoal/65 mb-4">
            Tell us your group size, dates, and a destination shortlist — we&rsquo;ll line up
            options the same day.
          </p>
          <Link
            href="/customize-trip?type=Group"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-charcoal text-tat-paper font-semibold text-sm hover:bg-tat-charcoal/90"
          >
            Brief a group <ArrowRight className="h-4 w-4" />
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
              <span className="eyebrow">Group trip packages</span>
              <h2 className="heading-section mt-2 text-balance">
                {pool.length} group trips,
                <span className="italic text-tat-gold font-light"> dates flexible.</span>
              </h2>
            </div>
            <Link
              href="/packages?type=Group"
              className="text-sm font-semibold text-tat-charcoal/70 hover:text-tat-gold inline-flex items-center gap-1"
            >
              Filter group type in /packages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {pool.slice(0, 24).map((p) => (
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

export default function GroupTripsPage() {
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Group Trips — Trust and Trip",
    description: "Group trips that aren't fixed-departure coaches. Your group only, your dates, your pace.",
    url: "https://trustandtrip.com/group-trips",
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={collectionLd} />
      <JsonLd data={faqLd} />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-14 md:pb-20 bg-tat-charcoal text-tat-paper overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-0 opacity-[0.18]"
          style={{
            background:
              "radial-gradient(ellipse at 25% 15%, rgba(212,175,55,0.5) 0%, transparent 60%), radial-gradient(ellipse at 80% 85%, rgba(14,124,123,0.45) 0%, transparent 60%)",
          }}
        />
        <div className="container-custom relative">
          <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tat-gold/15 border border-tat-gold/30 text-tat-gold text-[11px] font-semibold uppercase tracking-[0.2em]">
            <Users className="h-3 w-3" />
            Group Trips
          </p>
          <h1 className="mt-4 font-display text-display-lg md:text-display-xl font-medium leading-[1.02] max-w-4xl text-balance">
            Travel together,
            <span className="italic text-tat-gold font-light"> not with strangers.</span>
          </h1>
          <p className="mt-6 text-tat-paper/75 max-w-2xl leading-relaxed text-base md:text-lg">
            Your friends, your family, your colleagues — that&rsquo;s the bus. Group trips on your
            dates, at your pace, with one trip director who knows the cohort. No fixed-departure
            coach. No 35 strangers at every photo stop.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/customize-trip?type=Group"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-sm hover:bg-tat-gold/90"
            >
              Brief a group <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/918115999588?text=Hi%20Akash!%20I%27d%20like%20to%20brief%20a%20group%20trip."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-tat-paper/10 hover:bg-tat-paper/15 text-tat-paper border border-tat-paper/20 font-semibold text-sm"
            >
              <Phone className="h-4 w-4" />
              WhatsApp Akash
            </a>
          </div>

          <ul className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 text-[12px] md:text-[13px]">
            {STATS.map((s) => (
              <li key={s.k} className="rounded-2xl bg-tat-paper/5 border border-tat-paper/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-tat-paper/50 font-semibold">{s.k}</p>
                <p className="mt-1 text-tat-paper font-display text-base md:text-lg">{s.v}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Value props */}
      <section className="py-14 md:py-20 bg-tat-paper">
        <div className="container-custom">
          <span className="eyebrow">Why ours, not a coach tour</span>
          <h2 className="heading-section mt-2 mb-10 max-w-3xl text-balance">
            Four things a fixed-departure coach{" "}
            <span className="italic text-tat-gold font-light">cannot give you.</span>
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

      {/* Cohorts we run */}
      <section className="py-14 md:py-20 bg-tat-cream-warm/30">
        <div className="container-custom">
          <span className="eyebrow">Cohorts we run</span>
          <h2 className="heading-section mt-2 mb-3 max-w-3xl text-balance">
            From multi-gen families{" "}
            <span className="italic text-tat-gold font-light">to corporate offsites.</span>
          </h2>
          <p className="text-tat-charcoal/65 max-w-2xl mb-10 text-sm leading-relaxed">
            Different cohorts need different planning depths. Pick the closest match — the
            planner customises pace, hotels, dietary, and dates from there.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COHORTS.map((c) => (
              <div
                key={c.name}
                className="rounded-2xl bg-tat-paper border border-tat-charcoal/8 p-5"
              >
                <div className="h-9 w-9 rounded-full bg-tat-gold/15 flex items-center justify-center mb-3">
                  <c.icon className="h-4 w-4 text-tat-gold" />
                </div>
                <h3 className="font-display text-lg font-medium text-tat-charcoal leading-snug">{c.name}</h3>
                <p className="mt-2 text-sm text-tat-charcoal/65 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Package grid */}
      <Suspense fallback={<GridSkeleton />}>
        <GroupGrid />
      </Suspense>

      {/* FAQs */}
      <section className="py-14 md:py-20 bg-tat-cream-warm/30">
        <div className="container-custom max-w-3xl">
          <span className="eyebrow">Group-specific questions</span>
          <h2 className="heading-section mt-2 mb-6 text-balance">
            What organisers ask{" "}
            <span className="italic text-tat-gold font-light">before they brief.</span>
          </h2>
          <div className="divide-y divide-tat-charcoal/8 rounded-2xl bg-tat-paper border border-tat-charcoal/8">
            {FAQS.map((f, i) => (
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
              <p className="text-[11px] uppercase tracking-[0.2em] text-tat-gold font-semibold">Ready to brief a group?</p>
              <p className="font-display text-xl md:text-2xl mt-1">A planner replies within 9 minutes.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/customize-trip?type=Group" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-tat-gold text-tat-charcoal font-semibold text-sm">
                Brief a group <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://wa.me/918115999588"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-tat-paper/10 hover:bg-tat-paper/15 border border-tat-paper/20 font-semibold text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
