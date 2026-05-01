import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { getPackageBySlug } from "@/lib/sanity-queries";
import { BrochurePDF } from "@/lib/brochure-pdf";
import { rateLimit, clientIp } from "@/lib/redis";

export const runtime = "nodejs";
// 1 hour Vercel CDN cache, 1 day stale-while-revalidate. Brochures change
// only when Sanity content changes, and renderToStream is heavy enough
// that caching meaningfully cuts cold-start cost on repeat downloads.
export const revalidate = 3600;

interface Params {
  params: { slug: string };
}

/**
 * Server-rendered PDF brochure for a package. GET /api/brochure/{slug}
 * returns a downloadable application/pdf with the full trip details:
 * cover, day-by-day, inclusions, hotels, contact info.
 *
 * Renders via @react-pdf/renderer (Node runtime — needs server APIs the
 * edge runtime doesn't ship). renderToStream returns a Node Readable
 * which we wrap in a Web ReadableStream for the NextResponse.
 */
export async function GET(req: NextRequest, { params }: Params) {
  // PDF rendering is heavy (renderToStream allocates fonts/images per call).
  // Without a limit, anyone can spin a tab loop and force the function to
  // burn CPU/memory until it OOMs. 10/min/IP is generous for a real human
  // downloading a brochure and tight enough to keep cost bounded.
  const { allowed } = await rateLimit(`brochure:${clientIp(req)}`, {
    limit: 10,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const slug = decodeURIComponent(params.slug);
  const pkg = await getPackageBySlug(slug);
  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  // If an authored PDF was uploaded in Sanity (`brochureFile`), prefer it
  // over the live-rendered version. Sanity's CDN respects `?dl=name` to
  // force an attachment download with the given filename.
  if (pkg.brochureFile) {
    const filename = `${pkg.slug}-trust-and-trip.pdf`.replace(/[^a-z0-9.\-]+/gi, "-");
    const target = `${pkg.brochureFile}?dl=${encodeURIComponent(filename)}`;
    return NextResponse.redirect(target, { status: 302 });
  }

  let nodeStream: NodeJS.ReadableStream;
  try {
    nodeStream = await renderToStream(BrochurePDF({ pkg }));
  } catch (err) {
    console.error("[brochure] render failed:", err);
    return NextResponse.json({ error: "Could not render brochure" }, { status: 500 });
  }

  const filename = `${pkg.slug}-trust-and-trip.pdf`.replace(/[^a-z0-9.\-]+/gi, "-");

  // Bridge Node Readable -> Web ReadableStream so NextResponse can pipe it
  // directly without buffering the full PDF in memory.
  const webStream = new ReadableStream<Uint8Array>({
    start(controller) {
      nodeStream.on("data", (chunk: Buffer | string) => {
        controller.enqueue(typeof chunk === "string" ? new TextEncoder().encode(chunk) : new Uint8Array(chunk));
      });
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err) => controller.error(err));
    },
    cancel() {
      // best-effort cleanup if the client disconnects mid-download
      (nodeStream as NodeJS.ReadableStream & { destroy?: () => void }).destroy?.();
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
