import NewsletterBlock from "@/components/ui/NewsletterBlock";

interface Props {
  eyebrow?: string;
  titleStart?: string;
  titleItalic?: string;
  lede?: string;
  placeholder?: string;
  buttonLabel?: string;
  footerMicrocopy?: string;
  /** Live subscriber-base size; component does the formatting + rounding. */
  totalTravelers?: number;
}

function eyebrowFromCount(n: number): string {
  if (n >= 1000) {
    const rounded = Math.floor(n / 1000) * 1000;
    return `Join ${rounded.toLocaleString("en-IN")}+ travelers`;
  }
  return "Join the list";
}

export default function HomeNewsletter({
  eyebrow,
  titleStart = "₹500 off + the planner playbook",
  titleItalic = "free, on signup.",
  lede = "One email on the first Friday of every month — destination guides, flash deals, and a planner-only ₹500-off code valid on any package above ₹25,000.",
  placeholder = "you@example.com",
  buttonLabel = "Get my ₹500 + playbook",
  footerMicrocopy = "One code, valid 90 days. 12 emails a year. Never spam, never sold.",
  totalTravelers = 12000,
}: Props = {}) {
  return (
    <NewsletterBlock
      eyebrow={eyebrow ?? eyebrowFromCount(totalTravelers)}
      title={titleStart}
      italicTail={titleItalic}
      lede={lede}
      placeholder={placeholder}
      buttonLabel={buttonLabel}
      footerMicrocopy={footerMicrocopy}
    />
  );
}
