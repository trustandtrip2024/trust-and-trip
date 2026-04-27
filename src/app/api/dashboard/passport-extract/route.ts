// Passport scan → structured fields via Claude Sonnet 4.6 vision.
//
// Used by the booking flow / customer dashboard to auto-fill traveller
// details. Customer uploads a passport image, route returns
// { surname, givenName, passportNo, nationality, dob, expiryDate, sex }.
//
// Auth: SSR Supabase auth — must be signed in.
// Rate limit: 3 extractions / hour / IP (cheap protection).
//
// PII safety:
//   - Image is NOT persisted server-side. We only forward base64 to Anthropic.
//   - The structured response is returned to the caller — they store it on
//     bookings.travellers, not us.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { rateLimit, clientIp } from "@/lib/redis";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are an OCR + structured-extraction agent for Indian-issued passports (Republic of India). Read the image and return ONE JSON object only. Do NOT add commentary, markdown, or explanation.

Output schema (every field a string; empty string if not visible):
{
  "surname": string,
  "givenName": string,
  "passportNo": string,         // letter prefix + 7 digits, e.g. "M1234567"
  "nationality": string,        // ISO country name as printed
  "dob": string,                // ISO YYYY-MM-DD
  "sex": string,                // "M" | "F" | "X" | ""
  "placeOfBirth": string,
  "placeOfIssue": string,
  "issueDate": string,          // ISO YYYY-MM-DD
  "expiryDate": string,         // ISO YYYY-MM-DD
  "confidence": number          // 0-1; lower if image quality poor
}

Rules:
- If a field is unreadable, set "" and lower confidence.
- Convert dates from "12/03/1995" or "12 MAR 1995" formats to ISO.
- If you suspect this is not a passport (e.g. random photo), set every field to "" and confidence: 0.

Return JSON ONLY.`;

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: NextRequest) {
  // Auth.
  const cookieStore = cookies();
  const ssr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: () => undefined,
        remove: () => undefined,
      },
    }
  );
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  // Rate limit — vision calls are expensive.
  const { allowed } = await rateLimit(`passport:${clientIp(req)}`, {
    limit: 3,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many extractions. Try again in an hour." }, { status: 429 });
  }

  // Accept multipart/form-data with `file`, OR JSON with { dataUrl: "..." }.
  let mediaType = "";
  let base64 = "";

  const ct = req.headers.get("content-type") ?? "";
  try {
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof Blob)) throw new Error("file required");
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "max 10MB" }, { status: 413 });
      }
      mediaType = file.type;
      const buf = Buffer.from(await file.arrayBuffer());
      base64 = buf.toString("base64");
    } else {
      const body = await req.json();
      const dataUrl = String(body.dataUrl ?? "");
      const m = /^data:(image\/[^;]+);base64,(.+)$/.exec(dataUrl);
      if (!m) throw new Error("dataUrl required");
      mediaType = m[1];
      base64 = m[2];
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "bad_request" },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIME.has(mediaType)) {
    return NextResponse.json({ error: "unsupported image type" }, { status: 415 });
  }

  // Vision call.
  let extracted: Record<string, unknown>;
  try {
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: base64 },
            },
            { type: "text", text: "Extract the passport fields. JSON only." },
          ],
        },
      ],
    });
    const txt = res.content.find((b): b is Anthropic.Messages.TextBlock => b.type === "text");
    if (!txt) throw new Error("no text in vision response");
    const cleaned = txt.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    extracted = JSON.parse(cleaned);
  } catch (e) {
    console.error("[passport-extract] vision failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "vision failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, fields: extracted });
}
