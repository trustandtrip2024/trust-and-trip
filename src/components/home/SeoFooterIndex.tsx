import Link from "next/link";

// All links here resolve to a real SEO landing route — either a long-tail
// page from src/app/[...seo]/page.tsx, a /destinations/<slug>(/<travelType>)
// alias, or an /experiences/<slug> page. Don't add new entries without
// confirming the underlying route exists.
const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Trending Destinations",
    links: [
      { label: "Bali",        href: "/destinations/bali" },
      { label: "Maldives",    href: "/destinations/maldives" },
      { label: "Switzerland", href: "/destinations/switzerland" },
      { label: "Thailand",    href: "/destinations/thailand" },
      { label: "Singapore",   href: "/destinations/singapore" },
      { label: "Dubai",       href: "/destinations/dubai" },
      { label: "Vietnam",     href: "/vietnam-tour-packages-from-india" },
      { label: "Sri Lanka",   href: "/destinations/sri-lanka" },
    ],
  },
  {
    title: "Honeymoon Specials",
    links: [
      { label: "Bali Honeymoon",         href: "/honeymoon-packages-bali" },
      { label: "Maldives Honeymoon",     href: "/honeymoon-packages-maldives" },
      { label: "Thailand Honeymoon",     href: "/honeymoon-packages-thailand" },
      { label: "Switzerland Honeymoon",  href: "/destinations/switzerland/honeymoon" },
      { label: "Santorini Honeymoon",    href: "/destinations/santorini/honeymoon" },
      { label: "Ha Long Bay Cruise",     href: "/ha-long-bay-tour-package" },
      { label: "All Honeymoon trips",    href: "/experiences/honeymoon" },
    ],
  },
  {
    title: "Family & Group",
    links: [
      { label: "Kerala Family",      href: "/family-tour-packages-kerala" },
      { label: "Dubai Family",       href: "/family-tour-packages-dubai" },
      { label: "Bali Family",        href: "/destinations/bali/family" },
      { label: "Singapore Family",   href: "/destinations/singapore/family" },
      { label: "Goa Group Trip",     href: "/group-tour-packages-goa" },
      { label: "Thailand Group",     href: "/destinations/thailand/group" },
      { label: "All Family trips",   href: "/experiences/family" },
      { label: "All Group trips",    href: "/experiences/group" },
    ],
  },
  {
    title: "Yatras & Pilgrim",
    links: [
      { label: "Char Dham Yatra",        href: "/char-dham-yatra-package" },
      { label: "Kedarnath Yatra",        href: "/kedarnath-yatra-package" },
      { label: "Kedarnath Helicopter",   href: "/kedarnath-helicopter-package" },
      { label: "Devbhumi Uttarakhand",   href: "/destinations/uttarakhand" },
      { label: "All Pilgrim journeys",   href: "/experiences/pilgrim" },
    ],
  },
  {
    title: "Adventure & Solo",
    links: [
      { label: "Spiti Valley Tour",     href: "/spiti-valley-tour-packages" },
      { label: "Spiti Bike Trip",       href: "/spiti-valley-bike-trip" },
      { label: "Zanskar Valley",        href: "/zanskar-valley-tour-packages" },
      { label: "Chadar Trek",           href: "/chadar-trek-package" },
      { label: "Manali Solo",           href: "/solo-trip-packages-manali" },
      { label: "Bali Solo",             href: "/destinations/bali/solo" },
      { label: "All Adventure trips",   href: "/experiences/adventure" },
      { label: "All Solo trips",        href: "/experiences/solo" },
    ],
  },
  {
    title: "By Style & Budget",
    links: [
      { label: "Luxury",                  href: "/experiences/luxury" },
      { label: "Wellness",                href: "/experiences/wellness" },
      { label: "Cultural",                href: "/experiences/cultural" },
      { label: "Weekend Getaways",       href: "/experiences/weekend" },
      { label: "Budget International",   href: "/budget-international-packages" },
      { label: "3–5 day trips",          href: "/packages?duration=3-5" },
      { label: "6–9 day trips",          href: "/packages?duration=6-9" },
      { label: "10+ day trips",          href: "/packages?duration=10-plus" },
    ],
  },
  {
    title: "About · Talk to us",
    links: [
      { label: "About Trust and Trip",     href: "/about" },
      { label: "Reviews",                  href: "/reviews" },
      { label: "Blog & Journal",           href: "/blog" },
      { label: "Customize a trip",         href: "/customize-trip" },
      { label: "Offers & deals",           href: "/offers" },
      { label: "Contact",                  href: "/contact" },
      { label: "WhatsApp +91 8115 999 588", href: "https://wa.me/918115999588" },
      { label: "plan@trustandtrip.com",    href: "mailto:plan@trustandtrip.com" },
    ],
  },
];

export default function SeoFooterIndex() {
  return (
    <section
      aria-labelledby="seo-footer-title"
      className="py-18 md:py-22 border-t border-tat-charcoal/12 dark:border-white/10"
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <h2 id="seo-footer-title" className="sr-only">Site index</h2>
        <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-8">
          {COLUMNS.map((col) => (
            <li key={col.title}>
              <h3 className="text-body-sm font-semibold text-tat-charcoal dark:text-white font-sans">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-meta text-tat-slate dark:text-white/65 hover:text-tat-charcoal dark:hover:text-white hover:underline underline-offset-4 transition duration-120"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
