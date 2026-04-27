import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildCartResumeUrl } from "@/lib/cart-resume";

// Runs hourly via Vercel Cron (see vercel.json).
//
// Sends up to 2 reminders per cart item:
//   - 24h after created_at  (primary nudge)
//   - 72h after created_at  (final reminder)
//
// Guards:
//   - Skip users who have any booking in verified/created state with matching
//     package_slug (they're mid-flow or completed).
//   - Stamp reminder_*_sent_at so we never double-fire.
//   - Only fires when RESEND_API_KEY is configured (safe no-op otherwise).
//
// Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET>.

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trustandtrip.com";
const WHATSAPP_URL = "https://wa.me/918115999588?text=Hi%20Trust%20and%20Trip!%20I'd%20love%20help%20finalising%20my%20booking.";

interface CartRow {
  id: string;
  user_id: string;
  package_slug: string;
  package_title: string | null;
  package_image: string | null;
  package_price: number | null;
  destination_name: string | null;
  duration: string | null;
  num_travelers: number | null;
  created_at: string;
  reminder_24h_sent_at: string | null;
  reminder_72h_sent_at: string | null;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const hr24 = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const hr72 = new Date(now - 72 * 60 * 60 * 1000).toISOString();
  const hr96 = new Date(now - 96 * 60 * 60 * 1000).toISOString(); // upper bound so stale carts don't get blasted forever

  // Pull candidates for both tiers in one query
  const { data: rows, error } = await admin
    .from("user_cart")
    .select("id, user_id, package_slug, package_title, package_image, package_price, destination_name, duration, num_travelers, created_at, reminder_24h_sent_at, reminder_72h_sent_at")
    .lte("created_at", hr24)
    .gte("created_at", hr96);

