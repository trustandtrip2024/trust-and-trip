"use client";

import { useState } from "react";
import { Share2, Copy, Check, MessageCircle, Twitter, Link2 } from "lucide-react";

interface Props {
  title: string;
  slug: string;
  price: number;
  destination: string;
}

export default function SharePackage({ title, slug, price, destination }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = `https://trustandtrip.com/packages/${slug}`;
  const text = `✈️ Check out this amazing trip to ${destination}!\n\n${title}\n💰 Starting from ₹${price.toLocaleString("en-IN")}/person\n\n🔗 ${url}\n\n📞 Book via Trust and Trip`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shares = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      color: "bg-whatsapp text-white hover:bg-whatsapp-hover",
      href: `https://wa.me/?text=${encodeURIComponent(text)}`,
    },
    {
      label: "Twitter / X",
      icon: Twitter,
      color: "bg-black text-white hover:bg-gray-800",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} — starting from ₹${price.toLocaleString("en-IN")}/person via @trust_and_trip`)}&url=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border border-tat-charcoal/12 text-tat-charcoal/50 hover:border-tat-charcoal/30 hover:text-tat-charcoal transition-all">
        <Share2 className="h-3.5 w-3.5" />Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 z-50 bg-white rounded-2xl shadow-soft-lg border border-tat-charcoal/8 p-3 min-w-[200px]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-tat-charcoal/40 font-medium mb-2 px-1">Share this package</p>
            <div className="space-y-1.5">
              {shares.map(({ label, icon: Icon, color, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors ${color}`}>
                  <Icon className="h-3.5 w-3.5" />{label}
                </a>
              ))}
              <button onClick={copy}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium bg-tat-charcoal/5 text-tat-charcoal/70 hover:bg-tat-charcoal/10 transition-colors">
                {copied ? <><Check className="h-3.5 w-3.5 text-tat-success-fg" />Copied!</> : <><Copy className="h-3.5 w-3.5" />Copy link</>}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
