"use client";

import { useState } from "react";
import { MessageCircle, Twitter, Facebook, Linkedin, Link2, Check } from "lucide-react";

interface Props {
  title: string;
  slug: string;
}

/**
 * Inline horizontal share strip for the blog detail page header. Static
 * provider chips for WhatsApp / Twitter / Facebook / LinkedIn plus a
 * copy-link button that briefly flips to a confirmation tick.
 *
 * Server can't render `navigator.clipboard`, so this stays a client
 * component — but it's cheap (no portal, no menu state).
 */
export default function BlogShare({ title, slug }: Props) {
  const [copied, setCopied] = useState(false);

  const url = `https://trustandtrip.com/blog/${slug}`;
  const text = `${title} — via @trust_and_trip`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const items: { label: string; href: string; Icon: typeof Twitter; bg: string }[] = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
      Icon: MessageCircle,
      bg: "hover:text-whatsapp",
    },
    {
      label: "Twitter / X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      Icon: Twitter,
      bg: "hover:text-tat-charcoal",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      Icon: Facebook,
      bg: "hover:text-facebook",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      Icon: Linkedin,
      bg: "hover:text-linkedin",
    },
  ];

  return (
    <div className="inline-flex items-center gap-1 mt-5">
      <span className="text-[10px] uppercase tracking-[0.18em] text-tat-charcoal/45 font-medium mr-2">
        Share
      </span>
      {items.map(({ label, href, Icon, bg }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className={`grid place-items-center h-8 w-8 rounded-full text-tat-charcoal/55 transition-colors ${bg}`}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Copy article link"
        className="grid place-items-center h-8 w-8 rounded-full text-tat-charcoal/55 hover:text-tat-gold transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Link2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
