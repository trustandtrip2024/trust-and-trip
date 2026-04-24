import { NextResponse } from "next/server";
import { getRates } from "@/lib/currency";

export const revalidate = 86400; // 24h

export async function GET() {
  const rates = await getRates();
  return NextResponse.json({ rates }, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
