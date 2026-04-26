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
  eyebrow = "Stay in the know",
  titleStart = "Travel notes,",
  titleItalic = "in your inbox.",
  lede = "One email a month — flash deals, new destinations, and stories from the road. Unsubscribe anytime, no questions asked.",
  placeholder = "you@example.com",
  buttonLabel = "Subscribe",
  footerMicrocopy = "Roughly 12 emails a year. Never spam, never sold.",
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
