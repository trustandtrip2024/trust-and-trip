#!/usr/bin/env node
// Seed Vaishno Devi destination + package so the homepage Pilgrim
// Spotlight card has a real detail page to link to. Idempotent —
// uses createOrReplace + deterministic _ids.

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

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "ncxbf32w";
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    || "production";
const TOKEN      = process.env.SANITY_API_WRITE_TOKEN;

if (!TOKEN) {
  console.error("Missing SANITY_API_WRITE_TOKEN — set it in .env.local first.");
  process.exit(1);
}

const DEST_ID = "destination.vaishno-devi";
const PKG_ID  = "package.vaishno-devi-3n4d-darshan";

const destination = {
  _id: DEST_ID,
  _type: "destination",
  name: "Vaishno Devi",
  slug: { _type: "slug", current: "vaishno-devi" },
  country: "India",
  region: "Asia",
  priceFrom: 18500,
  tagline: "Katra · Bhavan · Bhairon Mandir",
  whisper: "13 km of devotion, ending at Mata's cave.",
  overview:
    "Mata Vaishno Devi Bhavan sits at 5,200 ft in the Trikuta hills, reached on foot, by pony, palki, or helicopter from Katra. The 13-km darshan trail is one of the most-visited pilgrimage circuits in India, with VIP-darshan tokens and helicopter shuttles taking the queue out of the experience for elders.",
  bestTimeToVisit: "March – June, September – October",
  idealDuration: "3 – 4 days",
  thingsToDo: [
    "Mata Vaishno Devi Bhavan darshan",
    "Bhairon Baba temple (closes the yatra)",
    "Ardh Kuwari cave",
    "Helicopter Katra ↔ Sanjichhat",
    "Raghunath Temple, Jammu",
  ],
  highlights: [
    "VIP darshan slot pre-booked",
    "Helicopter Katra ↔ Sanjichhat included",
    "4-star stay walk-in to base camp",
    "Doctor on call · oxygen kit",
  ],
};

