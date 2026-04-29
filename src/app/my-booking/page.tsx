"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Search, CheckCircle2, Clock, XCircle, AlertCircle, Package, CalendarDays, Users, IndianRupee, Phone, ArrowRight } from "lucide-react";
import { captureIntent } from "@/lib/capture-intent";

type Booking = {
  id: string;
  package_title: string;
  package_price: number;
  deposit_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  travel_date: string | null;
  num_travellers: number;
  status: "created" | "paid" | "verified" | "refunded" | "cancelled";
  created_at: string;
};

const STATUS_CONFIG = {
  created:   { icon: Clock,        color: "text-tat-gold",  bg: "bg-tat-warning-bg",  border: "border-tat-warning-fg/25", label: "Payment Pending",    desc: "Your booking was created. Complete payment to confirm." },
  paid:      { icon: CheckCircle2, color: "text-tat-info-fg",   bg: "bg-tat-info-bg",   border: "border-tat-info-fg/25",  label: "Payment Received",   desc: "We received your deposit! Our team is reviewing your booking." },
  verified:  { icon: CheckCircle2, color: "text-tat-success-fg",  bg: "bg-tat-success-bg",  border: "border-tat-success-fg/25", label: "Booking Confirmed",  desc: "Your trip is confirmed! Our planner will reach out within 24 hours." },
  refunded:  { icon: AlertCircle,  color: "text-tat-charcoal/60", bg: "bg-tat-cream-warm/30", border: "border-tat-cream-warm", label: "Refunded",           desc: "Your deposit has been refunded to the original payment method." },
  cancelled: { icon: XCircle,      color: "text-tat-danger-fg",    bg: "bg-tat-danger-bg",    border: "border-tat-danger-fg/25",   label: "Cancelled",          desc: "This booking has been cancelled. Contact us if you need help." },
};

function BookingCard({ b }: { b: Booking }) {
  const s = STATUS_CONFIG[b.status];
  const Icon = s.icon;
  const remaining = b.package_price - b.deposit_amount;
  return (
    <div className={`rounded-2xl border-2 ${s.border} ${s.bg} p-6 space-y-5`}>
      {/* Status badge */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-tat-charcoal/50 mb-1">Booking ID</p>
          <p className="font-mono text-sm text-tat-charcoal/70">{b.id.slice(0, 8).toUpperCase()}…</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${s.bg} border ${s.border}`}>
          <Icon className={`h-4 w-4 ${s.color}`} />
          <span className={`text-sm font-semibold ${s.color}`}>{s.label}</span>
        </div>
      </div>
      <p className="text-sm text-tat-charcoal/60">{s.desc}</p>

      {/* Package info */}
      <div className="border-t border-tat-charcoal/10 pt-4 space-y-3">
        <div className="flex items-start gap-2">
          <Package className="h-4 w-4 text-tat-gold mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-tat-charcoal/50">Package</p>
            <p className="font-medium text-tat-charcoal">{b.package_title}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {b.travel_date && (
            <div className="flex items-start gap-2">
              <CalendarDays className="h-4 w-4 text-tat-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-tat-charcoal/50">Travel Date</p>
                <p className="font-medium text-sm">{b.travel_date}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-tat-gold mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-tat-charcoal/50">Travellers</p>
              <p className="font-medium text-sm">{b.num_travellers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment summary */}
      <div className="border-t border-tat-charcoal/10 pt-4">
        <p className="text-xs text-tat-charcoal/50 mb-3 uppercase tracking-wider">Payment Summary</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-tat-charcoal/60">Package Price</span>
            <span className="font-medium">₹{b.package_price.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-tat-charcoal/60">Deposit Paid</span>
            <span className="font-semibold text-tat-success-fg">₹{b.deposit_amount.toLocaleString("en-IN")}</span>
          </div>
          {remaining > 0 && b.status !== "cancelled" && b.status !== "refunded" && (
            <div className="flex justify-between pt-2 border-t border-tat-charcoal/10">
              <span className="text-tat-charcoal/60">Balance Due</span>
              <span className="font-semibold text-tat-warning-fg">₹{remaining.toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      {(b.status === "verified" || b.status === "paid") && (
        <a
          href={`https://wa.me/918115999588?text=${encodeURIComponent(`Hi! I'd like to discuss my booking (ID: ${b.id.slice(0, 8).toUpperCase()}) for ${b.package_title}. Customer: ${b.customer_name}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => captureIntent("whatsapp_click", {
            package_title: b.package_title,
            note: `My-booking status page — Talk to Your Planner (booking ${b.id.slice(0, 8).toUpperCase()})`,
          })}
          className="flex items-center justify-center gap-2 w-full btn-primary !py-3"
        >
          <Phone className="h-4 w-4" />
          Talk to Your Planner
          <ArrowRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

