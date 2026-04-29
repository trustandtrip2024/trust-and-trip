"use client";

import { motion } from "framer-motion";
import { MessageCircle, Phone, IndianRupee } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { captureIntent } from "@/lib/capture-intent";

const WA_NUMBER = "918115999588";
const PHONE_1 = "+918115999588";
const PHONE_2 = "+917275999588";

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
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 z-40 lg:hidden"
      style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-3 mb-2 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(42,42,42,0.18)] border border-white/60">
        {/* Price strip */}
        <div className="bg-tat-charcoal px-4 py-2.5 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-tat-paper/50">Starting from</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-display text-xl font-medium text-tat-paper leading-none">
                ₹{price.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-tat-paper/40 font-sans">/person</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.15em] text-tat-gold">{duration}</p>
            <p className="text-[9px] text-tat-paper/40 mt-0.5">All inclusive</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="bg-white/95 backdrop-blur-md px-3 py-2.5 flex items-center gap-2">
          {/* Call button */}
          <a
            href={`tel:${PHONE_1}`}
            onClick={() =>
              captureIntent("call_click", {
                package_title: packageTitle,
                note: `Tapped Call on package CTA · ₹${price.toLocaleString("en-IN")} · ${duration}`,
              })
            }
            className="flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl bg-tat-charcoal/6 border border-tat-charcoal/10 text-tat-charcoal text-xs font-medium shrink-0"
            aria-label="Call us"
          >
            <Phone className="h-3.5 w-3.5" />
            Call
          </a>

          {/* WhatsApp Book Now */}
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              analytics.whatsappClick(`package_cta:${packageTitle}`);
              captureIntent("whatsapp_click", {
                package_title: packageTitle,
                note: `Book on WhatsApp · ₹${price.toLocaleString("en-IN")} · ${duration}`,
              });
            }}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366] text-white text-sm font-semibold"
          >
            <MessageCircle className="h-4 w-4 fill-white" />
            Book on WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
}
