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
      <div className="container-custom py-8 md:py-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow mb-2">About Trust and Trip</p>
          <h2
            id="about-trust-and-trip"
            className="font-display text-xl md:text-2xl font-medium text-tat-charcoal text-balance"
          >
            A custom travel-planning service that designs personalised
            itineraries with a real human planner — across 60+ destinations
            in India and abroad.
          </h2>
        </div>
      </div>
    </section>
  );
}
