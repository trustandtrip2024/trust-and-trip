import { Metadata } from "next";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description: "Trust and Trip's cancellation fees, refund timelines and policy for hotels, activities, visas and transfers.",
  alternates: { canonical: "https://trustandtrip.com/cancellation-policy" },
};

const cancellationSchedule = [
  { timeline: "At the time of booking", fee: "25% of total package cost or supplier fees, whichever is higher" },
  { timeline: "45+ days before travel", fee: "50% of total package cost or supplier fees, whichever is higher" },
  { timeline: "30 – 44 days before travel", fee: "75% of total package cost or supplier fees, whichever is higher" },
  { timeline: "Less than 20 days before travel", fee: "100% of total package cost (no refund)" },
];

export default function CancellationPolicyPage() {
  return (
    <>
      <section className="pt-28 md:pt-36 pb-12 bg-cream">
        <div className="container-custom max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gold/20 text-gold flex items-center justify-center">
              <RotateCcw className="h-5 w-5" />
            </div>
            <span className="eyebrow">Legal</span>
          </div>
          <h1 className="font-display text-display-md font-medium leading-[1.05] text-balance">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="mt-4 text-ink/60">
            Trust and Trip Experiences Pvt. Ltd. · Last updated 01 September 2024
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-custom max-w-3xl space-y-10">

          {/* Overview */}
          <div>
            <h2 className="font-display text-2xl font-medium text-ink mb-4 pb-3 border-b border-ink/8">
              Overview
            </h2>
            <p className="text-ink/75 leading-relaxed">
              Customers eligible for refunds will receive the refund amount within{" "}
              <strong>90 working days</strong> from the date of cancellation or supplier processing,
              whichever occurs later. Exchange rates may affect refund amounts based on international
              rates and supplier reimbursements.
            </p>
          </div>

          {/* Cancellation Fee Schedule */}
          <div>
            <h2 className="font-display text-2xl font-medium text-ink mb-4 pb-3 border-b border-ink/8">
              Cancellation Fee Schedule
            </h2>
            <div className="bg-white rounded-2xl border border-ink/8 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ink text-cream">
                    <th className="text-left px-5 py-4 font-medium text-[11px] uppercase tracking-wider">
                      When You Cancel
                    </th>
                    <th className="text-left px-5 py-4 font-medium text-[11px] uppercase tracking-wider">
                      Cancellation Fee
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cancellationSchedule.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-cream/50" : "bg-white"}>
                      <td className="px-5 py-4 font-medium text-ink">{row.timeline}</td>
                      <td className="px-5 py-4 text-ink/70">{row.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink/50">
              All cancellation charges are non-refundable and non-transferable.
            </p>
          </div>

          {/* Hotels */}
          <PolicySection title="Hotels">
            <ul>
              <li><strong>Non-refundable properties:</strong> No reimbursement is provided once booked.</li>
              <li><strong>Refundable hotels:</strong> Processed per the itinerary terms, subject to exchange rate variations.</li>
              <li>Trust and Trip is not responsible for changes in hotel quality, staff behaviour, or cleanliness after booking.</li>
              <li>Early check-in and late check-out depend on hotel availability and discretion — no refunds are provided if these are denied.</li>
              <li>Room upgrades purchased directly at the hotel are charged to the guest and are not reimbursable.</li>
            </ul>
          </PolicySection>

          {/* Activities */}
          <PolicySection title="Activities & Experiences">
            <ul>
              <li><strong>Non-refundable activities:</strong> No reimbursement once booked.</li>
              <li><strong>Refundable activities:</strong> Processed per the cancellation policy stated in your itinerary, subject to exchange fluctuations.</li>
            </ul>
          </PolicySection>

          {/* Transfers */}
          <PolicySection title="Transfers">
            <p>
              Transfer cancellations are processed per your itinerary terms with potential exchange
              rate variations affecting any refund amounts.
            </p>
          </PolicySection>

          {/* Visa & Insurance */}
          <PolicySection title="Visa & Insurance">
            <ul>
              <li><strong>Insurance policies,</strong> once applied, are non-refundable and subject to a 100% cancellation fee. Claims must be directed to the respective insurance company.</li>
              <li><strong>Visa fees</strong> are non-refundable in the event of rejection by the issuing embassy or consulate. Trust and Trip will assist with the application process but cannot guarantee visa approval.</li>
            </ul>
          </PolicySection>

          {/* Force Majeure */}
          <PolicySection title="Force Majeure & Exceptional Circumstances">
            <p>
              In the event of natural disasters, pandemics, political unrest, or other force majeure
              situations, Trust and Trip will make its best effort to provide alternatives or refunds
              in coordination with our suppliers. However, TTEPL cannot guarantee refunds from
              third-party providers in such circumstances.
            </p>
          </PolicySection>

          {/* How to Cancel */}
          <div className="bg-ink text-cream rounded-3xl p-8">
            <h2 className="font-display text-2xl font-medium mb-4">How to Request a Cancellation</h2>
            <ol className="space-y-3 text-cream/80 text-sm leading-relaxed list-decimal pl-5">
              <li>Email <a href="mailto:support@trustandtrip.com" className="text-gold hover:underline">support@trustandtrip.com</a> with your booking reference and reason for cancellation.</li>
              <li>Our team will confirm receipt within 24 hours and initiate the cancellation with all suppliers.</li>
              <li>You will receive a final cancellation summary with the applicable fees and refund amount (if any) within 3–5 working days.</li>
              <li>Approved refunds are processed within 90 working days of supplier confirmation.</li>
            </ol>
            <p className="mt-6 text-sm text-cream/60">
              You can also call us at{" "}
              <a href="tel:+918115999588" className="text-gold">+91 8115 999 588</a> during
              office hours (8 AM – 10 PM, Tuesday closed).
            </p>
          </div>

          <div className="text-sm text-ink/50 leading-relaxed">
            <p>
              This policy is subject to change. For the most current version, visit{" "}
              <Link href="/cancellation-policy" className="text-gold hover:underline">
                trustandtrip.com/cancellation-policy
              </Link>
              . For disputes, see our{" "}
              <Link href="/terms-and-conditions" className="text-gold hover:underline">
                Terms &amp; Conditions
              </Link>
              .
            </p>
          </div>

        </div>
      </section>
    </>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-medium text-ink mb-4 pb-3 border-b border-ink/8">
        {title}
      </h2>
      <div className="space-y-4 text-ink/75 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:leading-relaxed">
        {children}
      </div>
    </div>
  );
}
