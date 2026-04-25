export const revalidate = 30;

export const metadata = {
  title: "Trust and Trip – Crafting Reliable Travel",
  description:
    "Trust and Trip crafts reliable, handpicked travel experiences across 60+ destinations. Honeymoons, family holidays, group tours and solo adventures — planned with trust, delivered with care.",
  alternates: { canonical: "https://trustandtrip.com" },
};

import dynamic from "next/dynamic";
import HeroV2 from "@/components/homepage-v2/HeroV2";
import TrustRow from "@/components/homepage-v2/TrustRow";
import HowItWorks from "@/components/homepage-v2/HowItWorks";
import TaggedPackageSlider from "@/components/homepage-v2/TaggedPackageSlider";
import DestinationsGrid3x3 from "@/components/homepage-v2/DestinationsGrid3x3";
import ExperienceVectorGrid from "@/components/homepage-v2/ExperienceVectorGrid";

const FinalCTA = dynamic(() => import("@/components/homepage-v2/FinalCTA"));
const GoogleReviewsSection = dynamic(() => import("@/components/GoogleReviewsSection"));
const HomepageOffersSection = dynamic(() => import("@/components/HomepageOffersSection"));

import {
  getDestinations,
  getTrendingPackages,
  getBudgetPackages,
  getPackagesByType,
  getPilgrimPackages,
} from "@/lib/sanity-queries";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const DEST_TAGS = [
  { label: "Bali",       href: "/packages?destination=bali",      emoji: "🌺" },
  { label: "Maldives",   href: "/packages?destination=maldives",  emoji: "🏝️" },
  { label: "Kerala",     href: "/packages?destination=kerala",    emoji: "🌴" },
  { label: "Manali",     href: "/packages?destination=manali",    emoji: "🏔️" },
  { label: "Goa",        href: "/packages?destination=goa",       emoji: "🏖️" },
  { label: "Rajasthan",  href: "/packages?destination=rajasthan", emoji: "🏜️" },
  { label: "Thailand",   href: "/packages?destination=thailand",  emoji: "🐘" },
  { label: "Dubai",      href: "/packages?destination=dubai",     emoji: "🌆" },
  { label: "Switzerland",href: "/packages?destination=switzerland",emoji: "🏔️" },
  { label: "Singapore",  href: "/packages?destination=singapore", emoji: "🦁" },
];

const BUDGET_TAGS = [
  { label: "Under ₹35K",  href: "/packages?budget=budget",   emoji: "💸" },
  { label: "₹35K – ₹50K", href: "/packages?budget=budget",   emoji: "💰" },
  { label: "₹50K – ₹1L",  href: "/packages?budget=standard", emoji: "✨" },
  { label: "₹1L – ₹2L",   href: "/packages?budget=premium",  emoji: "💎" },
  { label: "Above ₹2L",   href: "/packages?budget=luxury",   emoji: "👑" },
];

const EXPERIENCE_TAGS = [
  { label: "Honeymoon",  href: "/experiences/honeymoon",  emoji: "💑" },
  { label: "Family",     href: "/experiences/family",     emoji: "👨‍👩‍👧‍👦" },
  { label: "Adventure",  href: "/experiences/adventure",  emoji: "🎒" },
  { label: "Pilgrim",    href: "/experiences/pilgrim",    emoji: "🛕" },
  { label: "Luxury",     href: "/experiences/luxury",     emoji: "👑" },
  { label: "Solo",       href: "/experiences/solo",       emoji: "🧭" },
  { label: "Group",      href: "/experiences/group",      emoji: "🎉" },
  { label: "Wellness",   href: "/experiences/wellness",   emoji: "🌿" },
  { label: "Weekend",    href: "/experiences/weekend",    emoji: "🌅" },
];

