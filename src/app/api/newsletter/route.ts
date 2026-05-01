import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { pushNewsletterSubscriber } from "@/lib/bitrix24";
import { rateLimit, clientIp } from "@/lib/redis";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COUPON_AMOUNT = 500;
const COUPON_MIN_ORDER = 25_000;
const COUPON_TTL_DAYS = 90;

function generateCouponCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "WELCOME";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

async function issueCoupon(email: string): Promise<{ code: string; expiresAt: Date } | null> {
  const expiresAt = new Date(Date.now() + COUPON_TTL_DAYS * 24 * 60 * 60 * 1000);

  for (let attempt = 0; attempt < 4; attempt++) {
    const code = generateCouponCode();
    const { error } = await supabase.from("coupons").insert({
      code,
      email,
      source: "newsletter",
      amount_off: COUPON_AMOUNT,
      min_order_value: COUPON_MIN_ORDER,
      expires_at: expiresAt.toISOString(),
    });
    if (!error) {
      await supabase
        .from("newsletter_subscribers")
        .update({ coupon_code: code })
        .eq("email", email);
      return { code, expiresAt };
    }
    if (error.code !== "23505") return null;
  }
  return null;
}

async function sendWelcomeEmail(email: string, code: string, expiresAt: Date) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const { Resend } = await import("resend");
    const { NewsletterWelcomeEmail } = await import("@/lib/emails/newsletter-welcome");

    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM = process.env.RESEND_FROM ?? "Trust and Trip <noreply@trustandtrip.com>";

    await resend.emails.send({
      from: FROM,
      to: [email],
      subject: `Your ₹${COUPON_AMOUNT} off code — welcome to Trust and Trip`,
      react: NewsletterWelcomeEmail({
        couponCode: code,
        amountOff: COUPON_AMOUNT,
        minOrder: COUPON_MIN_ORDER,
        expiresOn: expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      }),
    });
  } catch (e) {
    console.error("Newsletter welcome email error:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit per IP — newsletter signup fires Resend (cost), Bitrix
    // (rate-limited externally), and inserts a coupon row. Without a guard,
    // a single attacker can burn the daily Resend quota in a few minutes
    // and pollute the subscriber list with junk.
    const { allowed } = await rateLimit(`newsletter:${clientIp(req)}`, {
      limit: 5,
      windowSeconds: 3600,
    });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const cleaned = email.toLowerCase().trim();

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: cleaned });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, already: true });
      }
      return NextResponse.json({ error: "Failed to subscribe." }, { status: 500 });
    }

    const issued = await issueCoupon(cleaned);
    if (issued) {
      sendWelcomeEmail(cleaned, issued.code, issued.expiresAt).catch(() => {});
    }

    pushNewsletterSubscriber(cleaned).catch((e) =>
      console.error("Bitrix24 pushNewsletterSubscriber error:", e)
    );

    return NextResponse.json({
      success: true,
      coupon: issued ? { code: issued.code, amountOff: COUPON_AMOUNT, minOrder: COUPON_MIN_ORDER } : null,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
