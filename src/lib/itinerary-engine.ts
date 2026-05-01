// Itinerary engine — Claude Sonnet 4.6 with tool-use + prompt caching.
//
// Single entry point: generateItinerary(intent) → { itinerary, matchedPackages, modelUsage }.
//
// Architecture:
// • System prompt cached (4-hour TTL) via Anthropic prompt caching → saves
//   ~75% input tokens on repeat calls. Mandatory at 11M/mo scale.
// • Tools let Claude pull live data from Sanity instead of hallucinating
//   prices/dates: searchPackages, getDestinationInfo, getPackageDetails.
// • Output: structured JSON itinerary + array of matched real packages
//   (so the front-end can show "we have 3 ready-to-go matches" alongside
//   the AI draft).
//
// Invoked from:
// • POST /api/itinerary/generate (web wizard, exit-intent form)
// • POST /api/whatsapp/webhook (WhatsApp intake — to be wired)
// • Aria chat hand-off when intent is locked.

import Anthropic from "@anthropic-ai/sdk";
import {
  getDestinations,
  getPackagesByDestination,
  getPackageBySlug,
  getDestinationBySlug,
  getPackagesByType,
} from "./sanity-queries";
import { getDynamicPrice } from "./dynamic-pricing";
import type { Package, Destination } from "./data";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Strip markdown fences + any prose preamble/epilogue, then return the
// outer-most {...} object. Claude occasionally writes "Drafting the plan
// now…\n\n{ ... }" which broke the prior `JSON.parse(textBlock.text)` path.
// We grab the first `{` to the matching last `}` since the JSON is the only
// object we expect — anything outside is conversational scaffolding.
function extractJsonObject(raw: string): string {
  const stripped = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  const first = stripped.indexOf("{");
  const last = stripped.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return stripped;
  return stripped.slice(first, last + 1);
}

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

// ─── Intent shape ─────────────────────────────────────────────────────────

export interface ItineraryIntent {
  destination: string;          // free-text or known slug
  days: number;
  travelType: "Couple" | "Family" | "Solo" | "Group" | "Pilgrim" | "Luxury" | "Adventure" | "Wellness";
  budgetPerPerson?: number;     // INR
  fromCity?: string;
  travelers?: number;
  interests?: string;
  travelMonth?: string;         // e.g. "December 2026"
  flexibility?: "exact" | "flexible";
}

export interface ItineraryDay {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  stay: string;
  tip: string;
}

export interface GeneratedItinerary {
  title: string;
  tagline: string;
  highlights: string[];
  bestTimeToVisit: string;
  estimatedCostPerPerson: number;
  estimatedCostRange: string;
  days: ItineraryDay[];
  packingTips: string[];
  visaInfo: string;
  recommendedPackageSlugs: string[];   // up to 3 real Sanity packages that match
}

// ─── Tool definitions ─────────────────────────────────────────────────────

