"use client";

import { useEffect, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useTripPlanner } from "@/context/TripPlannerContext";
import { analytics } from "@/lib/analytics";
import { submitLead } from "@/lib/submit-lead";

const SESSION_KEY = "ttp_exit_shown";

export default function ExitIntentPopup() {
  const { isOpen } = useTripPlanner();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, "1");
    analytics.exitIntentDismiss();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setError("");
    setSubmitting(true);
    const res = await submitLead({
      name: name.trim(),
      email: "",
      phone: phone.trim(),
      destination: destination.trim() || undefined,
      source: "exit_intent",
      message: `Exit-intent popup — destination of interest: ${destination.trim() || "any"}`,
    });
    setSubmitting(false);
    if (res.ok) {
      setSuccess(true);
      analytics.exitIntentConvert();
      sessionStorage.setItem(SESSION_KEY, "1");
    } else {
      setError(res.error ?? "Could not send. Try again.");
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const timer = setTimeout(() => {
      if (!isOpen) setVisible(true);
    }, 40000);
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
            className="fixed inset-0 z-[75] bg-tat-charcoal/60 backdrop-blur-sm"
            onClick={dismiss}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            className="fixed inset-x-4 bottom-6 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:bottom-8 z-[76] w-auto md:w-[480px] bg-tat-charcoal rounded-3xl overflow-hidden shadow-soft-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-intent-title"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-tat-charcoal via-tat-charcoal to-tat-gold/10 pointer-events-none" />

            <div className="relative p-6 md:p-7">
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 p-1.5 rounded-full text-tat-paper/45 hover:text-tat-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tat-gold"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 bg-tat-gold/20 border border-tat-gold/30 rounded-full px-3 py-1 mb-4">
                <Sparkles className="h-3 w-3 text-tat-gold" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-tat-gold font-medium">Free trip planning</span>
              </div>

              {success ? (
                <div className="flex flex-col gap-3 py-2 text-center">
                  <div className="h-12 w-12 mx-auto rounded-pill bg-tat-success-fg/20 grid place-items-center">
                    <CheckCircle2 className="h-6 w-6 text-tat-success-fg" />
                  </div>
                  <h3 id="exit-intent-title" className="font-display text-xl text-tat-paper font-medium">
                    Got it. We&apos;ll be in touch soon.
                  </h3>
                  <p className="text-tat-paper/65 text-sm">
                    A planner will WhatsApp you within 24 hours with a custom itinerary.
                    No spam, no commitment.
                  </p>
                  <button
                    onClick={dismiss}
                    className="mt-2 text-tat-paper/55 text-sm hover:text-tat-paper transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <h3 id="exit-intent-title" className="font-display text-2xl text-tat-paper font-medium leading-tight text-balance">
                    Before you go — tell us where you want to travel.
                  </h3>
                  <p className="mt-2 text-tat-paper/60 text-sm leading-relaxed">
                    A planner will reply on WhatsApp within 24 hours. No spam, no commitment.
                  </p>

                  <form onSubmit={onSubmit} className="mt-5 space-y-2.5">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name *"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-tat-paper/10 border border-tat-paper/15 text-tat-paper placeholder:text-tat-paper/40 text-sm outline-none focus:border-tat-gold/60 focus:bg-tat-paper/15 transition"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="WhatsApp / Phone *"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-tat-paper/10 border border-tat-paper/15 text-tat-paper placeholder:text-tat-paper/40 text-sm outline-none focus:border-tat-gold/60 focus:bg-tat-paper/15 transition"
                    />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder='Where to? e.g. "Bali", "Char Dham", "Switzerland"'
                      className="w-full px-4 py-3 rounded-xl bg-tat-paper/10 border border-tat-paper/15 text-tat-paper placeholder:text-tat-paper/40 text-sm outline-none focus:border-tat-gold/60 focus:bg-tat-paper/15 transition"
                    />

                    {error && (
                      <p role="alert" className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                        {error}
                      </p>
                    )}

                    <div className="pt-1 flex flex-col sm:flex-row gap-3 items-center">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-tat-gold text-tat-charcoal py-3 rounded-full text-sm font-semibold hover:scale-[1.01] transition-transform disabled:opacity-60"
                      >
                        {submitting ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                        ) : (
                          <><Sparkles className="h-4 w-4" /> Find My Perfect Trip</>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={dismiss}
                        className="text-tat-paper/45 text-sm hover:text-tat-paper/70 transition-colors py-2"
                      >
                        Maybe later
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
