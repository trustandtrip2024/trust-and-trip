// Shared invoice URL helper.
//
// Tokens are HMAC(bookingId, INVOICE_SECRET) — un-guessable by anyone who
// doesn't know the secret. Used so customers can re-download their invoice
// from a link in the booking-confirmation email without us building auth.

import crypto from "crypto";

export function invoiceToken(bookingId: string): string {
  const secret = process.env.INVOICE_SECRET ?? process.env.ADMIN_SECRET ?? "dev";
  return crypto.createHmac("sha256", secret).update(bookingId).digest("hex").slice(0, 32);
}

export function buildInvoiceUrl(bookingId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustandtrip.com";
  return `${base}/invoice/${bookingId}?t=${invoiceToken(bookingId)}`;
}
