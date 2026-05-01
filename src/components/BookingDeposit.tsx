"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Shield, CreditCard, CheckCircle2, Loader2, X, IndianRupee, Tag, Calendar, Users } from "lucide-react";
import { pixel } from "@/components/MetaPixel";
import { analytics } from "@/lib/analytics";

interface Props {
  packageSlug: string;
  packageTitle: string;
  packagePrice: number;
}

declare global {
  interface Window { Razorpay: any; }
}

// Earliest selectable travel date — tomorrow (YYYY-MM-DD).
function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function BookingDeposit({ packageSlug, packageTitle, packagePrice }: Props) {
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

  // Deposit = 30% of (per-person price × travellers), floored at ₹5,000,
  // rounded to the nearest ₹100. Reactive to the traveller count so the
  // modal headline always matches the amount that gets charged.
  const numTravellers = Math.max(1, Math.min(20, Number(form.num_travellers) || 1));
  const tripTotal = packagePrice * numTravellers;
  const depositAmount = useMemo(
    () => Math.max(5000, Math.round((tripTotal * 0.30) / 100) * 100),
    [tripTotal],
  );
  const depositDisplay = `₹${depositAmount.toLocaleString("en-IN")}`;
  const tripTotalDisplay = `₹${tripTotal.toLocaleString("en-IN")}`;
  const minDate = useMemo(() => tomorrowIso(), []);

  // Auto-open when the package detail page is loaded with ?book=1.
  // Powers the "Quick Book" affordance on every PackageCard across the site
  // (cards link to /packages/{slug}?book=1 so deposit modal pops on landing).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("book") === "1") {
      setOpen(true);
      // Strip the param so a refresh doesn't re-open and back-nav stays clean.
      params.delete("book");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", next);
    }
  }, []);

  // Lock body scroll while modal is open so the package detail page
  // underneath doesn't bleed through on touch devices, and bind ESC.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const loadRazorpay = () => new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    // Stamp the per-request CSP nonce from <meta property="csp-nonce">
    // (set in app/layout.tsx). Required when the CSP uses 'strict-dynamic'
    // — without it the Razorpay script is blocked.
    const nonceMeta = document.querySelector<HTMLMetaElement>('meta[property="csp-nonce"]');
    if (nonceMeta?.content) s.setAttribute("nonce", nonceMeta.content);
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
      // Pass Razorpay order_id as eventId so the server-side CAPI
      // InitiateCheckout (which uses the same order_id) deduplicates.
      pixel.initiateCheckout(packageTitle, depositAmount, data.order_id);
      analytics.beginCheckout(packageTitle, packageSlug, depositAmount);

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
            // Pass Razorpay order_id as eventId — matches the CAPI Purchase
            // event in /api/payment/verify so Meta deduplicates the two.
            pixel.purchase(packageTitle, depositAmount, data.order_id);
            analytics.purchase(packageTitle, packageSlug, depositAmount, data.order_id);
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
      <div className="bg-tat-success-bg border border-tat-success-fg/25 rounded-2xl p-5 flex items-center gap-4">
        <CheckCircle2 className="h-8 w-8 text-tat-success-fg shrink-0" />
        <div>
          <p className="font-medium text-tat-success-fg">Deposit paid! Booking confirmed.</p>
          <p className="text-sm text-tat-success-fg mt-0.5">Our team will reach out within 2 hours to confirm your trip details.</p>
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

      {/* Modal — portalled to document.body so no ancestor stacking
          context (transform/will-change/contain on a parent, e.g. the
          sticky BookingAside or any future motion.* wrapper) can trap
          the fixed positioning and confine the modal to the sidebar.
          z-[200] sits above every floating widget on the detail page
          (FloatingWhatsApp, AriaChat, MobileBottomNav, sticky bars).
          Body scroll is locked via the effect above; max-h ensures the
          form is scrollable on small viewports without the page bleeding
          underneath. */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quick book this package"
          className="fixed inset-0 z-[200] bg-tat-charcoal/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-auto max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
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

            {/* Package summary — recalculates trip total + 30% deposit
                whenever the traveller count changes. */}
            <div className="px-5 py-4 bg-tat-gold/8 border-b border-tat-gold/15">
              <p className="text-xs text-tat-charcoal/50 uppercase tracking-wider">Booking for</p>
              <p className="font-medium text-tat-charcoal mt-0.5">{packageTitle}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-tat-charcoal/50">Package price</span>
                <span className="text-sm font-medium">₹{packagePrice.toLocaleString("en-IN")}/person</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-tat-charcoal/50">{numTravellers} traveller{numTravellers === 1 ? "" : "s"}</span>
                <span className="text-sm font-medium">{tripTotalDisplay} trip total</span>
              </div>
              <div className="flex items-center justify-between mt-1 pt-2 border-t border-tat-gold/20">
                <span className="text-xs text-tat-gold font-medium">30% deposit now</span>
                <span className="text-sm font-semibold text-tat-gold">{depositDisplay}</span>
              </div>
            </div>

            <form onSubmit={handlePay} className="p-5 space-y-3 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-tat-charcoal/50 block mb-1">Full Name *</label>
                  <input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    placeholder="Rahul Mehta" className="input-travel text-sm" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-tat-charcoal/50 block mb-1">Phone *</label>
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    pattern="[0-9+\-\s]{10,15}"
                    title="Enter a valid phone number (10–15 digits, may include + and spaces)."
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="input-travel text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-tat-charcoal/50 block mb-1">Email *</label>
                <input required type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  placeholder="you@example.com" className="input-travel text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-tat-charcoal/50 mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Travel Date *
                  </label>
                  <input
                    required
                    type="date"
                    min={minDate}
                    value={form.travel_date}
                    onChange={(e) => setForm({ ...form, travel_date: e.target.value })}
                    className="input-travel text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-tat-charcoal/50 mb-1 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Travellers *
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    value={form.num_travellers}
                    onChange={(e) => setForm({ ...form, num_travellers: e.target.value })}
                    className="input-travel text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-tat-charcoal/50 block mb-1">Special requests (optional)</label>
                <textarea
                  rows={2}
                  value={form.special_requests}
                  onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
                  placeholder="Anything we should know? Diet, mobility, anniversary, etc."
                  className="input-travel text-sm resize-none"
                />
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
                  <p className="mt-1 text-[11px] text-tat-success-fg font-medium">
                    ✓ {appliedCoupon.code} applied — ₹{appliedCoupon.amount_off.toLocaleString("en-IN")} off
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-tat-danger-fg bg-tat-danger-bg rounded-xl px-3 py-2">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-tat-gold text-tat-charcoal font-semibold py-3.5 rounded-xl hover:bg-tat-gold/90 transition-colors text-sm disabled:opacity-70">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Processing…</> : <><IndianRupee className="h-4 w-4" />Pay {depositDisplay} Deposit</>}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-tat-charcoal/40">
                <Shield className="h-3 w-3 text-tat-success-fg" />
                Secured by Razorpay · 256-bit SSL encryption
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