export default async function HomePage() {
  const [
    allDestinations,
    trendingPackages,
    budgetPackages,
    couplePackages,
    pilgrimPackages,
  ] = await Promise.all([
    getDestinations(),
    getTrendingPackages(),
    getBudgetPackages(),
    getPackagesByType("Couple"),
    getPilgrimPackages(),
  ]);

  return (
    <>
      {/* ── 1. Hero (video + search) ──────────────────────────── */}
      <HeroV2 />

      {/* ── 2. Trust row ─────────────────────────────────────── */}
      <TrustRow />

      {/* ── 3a. Mostly Experienced (Trending) — destination tags ── */}
      {trendingPackages.length > 0 && (
        <section className="py-16 md:py-20" aria-labelledby="trending-heading">
          <div className="container-custom">
            <TaggedPackageSlider
              id="trending-slider"
              eyebrow="Mostly Experienced"
              heading={`Journeys everyone's <span class="italic text-gradient-passion font-light">talking about.</span>`}
              tags={DEST_TAGS}
              packages={trendingPackages}
              tagAccent="ember"
            />
          </div>
        </section>
      )}

      {/* ── 3b. Based on Budget — budget tags ─────────────────── */}
      {budgetPackages.length > 0 && (
        <section className="py-16 md:py-20 bg-sand/20" aria-labelledby="budget-heading">
          <div className="container-custom">
            <TaggedPackageSlider
              id="budget-slider"
              eyebrow="Based on budget"
              heading={`Trips that fit <span class="italic text-gradient-passion font-light">every wallet.</span>`}
              tags={BUDGET_TAGS}
              packages={budgetPackages}
              tagAccent="gold"
            />
          </div>
        </section>
      )}

      {/* ── 3c. Based on Experience — experience tags ─────────── */}
      {couplePackages.length > 0 && (
        <section className="py-16 md:py-20" aria-labelledby="exp-heading">
          <div className="container-custom">
            <TaggedPackageSlider
              id="experience-slider"
              eyebrow="Based on experience"
              heading={`Curated by <span class="italic text-gradient-passion font-light">how you travel.</span>`}
              tags={EXPERIENCE_TAGS}
              packages={couplePackages}
              tagAccent="crimson"
            />
          </div>
        </section>
      )}

      {/* ── 4. Destinations 3 × 3 ────────────────────────────── */}
      <DestinationsGrid3x3 destinations={allDestinations} />

      {/* ── 5. Experiences 3 × 3 (vector / icon-only) ────────── */}
      <ExperienceVectorGrid />

      {/* ── 6. How it works (3 steps) ────────────────────────── */}
      <HowItWorks />

      {/* ── 7. Pilgrim trips ─────────────────────────────────── */}
      {pilgrimPackages.length > 0 && (
        <section className="py-20 md:py-28" aria-labelledby="pilgrim-heading">
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-10 md:mb-14">
              <div>
                <span className="eyebrow" style={{ color: "#92400e" }}>Sacred Journeys</span>
                <h2 id="pilgrim-heading" className="heading-section mt-2 max-w-sm text-balance">
                  Char Dham, Kedarnath &
                  <span className="italic font-light" style={{ color: "#b45309" }}> Devbhumi yatras.</span>
                </h2>
                <p className="mt-3 text-sm text-ink/55 max-w-md leading-relaxed">
                  Fully arranged pilgrimages by road or helicopter — registration, transfers, and stay included.
                </p>
              </div>
              <Link
                href="/destinations/uttarakhand"
                className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-ink/65 hover:text-gold transition-colors group shrink-0"
              >
                All yatra packages
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {pilgrimPackages.map((pkg) => (
                <Link
                  key={pkg.slug}
                  href={`/packages/${pkg.slug}`}
                  className="group bg-amber-50/60 border border-amber-100 hover:border-amber-300 hover:bg-white rounded-2xl p-5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-display text-base font-medium leading-snug text-ink group-hover:text-amber-900 transition-colors flex-1">
                      {pkg.title}
                    </h3>
                    <span className="shrink-0 text-[11px] font-semibold text-amber-700 bg-white border border-amber-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                      {pkg.duration}
                    </span>
                  </div>
                  <p className="text-xs text-ink/50 leading-relaxed line-clamp-2 mb-4">{pkg.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-amber-100">
                    <p className="text-sm font-semibold text-amber-800">
                      ₹{pkg.price.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-ink/40 ml-1">/ person</span>
                    </p>
                    <span className="text-xs text-ink/40 group-hover:text-amber-700 inline-flex items-center gap-1 transition-colors">
                      View <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. Offers ─────────────────────────────────────────── */}
      <HomepageOffersSection />

      {/* ── 9. Reviews (Google) ──────────────────────────────── */}
      <GoogleReviewsSection />

      {/* ── 10. Final CTA ────────────────────────────────────── */}
      <FinalCTA />
    </>
  );
}
