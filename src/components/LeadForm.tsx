"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { destinations } from "@/lib/data";
import { analytics } from "@/lib/analytics";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  destination: string;
  travelType: string;
  travelers: string;
  budget: string;
  travelDates: string;
  notes: string;
}

const WA_NUMBER = "918115999588";

interface Props {
  variant?: "popup" | "full";
  submitHandler?: (data: FormValues) => Promise<void> | void;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  packageContext?: string;
  destinationContext?: string;
}

export default function LeadForm({
  variant = "full",
  submitHandler,
  title = "Get a free itinerary",
  subtitle = "Tell us a little. We'll return with a hand-built proposal within 24 hours.",
  ctaLabel = "Get Free Itinerary",
  packageContext,
  destinationContext,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>();
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: FormValues) => {
    if (submitHandler) {
      await submitHandler(data);
    } else {
      // Build WhatsApp message from form data
      const lines = [
        `Hi Trust and Trip! 🙏`,
        ``,
        packageContext ? `📦 Interested in: *${packageContext}*` : null,
        destinationContext ? `📍 Destination interest: *${destinationContext}*` : null,
        ``,
        `👤 Name: ${data.name}`,
        `📱 Phone: ${data.phone}`,
        `📧 Email: ${data.email}`,
        data.destination ? `🗺️ Destination: ${data.destination}` : null,
        data.travelType ? `👥 Travel type: ${data.travelType}` : null,
        data.travelers ? `🧳 Travelers: ${data.travelers}` : null,
        data.budget ? `💰 Budget: ${data.budget}` : null,
        data.travelDates ? `📅 Travel dates: ${data.travelDates}` : null,
        data.notes ? `📝 Notes: ${data.notes}` : null,
        ``,
        `Please help me plan my trip. Thank you!`,
      ]
        .filter((l) => l !== null)
        .join("\n");

      const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
    analytics.formSubmit(data.destination || destinationContext);
    setSuccess(true);
    reset();
    setTimeout(() => setSuccess(false), 5000);
  };

  const isPopup = variant === "popup";

  return (
    <div className={isPopup ? "" : "bg-white rounded-3xl p-6 md:p-10 border border-ink/5 shadow-soft"}>
      {!isPopup && (
        <div className="mb-8">
          <span className="eyebrow">Plan Your Trip</span>
          <h3 className="heading-section mt-3 text-balance">{title}</h3>
          <p className="mt-3 text-ink/60 leading-relaxed">{subtitle}</p>
        </div>
      )}

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 text-center"
        >
          <div className="h-16 w-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-gold" />
          </div>
          <h4 className="font-display text-2xl mb-2">Opening WhatsApp…</h4>
          <p className="text-ink/60 text-sm">
            Your message is ready to send. A planner will reply within 2 hours.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Full Name" error={errors.name?.message}>
              <input
                {...register("name", { required: "Please enter your name" })}
                placeholder="Your name"
                className="input-travel"
              />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <input
                {...register("phone", { required: "Phone is required" })}
                type="tel"
                placeholder="+91 98765 43210"
                className="input-travel"
              />
            </Field>
          </div>

          <Field label="Email" error={errors.email?.message}>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email" },
              })}
              type="email"
              placeholder="you@example.com"
              className="input-travel"
            />
          </Field>

          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Destination">
              <select {...register("destination")} className="input-travel">
                <option value="">Any destination</option>
                {destinations.map((d) => (
                  <option key={d.slug} value={d.name}>
                    {d.name}, {d.country}
                  </option>
                ))}
                <option value="not-sure">I'm not sure yet</option>
              </select>
            </Field>
            <Field label="Travel Type">
              <select {...register("travelType")} className="input-travel">
                <option value="">Choose a style</option>
                <option value="Couple">Couple / Honeymoon</option>
                <option value="Family">Family</option>
                <option value="Group">Group of Friends</option>
                <option value="Solo">Solo</option>
                <option value="Corporate">Corporate</option>
              </select>
            </Field>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <Field label="Travelers">
              <input
                {...register("travelers")}
                type="number"
                min={1}
                placeholder="2"
                className="input-travel"
              />
            </Field>
            <Field label="Budget (₹ / person)">
              <select {...register("budget")} className="input-travel">
                <option value="">Select a range</option>
                <option value="<50000">Under 50,000</option>
                <option value="50000-100000">50,000 – 1,00,000</option>
                <option value="100000-200000">1,00,000 – 2,00,000</option>
                <option value="200000+">2,00,000+</option>
              </select>
            </Field>
            <Field label="Travel Dates">
              <input
                {...register("travelDates")}
                type="text"
                placeholder="e.g. Dec 2026"
                className="input-travel"
              />
            </Field>
          </div>

          <Field label="Anything special?">
            <textarea
              {...register("notes")}
              rows={4}
              placeholder="Dietary needs, occasions, dream experiences..."
              className="input-travel resize-none"
            />
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center !py-4 mt-2 group"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending your request...
              </>
            ) : (
              <>
                {ctaLabel}
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <p className="text-[11px] text-ink/40 text-center mt-3">
            By submitting, you agree to our privacy policy. We'll never share your data.
          </p>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.15em] text-ink/60 font-medium mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