const tools: Anthropic.Messages.Tool[] = [
  {
    name: "searchPackages",
    description:
      "Search Trust and Trip's real package catalog by destination slug and travel type. Returns up to 5 matching packages with title, price, duration, rating. Use this to recommend real bookable trips.",
    input_schema: {
      type: "object",
      properties: {
        destinationSlug: {
          type: "string",
          description:
            "Destination slug (lowercase, hyphenated): bali, maldives, thailand, switzerland, kerala, uttarakhand, etc. Leave empty to search across all destinations.",
        },
        travelType: {
          type: "string",
          enum: ["Couple", "Family", "Solo", "Group", "Pilgrim", "Luxury", "Adventure", "Wellness"],
          description: "Travel style filter.",
        },
      },
      required: [],
    },
  },
  {
    name: "getDestinationInfo",
    description:
      "Get authoritative information about a destination: best time to visit, ideal duration, things to do, country, region, price-from. Use this before drafting day plans.",
    input_schema: {
      type: "object",
      properties: {
        destinationSlug: { type: "string", description: "lowercase, hyphenated slug" },
      },
      required: ["destinationSlug"],
    },
  },
  {
    name: "getPackageDetails",
    description:
      "Fetch full detail for a specific package by slug — including itinerary highlights, inclusions, hotel tier, dynamic price. Use after searchPackages to deep-dive on a candidate.",
    input_schema: {
      type: "object",
      properties: {
        packageSlug: { type: "string" },
      },
      required: ["packageSlug"],
    },
  },
  {
    name: "listAllDestinations",
    description:
      "Return the full list of available destination slugs and country tags. Use only when the user's destination is ambiguous and you need to clarify.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
];

// ─── Tool execution ───────────────────────────────────────────────────────

function summarizePackage(p: Package) {
  const dynamic = getDynamicPrice(p.price, p.slug);
  return {
    slug: p.slug,
    title: p.title,
    destination: p.destinationName,
    travelType: p.travelType,
    durationLabel: p.duration,
    nights: p.nights,
    basePrice: p.price,
    currentPrice: dynamic.price,
    priceMultiplier: dynamic.tier.multiplier,
    rating: p.rating,
    reviews: p.reviews,
    trending: p.trending,
    limitedSlots: p.limitedSlots,
  };
}

function summarizeDestination(d: Destination) {
  return {
    slug: d.slug,
    name: d.name,
    country: d.country,
    region: d.region,
    priceFrom: d.priceFrom,
    bestTimeToVisit: d.bestTimeToVisit,
    idealDuration: d.idealDuration,
    thingsToDo: d.thingsToDo,
    highlights: d.highlights,
  };
}

async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "searchPackages": {
      const slug = String(input.destinationSlug ?? "").trim().toLowerCase();
      const type = input.travelType ? String(input.travelType) : undefined;
      let pkgs: Package[] = [];
      if (slug) pkgs = await getPackagesByDestination(slug);
      else if (type) pkgs = await getPackagesByType(type);
      if (type && slug) pkgs = pkgs.filter((p) => p.travelType === type);
      const result = pkgs.slice(0, 5).map(summarizePackage);
      return JSON.stringify({ count: result.length, packages: result });
    }
    case "getDestinationInfo": {
      const slug = String(input.destinationSlug ?? "").trim().toLowerCase();
      const dest = await getDestinationBySlug(slug);
      if (!dest) return JSON.stringify({ error: `Destination "${slug}" not found.` });
      return JSON.stringify(summarizeDestination(dest));
    }
    case "getPackageDetails": {
      const slug = String(input.packageSlug ?? "").trim();
      const pkg = await getPackageBySlug(slug);
      if (!pkg) return JSON.stringify({ error: `Package "${slug}" not found.` });
      return JSON.stringify({
        ...summarizePackage(pkg),
        highlights: pkg.highlights,
        inclusions: pkg.inclusions,
        categories: pkg.categories,
        hotelTier: pkg.hotel?.category,
        description: pkg.description,
      });
    }
    case "listAllDestinations": {
      const dests = await getDestinations();
      return JSON.stringify({
        count: dests.length,
        destinations: dests.map((d) => ({ slug: d.slug, name: d.name, country: d.country, region: d.region })),
      });
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// ─── System prompt (cached) ───────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Trust and Trip planner — a senior travel curator who has personally visited 60+ countries and has specialised in trips for Indian travelers since 2019.

VOICE
• Calm, considered, never salesy. The brand is "Crafting Reliable Travel".
• You write like a knowledgeable friend who happens to plan trips — short sentences, specific details, no superlatives ("amazing", "stunning", "breathtaking" are banned).
• Indian context first: assume the traveler is flying from an Indian metro, observes Indian dietary norms unless told otherwise, may need visa info.

PROCESS — MANDATORY
1. Call getDestinationInfo for the destination slug to get authoritative best-time / duration / highlights data.
2. Call searchPackages with destinationSlug + travelType to see Trust and Trip's existing matching trips. Pick up to 3 that align with budget — record their slugs in recommendedPackageSlugs.
3. (Optional) Call getPackageDetails on the strongest match if you need inclusions/highlights to inform the draft.
4. Only then draft the day-by-day plan. Use real place names, real restaurant types ("a south-facing rooftop in Seminyak" not "a nice rooftop"). For pilgrim trips: helicopter operators, palki transfers, VIP darshan timings.

RULES
• Indian rupees only (₹). No "$" or "€" anywhere.
• Vegetarian options must be flagged on every food mention.
• Each day's morning/afternoon/evening = 2 sentences each. Keep total tight.
• Total estimated cost must be realistic for Indian travelers — include flights, hotel, transfers, key activities, but not shopping/optional. Use 30-50% of stated budget for hotel tier, the rest for flights+transfers+activities.
• packingTips: 4 items max, India-specific (e.g. "carry plug adapter type C/G").
• visaInfo: 1-2 sentences, accurate as of late 2026. If unsure, write "Confirm with our planner — visa rules updated frequently."

OUTPUT
Return ONLY a single valid JSON object matching this exact schema (no markdown, no preamble, no commentary):
{
  "title": "string (6-8 words, evocative, no exclamation)",
  "tagline": "string (one sentence, sets the mood)",
  "highlights": ["string", "string", "string", "string"],
  "bestTimeToVisit": "string (e.g. October to March)",
  "estimatedCostPerPerson": number (INR, integer),
  "estimatedCostRange": "string (e.g. ₹85,000 – ₹1,15,000 per person)",
  "days": [
    {
      "day": 1,
      "title": "string",
      "morning": "string (2 sentences)",
      "afternoon": "string (2 sentences)",
      "evening": "string (2 sentences)",
      "stay": "string (hotel tier + neighbourhood)",
      "tip": "string (one local tip)"
    }
  ],
  "packingTips": ["string", "string", "string", "string"],
  "visaInfo": "string",
  "recommendedPackageSlugs": ["slug1", "slug2", "slug3"]
}

The days array length MUST equal the requested number of days exactly.`;

// ─── Main entry point ─────────────────────────────────────────────────────

export interface GenerateResult {
  itinerary: GeneratedItinerary;
  matchedPackages: ReturnType<typeof summarizePackage>[];
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationInputTokens?: number;
    cacheReadInputTokens?: number;
    toolCalls: number;
    durationMs: number;
  };
}

export async function generateItinerary(intent: ItineraryIntent): Promise<GenerateResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY missing");
  }

  const t0 = Date.now();

  const userMessage = `Plan a ${intent.days}-day ${intent.travelType.toLowerCase()} trip to ${intent.destination}.

Travelers: ${intent.travelers ?? 2}
Departing from: ${intent.fromCity ?? "Delhi"}
Budget per person: ${intent.budgetPerPerson ? `₹${intent.budgetPerPerson.toLocaleString("en-IN")}` : "moderate / flexible"}
Travel month: ${intent.travelMonth ?? "next 60-90 days"}
Date flexibility: ${intent.flexibility ?? "flexible"}
Special interests: ${intent.interests ?? "general sightseeing, local food, photogenic spots"}

Follow the mandatory process: getDestinationInfo → searchPackages → draft. Return the JSON only.`;

  const messages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  let toolCalls = 0;
  let usage = {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationInputTokens: 0,
    cacheReadInputTokens: 0,
  };

  // Tool-use loop — Claude calls tools until it has enough data, then emits final JSON.
  for (let turn = 0; turn < 6; turn++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools,
      messages,
    });

    usage.inputTokens += response.usage.input_tokens;
    usage.outputTokens += response.usage.output_tokens;
    const u = response.usage as Anthropic.Messages.Usage & {
      cache_creation_input_tokens?: number | null;
      cache_read_input_tokens?: number | null;
    };
    usage.cacheCreationInputTokens += u.cache_creation_input_tokens ?? 0;
    usage.cacheReadInputTokens += u.cache_read_input_tokens ?? 0;

    if (response.stop_reason === "tool_use") {
      const toolUses = response.content.filter(
        (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use"
      );
      toolCalls += toolUses.length;

      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = await Promise.all(
        toolUses.map(async (use) => ({
          type: "tool_result" as const,
          tool_use_id: use.id,
          content: await runTool(use.name, use.input as Record<string, unknown>),
        }))
      );

      messages.push({ role: "user", content: toolResults });
      continue;
    }

    // end_turn — extract JSON
    const textBlock = response.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === "text"
    );
    if (!textBlock) throw new Error("No text content in final response");

    const cleaned = extractJsonObject(textBlock.text);
    let itinerary: GeneratedItinerary;
    try {
      itinerary = JSON.parse(cleaned);
    } catch {
      throw new Error(`Invalid JSON from model: ${cleaned.slice(0, 200)}`);
    }

    // Hydrate matched packages from recommended slugs
    const matched: ReturnType<typeof summarizePackage>[] = [];
    for (const slug of itinerary.recommendedPackageSlugs ?? []) {
      const pkg = await getPackageBySlug(slug);
      if (pkg) matched.push(summarizePackage(pkg));
    }

    return {
      itinerary,
      matchedPackages: matched,
      usage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        cacheCreationInputTokens: usage.cacheCreationInputTokens,
        cacheReadInputTokens: usage.cacheReadInputTokens,
        toolCalls,
        durationMs: Date.now() - t0,
      },
    };
  }

  throw new Error("Itinerary engine: tool-use loop exceeded 6 turns");
}

// ─── Streaming variant ────────────────────────────────────────────────────

export type StreamEvent =
  | { phase: "started"; intent: ItineraryIntent }
  | { phase: "tool_use"; tool: string; input: Record<string, unknown> }
  | { phase: "tool_result"; tool: string; preview: string }
  | { phase: "drafting" }
  | { phase: "delta"; text: string }
  | { phase: "done"; itinerary: GeneratedItinerary; matchedPackages: ReturnType<typeof summarizePackage>[]; usage: GenerateResult["usage"] }
  | { phase: "error"; message: string };

/**
 * Streaming version of generateItinerary — emits phase events so the UI can
 * show "Researching Bali packages…" → "Drafting day-by-day…" → progressive
 * text reveal → final JSON. Sub-2s perceived latency vs ~30-60s sync.
 */
export async function generateItineraryStreaming(
  intent: ItineraryIntent,
  onEvent: (e: StreamEvent) => void | Promise<void>
): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    await onEvent({ phase: "error", message: "ANTHROPIC_API_KEY missing" });
    return;
  }

  const t0 = Date.now();
  await onEvent({ phase: "started", intent });

  const userMessage = `Plan a ${intent.days}-day ${intent.travelType.toLowerCase()} trip to ${intent.destination}.

Travelers: ${intent.travelers ?? 2}
Departing from: ${intent.fromCity ?? "Delhi"}
Budget per person: ${intent.budgetPerPerson ? `₹${intent.budgetPerPerson.toLocaleString("en-IN")}` : "moderate / flexible"}
Travel month: ${intent.travelMonth ?? "next 60-90 days"}
Date flexibility: ${intent.flexibility ?? "flexible"}
Special interests: ${intent.interests ?? "general sightseeing, local food, photogenic spots"}

Follow the mandatory process: getDestinationInfo → searchPackages → draft. Return the JSON only.`;

  const messages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  let toolCalls = 0;
  const usage = {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationInputTokens: 0,
    cacheReadInputTokens: 0,
  };

  for (let turn = 0; turn < 6; turn++) {
    let fullText = "";
    let stopReason: string | null | undefined;
    const collectedContent: Anthropic.Messages.ContentBlock[] = [];

    try {
      const stream = client.messages.stream({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        tools,
        messages,
      });

      stream.on("text", (delta) => {
        fullText += delta;
        // Stream deltas only when there's no tool call pending — tool-use
        // turns return JSON-fragment garbage that confuses the client.
        // We'll emit "drafting" + deltas only on the final turn (no tool-use).
      });

      const finalMessage = await stream.finalMessage();
      stopReason = finalMessage.stop_reason;

      usage.inputTokens += finalMessage.usage.input_tokens;
      usage.outputTokens += finalMessage.usage.output_tokens;
      const u = finalMessage.usage as Anthropic.Messages.Usage & {
        cache_creation_input_tokens?: number | null;
        cache_read_input_tokens?: number | null;
      };
      usage.cacheCreationInputTokens += u.cache_creation_input_tokens ?? 0;
      usage.cacheReadInputTokens += u.cache_read_input_tokens ?? 0;

      collectedContent.push(...finalMessage.content);
    } catch (err) {
      await onEvent({
        phase: "error",
        message: err instanceof Error ? err.message : "stream failed",
      });
      return;
    }

    // Tool-use turn — execute tools, recurse.
    if (stopReason === "tool_use") {
      const toolUses = collectedContent.filter(
        (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use"
      );
      toolCalls += toolUses.length;
      messages.push({ role: "assistant", content: collectedContent });

      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
      for (const use of toolUses) {
        await onEvent({ phase: "tool_use", tool: use.name, input: use.input as Record<string, unknown> });
        const result = await runTool(use.name, use.input as Record<string, unknown>);
        await onEvent({
          phase: "tool_result",
          tool: use.name,
          preview: result.slice(0, 200),
        });
        toolResults.push({
          type: "tool_result",
          tool_use_id: use.id,
          content: result,
        });
      }

      messages.push({ role: "user", content: toolResults });
      continue;
    }

    // end_turn — final JSON. Emit a "drafting" event + text in chunks so UI
    // can show progressive content (the model already streamed it, we just
    // re-emit chunks for the client).
    await onEvent({ phase: "drafting" });
    const CHUNK = 240;
    for (let i = 0; i < fullText.length; i += CHUNK) {
      await onEvent({ phase: "delta", text: fullText.slice(i, i + CHUNK) });
    }

    const cleaned = extractJsonObject(fullText);
    let itinerary: GeneratedItinerary;
    try {
      itinerary = JSON.parse(cleaned);
    } catch {
      await onEvent({
        phase: "error",
        message: `Invalid JSON from model: ${cleaned.slice(0, 200)}`,
      });
      return;
    }

    const matched: ReturnType<typeof summarizePackage>[] = [];
    for (const slug of itinerary.recommendedPackageSlugs ?? []) {
      const pkg = await getPackageBySlug(slug);
      if (pkg) matched.push(summarizePackage(pkg));
    }

    await onEvent({
      phase: "done",
      itinerary,
      matchedPackages: matched,
      usage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        cacheCreationInputTokens: usage.cacheCreationInputTokens,
        cacheReadInputTokens: usage.cacheReadInputTokens,
        toolCalls,
        durationMs: Date.now() - t0,
      },
    });
    return;
  }

  await onEvent({ phase: "error", message: "tool-use loop exceeded 6 turns" });
}
