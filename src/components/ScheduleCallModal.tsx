"use client";

import { useState } from "react";
import { Video, Phone, CheckCircle2, Loader2, ChevronLeft, Calendar } from "lucide-react";
import { submitLead } from "@/lib/submit-lead";
import MobileSheet from "./ui/MobileSheet";

interface Props {
  packageTitle: string;
  packageSlug: string;
  destinationName?: string;
  onClose: () => void;
}

type Step = "choose" | "form" | "success";
type CallType = "video" | "voice";

const TIME_SLOTS = [
  "9:00 AM – 10:00 AM",
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "2:00 PM – 3:00 PM",
  "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM",
  "6:00 PM – 7:00 PM",
  "7:00 PM – 8:00 PM",
];

export default function ScheduleCallModal({ packageTitle, packageSlug, destinationName, onClose }: Props) {
  const [step, setStep] = useState<Step>("choose");
  const [callType, setCallType] = useState<CallType>("video");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectType = (t: CallType) => {
    setCallType(t);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setError("");
    setLoading(true);
    const res = await submitLead({
      name: name.trim(),
      email: "",
      phone: phone.trim(),
      package_title: packageTitle,
      package_slug: packageSlug,
      destination: destinationName,
      source: "package_enquiry",
      message: `SCHEDULE ${callType.toUpperCase()} CALL — Date: ${date || "Flexible"}, Slot: ${slot || "Any"}.`,
      travel_type: undefined,
      budget: undefined,
    });
    setLoading(false);
    if (res.ok) setStep("success");
    else setError(res.error ?? "Something went wrong.");
  };

  return (
    <MobileSheet
      open
      onClose={onClose}
      eyebrow="Schedule a Call"
      title={packageTitle}
      icon={callType === "video" ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
      maxWidthClass="md:max-w-sm"
    >
      <div className="px-6 py-6">
        {step === "choose" && (
          <div>
            <p className="text-sm text-tat-charcoal/55 mb-5 leading-relaxed">
              Speak with a travel expert about this package. Choose how you&apos;d like to connect.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => selectType("video")}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-tat-charcoal/10 hover:border-tat-gold hover:bg-tat-gold/5 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-full bg-tat-charcoal/5 group-hover:bg-tat-gold/15 flex items-center justify-center transition-colors">
                  <Video className="h-5 w-5 text-tat-charcoal/60 group-hover:text-tat-charcoal transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-tat-charcoal">Video Call</p>
                  <p className="text-[11px] text-tat-charcoal/45 mt-0.5">Google Meet / Zoom</p>
                </div>
              </button>

              <button
                onClick={() => selectType("voice")}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-tat-charcoal/10 hover:border-tat-gold hover:bg-tat-gold/5 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-full bg-tat-charcoal/5 group-hover:bg-tat-gold/15 flex items-center justify-center transition-colors">
                  <Phone className="h-5 w-5 text-tat-charcoal/60 group-hover:text-tat-charcoal transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-tat-charcoal">Voice Call</p>
                  <p className="text-[11px] text-tat-charcoal/45 mt-0.5">Phone / WhatsApp</p>
                </div>
              </button>
            </div>
            <p className="text-[11px] text-tat-charcoal/35 text-center mt-4">Free consultation · No obligation</p>
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => setStep("choose")}
                className="h-7 w-7 rounded-full hover:bg-tat-charcoal/8 flex items-center justify-center transition-colors"
                aria-label="Back"
              >
                <ChevronLeft className="h-4 w-4 text-tat-charcoal/60" />
              </button>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                callType === "video" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-green-50 text-green-700 border border-green-100"
              }`}>
                {callType === "video" ? <Video className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                {callType === "video" ? "Video Call" : "Voice Call"} selected
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Your Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-tat-charcoal/15 bg-white text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Phone / WhatsApp *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-tat-charcoal/15 bg-white text-sm text-tat-charcoal placeholder-tat-charcoal/35 focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">
                <Calendar className="inline h-3 w-3 mr-1 opacity-60" />
                Preferred Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3.5 py-2.5 rounded-xl border border-tat-charcoal/15 bg-white text-sm text-tat-charcoal focus:outline-none focus:ring-2 focus:ring-tat-gold/40 focus:border-tat-gold transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-tat-charcoal/60 mb-1.5">Preferred Time Slot</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSlot(t)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all text-center ${
                      slot === t
                        ? "bg-tat-gold/15 border-tat-gold text-tat-charcoal"
                        : "border-tat-charcoal/10 text-tat-charcoal/50 hover:border-tat-charcoal/25 hover:text-tat-charcoal"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-tat-charcoal hover:bg-tat-gold text-tat-paper hover:text-tat-charcoal rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Booking…</>
              ) : (
                `Confirm ${callType === "video" ? "Video" : "Voice"} Call`
              )}
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="font-display text-lg font-medium text-tat-charcoal">Call scheduled!</p>
              <p className="text-sm text-tat-charcoal/55 mt-1.5 leading-relaxed">
                Our travel expert will call you at your preferred time.
                {slot && <> Slot: <span className="font-medium text-tat-charcoal">{slot}</span>.</>}
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-1 px-6 py-2.5 bg-tat-teal text-tat-paper rounded-full text-sm font-medium hover:bg-tat-teal-deep transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </MobileSheet>
  );
}