function MyBookingInner() {
  const params = useSearchParams();
  const [mode, setMode] = useState<"id" | "phone">(params.get("id") ? "id" : "phone");
  const [input, setInput] = useState(params.get("id") ?? "");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.get("id")) lookup(params.get("id")!, "id");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const lookup = async (val: string, m: "id" | "phone") => {
    setLoading(true); setError(""); setBookings([]);
    const res = await fetch(`/api/booking-status?${m === "id" ? "id" : "phone"}=${encodeURIComponent(val.trim())}`);
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Something went wrong.");
    else setBookings(data.bookings);
    setLoading(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    lookup(input, mode);
  };

  return (
    <div className="min-h-screen bg-tat-paper pt-24 pb-20">
      <div className="container-custom max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="eyebrow">Booking Status</span>
          <h1 className="mt-3 font-display text-display-md font-medium leading-tight">
            Track your <span className="italic text-tat-gold font-light">booking</span>
          </h1>
          <p className="mt-3 text-tat-charcoal/60 text-sm leading-relaxed">
            Enter your booking ID (from your WhatsApp confirmation) or your phone number.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={submit} className="bg-white rounded-2xl border border-tat-charcoal/10 p-6 shadow-sm mb-6">
          {/* Toggle */}
          <div className="flex gap-2 mb-5">
            {(["id", "phone"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setInput(""); setBookings([]); setError(""); }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${mode === m ? "bg-tat-charcoal text-tat-paper" : "bg-tat-charcoal/5 text-tat-charcoal/60 hover:bg-tat-charcoal/10"}`}
              >
                {m === "id" ? "Booking ID" : "Phone Number"}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type={mode === "phone" ? "tel" : "text"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "id" ? "e.g. 3f2a1b9c-..." : "e.g. 9876543210"}
              className="w-full border border-tat-charcoal/15 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-tat-gold transition-colors"
              required
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-tat-charcoal/30" />
          </div>

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-full btn-primary justify-center mt-4 disabled:opacity-50"
          >
            {loading ? "Looking up…" : "Find Booking"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-tat-danger-bg border border-tat-danger-fg/25 text-tat-danger-fg text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {bookings.map((b) => <BookingCard key={b.id} b={b} />)}
        </div>

        {/* Help */}
        <p className="text-center text-sm text-tat-charcoal/50 mt-8">
          Can't find your booking?{" "}
          <a
            href="https://wa.me/918115999588"
            onClick={() => captureIntent("whatsapp_click", { note: "My-booking — Can't find your booking" })}
            className="text-tat-gold hover:underline"
          >WhatsApp us</a>{" "}
          or call{" "}
          <a
            href="tel:+918115999588"
            onClick={() => captureIntent("call_click", { note: "My-booking — Can't find your booking" })}
            className="text-tat-gold hover:underline"
          >+91 8115 999 588</a>
        </p>
      </div>
    </div>
  );
}

export default function MyBookingPage() {
  return (
    <Suspense>
      <MyBookingInner />
    </Suspense>
  );
}
