import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Trust and Trip collects, uses and protects your personal information.",
  alternates: { canonical: "https://trustandtrip.com/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="pt-28 md:pt-36 pb-12 bg-tat-paper">
        <div className="container-custom max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-tat-gold/20 text-tat-gold flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="eyebrow">Legal</span>
          </div>
          <h1 className="font-display text-display-md font-medium leading-[1.05] text-balance">
            Privacy Policy
          </h1>
          <p className="mt-4 text-tat-charcoal/60">
            Effective from <strong>01 September 2024</strong> · Trust and Trip Experiences Pvt. Ltd.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-custom max-w-3xl">
          <div className="prose max-w-none space-y-10 text-tat-charcoal/80">

            <PolicySection title="Overview">
              <p>
                At Trust and Trip Experiences Pvt. Ltd. ("Trust and Trip", "we", "us"), we prioritize
                user privacy and personal data protection. We do not sell or rent your personal
                information to third parties, and we do not send unsolicited communications.
              </p>
              <p>
                This policy explains how we collect, use, and safeguard personal information through
                our website <strong>trustandtrip.com</strong> and mobile app. We encourage you to
                review this policy periodically.
              </p>
            </PolicySection>

            <PolicySection title="What Personal Information We Collect">
              <p>
                You are not required to provide personal information while simply browsing our site.
                However, when making a purchase or signing up for services, we collect:
              </p>
              <ul>
                <li><strong>Making a Purchase:</strong> Name, email address, phone number, postal address, and payment details. This information is used solely to process your reservation and provide updates on the transaction.</li>
                <li><strong>Member Registration:</strong> Name, email address, phone number, and password — used for identification and completing travel bookings.</li>
                <li><strong>Member Profile:</strong> Travel preferences, billing addresses, and frequent traveller numbers to streamline future bookings.</li>
              </ul>
            </PolicySection>

            <PolicySection title="Mobile App Permissions">
              <p>
                Our mobile app may request access to:
              </p>
              <ul>
                <li><strong>Camera and microphone (iOS only):</strong> To share photos or videos with customer support when necessary.</li>
                <li><strong>GPS location (both platforms):</strong> To suggest relevant travel options. We do not disclose personal or financial information publicly.</li>
              </ul>
            </PolicySection>

            <PolicySection title="Cookies and Session Data">
              <p>
                Cookies are small data files stored on your device when visiting our site. They
                enable personalized experiences by saving preferences and login information.
              </p>
              <p>
                We do not store personally identifiable information (PII) in cookies, and no PII
                is passed on to third parties.
              </p>
            </PolicySection>

            <PolicySection title="Third-Party Data Sharing">
              <p>
                When booking travel services with us, we may share certain information (such as names
                and booking details) with third parties such as airlines, hotels, and tour operators —
                solely for fulfilling your reservation.
              </p>
              <p>
                We do not sell or rent personal information. Anonymized, aggregated data may be
                shared with partners and advertisers without containing any personally identifiable
                information.
              </p>
            </PolicySection>

            <PolicySection title="Promotions and Communications">
              <p>
                Registered members may receive emails or messages about deals and offers. You can
                opt-out at any time by following the unsubscribe link in any email or by updating
                your preferences in your account.
              </p>
            </PolicySection>

            <PolicySection title="Data Security">
              <p>
                All transactions and payments on our site are SSL-encrypted to ensure the security
                of your data. We require strong passwords and multi-factor authentication for
                account access.
              </p>
            </PolicySection>

            <PolicySection title="Your Rights">
              <p>
                You may access, update, or delete your personal data by logging into your account.
                For privacy concerns, contact us at{" "}
                <a href="mailto:support@trustandtrip.com" className="text-tat-gold hover:underline">
                  support@trustandtrip.com
                </a>
                .
              </p>
            </PolicySection>

            <PolicySection title="Policy Updates">
              <p>
                This Privacy Policy is effective as of 01 September 2024. Changes to our data
                handling practices will be reflected in future versions of this policy. We recommend
                checking this page periodically.
              </p>
            </PolicySection>

            <div className="mt-12 p-6 bg-tat-paper rounded-2xl border border-tat-charcoal/8">
              <p className="text-sm text-tat-charcoal/60">
                <strong>Contact:</strong>{" "}
                <a href="mailto:support@trustandtrip.com" className="text-tat-gold hover:underline">
                  support@trustandtrip.com
                </a>{" "}
                · Trust and Trip Experiences Pvt. Ltd., R-607, Amrapali Princely, Noida Sector 71,
                Gautambuddh Nagar 201301
              </p>
            </div>
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
      <h2 className="font-display text-2xl font-medium text-tat-charcoal mb-4 pb-3 border-b border-tat-charcoal/8">
        {title}
      </h2>
      <div className="space-y-4 text-tat-charcoal/75 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:leading-relaxed">
        {children}
      </div>
    </div>
  );
}
