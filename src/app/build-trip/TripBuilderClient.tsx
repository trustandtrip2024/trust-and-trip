"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Package, Destination } from "@/lib/data";
import { ArrowRight, ArrowLeft, Check, MapPin, Users, Clock, IndianRupee, Calendar, Star } from "lucide-react";
import { submitLead } from "@/lib/submit-lead";

const STEPS = ["destination", "style", "duration", "budget", "dates", "results"] as const;
type Step = typeof STEPS[number];

const STYLES = [
  { value: "Couple", emoji: "💑", label: "Honeymoon / Couple", desc: "Romantic getaway for two" },
  { value: "Family", emoji: "👨‍👩‍👧‍👦", label: "Family Holiday",     desc: "Fun for all ages" },
  { value: "Group",  emoji: "🎉", label: "Group Trip",          desc: "Unforgettable with friends" },
  { value: "Solo",   emoji: "🧭", label: "Solo Adventure",       desc: "Your pace, your rules" },
];

const DURATIONS = [
  { label: "Weekend", days: [2,3], icon: "⚡" },
  { label: "3–5 Days", days: [3,5], icon: "🌅" },
  { label: "5–7 Days", days: [5,7], icon: "✈️" },
  { label: "7–10 Days", days: [7,10], icon: "🗺️" },
  { label: "10+ Days", days: [10,99], icon: "🌍" },
];

const BUDGETS = [
  { value: "budget",   label: "Budget",   range: "Under ₹35,000",   min: 0,      max: 35000 },
  { value: "standard", label: "Standard", range: "₹35K – ₹75K",    min: 35000,  max: 75000 },
  { value: "premium",  label: "Premium",  range: "₹75K – ₹1.5L",   min: 75000,  max: 150000 },
  { value: "luxury",   label: "Luxury",   range: "Above ₹1.5L",    min: 150000, max: 9999999 },
];

