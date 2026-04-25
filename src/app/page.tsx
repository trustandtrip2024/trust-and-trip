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
const SacredJourneys = dynamic(() => import("@/components/homepage-v2/SacredJourneys"));

import {
  getDestinations,
  getTrendingPackages,
  getBudgetPackages,
  getPackagesByType,
} from "@/lib/sanity-queries";

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
  ] = await Promise.all([
    getDestinations(),
    getTrendingPackages(),
    getBudgetPackages(),
    getPackagesByType("Couple"),
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

      {/* ── 7. Sacred Journeys (Char Dham + Kedarnath yatras) ── */}
      <SacredJourneys />

      {/* ── 8. Offers ─────────────────────────────────────────── */}
      <HomepageOffersSection />

      {/* ── 9. Reviews (Google) ──────────────────────────────── */}
      <GoogleReviewsSection />

      {/* ── 10. Final CTA ────────────────────────────────────── */}
      <FinalCTA />
    </>
  );
}
