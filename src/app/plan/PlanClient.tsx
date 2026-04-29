"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Loader2, Sun, Coffee, Sunset, Hotel, Lightbulb, MapPin, Clock, IndianRupee, Check, Send } from "lucide-react";
import { submitLead } from "@/lib/submit-lead";

const DESTINATIONS = [
  "Bali", "Maldives", "Kerala", "Goa", "Manali", "Rajasthan", "Ladakh",
  "Spiti Valley", "Zanskar Valley", "Vietnam", "Thailand", "Dubai",
  "Switzerland", "Japan", "Singapore", "Nepal", "Uttarakhand", "Andaman Islands",
  "Coorg", "Shimla", "Paris", "Turkey", "Malaysia", "Sri Lanka", "Australia",
];

const FROM_CITIES = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad", "Kolkata", "Pune", "Ahmedabad"];

type Itinerary = {
  title: string;
  tagline: string;
  highlights: string[];
  bestTimeToVisit: string;
  estimatedCost: string;
  days: {
    day: number;
    title: string;
    morning: string;
    afternoon: string;
    evening: string;
    stay: string;
    tip: string;
  }[];
  packingTips: string[];
  visaInfo: string;
};

export default function PlanClient() {
  const [form, setForm] = useState({
    destination: "",
    days: "6",
    travelType: "Couple",
    budget: "moderate",
    fromCity: "Delhi",
    interests: "",
  });
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState("");
  const [lead, setLead] = useState({ name: "", phone: "", email: "" });
  const [leadSent, setLeadSent] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.destination) { setError("Please select a destination."); return; }
    setLoading(true);
    setError("");
    setItinerary(null);

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItinerary(data.itinerary);
      setTimeout(() => document.getElementById("itinerary-output")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name || !lead.phone) return;
    setLeadLoading(true);
    await submitLead({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || "",
      destination: form.destination,
      travel_type: form.travelType,
      message: `Custom itinerary request — ${form.days} days, ${form.budget} budget. Trip: "${itinerary?.title}"`,
      source: "itinerary_generator",
    });
    setLeadSent(true);
    setLeadLoading(false);
  };

  return (
    <div className="min-h-screen bg-tat-paper">
      {/* Header */}
      <section className="pt-24 md:pt-32 pb-12 border-b border-tat-charcoal/8">
        <div className="container-custom max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-tat-gold/10 border border-tat-gold/20 text-tat-gold text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="h-3 w-3" />
            AI-powered · Free · No sign-up
          </div>
          <h1 className="font-display text-display-md font-medium leading-[1.05] text-balance">
            Get your custom
            <span className="italic text-tat-gold font-light"> travel itinerary.</span>
          </h1>
          <p className="mt-4 text-tat-charcoal/60 text-lg leading-relaxed max-w-xl">
            Tell us where you want to go. We'll build a detailed day-by-day plan — completely free.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="container-custom max-w-3xl">
          <form onSubmit={generate} className="space-y-6">
            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-tat-charcoal mb-2">Where do you want to go? *</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-tat-charcoal/30" />
                <select
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-tat-charcoal/15 bg-white text-tat-charcoal focus:outline-none focus:border-tat-gold text-sm appearance-none"
                >
                  <option value="">Select a destination</option>
                  {DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Days + Travel type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tat-charcoal mb-2">How many days?</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-tat-charcoal/30" />
                  <select
                    value={form.days}
                    onChange={(e) => setForm({ ...form, days: e.target.value })}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-tat-charcoal/15 bg-white text-tat-charcoal focus:outline-none focus:border-tat-gold text-sm appearance-none"
                  >
                    {[3,4,5,6,7,8,9,10,12,14].map((d) => (
                      <option key={d} value={d}>{d} days</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-tat-charcoal mb-2">Travel style</label>
                <select
                  value={form.travelType}
                  onChange={(e) => setForm({ ...form, travelType: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border border-tat-charcoal/15 bg-white text-tat-charcoal focus:outline-none focus:border-tat-gold text-sm appearance-none"
                >
                  {["Couple", "Family", "Group", "Solo"].map((t) => (
                    <option key={t} value={t}>{t === "Couple" ? "💑 Couple / Honeymoon" : t === "Family" ? "👨‍👩‍👧‍👦 Family" : t === "Group" ? "🎉 Group" : "🧭 Solo"}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget + From city */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tat-charcoal mb-2">Budget range</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-tat-charcoal/30" />
                  <select
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-tat-charcoal/15 bg-white text-tat-charcoal focus:outline-none focus:border-tat-gold text-sm appearance-none"
                  >
                    <option value="budget">Budget (under ₹35,000)</option>
                    <option value="moderate">Moderate (₹35K–₹75K)</option>
                    <option value="premium">Premium (₹75K–₹1.5L)</option>
                    <option value="luxury">Luxury (above ₹1.5L)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-tat-charcoal mb-2">Departing from</label>
                <select
                  value={form.fromCity}
                  onChange={(e) => setForm({ ...form, fromCity: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border border-tat-charcoal/15 bg-white text-tat-charcoal focus:outline-none focus:border-tat-gold text-sm appearance-none"
                >
                  {FROM_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-tat-charcoal mb-2">Special interests <span className="text-tat-charcoal/40 font-normal">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. photography, street food, adventure sports, temples, beaches..."
                value={form.interests}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl border border-tat-charcoal/15 bg-white text-tat-charcoal placeholder:text-tat-charcoal/30 focus:outline-none focus:border-tat-gold text-sm"
              />
            </div>

            {error && <p className="text-sm text-tat-danger-fg bg-tat-danger-bg px-4 py-3 rounded-xl">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-tat-charcoal text-tat-paper font-semibold py-4 rounded-xl hover:bg-tat-charcoal/90 transition-colors text-sm disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Crafting your itinerary…</>
              ) : (
                <><Sparkles className="h-4 w-4 text-tat-gold" />Generate My Itinerary — Free</>
              )}
            </button>
            <p className="text-center text-xs text-tat-charcoal/40">Takes about 15 seconds · Powered by AI</p>
          </form>
        </div>
      </section>

      {/* Loading skeleton */}
      {loading && (
        <section className="pb-16">
          <div className="container-custom max-w-4xl space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-tat-charcoal/8 animate-pulse">
                <div className="h-4 bg-tat-charcoal/8 rounded w-24 mb-3" />
                <div className="h-6 bg-tat-charcoal/8 rounded w-2/3 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-tat-charcoal/6 rounded w-full" />
                  <div className="h-3 bg-tat-charcoal/6 rounded w-4/5" />
                  <div className="h-3 bg-tat-charcoal/6 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Itinerary output */}
      {itinerary && (
        <section id="itinerary-output" className="pb-20">
          <div className="container-custom max-w-4xl">
            {/* Header */}
            <div className="bg-tat-charcoal text-tat-paper rounded-3xl p-8 md:p-10 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-tat-gold" />
                <span className="text-xs uppercase tracking-[0.2em] text-tat-gold font-medium">Your personalised itinerary</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-medium leading-tight mb-3">{itinerary.title}</h2>
              <p className="text-tat-paper/70 text-base leading-relaxed mb-6 max-w-2xl">{itinerary.tagline}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {itinerary.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-tat-paper/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-tat-gold shrink-0" />{h}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-tat-paper/10 text-xs text-tat-paper/50">
                <span>📅 Best time: {itinerary.bestTimeToVisit}</span>
                <span>💰 Est. cost: {itinerary.estimatedCost}</span>
                <span>🛂 {itinerary.visaInfo}</span>
              </div>
            </div>

            {/* Day cards */}
            <div className="space-y-4 mb-8">
              {itinerary.days.map((day) => (
                <div key={day.day} className="bg-white rounded-2xl border border-tat-charcoal/8 overflow-hidden">
                  <div className="flex items-center gap-4 px-6 py-4 border-b border-tat-charcoal/6 bg-tat-cream/30">
                    <span className="font-display text-2xl font-medium text-tat-gold/80 tabular-nums w-8">{String(day.day).padStart(2, "0")}</span>
                    <h3 className="font-display text-lg font-medium text-tat-charcoal">{day.title}</h3>
                  </div>
                  <div className="p-6 grid md:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-tat-charcoal/50 uppercase tracking-wider mb-2">
                        <Coffee className="h-3.5 w-3.5 text-tat-gold" /> Morning
                      </div>
                      <p className="text-sm text-tat-charcoal/75 leading-relaxed">{day.morning}</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-tat-charcoal/50 uppercase tracking-wider mb-2">
                        <Sun className="h-3.5 w-3.5 text-tat-gold" /> Afternoon
                      </div>
                      <p className="text-sm text-tat-charcoal/75 leading-relaxed">{day.afternoon}</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-tat-charcoal/50 uppercase tracking-wider mb-2">
                        <Sunset className="h-3.5 w-3.5 text-orange-400" /> Evening
                      </div>
                      <p className="text-sm text-tat-charcoal/75 leading-relaxed">{day.evening}</p>
                    </div>
                  </div>
                  <div className="px-6 pb-4 flex flex-wrap gap-4 text-xs text-tat-charcoal/50">
                    <span className="flex items-center gap-1.5"><Hotel className="h-3.5 w-3.5 text-tat-charcoal/30" />{day.stay}</span>
                    <span className="flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5 text-tat-gold/60" />{day.tip}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Packing tips */}
            {itinerary.packingTips.length > 0 && (
              <div className="bg-tat-gold/8 border border-tat-gold/15 rounded-2xl p-6 mb-8">
                <p className="text-xs uppercase tracking-[0.2em] text-tat-gold font-medium mb-3">What to pack</p>
                <div className="flex flex-wrap gap-2">
                  {itinerary.packingTips.map((tip, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-white border border-tat-gold/20 px-3 py-1.5 rounded-full text-tat-charcoal/70">
                      <Check className="h-3 w-3 text-tat-gold" />{tip}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lead capture */}
            <div className="bg-tat-charcoal text-tat-paper rounded-3xl p-8 md:p-10">
              {leadSent ? (
                <div className="text-center py-4">
                  <div className="h-14 w-14 rounded-full bg-tat-gold/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-7 w-7 text-tat-gold" />
                  </div>
                  <h3 className="font-display text-2xl font-medium mb-2">We've got your details!</h3>
                  <p className="text-tat-paper/60 max-w-sm mx-auto">A planner will call you within 2 hours to discuss your {form.destination} trip and book everything for you.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <span className="text-xs uppercase tracking-[0.2em] text-tat-gold font-medium">Next step</span>
                    <h3 className="font-display text-2xl md:text-3xl font-medium mt-2 mb-2">
                      Want us to book this for you?
                    </h3>
                    <p className="text-tat-paper/60 text-sm leading-relaxed">
                      Share your details and a planner will call within 2 hours — they'll customise this itinerary, handle all bookings and get you the best price.
                    </p>
                  </div>
                  <form onSubmit={sendLead} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        required
                        placeholder="Your name *"
                        value={lead.name}
                        onChange={(e) => setLead({ ...lead, name: e.target.value })}
                        className="px-4 py-3 rounded-xl bg-tat-paper/10 border border-tat-paper/15 text-tat-paper placeholder:text-tat-paper/35 text-sm focus:outline-none focus:border-tat-gold"
                      />
                      <input
                        required
                        type="tel"
                        placeholder="Phone number *"
                        value={lead.phone}
                        onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                        className="px-4 py-3 rounded-xl bg-tat-paper/10 border border-tat-paper/15 text-tat-paper placeholder:text-tat-paper/35 text-sm focus:outline-none focus:border-tat-gold"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email (optional — we'll send this itinerary)"
                      value={lead.email}
                      onChange={(e) => setLead({ ...lead, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-tat-paper/10 border border-tat-paper/15 text-tat-paper placeholder:text-tat-paper/35 text-sm focus:outline-none focus:border-tat-gold"
                    />
                    <button
                      type="submit"
                      disabled={leadLoading}
                      className="w-full flex items-center justify-center gap-2 bg-tat-gold text-tat-charcoal font-semibold py-3.5 rounded-xl hover:bg-tat-gold/90 transition-colors text-sm disabled:opacity-60"
                    >
                      {leadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {leadLoading ? "Sending…" : "Get a Free Callback Within 2 Hours"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
