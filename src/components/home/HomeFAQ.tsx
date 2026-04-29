import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

interface QA { q: string; a: string }

const FAQ: QA[] = [
  {
    q: "How is Trust and Trip different from MakeMyTrip or Yatra?",
    a: "We're not a marketplace. A real planner reads your form and builds the itinerary by hand in 24 hours — you talk to one named human start to finish, not a queue. Aggregators sell shelf packages and pass you to whichever supplier replies first; we own the planning and stay with you on WhatsApp through return.",
  },
  {
    q: "Do I have to pay anything to get an itinerary?",
    a: "No. Sharing your trip details and getting the first itinerary is free. You only pay a 30% deposit (min ₹5,000) once you've reviewed the plan and want to lock the booking. Card or UPI via Razorpay; receipt emailed instantly.",
  },
  {
    q: "Can the itinerary be customised?",
    a: "Yes — every itinerary is custom by default. Tell us your dates, group size, food preferences, mobility needs, prayer times, anniversary, anything. We'll build around it. You can request unlimited revisions before paying the deposit.",
  },
  {
    q: "How quickly will I get a reply?",
    a: "First reply within 24 hours, usually faster on weekdays. If you message us on WhatsApp at +91 8115 9995 88, you'll hear back the same day during business hours (10 AM – 8 PM IST).",
  },
  {
    q: "What's included in your packages?",
    a: "Hotels, all internal transfers, daily breakfasts at minimum, sightseeing as per the itinerary, and 24×7 on-trip support. Flights are optional — we quote both inclusive and excluding-flight versions so you can compare with what you find on aggregators.",
  },
  {
    q: "Do you handle visas?",
    a: "Yes, for international trips we handle the full visa application — documents, appointments, courier. There's a small visa-handling fee on top of government charges, transparently disclosed before you pay.",
  },
  {
    q: "What if my plans change after booking?",
    a: "Changes up to 21 days before travel are free (we just re-confirm hotels). Within 21 days, third-party cancellation rules apply — typically 25–100% of the deposit depending on how close to the date. We'll tell you exact penalties before you change anything.",
  },
  {
    q: "Are your reviews real?",
    a: "Yes. The reviews on this page are pulled live from Google (where we're rated 4.9 by 8,000+ travelers) and from verified bookings in our system. Every review you see is tied to a real trip we ran.",
  },
];

export default function HomeFAQ() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" aria-labelledby="faq-title" className="py-16 md:py-24 bg-tat-paper dark:bg-tat-charcoal">
      <div className="container-custom max-w-4xl">
        <SectionHeader
          eyebrow="Questions, answered"
          title="Things travelers ask us"
          italicTail="before they book."
          lede="No fine print, no upsell scripts. If something isn't here, ask on WhatsApp — we'll add it."
          align="center"
        />

        <ul className="mt-10 divide-y divide-tat-charcoal/10 dark:divide-white/10 border-y border-tat-charcoal/10 dark:border-white/10">
          {FAQ.map((f, i) => (
            <li key={i}>
              <details className="group py-5 [&_summary]:list-none">
                <summary className="flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm">
                  <h3 className="font-display font-medium text-[18px] md:text-[20px] text-tat-charcoal dark:text-tat-paper text-balance">
                    {f.q}
                  </h3>
                  <ChevronDown className="h-5 w-5 shrink-0 text-tat-gold transition-transform duration-200 group-open:rotate-180" aria-hidden />
                </summary>
                <p className="mt-3 pr-8 text-body text-tat-slate dark:text-tat-paper/75 leading-relaxed">
                  {f.a}
                </p>
              </details>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <p className="text-body-sm text-tat-slate dark:text-tat-paper/70">
            Still have questions?
          </p>
          <Link
            href="https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip%20%E2%80%94%20I%20have%20a%20question."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-body-sm font-semibold text-tat-gold dark:text-tat-gold hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-orange focus-visible:ring-offset-2 rounded-sm"
          >
            Ask a planner on WhatsApp
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
