import Link from "next/link";

// All links here resolve to a real route. Slugs that don't have a dedicated
// Sanity destination (e.g. Mauritius, Seychelles, Bhutan) fall through to
// /packages with a destination query so the listing page renders something
// useful instead of 404. /reviews resolves via a thin alias page.
const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Trending Destinations",
    links: [
      { label: "Bali",        href: "/destinations/bali" },
      { label: "Maldives",    href: "/destinations/maldives" },
      { label: "Switzerland", href: "/destinations/switzerland" },
      { label: "Japan",       href: "/destinations/japan" },
      { label: "Singapore",   href: "/destinations/singapore" },
      { label: "Thailand",    href: "/destinations/thailand" },
      { label: "Sri Lanka",   href: "/destinations/sri-lanka" },
      { label: "Vietnam",     href: "/packages?destination=vietnam" },
    ],
  },
  {
    title: "Visa-Free for Indians",
    links: [
      { label: "Maldives",            href: "/destinations/maldives" },
      { label: "Thailand",            href: "/destinations/thailand" },
      { label: "Sri Lanka",           href: "/destinations/sri-lanka" },
      { label: "Indonesia (Bali)",    href: "/destinations/bali" },
      { label: "Mauritius",           href: "/packages?destination=mauritius" },
      { label: "Seychelles",          href: "/packages?destination=seychelles" },
      { label: "Malaysia",            href: "/packages?destination=malaysia" },
      { label: "Bhutan",              href: "/packages?destination=bhutan" },
    ],
  },
  {
    title: "Yatras & Pilgrim Journeys",
    links: [
      { label: "Char Dham Helicopter", href: "/packages?destination=uttarakhand&travelType=Pilgrim&type=helicopter" },
      { label: "Char Dham Road",       href: "/packages?destination=uttarakhand&travelType=Pilgrim&type=road" },
      { label: "Kedarnath",            href: "/packages?destination=uttarakhand&q=kedarnath" },
      { label: "Do Dham",              href: "/packages?destination=uttarakhand&q=dodham" },
      { label: "Badrinath–Kedarnath",  href: "/packages?destination=uttarakhand&q=badrinath" },
      { label: "Yamunotri & Gangotri", href: "/destinations/uttarakhand" },
      { label: "Devbhumi Uttarakhand", href: "/destinations/uttarakhand" },
    ],
  },
  {
    title: "Themed Journeys",
    links: [
      { label: "Honeymoon",         href: "/experiences/honeymoon" },
      { label: "Family",            href: "/experiences/family" },
      { label: "Solo",              href: "/experiences/solo" },
      { label: "Group",             href: "/experiences/group" },
      { label: "Adventure",         href: "/experiences/adventure" },
      { label: "Wellness",          href: "/experiences/wellness" },
      { label: "Luxury",            href: "/experiences/luxury" },
      { label: "Weekend Getaways",  href: "/packages?duration=3-5" },
    ],
  },
  {
    title: "Packages by Duration",
    links: [
      { label: "3–5 day",       href: "/packages?duration=3-5" },
      { label: "6–9 day",       href: "/packages?duration=6-9" },
      { label: "10+ day",       href: "/packages?duration=10-plus" },
      { label: "Long weekend",  href: "/packages?duration=3-5" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Trust and Trip", href: "/about" },
      { label: "Our story",            href: "/about" },
      { label: "Reviews",              href: "/reviews" },
      { label: "Press",                href: "/about" },
      { label: "Careers",              href: "/about" },
      { label: "Contact",              href: "/contact" },
    ],
  },
  {
    title: "Talk to us",
    links: [
      { label: "WhatsApp +91 8115 999 588", href: "https://wa.me/918115999588" },
      { label: "Mon–Sun 9am–10pm IST",      href: "/contact" },
      { label: "plan@trustandtrip.com",     href: "mailto:plan@trustandtrip.com" },
    ],
  },
];

export default function SeoFooterIndex() {
  return (
    <section
      aria-labelledby="seo-footer-title"
      className="py-18 md:py-22 border-t border-tat-charcoal/12"
    >
      <div className="container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl">
        <h2 id="seo-footer-title" className="sr-only">Site index</h2>
        <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-8">
          {COLUMNS.map((col) => (
            <li key={col.title}>
              <h3 className="text-body-sm font-semibold text-tat-charcoal font-sans">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-meta text-tat-slate hover:text-tat-charcoal hover:underline underline-offset-4 transition duration-120"
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
