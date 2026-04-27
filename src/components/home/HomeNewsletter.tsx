import NewsletterBlock from "@/components/ui/NewsletterBlock";

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  placeholder?: string;
  buttonLabel?: string;
  footerMicrocopy?: string;
}

export default function HomeNewsletter({
  eyebrow = "Join 12,000+ travelers",
  titleStart = "Get ₹500 off",
  titleItalic = "your first trip.",
  lede = "One email a month — flash deals, new destinations, and stories from the road. Subscribe today and we'll email you a ₹500-off code, valid on any package above ₹25,000.",
  placeholder = "you@example.com",
  buttonLabel = "Get my ₹500 off",
  footerMicrocopy = "One-time code, valid 90 days. ~12 emails a year. Never spam, never sold.",
}: Props = {}) {
  return (
    <NewsletterBlock
      eyebrow={eyebrow}
      title={titleStart}
      italicTail={titleItalic}
      lede={lede}
      placeholder={placeholder}
      buttonLabel={buttonLabel}
      footerMicrocopy={footerMicrocopy}
    />
  );
}
