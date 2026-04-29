"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Sliders } from "lucide-react";
import { submitLead } from "@/lib/submit-lead";
import MobileSheet from "./ui/MobileSheet";

interface Props {
  packageTitle: string;
  packageSlug: string;
  destinationName?: string;
  onClose: () => void;
}

interface FormState {
  name: string;
  phone: string;
  travelDates: string;
  adults: string;
  children: string;
  accommodation: string;
  notes: string;
}

const EMPTY: FormState = {
  name: "",
  phone: "",
  travelDates: "",
  adults: "2",
  children: "0",
  accommodation: "comfort",
  notes: "",
};

export default function CustomizeModal({ packageTitle, packageSlug, destinationName, onClose }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setError("");
    setLoading(true);
    const res = await submitLead({
      name: form.name.trim(),
      email: "",
      phone: form.phone.trim(),
      package_title: packageTitle,
      package_slug: packageSlug,
      destination: destinationName,
      source: "package_enquiry",
      message: `CUSTOMIZE REQUEST — Adults: ${form.adults}, Children: ${form.children}, Dates: ${form.travelDates || "Flexible"}, Accommodation: ${form.accommodation}. Notes: ${form.notes || "None"}`,
      travel_type: undefined,
      budget: undefined,
    });
    setLoading(false);
    if (res.ok) setSuccess(true);
    else setError(res.error ?? "Something went wrong.");
  };

  return (
    <MobileSheet
      open
      onClose={onClose}
      eyebrow="Customize Package"
      title={packageTitle}
      icon={<Sliders className="h-4 w-4" />}
    >
      <div className="px-6 py-5">
        {success ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="h-14 w-14 rounded-full bg-tat-success-bg flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-tat-success-fg" />
            </div>
            <div>
              <p className="font-display text-lg font-medium text-tat-charcoal">Request received!</p>
              <p className="text-sm text-tat-charcoal/55 mt-1">We&apos;ll send your custom itinerary within 24 hours.</p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-tat-teal text-tat-paper rounded-full text-sm font-medium hover:bg-tat-teal-deep transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-tat-charcoal/55 leading-relaxed">
              Tell us how you&apos;d like to tailor this trip. We&apos;ll build a custom itinerary just for you.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Your Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tat-charcoal/15 bg-white text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">WhatsApp / Phone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tat-charcoal/15 bg-white text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Preferred Travel Dates</label>
                <input
                  type="text"
                  value={form.travelDates}
                  onChange={set("travelDates")}
                  placeholder="e.g. Dec 20–27, flexible in Jan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tat-charcoal/15 bg-white text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Adults</label>
                <select
                  value={form.adults}
                  onChange={set("adults")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tat-charcoal/15 bg-white text-sm text-tat-charcoal focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
                >
                  {["1","2","3","4","5","6","7","8","9","10+"].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Children</label>
                <select
                  value={form.children}
                  onChange={set("children")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tat-charcoal/15 bg-white text-sm text-tat-charcoal focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
                >
                  {["0","1","2","3","4","5+"].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Accommodation Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "budget", label: "Budget" },
                    { value: "comfort", label: "Comfort" },
                    { value: "luxury", label: "Luxury" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, accommodation: opt.value }))}
                      className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                        form.accommodation === opt.value
                          ? "bg-tat-gold/15 border-tat-gold text-tat-charcoal"
                          : "border-tat-charcoal/12 text-tat-charcoal/55 hover:border-tat-charcoal/25"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Special Requests</label>
                <textarea
                  value={form.notes}
                  onChange={set("notes")}
                  rows={3}
                  placeholder="Honeymoon setup, dietary needs, accessibility, specific hotels…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tat-charcoal/15 bg-white text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition resize-none"
                />
              </div>
            </div>

            {error && <p className="text-xs text-tat-danger-fg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
              ) : (
                "Send Customization Request"
              )}
            </button>
          </form>
        )}
      </div>
    </MobileSheet>
  );
}
