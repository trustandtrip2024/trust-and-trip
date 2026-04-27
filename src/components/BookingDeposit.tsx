"use client";

import { useState } from "react";
import { Shield, CreditCard, CheckCircle2, Loader2, X, IndianRupee, Tag } from "lucide-react";
import { pixel } from "@/components/MetaPixel";

interface Props {
  packageSlug: string;
  packageTitle: string;
  packagePrice: number;
}

declare global {
  interface Window { Razorpay: any; }
}

export default function BookingDeposit({ packageSlug, packageTitle, packagePrice }: Props) {
  const depositAmount = Math.max(5000, Math.round((packagePrice * 0.30) / 100) * 100);
  const depositDisplay = `₹${depositAmount.toLocaleString("en-IN")}`;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    travel_date: "",
    num_travellers: "2",
    special_requests: "",
    coupon_code: "",
  });
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; amount_off: number } | null>(null);

  const loadRazorpay = () => new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const loaded = await loadRazorpay();
    if (!loaded) { setError("Payment gateway failed to load."); setLoading(false); return; }

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, package_slug: packageSlug, package_title: packageTitle, package_price: packagePrice }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to initiate payment."); setLoading(false); return; }

      if (data.coupon) setAppliedCoupon(data.coupon);
      pixel.initiateCheckout(packageTitle, depositAmount);

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: "Trust and Trip",
        description: `Booking deposit — ${packageTitle}`,
        image: "/favicon.ico",
        prefill: {
          name: form.customer_name,
          email: form.customer_email,
          contact: form.customer_phone,
        },
        theme: { color: "#E8A94C" },
        handler: async (response: any) => {
          const verify = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verify.ok) {
            pixel.purchase(packageTitle, depositAmount);
            setSuccess(true); setOpen(false);
          }
          else setError("Payment received but verification failed. Please contact us.");
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
        <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
        <div>
          <p className="font-medium text-green-800">Deposit paid! Booking confirmed.</p>
          <p className="text-sm text-green-600 mt-0.5">Our team will reach out within 2 hours to confirm your trip details.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-tat-charcoal/5 hover:bg-tat-charcoal text-tat-charcoal hover:text-tat-paper border border-tat-charcoal/15 font-medium py-3 rounded-xl transition-all duration-200 text-sm group"
      >
        <CreditCard className="h-4 w-4" />
        Pay {depositDisplay} Deposit to Confirm Slot
      </button>
      <p className="text-center text-[11px] text-tat-charcoal/40 mt-1.5">100% refundable · No hidden charges</p>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[90] bg-tat-charcoal/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-tat-charcoal/8">
              <div>
                <h3 className="font-display text-lg font-medium">Secure your slot</h3>
                <p className="text-xs text-tat-charcoal/50 mt-0.5">Pay {depositDisplay} deposit · Balance due later</p>
              </div>
              <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-full bg-tat-charcoal/5 flex items-center justify-center hover:bg-tat-charcoal/10 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Package summary */}
            <div className="px-5 py-4 bg-tat-gold/8 border-b border-tat-gold/15">
              <p className="text-xs text-tat-charcoal/50 uppercase tracking-wider">Booking for</p>
              <p className="font-medium text-tat-charcoal mt-0.5">{packageTitle}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-tat-charcoal/50">Package price</span>
                <span className="text-sm font-medium">₹{packagePrice.toLocaleString("en-IN")}/person</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-tat-gold font-medium">Deposit now</span>
                <span className="text-sm font-semibold text-tat-gold">{depositDisplay}</span>
              </div>
            </div>

            <form onSubmit={handlePay} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-tat-charcoal/50 block mb-1">Full Name *</label>
                  <input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    placeholder="Rahul Mehta" className="input-travel text-sm" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-tat-charcoal/50 block mb-1">Phone *</label>
                  <input required type="tel" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                    placeholder="+91 98765 43210" className="input-travel text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-tat-charcoal/50 block mb-1">Email *</label>
                <input required type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  placeholder="you@example.com" className="input-travel text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-tat-charcoal/50 block mb-1">Travel Date</label>
                  <input value={form.travel_date} onChange={(e) => setForm({ ...form, travel_date: e.target.value })}
                    placeholder="e.g. June 2026" className="input-travel text-sm" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-tat-charcoal/50 block mb-1">Travellers</label>
                  <input type="number" min="1" max="20" value={form.num_travellers}
                    onChange={(e) => setForm({ ...form, num_travellers: e.target.value })} className="input-travel text-sm" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-tat-charcoal/50 block mb-1 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Coupon code (optional)
                </label>
                <input
                  value={form.coupon_code}
                  onChange={(e) => {
                    setForm({ ...form, coupon_code: e.target.value.toUpperCase() });
                    setAppliedCoupon(null);
                  }}
                  placeholder="WELCOME12AB34"
                  className="input-travel text-sm uppercase tracking-wider"
                />
                {appliedCoupon && (
                  <p className="mt-1 text-[11px] text-green-700 font-medium">
                    ✓ {appliedCoupon.code} applied — ₹{appliedCoupon.amount_off.toLocaleString("en-IN")} off
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-tat-gold text-tat-charcoal font-semibold py-3.5 rounded-xl hover:bg-tat-gold/90 transition-colors text-sm disabled:opacity-70">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Processing…</> : <><IndianRupee className="h-4 w-4" />Pay {depositDisplay} Deposit</>}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-tat-charcoal/40">
                <Shield className="h-3 w-3 text-green-500" />
                Secured by Razorpay · 256-bit SSL encryption
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
