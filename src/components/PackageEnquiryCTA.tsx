"use client";

import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";
import { analytics } from "@/lib/analytics";

const WA_NUMBER = "918115999588";
const PHONE = "+918115999588";

interface Props {
  packageTitle: string;
  price: number;
  duration: string;
}

export default function PackageEnquiryCTA({ packageTitle, price, duration }: Props) {
  const waMessage = encodeURIComponent(
    `Hi Trust and Trip! 🙏\n\nI'm interested in the *${packageTitle}* package (₹${price.toLocaleString("en-IN")}/person · ${duration}).\n\nCan you help me book or customize this trip?`
  );

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-16 inset-x-0 z-40 lg:hidden"
    >
      <div className="mx-3 bg-white rounded-2xl shadow-[0_-4px_30px_rgba(11,28,44,0.15)] border border-ink/8 p-3 flex items-center gap-3">
        {/* Price */}
        <div className="flex-1 min-w-0 pl-1">
          <p className="text-[10px] uppercase tracking-wider text-ink/50">From</p>
          <p className="font-display text-xl font-medium text-ink leading-none mt-0.5">
            ₹{price.toLocaleString("en-IN")}
            <span className="text-xs text-ink/40 font-sans font-normal ml-1">/person</span>
          </p>
        </div>

        {/* Call button */}
        <a
          href={`tel:${PHONE}`}
          className="h-12 w-12 rounded-xl bg-ink/8 flex items-center justify-center shrink-0"
          aria-label="Call us"
        >
          <Phone className="h-5 w-5 text-ink" />
        </a>

        {/* WhatsApp CTA */}
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => analytics.whatsappClick(`package_cta:${packageTitle}`)}
          className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl text-sm font-semibold shrink-0"
        >
          <MessageCircle className="h-4 w-4 fill-white" />
          Book Now
        </a>
      </div>
    </motion.div>
  );
}