const pkg = {
  _id: PKG_ID,
  _type: "package",
  title: "Vaishno Devi 3N/4D — VIP Darshan with Helicopter",
  slug: { _type: "slug", current: "vaishno-devi-3n4d-darshan" },
  destination: { _type: "reference", _ref: DEST_ID },
  price: 18500,
  duration: "4 Days / 3 Nights",
  nights: 3,
  days: 4,
  travelType: "Family",
  rating: 4.9,
  reviews: 142,
  description:
    "Three nights and four days at Mata Vaishno Devi with VIP darshan, helicopter transfers from Katra to Sanjichhat, and a 4-star base hotel a short walk from the yatra start point. Designed for families with elderly travellers who want the darshan without the 13-km climb.",
  highlights: [
    "VIP darshan slot pre-booked at Bhavan",
    "Helicopter shuttle Katra ↔ Sanjichhat (return)",
    "4-star stay in Katra, 5 minutes from Banganga",
    "Battery car · pony / palki options arranged",
    "Doctor on call + oxygen kit on yatra day",
    "Ardh Kuwari + Bhairon Mandir included",
  ],
  inclusions: [
    "3 nights at a 4-star hotel in Katra (twin sharing)",
    "Daily breakfast",
    "Return helicopter Katra ↔ Sanjichhat",
    "VIP darshan tokens (group of 4)",
    "Yatra parchi assistance",
    "Airport / Jammu railway transfers (sedan / SUV)",
    "All taxes and GST",
  ],
  exclusions: [
    "Flights / train fare to Jammu",
    "Pony / palki / battery-car charges (optional)",
    "Personal expenses, tips, prasad purchases",
    "Travel insurance",
  ],
  hotel: {
    name: "Hotel Country Inn & Suites by Radisson, Katra",
    stars: 4,
    description:
      "Walk-in to Banganga base camp, full-service spa, Indian + Jain meal options, and a 24-hour front desk equipped to issue yatra parchi.",
  },
  itinerary: [
    {
      day: 1,
      title: "Arrive Jammu, drive to Katra",
      description:
        "Pickup from Jammu airport or railway station and drive to Katra (~50 km, 1.5 hours). Hotel check-in by afternoon, evening at the Banganga ghat for the lighting ceremony, early dinner and rest. Yatra parchi handed out at the front desk.",
      meals: { breakfast: false, lunch: false, dinner: true },
    },
    {
      day: 2,
      title: "Helicopter darshan day — VIP slot",
      description:
        "Pre-dawn breakfast and shuttle to the helipad. Helicopter Katra → Sanjichhat (8 minutes), short walk to Bhavan, VIP darshan window. Optional Ardh Kuwari and Bhairon Baba temple before the return helicopter. Hotel by mid-afternoon, rest, evening tea.",
      meals: { breakfast: true, lunch: false, dinner: true },
    },
    {
      day: 3,
      title: "Jammu side-trip · Raghunath Temple",
      description:
        "Drive to Jammu after breakfast. Visit Raghunath Temple, Bahu Fort, and the Mubarak Mandi heritage complex. Lunch at Pahalgam Hotel, return to Katra by evening, free time for shopping at Banganga market.",
      meals: { breakfast: true, lunch: true, dinner: true },
    },
    {
      day: 4,
      title: "Departure",
      description:
        "Late breakfast at the hotel, transfer to Jammu airport or railway station for onward journey.",
      meals: { breakfast: true, lunch: false, dinner: false },
    },
  ],
  activities: [
    "VIP darshan",
    "Helicopter ride",
    "Cave temple visits",
    "Heritage walk",
    "Local market shopping",
  ],
  categories: ["Family", "Domestic", "Pilgrim", "Spiritual"],
  tags: ["yatra", "pilgrim", "vaishno-devi", "helicopter-darshan", "elders-friendly"],
  trending: true,
  featured: true,
  limitedSlots: false,
  whyThisPackage: [
    "Helicopter avoids the 13-km uphill climb — trip works for grandparents.",
    "VIP darshan token cuts the temple queue from 4–6 hours to 30 minutes.",
    "Hotel is walking distance from the helipad shuttle and Banganga.",
    "Doctor on call + oxygen kit included for yatra day at altitude.",
  ],
  bestFor: "Families with elderly travellers who want the full darshan without the climb.",
  bookedThisMonth: 38,
  faqs: [
    {
      q: "Is the helicopter included in the package price?",
      a: "Yes — the round-trip helicopter from Katra to Sanjichhat is bundled into the price. You pay nothing extra at the helipad.",
    },
    {
      q: "How long does VIP darshan take?",
      a: "From the moment you reach Bhavan to walking out of the cave is typically 30–45 minutes with VIP tokens, versus 4–6 hours in the standard queue.",
    },
    {
      q: "Can I add Ardh Kuwari and Bhairon Mandir?",
      a: "Yes — both are included on yatra day. The helicopter return slot is timed so you have ~3 hours at Bhavan to do all three temples.",
    },
    {
      q: "What if the helicopter doesn't fly due to weather?",
      a: "If MET cancels the helicopter (poor visibility, high winds), we arrange battery cars + ponies / palki to Bhavan and refund the helicopter fare component. We never strand you in Katra.",
    },
  ],
  bestMonths: [
    { month: 3, tag: "shoulder", note: "Spring — comfortable temps." },
    { month: 4, tag: "peak", note: "Navratri season, busiest." },
    { month: 5, tag: "peak" },
    { month: 6, tag: "peak" },
    { month: 9, tag: "peak", note: "Sharad Navratri." },
    { month: 10, tag: "shoulder" },
    { month: 11, tag: "off" },
    { month: 12, tag: "avoid", note: "Snow on the trail above Sanjichhat." },
    { month: 1, tag: "avoid" },
  ],
  groupSize: { min: 1, max: 12, idealFor: "Families with grandparents" },
  difficulty: "easy",
  visaInfo: { required: false, notes: "Domestic — Indian ID required." },
};

async function mutate(docs) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}?returnIds=true`;
  const mutations = docs.map((doc) => ({ createOrReplace: doc }));
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutations }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("Sanity error:", JSON.stringify(json, null, 2));
    process.exit(1);
  }
  return json;
}

const result = await mutate([destination, pkg]);
console.log("Seeded Vaishno Devi destination + package.");
console.log(`  Destination ID: ${DEST_ID}`);
console.log(`  Package ID:     ${PKG_ID}`);
console.log(`  URL:            /packages/vaishno-devi-3n4d-darshan`);
console.log(`  Mutation result: ${JSON.stringify(result.results?.map((r) => r.id) ?? result, null, 2)}`);
