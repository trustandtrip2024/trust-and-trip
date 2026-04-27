// Internal endpoint — exposes the WhatsApp intent parser via /admin/agents
// for QA/debugging. Auth handled by /api/admin/* middleware.

import { NextRequest, NextResponse } from "next/server";
import {
  parseWhatsAppIntent,
  isIntentComplete,
  toItineraryIntent,
  nextClarifyingQuestion,
} from "@/lib/whatsapp-intent";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { text?: string };
  const text = String(body.text ?? "").trim();
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  const parsed = await parseWhatsAppIntent(text);
  const complete = isIntentComplete(parsed);
  const intent = parsed ? toItineraryIntent(parsed) : null;
  const nextQuestion = parsed ? nextClarifyingQuestion(parsed) : null;

  return NextResponse.json({
    parsed,
    complete,
    intent,
    nextQuestion,
  });
}
