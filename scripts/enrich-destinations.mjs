#!/usr/bin/env node
// Adds missing whisper line on every destination + creates Bhutan & Mauritius
// destination docs that footer/visa-free flow already references.
// Idempotent — patches only what's empty; createOrReplace for new docs uses
// deterministic _ids so re-runs are safe.

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
const API_HOST   = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01`;
if (!TOKEN) { console.error("missing SANITY_API_WRITE_TOKEN"); process.exit(1); }

// Hand-crafted whisper lines (max 120 chars). Each evokes the destination,
// not a sales pitch. Keyed by slug.
const WHISPERS = {
  "mount-abu": "Rajasthan's only hill station — sunsets over Nakki Lake, Dilwara marble, Aravalli pine.",
  "maldives": "Overwater villas, glass-clear lagoons, the kind of quiet that resets you.",
  "pushkar": "Sacred lake, blue alleys, camel-fair dusk — Rajasthan in its softest light.",
  "tirupati": "VIP darshan at India's most-visited temple, the seven hills of Tirumala.",
  "kerala": "Backwater houseboats, monsoon ayurveda, coconut groves whispering at low tide.",
  "sri-lanka": "Tea hills, ancient citadels, leopard country — an island that holds five climates.",
  "thailand": "Floating markets at dawn, longtail boats to limestone islands, Bangkok-bright nights.",
  "manali": "Beas river under deodar pines — Himachal's gateway to snow, treks and old trails.",
  "cambodia": "Sunrise at Angkor Wat. The largest religious monument on earth, still alive at dawn.",
  "zanskar-valley": "Frozen river treks, monasteries on cliffs — Ladakh's wildest valley.",
  "shimla": "Colonial mall walks, toy train through pine — the queen of the hills, crisp at every season.",
  "bali": "Rice-terrace mornings, temple processions, surf at every beach — the island of the gods.",
  "uk": "London markets to Highland glens — castles, kilts, Harry Potter and afternoon tea.",
  "mahabaleshwar": "Strawberry farms, valley viewpoints, Sahyadri monsoon — Maharashtra's hill escape.",
  "singapore": "Garden city skyline, hawker-stall feasts, Universal Studios for the kids.",
  "vietnam": "Limestone karsts in Halong Bay, ao dai dawn cycles, bowls of pho on plastic stools.",
  "spiti-valley": "Cold desert above 13,000 ft — monasteries on moonscapes, the most photographed valley.",
  "vaishno-devi": "13.5-km trek to the Mata's cave shrine — Trikuta hills, helicopter or palki.",
  "paris": "Seine sunsets, croissant mornings, the Eiffel sparkling on the hour.",
  "varanasi": "Ganga aarti at Dashashwamedh, ghats older than memory, the city Mark Twain called the oldest.",
  "nepal": "Kathmandu durbar squares, Pokhara lakes, Annapurna teahouses — Himalaya at every angle.",
  "char-dham": "Yamunotri, Gangotri, Kedarnath, Badrinath — the four sacred shrines of the Garhwal Himalaya.",
  "italy": "Roman ruins, Florentine art, Venetian gondolas — three cities, a thousand years of beauty.",
  "rajasthan": "Forts on every hilltop, palaces by every lake — the land of kings still wears its colour.",
  "andaman": "Cellular Jail history, scuba reefs at Havelock, sand whiter than salt at Radhanagar.",
  "pondicherry": "French Quarter mustard houses, Auroville's gold dome, beach cafes built on bouginvillea.",
  "hong-kong": "Victoria Peak skyline, dim sum mornings, Disneyland and Macau ferries — Asia's busiest weekend.",
  "malaysia": "Petronas Towers to Langkawi beaches — three-country itineraries, halal-friendly, Indian-meal-easy.",
  "darjeeling": "Toy train to Tiger Hill sunrise, Kanchenjunga views, tea estates older than the British Raj.",
  "lonavala": "Sahyadri waterfalls in monsoon, chikki and forts — Mumbai's favourite weekend.",
  "kenya": "Maasai Mara migration, Big Five at sunrise, lodges built where the land still belongs to lions.",
  "france": "Eiffel sparkles, Disneyland Paris, Provence lavender — the country that invented the holiday.",
  "ladakh": "Pangong blue, Khardung-La summit, Hemis monasteries — the Himalayan high desert nobody forgets.",
  "russia": "Red Square nights, Hermitage halls, the Trans-Siberian beginning — Moscow to St. Petersburg in six days.",
  "japan": "Cherry blossom Kyoto, Shibuya neon, Mount Fuji from a bullet-train window.",
  "turkey": "Cappadocia balloons at dawn, Hagia Sophia at dusk — Europe and Asia in one trip.",
  "uttarakhand": "Yoga capital Rishikesh, Ganga arati Haridwar, Char Dham starting line — Devbhoomi at every turn.",
  "kanha": "Kipling's Jungle Book country — barasingha grasslands, tigers, sal forest sundowners.",
  "australia": "Sydney Opera House, Great Barrier Reef snorkelling, Gold Coast surf — Down Under in a fortnight.",
  "switzerland": "Glacier-express windows, Jungfrau snow, Lucerne lake walks — the Alps at their politest.",
  "dubai": "Burj Khalifa skyline, desert dune-bashing, gold-souk evenings — the Gulf at full volume.",
  "coorg": "Coffee-estate stays, Madikeri mist, Cauvery dawn — Karnataka's quietest hill town.",
  "lakshadweep": "Coral atolls 250 km off Kerala — diving, lagoons, the Maldives without the visa.",
  "ranthambore": "Jeep safaris through ruined forts, India's most photographed tiger reserve.",
  "south-korea": "Seoul K-pop streets, Jeju volcanic island, Busan beaches — Asia's trending cherry-blossom week.",
  "goa": "Beach shacks at sunset, Portuguese chapels, scooter-loop villages — three coasts, one mood.",
};

// New destinations the footer/visa-free flow already promises.
const NEW_DESTINATIONS = [
  {
    _id: "destination.bhutan",
    _type: "destination",
    name: "Bhutan",
    slug: { _type: "slug", current: "bhutan" },
    country: "Bhutan",
    region: "Asia",
    priceFrom: 65000,
    tagline: "Gross National Happiness, dzongs in every valley, free visa for Indians",
    whisper: "Tiger's Nest cliffside monastery, Paro chilis, the kingdom that measures happiness.",
    overview:
      "Bhutan opens to Indian passports on a permit (no formal visa needed) and rewards you with monasteries built on cliffs, dzongs guarding every valley, and a national policy of preserving forest cover. Paro, Thimphu and Punakha form the classic 5N circuit; add Bumthang for the deeper east. Closed-cup driving lanes, Indian rupee accepted in most towns, and a daily Sustainable Development Fee of INR 1,200 per night for Indian travellers.",
    bestTimeToVisit: "March-May (rhododendron) and September-November (clearest mountain views)",
    idealDuration: "5-7 days",
    thingsToDo: [
      "Hike to Taktsang (Tiger's Nest) Monastery in Paro",
      "Cross the longest suspension bridge at Punakha Dzong",
      "Buddha Dordenma giant statue overlooking Thimphu",
      "Dochula Pass — 108 chortens with Himalayan panorama",
      "Try ema datshi (chili-cheese) and ara rice spirit",
    ],
    highlights: [
      "Permit-only — no embassy visa required for Indian passport holders",
      "Carbon-negative country — 70%+ forest cover protected by constitution",
      "Indian rupee accepted (INR 100 and below); higher denominations need exchange",
    ],
  },
  {
    _id: "destination.mauritius",
    _type: "destination",
    name: "Mauritius",
    slug: { _type: "slug", current: "mauritius" },
    country: "Mauritius",
    region: "Africa",
    priceFrom: 95000,
    tagline: "Premium beach honeymoon — Indian-meal-friendly, visa-free for 60 days",
    whisper: "Black River gorges, Le Morne lagoons, dolphin dawns — the Indian Ocean's polished side.",
    overview:
      "Mauritius offers Indians a 60-day visa-on-arrival and pairs effortlessly with Seychelles or Reunion for longer Indian-Ocean routings. Most premium honeymoon stays cluster on the north (Grand Baie) and west (Flic-en-Flac, Le Morne) coasts. Indian-meal-friendly hotels, large Bhojpuri-Indian community, English-speaking guides. Underwater walks at Trou aux Biches, dolphin swims at Tamarin, and the seven-coloured earth at Chamarel are signature stops.",
    bestTimeToVisit: "May-December (cool & dry); avoid January-March cyclone window",
    idealDuration: "6-8 days",
    thingsToDo: [
      "Catamaran cruise to Île aux Cerfs",
      "Underwater sea-walk at Trou aux Biches",
      "Black River Gorges National Park hike",
      "Chamarel seven-coloured earth and rum distillery",
      "Dolphin swim at Tamarin Bay (early morning)",
    ],
    highlights: [
      "60-day visa-on-arrival for Indian passport holders",
      "Indian community ~70% — vegetarian and Jain meals widely available",
      "Premium overwater and beachfront resorts at honeymoon-friendly pricing",
    ],
  },
];

async function fetchAll() {
  const q = encodeURIComponent(
    `*[_type=="destination" && !defined(whisper)]{_id, "slug": slug.current, name}`
  );
  const r = await fetch(`${API_HOST}/data/query/${DATASET}?query=${q}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!r.ok) throw new Error(`fetch failed: ${await r.text()}`);
  return (await r.json()).result || [];
}

async function mutate(mutations) {
  const r = await fetch(`${API_HOST}/data/mutate/${DATASET}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!r.ok) throw new Error(`mutate failed: ${await r.text()}`);
  return r.json();
}

const missing = await fetchAll();
console.log(`Destinations missing whisper: ${missing.length}`);

const mutations = [];
let skipped = [];

for (const d of missing) {
  const w = WHISPERS[d.slug];
  if (!w) { skipped.push(d.slug); continue; }
  const id = d._id.replace(/^drafts\./, "");
  mutations.push({ patch: { id, set: { whisper: w } } });
}

for (const doc of NEW_DESTINATIONS) {
  mutations.push({ createOrReplace: doc });
}

console.log(`Patches: ${mutations.length} (skipped: ${skipped.join(", ") || "none"})`);

if (mutations.length === 0) { console.log("Nothing to do."); process.exit(0); }

for (let i = 0; i < mutations.length; i += 50) {
  const chunk = mutations.slice(i, i + 50);
  const r = await mutate(chunk);
  console.log(`Chunk ${i / 50 + 1}: ${r.results?.length || 0} ops`);
}
console.log("Done.");
