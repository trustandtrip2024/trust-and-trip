import Link from "next/link";
import { Cloud, Bus, Plane, FileText, Stethoscope, Banknote } from "lucide-react";

interface Props {
  destinationName: string;
}

/**
 * "Need to know" grid — weather link, transport, documents required and
 * payment options. Replaces the Veena-style flat-list version with a
 * card-grid that's easier to scan on mobile.
 */
export default function NeedToKnowGrid({ destinationName }: Props) {
  const items = [
    {
      icon: Cloud,
      title: "Weather",
      body: (
        <>
          For up-to-date weather, check{" "}
          <a
            href={`https://www.accuweather.com/en/search-locations?query=${encodeURIComponent(destinationName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-tat-burnt dark:text-tat-gold underline underline-offset-2 hover:no-underline"
          >
            AccuWeather
          </a>{" "}
          or your preferred forecasting service before you pack.
        </>
      ),
    },
    {
      icon: Plane,
      title: "Air travel",
      body: (
        <>
          We typically book Air India or IndiGo on Indian sectors and a
          star-alliance carrier internationally. Specific airline confirmed
          15 days before departure.
        </>
      ),
    },
    {
      icon: Bus,
      title: "Coach travel",
      body: (
        <>
          AC vehicles sized for your group: sedan / SUV up to 4 pax, tempo
          traveller for 5–12, mini bus or 35-seater for larger groups.
        </>
      ),
    },
    {
      icon: FileText,
      title: "Documents required",
      body: (
        <ul className="mt-1 list-disc pl-4 space-y-0.5">
          <li>Adult: Voter ID / Passport / Aadhaar / DL</li>
          <li>Child: Passport / Aadhaar / School ID</li>
          <li>Infant: Aadhaar / Birth certificate</li>
          <li>NRIs &amp; foreign nationals: Passport + valid Indian visa</li>
        </ul>
      ),
    },
    {
      icon: Stethoscope,
      title: "Health &amp; insurance",
      body: (
        <>
          Travel insurance is strongly recommended. Carry routine medicines.
          Consult your doctor for high-altitude segments (Ladakh, Spiti,
          Char Dham).
        </>
      ),
    },
    {
      icon: Banknote,
      title: "Payments",
      body: (
        <>
          Cheque, DD, debit / credit card, NEFT / RTGS / IMPS. Card payments
          carry an additional 1.8% gateway fee. Cheques in favour of{" "}
          <em>Trust and Trip Experiences Pvt. Ltd.</em>
        </>
      ),
    },
  ];

  return (
    <div className="rounded-3xl border border-tat-charcoal/8 dark:border-white/10 bg-white dark:bg-white/5 shadow-soft p-5 md:p-7">
      <p className="tt-eyebrow !text-tat-burnt dark:!text-tat-gold mb-1.5">Need to know</p>
      <p className="font-display text-[20px] md:text-[22px] font-medium text-tat-charcoal dark:text-tat-paper leading-tight">
        Things to consider before the trip.
      </p>
      <ul className="mt-5 grid sm:grid-cols-2 gap-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li
              key={it.title}
              className="flex gap-3 rounded-2xl border border-tat-charcoal/6 dark:border-white/8 bg-tat-cream-warm/30 dark:bg-white/[0.04] p-4"
            >
              <span className="grid place-items-center h-9 w-9 rounded-xl bg-tat-burnt/10 dark:bg-tat-gold/15 text-tat-burnt dark:text-tat-gold shrink-0">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p
                  className="font-medium text-[14px] text-tat-charcoal dark:text-tat-paper"
                  // Allow inline HTML entity in title (Health &amp;...).
                  dangerouslySetInnerHTML={{ __html: it.title }}
                />
                <div className="mt-1 text-[13px] text-tat-charcoal/70 dark:text-tat-paper/75 leading-relaxed">
                  {it.body}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-[12px] text-tat-charcoal/55 dark:text-tat-paper/60 italic">
        Standard hotel check-in is 1.30 PM and check-out 10 AM. For
        questions specific to your booking,{" "}
        <Link href="/contact" className="text-tat-burnt dark:text-tat-gold underline underline-offset-2 hover:no-underline">
          message your planner
        </Link>
        .
      </p>
    </div>
  );
}
