"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, X } from "lucide-react";

const WHATSAPP_NUMBER = "918115999588";
const PHONE_NUMBER = "+918115999588";

export default function FloatingWhatsApp() {
  const [expanded, setExpanded] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const waMessage = encodeURIComponent(
    "Hi Trust and Trip! I'd love some help planning my next trip."
  );

  return (
    <>
      {/* Desktop floating WhatsApp */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-3"
      >
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-white rounded-2xl p-5 shadow-soft-lg max-w-[280px] border border-ink/5"
            >
              <p className="font-display text-lg leading-tight mb-1">
                Talk to a planner
              </p>
              <p className="text-xs text-ink/60 mb-4">
                Real people, instant replies, 24/7.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 bg-[#25D366] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="flex items-center gap-2.5 bg-ink text-cream px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gold hover:text-ink transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Close contact menu" : "Open contact menu"}
          className="relative h-14 w-14 rounded-full bg-[#25D366] text-white shadow-soft-lg hover:scale-110 transition-transform flex items-center justify-center"
        >
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
          {expanded ? (
            <X className="h-6 w-6 relative" />
          ) : (
            <MessageCircle className="h-6 w-6 relative fill-white" />
          )}
        </button>
      </motion.div>

      {/* Mobile sticky bottom CTA */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur-xl border-t border-ink/10 p-3 grid grid-cols-2 gap-2"
      >
        <a
          href={`tel:${PHONE_NUMBER}`}
          className="flex items-center justify-center gap-2 bg-ink text-cream rounded-xl py-3 text-sm font-medium"
        >
          <Phone className="h-4 w-4" />
          Call Now
        </a>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl py-3 text-sm font-medium"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </motion.div>
    </>
  );
}
