import Image from "next/image";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import JsonLd from "@/components/JsonLd";
import { getPackageBySlug } from "@/lib/sanity-queries";
import { Compass, PenTool, Send, ThumbsUp, Clock, IndianRupee, X } from "lucide-react";

export const metadata = {
  title: "Customize a Trip — Trust and Trip",
  description: "Tell us where your heart wants to go. We'll design a trip that feels entirely yours.",
  alternates: { canonical: "https://trustandtrip.com/customize-trip" },
};

const steps = [
  {
    icon: PenTool,
    title: "Share your dreams",
    description: "Fill the form. Voice-note us. WhatsApp a Pinterest board. Whatever works for you.",
  },
  {
    icon: Compass,
    title: "We craft your itinerary",
    description: "Within 24 hours, a planner returns with a hand-built proposal. We refine until it's yours.",
  },
  {
    icon: ThumbsUp,
    title: "You approve",
    description: "Love it as-is or tweak hotels, activities, pace. No pressure, no obligation.",
  },
  {
    icon: Send,
    title: "We take over",
    description: "Bookings, confirmations, transfers, 24/7 support. You pack. We handle the rest.",
  },
];

interface Props {
  searchParams?: { package?: string; destination?: string };
}

function prettifyDestSlug(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export default async function CustomizeTripPage({ searchParams }: Props) {
  // Pre-fill context from referring page. /packages → adds ?package=slug,
  // /destinations → adds ?destination=slug. We resolve the package title
  // server-side so the context chip says "Customising: <Real Title>" not the
  // raw slug. Sanity miss falls back gracefully to the slug.
  const packageSlug = searchParams?.package?.trim();
  const destSlug = searchParams?.destination?.trim();
  const pkg = packageSlug
    ? await getPackageBySlug(packageSlug).catch(() => null)
    : null;
  const packageContext = pkg?.title;
  const destinationContext = destSlug ? prettifyDestSlug(destSlug) : undefined;

  // Light Service + FAQ JSON-LD so this lead-gen page registers with search
  // engines as a bookable concierge service rather than just a contact form.
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Trust and Trip — Custom Trip Planning",
    serviceType: "Travel itinerary design",
    provider: { "@type": "TravelAgency", name: "Trust and Trip" },
    areaServed: ["India", "Asia", "Europe", "Worldwide"],
    description:
      "A real planner builds a hand-crafted itinerary within 24 hours. Free until you're sure.",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: 0,
      description: "Free proposal — no card required.",
    },
  };

  return (
    <>
      <JsonLd data={serviceLd} />

      <section className="relative pt-28 md:pt-36 pb-12 md:pb-16 bg-tat-paper overflow-hidden">
        <div
          aria-hidden
          className="absolute -right-40 -top-20 w-96 h-96 rounded-full bg-tat-gold/10 blur-3xl"
        />
        <div className="container-custom max-w-5xl relative">
          <span className="eyebrow">Customize your trip</span>
          <h1 className="mt-3 font-display text-display-lg font-medium leading-[1.02] max-w-3xl text-balance">
            A trip so yours,
            <span className="italic text-tat-gold font-light"> nobody else could take it.</span>
          </h1>
          <p className="mt-6 text-tat-charcoal/60 max-w-xl leading-relaxed">
            Skip the templates. Tell us your idea, your budget, your people — and we'll build a
            journey that fits like a favorite jacket.
          </p>

          {/* Pre-fill context chip — visible only when the page was reached
              from a specific package or destination. Reassures the user we
              already know what they're customising and lets them clear it. */}
          {(pkg || destinationContext) && (
            <div className="mt-7 inline-flex items-center gap-3 bg-white rounded-2xl ring-1 ring-tat-charcoal/8 px-4 py-3 max-w-full">
              {pkg?.image && (
                <span className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 bg-tat-cream">
                  <Image src={pkg.image} alt="" fill sizes="48px" className="object-cover" />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-tat-orange font-semibold">
                  Customising
                </p>
                <p className="font-medium text-tat-charcoal truncate text-sm md:text-base">
                  {pkg?.title ?? `Trip to ${destinationContext}`}
                </p>
                {pkg && (
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-tat-charcoal/55">
                    {pkg.duration && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {pkg.duration}
                      </span>
                    )}
                    {pkg.price > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        from ₹{pkg.price.toLocaleString("en-IN")}/person
                      </span>
                    )}
                  </div>
                )}
              </div>
              <Link
                href="/customize-trip"
                aria-label="Clear pre-filled trip"
                className="ml-auto grid place-items-center h-7 w-7 rounded-full text-tat-charcoal/40 hover:bg-tat-charcoal/5 hover:text-tat-charcoal transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-5 md:gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="bg-tat-paper rounded-3xl p-6 border border-tat-charcoal/5 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-11 w-11 rounded-full bg-tat-gold/20 text-tat-gold flex items-center justify-center">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="font-display text-3xl text-tat-charcoal/10">0{i + 1}</span>
                  </div>
                  <h3 className="font-display text-xl font-medium mb-2">{s.title}</h3>
                  <p className="text-sm text-tat-charcoal/60 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 md:py-16 bg-tat-cream/40">
        <div className="container-custom max-w-4xl">
          <LeadForm
            title={packageContext ? `Customise the ${packageContext} trip` : "Get a free itinerary"}
            subtitle={
              packageContext
                ? "Tell us what you'd like to change — hotels, pace, activities, dates. A real planner replies within 2 hours."
                : "A few details to get us started. Your message opens directly in WhatsApp — a real planner replies within 2 hours."
            }
            source="trip_planner"
            packageContext={packageContext}
            packageSlug={packageSlug}
            destinationContext={destinationContext}
          />
        </div>
      </section>

      {/* Reassurance band */}
      <section className="py-16 bg-tat-charcoal text-tat-paper">
        <div className="container-custom grid md:grid-cols-3 gap-10 text-center md:text-left">
          <div>
            <p className="eyebrow text-tat-gold">No commitment</p>
            <p className="mt-3 font-display text-2xl">
              Proposals are always free. Pay only when you love it.
            </p>
          </div>
          <div>
            <p className="eyebrow text-tat-gold">Always a human</p>
            <p className="mt-3 font-display text-2xl">
              You'll speak to a real planner who remembers your name.
            </p>
          </div>
          <div>
            <p className="eyebrow text-tat-gold">Flexible to the end</p>
            <p className="mt-3 font-display text-2xl">
              Tweak and refine as many times as it takes.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