export default function TripBuilderClient({ packages, destinations }: { packages: Package[]; destinations: Destination[] }) {
  const [step, setStep] = useState<Step>("destination");
  const [dir, setDir] = useState(1);
  const [sel, setSel] = useState({ destination: "", style: "", duration: [0,99] as [number,number], budget: [0,9999999] as [number,number], month: "" });
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const go = (s: Step, d = 1) => { setDir(d); setStep(s); };
  const stepIdx = STEPS.indexOf(step);

  const matched = packages.filter((p) => {
    if (sel.destination && p.destinationSlug !== sel.destination) return false;
    if (sel.style && p.travelType !== sel.style) return false;
    if (p.days < sel.duration[0] || p.days > sel.duration[1]) return false;
    if (p.price < sel.budget[0] || p.price > sel.budget[1]) return false;
    return true;
  }).slice(0, 9);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dest = destinations.find((d) => d.slug === sel.destination);
    await submitLead({
      name, phone, email,
      destination: dest?.name ?? sel.destination,
      travel_type: sel.style,
      travel_date: sel.month,
      source: "trip_planner",
    });
    setSubmitted(true);
  };

  const slide = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="container-custom max-w-3xl">
        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-8">
          {STEPS.slice(0,-1).map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${i <= stepIdx ? "bg-gold" : "bg-ink/10"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>

            {/* STEP 1: Destination */}
            {step === "destination" && (
              <div>
                <span className="eyebrow">Step 1 of 5</span>
                <h1 className="heading-section mt-2 mb-6 text-balance">Where do you want to go?</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                  <button onClick={() => { setSel({ ...sel, destination: "" }); go("style"); }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${!sel.destination ? "border-gold bg-gold/8" : "border-ink/10 hover:border-ink/30"}`}>
                    <p className="text-2xl mb-1">🌏</p>
                    <p className="font-medium text-sm">Anywhere</p>
                    <p className="text-xs text-ink/50">Surprise me!</p>
                  </button>
                  {destinations.map((d) => (
                    <button key={d.slug} onClick={() => { setSel({ ...sel, destination: d.slug }); go("style"); }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${sel.destination === d.slug ? "border-gold bg-gold/8" : "border-ink/10 hover:border-ink/30"}`}>
                      <p className="font-medium text-sm">{d.name}</p>
                      <p className="text-xs text-ink/40">{d.country}</p>
                      <p className="text-xs text-gold mt-1">From ₹{d.priceFrom.toLocaleString("en-IN")}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Style */}
            {step === "style" && (
              <div>
                <span className="eyebrow">Step 2 of 5</span>
                <h1 className="heading-section mt-2 mb-6">How are you traveling?</h1>
                <div className="grid sm:grid-cols-2 gap-4">
                  {STYLES.map((s) => (
                    <button key={s.value} onClick={() => { setSel({ ...sel, style: s.value }); go("duration"); }}
                      className={`p-6 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${sel.style === s.value ? "border-gold bg-gold/8" : "border-ink/10 hover:border-ink/30"}`}>
                      <span className="text-4xl">{s.emoji}</span>
                      <div>
                        <p className="font-display text-lg font-medium">{s.label}</p>
                        <p className="text-xs text-ink/50 mt-0.5">{s.desc}</p>
                      </div>
                      {sel.style === s.value && <Check className="h-5 w-5 text-gold ml-auto" />}
                    </button>
                  ))}
                </div>
                <BackBtn onClick={() => go("destination", -1)} />
              </div>
            )}

            {/* STEP 3: Duration */}
            {step === "duration" && (
              <div>
                <span className="eyebrow">Step 3 of 5</span>
                <h1 className="heading-section mt-2 mb-6">How long is your trip?</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DURATIONS.map((d) => (
                    <button key={d.label}
                      onClick={() => { setSel({ ...sel, duration: d.days as [number,number] }); go("budget"); }}
                      className={`p-5 rounded-2xl border-2 text-center transition-all ${JSON.stringify(sel.duration) === JSON.stringify(d.days) ? "border-gold bg-gold/8" : "border-ink/10 hover:border-ink/30"}`}>
                      <span className="text-3xl block mb-2">{d.icon}</span>
                      <p className="font-medium text-sm">{d.label}</p>
                    </button>
                  ))}
                </div>
                <BackBtn onClick={() => go("style", -1)} />
              </div>
            )}

            {/* STEP 4: Budget */}
            {step === "budget" && (
              <div>
                <span className="eyebrow">Step 4 of 5</span>
                <h1 className="heading-section mt-2 mb-6">What's your budget per person?</h1>
                <div className="grid sm:grid-cols-2 gap-4">
                  {BUDGETS.map((b) => (
                    <button key={b.value}
                      onClick={() => { setSel({ ...sel, budget: [b.min, b.max] }); go("dates"); }}
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${sel.budget[0] === b.min ? "border-gold bg-gold/8" : "border-ink/10 hover:border-ink/30"}`}>
                      <p className="font-display text-2xl font-medium text-gold">{b.label}</p>
                      <p className="text-sm text-ink/60 mt-1">{b.range} / person</p>
                    </button>
                  ))}
                </div>
                <BackBtn onClick={() => go("duration", -1)} />
              </div>
            )}

            {/* STEP 5: Month */}
            {step === "dates" && (
              <div>
                <span className="eyebrow">Step 5 of 5</span>
                <h1 className="heading-section mt-2 mb-6">When are you planning to travel?</h1>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
                    <button key={m}
                      onClick={() => { setSel({ ...sel }); setStep("results"); }}
                      className={`py-4 rounded-2xl border-2 font-medium transition-all ${sel.month === m ? "border-gold bg-gold/8 text-ink" : "border-ink/10 hover:border-ink/30 text-ink/70"}`}
                      onMouseDown={() => setSel({ ...sel, month: m })}>
                      {m} 2026
                    </button>
                  ))}
                  <button onClick={() => { setStep("results"); }}
                    className="py-4 rounded-2xl border-2 border-ink/10 hover:border-ink/30 text-ink/50 text-sm transition-all col-span-2">
                    Not sure yet
                  </button>
                </div>
                <BackBtn onClick={() => go("budget", -1)} />
              </div>
            )}

            {/* RESULTS */}
            {step === "results" && (
              <div>
                <span className="eyebrow">Your matches</span>
                <h1 className="heading-section mt-2 mb-2">
                  {matched.length > 0 ? `${matched.length} packages found` : "No exact matches"}
                  <span className="italic text-gold font-light"> for you.</span>
                </h1>
                <p className="text-ink/60 text-sm mb-6">Based on your preferences. A planner can also build a custom one.</p>

                {matched.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    {matched.map((p) => (
                      <Link key={p.slug} href={`/packages/${p.slug}`}
                        className="group bg-white rounded-2xl border border-ink/8 overflow-hidden hover:shadow-soft-lg transition-all">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="50vw" />
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-ink/50 mb-1">{p.destinationName} · {p.travelType}</p>
                          <p className="font-display font-medium leading-tight line-clamp-2">{p.title}</p>
                          <div className="flex items-center justify-between mt-3">
                            <div>
                              <p className="text-[10px] text-ink/40">From</p>
                              <p className="font-display text-lg font-medium text-gold">₹{p.price.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-ink/50">
                              <Star className="h-3 w-3 fill-gold text-gold" />{p.rating}
                              <span className="mx-1">·</span>
                              <Clock className="h-3 w-3" />{p.duration}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-cream rounded-2xl p-8 border border-ink/5 text-center mb-8">
                    <p className="text-4xl mb-3">🧭</p>
                    <p className="font-display text-xl mb-2">No exact matches</p>
                    <p className="text-ink/60 text-sm mb-4">Our planners can build a custom itinerary just for you.</p>
                  </div>
                )}

                {/* Lead capture */}
                {!submitted ? (
                  <div className="bg-ink text-cream rounded-2xl p-6">
                    <p className="font-display text-lg font-medium mb-1">Get a personalised quote</p>
                    <p className="text-cream/50 text-sm mb-4">A planner will call you back within 2 hours.</p>
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                        className="w-full bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/40 text-sm rounded-xl px-4 py-3 outline-none focus:border-gold" />
                      <div className="grid grid-cols-2 gap-3">
                        <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 phone"
                          className="w-full bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/40 text-sm rounded-xl px-4 py-3 outline-none focus:border-gold" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)"
                          className="w-full bg-cream/10 border border-cream/20 text-cream placeholder:text-cream/40 text-sm rounded-xl px-4 py-3 outline-none focus:border-gold" />
                      </div>
                      <button type="submit" className="w-full bg-gold text-ink font-semibold py-3 rounded-xl hover:bg-gold/90 transition-colors text-sm flex items-center justify-center gap-2">
                        <ArrowRight className="h-4 w-4" />Get My Free Quote
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
                    <Check className="h-8 w-8 text-green-500 shrink-0" />
                    <div>
                      <p className="font-medium text-green-800">We've got your details!</p>
                      <p className="text-sm text-green-600">A planner will call you within 2 hours.</p>
                    </div>
                  </div>
                )}

                <button onClick={() => { setStep("destination"); setSel({ destination: "", style: "", duration: [0,99], budget: [0,9999999], month: "" }); }}
                  className="mt-4 text-sm text-ink/50 hover:text-ink transition-colors underline-offset-2 hover:underline">
                  Start over
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="mt-6 flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink transition-colors">
      <ArrowLeft className="h-4 w-4" />Back
    </button>
  );
}
