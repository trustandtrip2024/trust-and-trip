#!/usr/bin/env node
// Seed / replace the homepageContent singleton in Sanity production.
//
// Run once after the schema lands. Re-runnable — uses createOrReplace,
// so it always writes the canonical document at _id = "homepageContent",
// the singleton ID enforced by structure.ts. Editors can then tweak copy
// in Studio without touching code.
//
// Usage:  node scripts/seed-homepage.mjs
//
// Reads SANITY_API_WRITE_TOKEN from .env.local. The token must have
// "Editor" or "Administrator" scope on project ncxbf32w.

import fs from "node:fs";
import path from "node:path";

const ENV_PATH = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(ENV_PATH)) {
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let [, k, v] = m;
    v = v.trim().replace(/^"|"$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_API_PROJECT_ID || "ncxbf32w";
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    || process.env.SANITY_API_DATASET    || "production";
const TOKEN      = process.env.SANITY_API_WRITE_TOKEN;

if (!TOKEN) {
  console.error("Missing SANITY_API_WRITE_TOKEN — set it in .env.local first.");
  process.exit(1);
}

const homepageContent = {
  _id: "homepageContent",
  _type: "homepageContent",
  hero: {
    eyebrow: "Trust and Trip · Crafting Reliable Travel",
    titleStart: "Trips that feel",
    titleItalic: "made just for you.",
    lede: "A real planner. An itinerary in 24 hours. Free until you're sure.",
    searchPlaceholder: "Where to? Try \"Bali\"…",
    ctaLabel: "Plan my trip — free",
    trustStrip: "143+ trips planned this week · 4.9★ from 8,000+ travelers · 60+ destinations",
  },
  recentlyCrafted: {
    eyebrow: "Recently crafted",
    titleStart: "Real trips,",
    titleItalic: "fresh from the planner.",
    lede: "Itineraries we sent in the last 14 days. Real customers, real prices, real package routes.",
  },
  byHowYouTravel: {
    eyebrow: "By how you travel",
    titleStart: "Pick a feeling.",
    titleItalic: "We'll do the rest.",
    lede: "The destination matters less than the kind of trip you want it to be. Choose the mood — we'll match the place.",
  },
  pilgrimFeature: {
    eyebrow: "Pilgrim journeys",
    titleStart: "Sacred routes,",
    titleItalic: "carried with care.",
    lede: "Char Dham, Kedarnath, helicopter darshans, vegetarian planning and hotels close to the temple gate.",
  },
  packagesByDuration: {
    eyebrow: "By how long you have",
    titleStart: "Pick the time you have.",
    titleItalic: "We'll match the trip.",
    lede: "Long-weekend escapes through 10+ day epics — the same hand-built planning either way.",
  },
  destinations: {
    eyebrow: "Where we travel",
    titleStart: "60+ destinations,",
    titleItalic: "every one walked first.",
    lede: "Bali to Char Dham, Switzerland to Andaman — every itinerary built by a planner who has actually been there.",
  },
  reviews: {
    eyebrow: "Travelers tell us",
    titleStart: "Words from",
    titleItalic: "real trips.",
    lede: "Verified reviews from travelers who have completed their journey with Trust and Trip.",
  },
  ugc: {
    eyebrow: "From real trips",
    titleStart: "Postcards from our travelers.",
    titleItalic: "No filters needed.",
  },
  press: {
    eyebrow: "As featured in",
    titleStart: "Trusted,",
    titleItalic: "on record.",
  },
  pillars: {
    eyebrow: "Why Trust and Trip",
    titleStart: "Three reasons travelers",
    titleItalic: "come back.",
    closingLine: "Originality. Trust. Human care. Detail.",
    pillars: [
      {
        _key: "p1",
        _type: "object",
        icon: "Sparkles",
        title: "Originality",
        headline: "Hand-built, not shelf-picked.",
        body: "Every itinerary is written for you, by a planner who's actually been to the place. We don't sell pre-made packages and rebrand them as “custom.”",
      },
      {
        _key: "p2",
        _type: "object",
        icon: "Heart",
        title: "Human Care",
        headline: "One planner, start to finish.",
        body: "A named human reads your form, plans your trip, and stays with you on WhatsApp through return. Not a queue, not a chatbot — a person whose phone is on.",
      },
      {
        _key: "p3",
        _type: "object",
        icon: "Eye",
        title: "Detail",
        headline: "The small things, remembered.",
        body: "Diabetic snacks pre-stocked. Aisle seats noted. Prayer-time itineraries respected. A vegetarian-only Bali dinner reservation, made three weeks ahead.",
      },
    ],
  },
  finalCta: {
    eyebrow: "Ready when you are",
    titleStart: "Let's plan",
    titleItalic: "your next trip.",
    lede: "Free itinerary in 24 hours. Pay only when you're sure.",
    ctaLabel: "Start planning",
    microcopy: "No card. No commitment. Just a planner.",
  },
  newsletter: {
    eyebrow: "Travel updates",
    titleStart: "Get exclusive deals",
    titleItalic: "in your inbox.",
    lede: "Early-bird offers, new destinations, travel tips. No spam.",
    placeholder: "your@email.com",
    buttonLabel: "Subscribe",
    footerMicrocopy: "Unsubscribe any time. We never share your email.",
  },
};

const url = `https://${PROJECT_ID}.api.sanity.io/v2025-01-01/data/mutate/${DATASET}`;
const body = {
  mutations: [{ createOrReplace: homepageContent }],
};

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  },
  body: JSON.stringify(body),
});

const data = await res.json();
if (!res.ok) {
  console.error(`Sanity mutate failed: ${res.status}`);
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log("OK — homepageContent singleton seeded.");
console.log(JSON.stringify(data, null, 2));
