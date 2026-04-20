"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";
import { analytics } from "@/lib/analytics";

const SESSION_KEY = "ttp_exit_shown";

export default function ExitIntentPopup() {
  const { open, isOpen } = useTripPlanner();
  const [visible, setVisible] = useState(false);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, "1");
    analytics.exitIntentDismiss();
  };

  const handlePlan = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, "1");
    analytics.exitIntentConvert();
    open();
  };

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Timed trigger — 40 seconds
    const timer = setTimeout(() => {
      if (!isOpen) setVisible(true);
    }, 40000);

    // Exit intent — mouse leaves top of viewport (desktop)
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem(SESSION_KEY) && !isOpen) {
        setVisible(true);
        sessionStorage.setItem(SESSION_KEY, "1");
      }
    };
    document.addEventListener("mouseleave", onMouseOut);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onMouseOut);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75] bg-ink/60 backdrop-blur-sm"
            onClick={dismiss}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            className="fixed inset-x-4 bottom-6 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:bottom-8 z-[76] w-auto md:w-[480px] bg-ink rounded-3xl overflow-hidden shadow-soft-lg"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-gold/10 pointer-events-none" />

            <div className="relative p-7">
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 p-1.5 rounded-full text-cream/40 hover:text-cream transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 bg-gold/20 border border-gold/30 rounded-full px-3 py-1 mb-4">
                <Sparkles className="h-3 w-3 text-gold" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium">
                  Free trip planning
                </span>
              </div>

              <h3 className="font-display text-2xl text-cream font-medium leading-tight text-balance">
                Before you go — tell us where you want to travel.
              </h3>
              <p className="mt-3 text-cream/60 text-sm leading-relaxed">
                Answer 4 quick questions and we&apos;ll show you packages built for you.
                No spam, no commitment.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handlePlan}
                  className="flex-1 flex items-center justify-center gap-2 bg-gold text-ink py-3 rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform"
                >
                  <Sparkles className="h-4 w-4" />
                  Find My Perfect Trip
                </button>
                <button
                  onClick={dismiss}
                  className="text-cream/40 text-sm hover:text-cream/70 transition-colors py-2 text-center"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
