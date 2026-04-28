// GST-compliant tax invoice (Indian travel agency style).
//
// URL: /invoice/<bookingId>?t=<token>
//   token = HMAC(bookingId, INVOICE_SECRET) — issued by booking-confirmation
//   email so the customer can re-download anytime without auth.
//
// Browser-print → PDF for archival or for ops to attach to email.
// Status=verified bookings only.

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { invoiceToken } from "@/lib/invoice";

export const metadata = {
  title: "Tax invoice",
  description: "GST-compliant tax invoice for your Trust and Trip booking.",
  robots: { index: false, follow: false },
};
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

interface Booking {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  package_title: string | null;
  package_slug: string | null;
  package_price: number | null;
  deposit_amount: number | null;
  status: string | null;
  travel_date: string | null;
  num_travellers: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  discount_amount: number | null;
  coupon_code: string | null;
}

// Brand details — pulled from env so the same code works for staging/test
// portals without leaking real GST numbers.
const BRAND = {
  name:    "Trust and Trip Travel Pvt Ltd",
  address: process.env.INVOICE_BRAND_ADDRESS  ?? "R-607, Amrapali Princely, Sector 71, Noida 201301, Uttar Pradesh, India",
  gstin:   process.env.INVOICE_BRAND_GSTIN    ?? "—",
  pan:     process.env.INVOICE_BRAND_PAN      ?? "—",
  state:   process.env.INVOICE_BRAND_STATE    ?? "Uttar Pradesh",
  stateCode: process.env.INVOICE_BRAND_STATE_CODE ?? "09",
  email:   "hello@trustandtrip.com",
  phone:   "+91 8115 999 588",
  website: "trustandtrip.com",
};

// SAC 998555 = "Tour operator services" — standard for ITC.
const SAC_CODE = "998555";
// Tour operator services attract 5% GST without ITC. Adjust if your
// chartered-accountant directs differently.
const GST_RATE = 0.05;


function fmtINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function invoiceNumber(b: Booking): string {
  const dt = new Date(b.created_at);
  const yy = String(dt.getFullYear()).slice(-2);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `TT/${yy}${mm}/${b.id.slice(0, 8).toUpperCase()}`;
}

interface Props {
  params: { bookingId: string };
  searchParams?: { t?: string };
}

