// Sanity → Next.js cache revalidator.

export const dynamic = "force-dynamic";
//
// Wire as a Sanity webhook (Sanity dashboard → API → Webhooks):
//   URL:     https://trustandtrip.com/api/revalidate
//   Method:  POST
//   Trigger: on create / update / delete for documents you care about
//   Filter:  _type in ["destination","package","homepageContent","blogPost","ugcPost","partnerLogo","pressQuote","category","tag","country","theme"]
//   Headers: Authorization: Bearer ${SANITY_REVALIDATE_SECRET}
//   Projection (Sanity body):
//     {
//       "_type": _type,
//       "_id": _id,
//       "slug": coalesce(slug.current, "")
//     }
//
// Without this, Sanity content edits show up only after the static cache
// expires (revalidate=30 on most pages → up to 30s lag plus next deploy).
// With this, edits are live within seconds.

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { cacheDel } from "@/lib/redis";

const SECRET = process.env.SANITY_REVALIDATE_SECRET;

interface SanityHookBody {
  _type?: string;
  _id?: string;
  slug?: string;
  // Sanity also sends `before` / `after` projections on edits, but we don't
  // need them for naive revalidation.
}

// Maps Sanity _type → array of (path | tag) pairs to revalidate.
//
// `tag:foo` → revalidateTag("foo") — for routes that opt into the cache tag.
// `path:/x` → revalidatePath("/x") — works without tag plumbing.
//
// Errs on the side of revalidating broadly: a few extra cache misses are
// cheap compared to stale content showing up to ad-driven traffic.
function targetsFor(type: string, slug?: string): string[] {
  switch (type) {
    case "destination":
      return [
        "path:/",
        "path:/destinations",
        slug ? `path:/destinations/${slug}` : null,
        "tag:destinations",
        "tag:homepage",
      ].filter(Boolean) as string[];

    case "package":
      return [
        "path:/",
        "path:/packages",
        slug ? `path:/packages/${slug}` : null,
        "tag:packages",
        "tag:homepage",
      ].filter(Boolean) as string[];

    case "homepageContent":
    case "homepage":
      return ["path:/", "tag:homepage"];

    case "blogPost":
    case "blog":
      return [
        "path:/blog",
        slug ? `path:/blog/${slug}` : null,
        "tag:blog",
      ].filter(Boolean) as string[];

    case "ugcPost":
      return ["path:/", "tag:homepage", "tag:ugc"];

    case "partnerLogo":
    case "pressQuote":
      return ["path:/", "tag:homepage", "tag:press"];

    case "category":
      // A category edit changes the category landing page + every package
      // page that lists category pills + the homepage shelf and the
      // /categories index. Revalidating /packages too is cheap insurance.
      return [
        "path:/",
        "path:/categories",
        slug ? `path:/categories/${slug}` : null,
        "path:/packages",
        "tag:packages",
        "tag:homepage",
        "tag:categories",
      ].filter(Boolean) as string[];

    case "tag":
      return [
        "path:/packages",
        "tag:packages",
        "tag:tags",
      ];

    case "country":
      // Country meta (visa, currency, timezone) flows into every
      // destination + package in that country. Revalidate broadly.
      return [
        "path:/",
        "path:/destinations",
        "path:/packages",
        "tag:destinations",
        "tag:packages",
      ];

    case "theme":
      // Editorial collections drive homepage shelves + their own landing.
      return [
        "path:/",
        slug ? `path:/themes/${slug}` : null,
        "tag:homepage",
        "tag:themes",
      ].filter(Boolean) as string[];

    default:
      // Unknown _type → revalidate homepage as a safe fallback.
      return ["path:/"];
  }
}

// Sanity-cache keys (the Redis cached() wrapper used by sanity-queries.ts).
// Mirrors the keys used in src/lib/sanity-queries.ts. If you add new
// cached() calls there, mirror the keys here.
function redisKeysFor(type: string): string[] {
  switch (type) {
    case "destination":
      return ["destinations", "all-destination-slugs", "homepage:content"];
    case "package":
      return [
        "packages",
        "all-package-slugs",
        "trending-packages",
        "featured-packages",
        "budget-packages",
        "newly-added-packages",
        "pilgrim-packages",
        "best-choice-packages",
        "offer-packages",
      ];
    case "homepageContent":
    case "homepage":
      return ["homepage:content"];
    case "blogPost":
    case "blog":
      return ["blog:posts", "blog:slugs", "blog:featured"];
    case "ugcPost":
      return ["ugc:posts"];
    case "partnerLogo":
      return ["partner:logos"];
    case "pressQuote":
      return ["press:featured"];
    case "category":
      return ["sanity:categories", "packages", "trending-packages", "featured-packages"];
    case "tag":
      return ["packages"];
    case "country":
      return ["destinations", "packages"];
    case "theme":
      return ["sanity:themes", "homepage:content"];
    default:
      return [];
  }
}

export async function POST(req: NextRequest) {
  // Auth — accept the secret via either Authorization: Bearer (preferred)
  // or ?token=<secret> query string. Apex → www redirects strip headers,
  // so the query param keeps Sanity webhooks working without forcing the
  // user to use the canonical host.
  if (SECRET) {
    const auth = req.headers.get("authorization");
    const queryToken = req.nextUrl.searchParams.get("token");
    const ok =
      auth === `Bearer ${SECRET}` ||
      queryToken === SECRET;
    if (!ok) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  let body: SanityHookBody;
  try {
    body = (await req.json()) as SanityHookBody;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const type = (body._type ?? "").trim();
  if (!type) {
    return NextResponse.json({ error: "missing _type" }, { status: 400 });
  }

  const slug = (body.slug ?? "").trim() || undefined;
  const targets = targetsFor(type, slug);
  const keys = redisKeysFor(type);

  // Revalidate Next.js cache.
  const revalidated: string[] = [];
  for (const t of targets) {
    try {
      if (t.startsWith("tag:"))      revalidateTag(t.slice(4));
      else if (t.startsWith("path:")) revalidatePath(t.slice(5));
      revalidated.push(t);
    } catch (e) {
      console.error(`[revalidate] failed ${t}`, e);
    }
  }

  // Bust Redis cache (sanity-queries.ts wraps every query in cached()).
  // Fire-and-forget so the 200 returns fast.
  void Promise.all(keys.map((k) => cacheDel(k).catch(() => undefined)));

  return NextResponse.json({
    ok: true,
    type,
    slug,
    revalidated,
    redis: keys,
  });
}

export async function GET() {
  // Health check — useful when first wiring the webhook.
  return NextResponse.json({ ok: true, hint: "POST a Sanity webhook here." });
}
