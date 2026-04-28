/**
 * Plain-language "what is this site" band rendered just below the hero.
 *
 * Exists primarily to satisfy Google's OAuth-consent-screen verification
 * reviewers, who require the home page to contain visible text that clearly
 * explains what the application does and which matches the OAuth client's
 * App Name. Also good for SEO and first-time visitors.
 *
 * Keep this section: a) visible (not hidden via display:none), b) plain
 * English, c) using the exact brand name "Trust and Trip", d) listing the
 * concrete services offered. Don't move it below the fold.
 */
export default function HomeAboutBlurb() {
  return (
    <section
      aria-labelledby="about-trust-and-trip"
      className="bg-tat-paper border-y border-tat-charcoal/8"
    >
      <div className="container-custom py-10 md:py-14">
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow mb-3">About Trust and Trip</p>
          <h2
            id="about-trust-and-trip"
            className="font-display text-2xl md:text-3xl font-medium text-tat-charcoal text-balance"
          >
            Trust and Trip is a custom travel-planning service that designs
            personalised holiday itineraries with a real human planner.
          </h2>
          <p className="mt-4 text-tat-charcoal/70 leading-relaxed text-base md:text-lg">
            We help travellers plan and book honeymoons, family vacations,
            group tours, solo trips and pilgrim journeys across 60+
            destinations in India and abroad — including Bali, the Maldives,
            Switzerland, Thailand, Kerala, Rajasthan, Ladakh, Uttarakhand and
            Char Dham. Tell us what you want, a planner builds your itinerary
            within 24 hours, and you only pay once you&apos;re sure.
          </p>
        </div>
      </div>
    </section>
  );
}