  if (error) {
    console.error("[cron:cart-abandonment] fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!rows?.length) {
    return NextResponse.json({ ok: true, candidates: 0, sent_24h: 0, sent_72h: 0 });
  }

  const carts = rows as CartRow[];

  // Group by user to send one email per user per tier (not one per cart item)
  const by24h = new Map<string, CartRow[]>();
  const by72h = new Map<string, CartRow[]>();
  for (const row of carts) {
    const age = now - new Date(row.created_at).getTime();
    if (!row.reminder_24h_sent_at && age >= 24 * 3600 * 1000) {
      const arr = by24h.get(row.user_id) ?? [];
      arr.push(row);
      by24h.set(row.user_id, arr);
    }
    if (!row.reminder_72h_sent_at && age >= 72 * 3600 * 1000) {
      const arr = by72h.get(row.user_id) ?? [];
      arr.push(row);
      by72h.set(row.user_id, arr);
    }
  }

  const userIds = Array.from(new Set([...by24h.keys(), ...by72h.keys()]));
  if (!userIds.length) {
    return NextResponse.json({ ok: true, candidates: carts.length, sent_24h: 0, sent_72h: 0 });
  }

  // Load user profiles
  const { data: { users: allUsers } } = await admin.auth.admin.listUsers();
  const userMap = new Map<string, { email: string; name: string; phone?: string }>();
  for (const u of allUsers ?? []) {
    if (userIds.includes(u.id) && u.email) {
      userMap.set(u.id, {
        email: u.email,
        name: (u.user_metadata?.full_name as string) || u.email.split("@")[0],
        phone: (u.user_metadata?.phone as string) || undefined,
      });
    }
  }

  // Exclude users whose carts map to existing bookings
  const allSlugs = Array.from(new Set(carts.map((c) => c.package_slug)));
  const userEmails = Array.from(userMap.values()).map((u) => u.email);
  let bookedPairs = new Set<string>(); // `${email}|${slug}`
  if (allSlugs.length && userEmails.length) {
    const { data: bookings } = await admin
      .from("bookings")
      .select("customer_email, package_slug, status")
      .in("customer_email", userEmails)
      .in("package_slug", allSlugs)
      .in("status", ["created", "verified", "pending"]);
    for (const b of bookings ?? []) {
      if (b.customer_email && b.package_slug) bookedPairs.add(`${b.customer_email}|${b.package_slug}`);
    }
  }

  const resendKey = process.env.RESEND_API_KEY;
  let Resend: typeof import("resend").Resend | null = null;
  let CartAbandonmentEmail: typeof import("@/lib/emails/cart-abandonment").CartAbandonmentEmail | null = null;
  if (resendKey) {
    try {
      Resend = (await import("resend")).Resend;
      CartAbandonmentEmail = (await import("@/lib/emails/cart-abandonment")).CartAbandonmentEmail;
    } catch (e) {
      console.error("[cron:cart-abandonment] resend import failed:", e);
    }
  }
  const resend = resendKey && Resend ? new Resend(resendKey) : null;
  const FROM = process.env.RESEND_FROM ?? "Trust and Trip <noreply@trustandtrip.com>";

  let sent24 = 0;
  let sent72 = 0;

  async function sendForTier(tier: "24h" | "72h", map: Map<string, CartRow[]>) {
    for (const [userId, items] of map) {
      const user = userMap.get(userId);
      if (!user) continue;

      const unbooked = items.filter((c) => !bookedPairs.has(`${user.email}|${c.package_slug}`));
      if (!unbooked.length) {
        // All items already booked — just stamp so we skip next cycle
        for (const it of items) {
          await admin
            .from("user_cart")
            .update({ [tier === "24h" ? "reminder_24h_sent_at" : "reminder_72h_sent_at"]: new Date().toISOString() })
            .eq("id", it.id);
        }
        continue;
      }

      if (resend && CartAbandonmentEmail) {
        try {
          await resend.emails.send({
            from: FROM,
            to: [user.email],
            subject: tier === "24h"
              ? `${user.name.split(" ")[0] || "You"}, you left a trip in your cart 🎒`
              : `Final reminder — your saved trip is still waiting`,
            react: CartAbandonmentEmail({
              name: user.name,
              items: unbooked.map((c) => ({
                packageTitle: c.package_title ?? "Your saved package",
                packageSlug: c.package_slug,
                packageImage: c.package_image ?? undefined,
                packagePrice: c.package_price ?? 0,
                destinationName: c.destination_name ?? undefined,
                duration: c.duration ?? undefined,
                numTravelers: c.num_travelers ?? undefined,
              })),
              tier,
              cartUrl: buildCartResumeUrl(userId),
              whatsappUrl: WHATSAPP_URL,
            }),
          });
          if (tier === "24h") sent24++;
          else sent72++;
        } catch (e) {
          console.error(`[cron:cart-abandonment] send ${tier} failed for ${user.email}:`, e);
          continue; // don't stamp on failure; we'll retry next run
        }
      }

      // Mirror to WhatsApp if we have a phone — open rate ~70% vs email ~20%.
      if (user.phone) {
        sendCartAbandonWhatsApp({
          phone: user.phone,
          name: user.name,
          items: unbooked,
          tier,
          userId,
        }).catch((e) =>
          console.error(`[cron:cart-abandonment] WA ${tier} failed for ${user.phone}:`, e)
        );
      }

      // Stamp all items for this user at this tier (whether email succeeded or we're in no-resend mode)
      for (const it of items) {
        await admin
          .from("user_cart")
          .update({ [tier === "24h" ? "reminder_24h_sent_at" : "reminder_72h_sent_at"]: new Date().toISOString() })
          .eq("id", it.id);
      }
    }
  }

  await sendForTier("24h", by24h);
  await sendForTier("72h", by72h);

  return NextResponse.json({
    ok: true,
    candidates: carts.length,
    users_touched: userIds.length,
    sent_24h: sent24,
    sent_72h: sent72,
    resend_configured: !!resend,
  });
}

// ─── WhatsApp mirror ──────────────────────────────────────────────────────

async function sendCartAbandonWhatsApp(opts: {
  phone: string;
  name: string;
  items: CartRow[];
  tier: "24h" | "72h";
  userId: string;
}): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return false;

  const digits = opts.phone.replace(/\D/g, "");
  if (!digits) return false;
  const to = digits.length === 10 ? `91${digits}` : digits;
  const firstName = opts.name.split(/\s+/)[0] || opts.name;

  const top = opts.items.slice(0, 3);
  const lines: string[] = [];
  if (opts.tier === "24h") {
    lines.push(`Hi ${firstName} 🎒 we held your saved trips for you.`);
  } else {
    lines.push(`Hi ${firstName} — last nudge before we release your saved trips.`);
  }
  lines.push("");
  for (const c of top) {
    const title = c.package_title ?? "Your saved package";
    const price = c.package_price ? `₹${c.package_price.toLocaleString("en-IN")}` : "";
    lines.push(`• ${title}${price ? ` · ${price}` : ""}`);
    lines.push(`  ${SITE_URL}/packages/${c.package_slug}`);
  }
  if (opts.items.length > top.length) {
    lines.push(`+ ${opts.items.length - top.length} more in your cart`);
  }
  lines.push("");
  lines.push(`Open your cart: ${buildCartResumeUrl(opts.userId)}`);
  lines.push("");
  lines.push("Reply with any change — we'll re-quote in minutes.");

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: lines.join("\n") },
        }),
      }
    );
    return res.ok;
  } catch (e) {
    console.error("[cart-abandon WA] send failed", e);
    return false;
  }
}
