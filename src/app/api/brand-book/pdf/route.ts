import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { BrandBookPDF } from "@/lib/brand-book-pdf";
import { rateLimit, clientIp } from "@/lib/redis";

export const runtime = "nodejs";
// Brand book content is static between releases. 1-day CDN cache, 1-week
// stale-while-revalidate so the PDF is served instantly for repeat visits
// while still refreshing soon after the source file changes.
export const revalidate = 86400;

/**
 * GET /api/brand-book/pdf — server-rendered Trust and Trip brand book.
 * 7 pages: cover, essence, color, typography, voice, channels, campaigns,
 * asset inventory. Hand-off doc for designers, agencies, and partners.
 */
export async function GET(req: NextRequest) {
  const { allowed } = await rateLimit(`brand-book:${clientIp(req)}`, {
    limit: 10,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let nodeStream: NodeJS.ReadableStream;
  try {
    nodeStream = await renderToStream(BrandBookPDF());
  } catch (err) {
    console.error("[brand-book] render failed:", err);
    return NextResponse.json({ error: "Could not render brand book" }, { status: 500 });
  }

  const webStream = new ReadableStream<Uint8Array>({
    start(controller) {
      nodeStream.on("data", (chunk: Buffer | string) => {
        controller.enqueue(typeof chunk === "string" ? new TextEncoder().encode(chunk) : new Uint8Array(chunk));
      });
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err) => controller.error(err));
    },
    cancel() {
      (nodeStream as NodeJS.ReadableStream & { destroy?: () => void }).destroy?.();
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="trust-and-trip-brand-book-v1.pdf"`,
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
