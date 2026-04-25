import NewsletterBlock from "@/components/ui/NewsletterBlock";

export default function HomeNewsletter() {
  return (
    <NewsletterBlock
      eyebrow="Stay in the know"
      title="Travel notes,"
      italicTail="in your inbox."
      lede="One email a month — flash deals, new destinations, and stories from the road. Unsubscribe anytime, no questions asked."
      placeholder="you@example.com"
      buttonLabel="Subscribe"
      footerMicrocopy="Roughly 12 emails a year. Never spam, never sold."
    />
  );
}
