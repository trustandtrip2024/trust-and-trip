// Shared helper used by both /api/payment/verify and /api/payment/webhook.
// Fire-and-forget — never blocks the primary flow. Skips silently if Resend
// is not configured.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustandtrip.com";
const WHATSAPP_URL = "https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I%20have%20a%20question%20about%20my%20booking.";

interface BookingShape {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  package_title: string | null;
  package_price: number | null;
  num_travellers: number | null;
  deposit_amount: number | null;
  travel_date: string | null;
  razorpay_payment_id?: string | null;
}

export async function sendBookingConfirmationEmail(b: BookingShape) {
  if (!process.env.RESEND_API_KEY) return;
  if (!b.customer_email?.trim()) return;
  try {
    const { Resend } = await import("resend");
    const { BookingConfirmationEmail } = await import("./booking-confirmation");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM = process.env.RESEND_FROM ?? "Trust and Trip <noreply@trustandtrip.com>";

    await resend.emails.send({
      from: FROM,
      to: [b.customer_email],
      subject: `Booking confirmed: ${b.package_title ?? "your trip"} — Trust and Trip`,
      react: BookingConfirmationEmail({
        name: b.customer_name ?? "Traveller",
        bookingId: b.id,
        packageTitle: b.package_title ?? "Your package",
        packagePrice: b.package_price ?? 0,
        numTravellers: b.num_travellers ?? 1,
        depositAmount: b.deposit_amount ?? 0,
        travelDate: b.travel_date ?? null,
        paymentId: b.razorpay_payment_id ?? null,
        bookingUrl: `${SITE_URL}/dashboard/bookings/${b.id}`,
        receiptUrl: `${SITE_URL}/dashboard/bookings/${b.id}/receipt`,
        whatsappUrl: WHATSAPP_URL,
      }),
    });
  } catch (e) {
    console.error("[booking-confirmation email] send failed:", e);
  }
}
