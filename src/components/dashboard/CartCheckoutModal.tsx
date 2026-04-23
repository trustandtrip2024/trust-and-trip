"use client";

import { useEffect, useState } from "react";
import { X, Loader2, ShieldCheck, CheckCircle2, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";

declare global {
  interface Window { Razorpay: any; }
}

interface Props {
  totalDeposit: number;
  itemCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function CartCheckoutModal({ totalDeposit, itemCount, onClose, onSuccess }: Props) {
  const { user } = useUserStore();
  const router = useRouter();
  const [name, setName] = useState(user?.user_metadata?.full_name ?? "");
  const [phone, setPhone] = useState(user?.user_metadata?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState<"form" | "paying" | "done">("form");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone number are required.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Payment gateway failed to load.");

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("Session expired. Please sign in again.");

      const res = await fetch("/api/payment/create-cart-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customer_name: name, customer_phone: phone, special_requests: notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create order.");

      setStage("paying");

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: "Trust and Trip",
        description: `Cart checkout — ${itemCount} ${itemCount === 1 ? "trip" : "trips"}`,
        image: "/favicon.ico",
        prefill: { name, email: user?.email ?? "", contact: phone },
        theme: { color: "#E8A94C" },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) throw new Error("Verification failed");

            setStage("done");
            onSuccess();
            setTimeout(() => {
              router.push(`/dashboard/bookings/${verifyData.booking_id}`);
            }, 1600);
          } catch (err) {
            setError("Payment captured but verification failed. Our team will contact you.");
            setStage("form");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setStage("form");
            setLoading(false);
          },
        },
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
      setStage("form");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-soft-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-ink/8">
          <div>
            <h2 className="font-display text-lg font-medium text-ink">Confirm & pay</h2>
            <p className="text-xs text-ink/55 mt-0.5">
              {itemCount} {itemCount === 1 ? "trip" : "trips"} · ₹{totalDeposit.toLocaleString("en-IN")} deposit
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading && stage !== "done"}
            aria-label="Close"
            className="h-8 w-8 rounded-full bg-ink/5 hover:bg-ink/10 flex items-center justify-center text-ink/60 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {stage === "done" ? (
            <div className="text-center py-8">
              <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-display text-lg font-medium text-ink mb-1">Payment confirmed</h3>
              <p className="text-sm text-ink/60">Redirecting to your bookings…</p>
            </div>
          ) : stage === "paying" ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-4" />
              <p className="text-sm text-ink/65">Opening secure payment window…</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink/65 mb-1.5">Full name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="As on ID"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink/65 mb-1.5">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink/65 mb-1.5">Notes <span className="text-ink/35">(optional)</span></label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dietary, accessibility, anniversary surprises…"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-ink/15 bg-cream text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition resize-none"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="bg-sand/30 rounded-xl p-3 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-ink/65 leading-relaxed">
                  You&apos;ll be charged <strong>₹{totalDeposit.toLocaleString("en-IN")}</strong> now as a 30% deposit. Balance due 14 days before departure. Refundable within 14 days of booking.
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-ink hover:bg-gold text-cream hover:text-ink py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Pay ₹{totalDeposit.toLocaleString("en-IN")} securely
              </button>
              <p className="text-center text-[10px] text-ink/40">Powered by Razorpay · UPI · Cards · Netbanking</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
