import { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms and conditions governing your use of Trust and Trip services.",
  alternates: { canonical: "https://trustandtrip.com/terms-and-conditions" },
};

export default function TermsPage() {
  return (
    <>
      <section className="pt-28 md:pt-36 pb-12 bg-tat-paper">
        <div className="container-custom max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-tat-gold/20 text-tat-gold flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <span className="eyebrow">Legal</span>
          </div>
          <h1 className="font-display text-display-md font-medium leading-[1.05] text-balance">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-tat-charcoal/60">
            Trust and Trip Experiences Pvt. Ltd. (TTEPL) · Last updated 01 September 2024
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-custom max-w-3xl">
          <div className="space-y-10 text-tat-charcoal/80">

            <PolicySection title="Applicability of This Agreement">
              <p>
                This User Agreement outlines the terms and conditions for{" "}
                <strong>Trust and Trip Experiences Pvt. Ltd.</strong> ("TTEPL" or "the Company") to
                provide travel-related services to any person ("the User") who purchases or enquires
                about products/services from TTEPL through its website, offices, call centres, or
                any other customer channels.
              </p>
            </PolicySection>

            <PolicySection title="User's Acknowledgment">
              <p>
                By availing services from TTEPL, the User acknowledges that they have read,
                understood, and expressly agreed to the terms and conditions of this agreement.
                All rights and responsibilities of the User and TTEPL are limited to the scope
                of this agreement.
              </p>
              <p>
                TTEPL reserves the right to terminate or suspend access to its services at any
                time, without prior notice, for maintenance or any other reason deemed necessary.
              </p>
            </PolicySection>

            <PolicySection title="Third-Party Services">
              <p>
                Some terms of service may apply specifically to certain services (air tickets,
                holiday packages, etc.) provided by TTEPL. These will be provided at the time
                of booking. In the event of a conflict, the terms of this Agreement shall prevail.
              </p>
              <p>
                The User is responsible for complying with all terms and guidelines of third-party
                service providers (airlines, hotels, car rentals) associated with their travel.
              </p>
            </PolicySection>

            <PolicySection title="User Information and Responsibility">
              <p>
                The User must provide accurate, complete, and current information during the booking
                process. The User is responsible for maintaining the confidentiality of their
                account details including the password.
              </p>
              <p>
                In case of unauthorized use, the User must notify TTEPL immediately. TTEPL will not
                be liable for any losses incurred by the User due to unauthorized use of the account.
              </p>
            </PolicySection>

            <PolicySection title="Insurance">
              <p>
                Unless explicitly mentioned, travel insurance is not included in any package offered
                by TTEPL. It is the User&apos;s responsibility to purchase sufficient insurance coverage
                independently.
              </p>
              <p>
                If insurance is provided as part of a service, claims should be directed to the
                respective insurance company.
              </p>
            </PolicySection>

            <PolicySection title="Force Majeure">
              <p>
                The User agrees that exceptional circumstances — including weather conditions, labour
                unrest, insolvency, civil unrest, pandemics, or government regulations — may affect
                travel services. TTEPL will make its best effort to provide alternative services or
                refunds depending on the cooperation of service providers.
              </p>
              <p>
                TTEPL shall not be held liable for any losses or delays caused by such circumstances.
                TTEPL&apos;s liability in such situations is limited to the refund of the total amount
                paid by the User, minus any cancellation charges.
              </p>
            </PolicySection>

            <PolicySection title="Refund Policy">
              <p>
                Refunds for cancellations will be processed based on the specific terms of the
                service providers (hotels, airlines) involved in the booking. TTEPL will only
                refund the amount it receives from these providers, minus applicable service charges.
              </p>
              <p>
                Please refer to our{" "}
                <a href="/cancellation-policy" className="text-tat-gold hover:underline">
                  Cancellation Policy
                </a>{" "}
                for full details on the cancellation fee schedule.
              </p>
            </PolicySection>

            <PolicySection title="Liability Limitations">
              <p>
                TTEPL shall not be held liable for any direct, indirect, punitive, or consequential
                damages arising from the use of its website or services. In no case shall TTEPL&apos;s
                liability exceed the total amount paid by the User for the services booked.
              </p>
              <p>
                TTEPL is not responsible for any errors, omissions, or delays in the services
                provided by third-party suppliers.
              </p>
            </PolicySection>

            <PolicySection title="User Consent for Promotional Activities">
              <p>
                The User agrees that TTEPL may use photos, videos, or other media shared by the
                User during or after their trip for promotional purposes on social media or other
                platforms, unless the User explicitly requests otherwise via email to{" "}
                <a href="mailto:support@trustandtrip.com" className="text-tat-gold hover:underline">
                  support@trustandtrip.com
                </a>
                .
              </p>
            </PolicySection>

            <PolicySection title="Jurisdiction">
              <p>
                This agreement is governed by the laws of India. Any disputes shall be subject to
                the exclusive jurisdiction of the courts in{" "}
                <strong>Gautambuddh Nagar, Uttar Pradesh</strong>.
              </p>
            </PolicySection>

            <PolicySection title="Modification of Terms">
              <p>
                TTEPL reserves the right to modify these terms and conditions at any time. Users
                are advised to review these terms periodically. Continued use of our services
                after changes constitutes acceptance of the updated terms.
              </p>
            </PolicySection>

            <PolicySection title="Contact">
              <p>
                For any concerns or disputes, please contact{" "}
                <a href="mailto:support@trustandtrip.com" className="text-tat-gold hover:underline">
                  support@trustandtrip.com
                </a>
                . TTEPL will make every effort to resolve the issue promptly.
              </p>
              <p className="text-sm text-tat-charcoal/50 mt-2">
                Trust and Trip Experiences Pvt. Ltd. · R-607, Amrapali Princely, Noida Sector 71,
                Gautambuddh Nagar 201301 · +91 8115 999 588
              </p>
            </PolicySection>

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
      <h2 className="font-display text-h2 font-medium text-tat-charcoal mb-4 pb-3 border-b border-tat-charcoal/8">
        {title}
      </h2>
      <div className="space-y-4 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