export default async function InvoicePage({ params, searchParams }: Props) {
  const { bookingId } = params;

  // Validate token unless caller has admin Basic Auth — the middleware
  // already protects /admin paths but invoice URLs are public for customers.
  const expectedToken = invoiceToken(bookingId);
  if ((searchParams?.t ?? "") !== expectedToken) {
    notFound();
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return notFound();
  }
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await sb
    .from("bookings")
    .select("id, created_at, customer_name, customer_email, customer_phone, package_title, package_slug, package_price, deposit_amount, status, travel_date, num_travellers, razorpay_order_id, razorpay_payment_id, discount_amount, coupon_code")
    .eq("id", bookingId)
    .single();

  if (error || !data) return notFound();
  const b = data as Booking;

  if (b.status !== "verified" && b.status !== "completed") {
    return (
      <div className="p-10 max-w-xl mx-auto text-center">
        <h1 className="text-xl font-semibold">Invoice not yet available</h1>
        <p className="mt-3 text-tat-slate">
          Tax invoice is generated after the deposit is verified by Razorpay.
          Current status: <strong>{b.status}</strong>.
        </p>
      </div>
    );
  }

  // Razorpay deposit is post-tax (the customer's payment includes GST).
  // Treat deposit_amount as the gross paid; back-calc the taxable + GST.
  const grossPaid = Number(b.deposit_amount ?? 0);
  const taxable = Math.round(grossPaid / (1 + GST_RATE) * 100) / 100;
  const gstTotal = Math.round((grossPaid - taxable) * 100) / 100;

  // Inter-state customers get IGST; same-state customers get CGST + SGST.
  // We default to IGST until we capture customer state on booking — most
  // customers are out-of-state for a Noida-based ops team.
  const isIntraState = false;
  const cgst = isIntraState ? gstTotal / 2 : 0;
  const sgst = isIntraState ? gstTotal / 2 : 0;
  const igst = isIntraState ? 0 : gstTotal;

  const dt = new Date(b.created_at);
  const dateLabel = dt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="bg-white text-tat-charcoal min-h-screen">
      {/* Print-only stylesheet keeps the on-screen UI clean while making
          the printed PDF look like a proper tax invoice. */}
      <style>{`
        @media print {
          @page { margin: 12mm; }
          .no-print { display: none !important; }
          body { background: white !important; }
        }
        body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
      `}</style>

      <div className="no-print bg-tat-charcoal text-white px-5 py-3 flex items-center justify-between">
        <p className="text-meta">
          Trust and Trip · Tax Invoice · <span className="font-mono">{invoiceNumber(b)}</span>
        </p>
        <PrintButton />
      </div>

      <div className="max-w-3xl mx-auto p-8 md:p-12 text-[13px]">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 border-b border-tat-charcoal/15 pb-6">
          <div>
            <h1 className="font-display text-display-md text-tat-charcoal leading-none">{BRAND.name}</h1>
            <p className="mt-2 text-tat-slate leading-relaxed max-w-md">{BRAND.address}</p>
            <p className="mt-2 text-tat-slate">
              GSTIN: <strong>{BRAND.gstin}</strong> · PAN: <strong>{BRAND.pan}</strong>
            </p>
            <p className="mt-1 text-tat-slate">
              {BRAND.email} · {BRAND.phone} · {BRAND.website}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-tag uppercase text-tat-slate">Tax Invoice</p>
            <p className="mt-1 font-mono text-tat-charcoal">{invoiceNumber(b)}</p>
            <p className="mt-1 text-tat-slate">{dateLabel}</p>
          </div>
        </header>

        {/* Bill-to */}
        <section className="mt-6 grid grid-cols-2 gap-6 pb-6 border-b border-tat-charcoal/15">
          <div>
            <p className="text-tag uppercase text-tat-slate">Bill to</p>
            <p className="mt-1 font-semibold text-tat-charcoal">{b.customer_name ?? "—"}</p>
            <p className="text-tat-slate">{b.customer_email ?? "—"}</p>
            <p className="text-tat-slate">{b.customer_phone ?? "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-tag uppercase text-tat-slate">Razorpay Payment ID</p>
            <p className="mt-1 font-mono text-[11px] break-all">{b.razorpay_payment_id ?? "—"}</p>
            <p className="mt-2 text-tag uppercase text-tat-slate">Order ID</p>
            <p className="mt-1 font-mono text-[11px] break-all">{b.razorpay_order_id ?? "—"}</p>
          </div>
        </section>

        {/* Line items */}
        <section className="mt-6">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-tat-charcoal/30 text-tag uppercase text-tat-slate">
                <th className="text-left py-2">Description</th>
                <th className="text-left py-2 w-24">SAC</th>
                <th className="text-right py-2 w-28">Qty</th>
                <th className="text-right py-2 w-32">Amount (incl. GST)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-tat-charcoal/12">
                <td className="py-3 align-top">
                  <p className="font-semibold text-tat-charcoal">{b.package_title ?? "Travel package"}</p>
                  <p className="mt-1 text-tat-slate text-meta">
                    {b.travel_date ? `Travel date: ${b.travel_date} · ` : ""}
                    {b.num_travellers ? `${b.num_travellers} traveller(s) · ` : ""}
                    Initial deposit (30% of package value)
                  </p>
                </td>
                <td className="py-3 align-top text-tat-charcoal">{SAC_CODE}</td>
                <td className="py-3 align-top text-right tabular-nums">1</td>
                <td className="py-3 align-top text-right tabular-nums">{fmtINR(grossPaid)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <section className="mt-2 ml-auto w-full max-w-sm text-[13px]">
          <table className="w-full">
            <tbody>
              <Row label="Taxable value"     value={fmtINR(taxable)} />
              {!isIntraState && <Row label={`IGST @ ${(GST_RATE * 100).toFixed(0)}%`} value={fmtINR(igst)} />}
              {isIntraState && <Row label={`CGST @ ${(GST_RATE * 50).toFixed(1)}%`} value={fmtINR(cgst)} />}
              {isIntraState && <Row label={`SGST @ ${(GST_RATE * 50).toFixed(1)}%`} value={fmtINR(sgst)} />}
              <tr className="border-t-2 border-tat-charcoal/40">
                <td className="py-2.5 font-semibold">Total paid</td>
                <td className="py-2.5 text-right tabular-nums font-semibold">{fmtINR(grossPaid)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Footer notes */}
        <footer className="mt-8 pt-6 border-t border-tat-charcoal/15 text-tat-slate text-[11.5px] leading-relaxed">
          <p>
            <strong className="text-tat-charcoal">Place of supply:</strong> Customer state ({BRAND.stateCode} ·{" "}
            {BRAND.state} for intra-state) · {isIntraState ? "CGST + SGST" : "IGST applied"}.
          </p>
          <p className="mt-2">
            <strong className="text-tat-charcoal">Note:</strong> Tour operator services attract GST @ 5% under
            SAC {SAC_CODE} as per Notification 11/2017-Central Tax (Rate). This invoice is issued
            electronically and is valid without a physical signature.
          </p>
          <p className="mt-2">
            Balance package value (70%) is payable per the agreement at the milestones communicated by
            your planner. A separate tax invoice will be issued upon receipt of each subsequent payment.
          </p>
        </footer>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-tat-charcoal/8">
      <td className="py-1.5 text-tat-slate">{label}</td>
      <td className="py-1.5 text-right tabular-nums">{value}</td>
    </tr>
  );
}

