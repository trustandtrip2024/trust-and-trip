#!/usr/bin/env node
// Bulk-import the 69 itinerary PDFs in
// C:\Users\akash\Downloads\OneDrive_2026-05-01\Trust and Trip Itineraries
// as Sanity package documents.
//
// Defaults to DRY-RUN. Prints a parse summary + 3 sample docs as JSON.
// Add --commit to push the createOrReplace mutations to production.
// Add --create-dests-only to seed only the 5 missing destinations.
//
// Reads SANITY_API_WRITE_TOKEN from .env.local.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

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

const ARGS = new Set(process.argv.slice(2));
const COMMIT = ARGS.has("--commit");
const DESTS_ONLY = ARGS.has("--create-dests-only");

if (COMMIT && !TOKEN) {
  console.error("Missing SANITY_API_WRITE_TOKEN — set it in .env.local first.");
  process.exit(1);
}

const PDF_DIR = "C:\\Users\\akash\\Downloads\\OneDrive_2026-05-01\\Trust and Trip Itineraries";
const TXT_DIR = path.resolve(process.cwd(), ".tat-pdf-cache");

// ──────────────────────────────────────────────────────────────────────────
// Existing destinations (fetched 2026-05-01 from production)
// ──────────────────────────────────────────────────────────────────────────
const EXISTING_DESTS = {
  "mount-abu":          "053ab434-8984-41b5-b1c7-28910c0e3b4f",
  "maldives":           "110fbe35-f0b2-4df4-862a-610dfd9064cd",
  "pushkar":            "11831818-9eeb-4136-9858-bbf9331ae80e",
  "tirupati":           "1b9cc735-cd14-474c-a9a3-c1fd807d1b97",
  "kerala":             "1ed54298-f8cd-4515-ba5e-e0c4988f34c1",
  "sri-lanka":          "2305d23e-190e-4180-9257-3c59ae58322a",
  "thailand":           "267cb0fb-20f6-4677-bc85-4843a1827bc5",
  "manali":             "29b59fd2-a3b8-463f-80a1-5daa9bf94d09",
  "cambodia":           "332a98df-ce16-4274-8e3c-2e438b874d77",
  "zanskar-valley":     "3760b45f-b90b-4cc3-a7c0-59c44995b7d2",
  "shimla":             "3de47eec-7e35-432b-a745-3cf6297d9e4d",
  "bali":               "3f800e3b-a726-4808-98ca-87cb4d2e0b2c",
  "uk":                 "4cdd8dc7-19e6-49e6-863c-ca0fab11341e",
  "mahabaleshwar":      "50af8c4f-6790-4b0d-9bde-830ba0ee42fb",
  "singapore":          "5141ff2b-037a-4d17-8e60-9e73c51a2f55",
  "vietnam":            "565b9162-5bc3-4fd8-8760-e2efe2006841",
  "spiti-valley":       "5f67b5d6-49bc-46a3-9cdd-44a2dfe9f27a",
  "paris":              "671376f4-3fd1-41f6-95df-034482f96d04",
  "varanasi":           "740b7061-b716-43ac-b2cf-36eb8ca1b672",
  "nepal":              "76509307-6990-4b07-b293-261ca86bd906",
  "char-dham":          "798a2a4d-9d4b-4b53-9be5-21fb33a07e99",
  "italy":              "7a89555f-c4ab-4c9e-abf6-3660107c6da3",
  "rajasthan":          "85e9dc7b-6f6a-4b95-be32-30daf9772e91",
  "andaman":            "8b608f01-942c-44b9-bfeb-3932e6c85f23",
  "pondicherry":        "9a8cbf6e-5853-4da0-a5d1-490e1c9a5dcc",
  "hong-kong":          "9cb6ff3b-2b8c-459b-abe5-98440d3773ed",
  "malaysia":           "a981ad82-30c0-4216-9093-aca2dd89e052",
  "darjeeling":         "b1a9b5c3-3761-42bb-a2e5-7af809b04b62",
  "lonavala":           "b23cfbbb-50b8-4188-b684-6823e9d4c743",
  "kenya":              "b782dd45-13b1-4938-9d3a-36aefef79928",
  "france":             "b8b89599-cc3d-42eb-bff2-43e968d4eccc",
  "ladakh":             "ba889b40-5cbf-49d5-9901-d82e80a3427e",
  "russia":             "bad46e50-0625-49f9-b621-9e3cf6870bf1",
  "japan":              "baff4c8b-2b5b-4243-b1ff-5ee1edaf3466",
  "turkey":             "bb63b713-8817-4c31-a5f2-6ba5aaa4ae95",
  "uttarakhand":        "c3dabd11-33b5-4d22-a79f-dc28067448cc",
  "kanha":              "c4fec7ad-13f1-4bdc-a9ab-750d90da7a2f",
  "australia":          "c66860f5-7365-449b-9421-46bb20ec0176",
  "switzerland":        "ca78ae8d-f03e-4b74-b733-9182299309b3",
  "dubai":              "cf9670fd-4612-4d11-a04a-7594010669b8",
  "coorg":              "d76af40b-193f-4ed3-87ec-eed3b5202e18",
  "lakshadweep":        "db80f43a-2e5a-4c71-8baf-269e22151fa2",
  "ranthambore":        "e2c6c7ce-2a64-42c3-a670-3a21ed3b5a53",
  "south-korea":        "f3a458ea-5468-4d68-814a-bec49e0fee0e",
  "goa":                "fd7e24ce-5646-4c64-9009-abb9f24d663d",
};

// ──────────────────────────────────────────────────────────────────────────
// New destinations to seed (deterministic _ids so re-running is idempotent)
// ──────────────────────────────────────────────────────────────────────────
const NEW_DESTS = [
  {
    _id: "dest-kashmir",
    _type: "destination",
    name: "Kashmir",
    slug: { _type: "slug", current: "kashmir" },
    country: "India",
    region: "Asia",
    priceFrom: 22000,
    tagline: "Srinagar · Gulmarg · Pahalgam · Sonmarg",
    whisper: "Houseboats on Dal Lake, gondolas on snow.",
    overview:
      "Kashmir Valley wraps Srinagar's Dal Lake houseboats, the Mughal gardens, the Gulmarg gondola, and Pahalgam's pine valleys into one of India's most photographed loops. Spring brings tulips; winter brings skiing. Most circuits run 5–7 days.",
    bestTimeToVisit: "April – June, September – October",
    idealDuration: "5 – 7 days",
    thingsToDo: ["Shikara ride on Dal Lake", "Gulmarg gondola Phase 1 + 2", "Betaab Valley (Pahalgam)", "Mughal gardens (Shalimar, Nishat)", "Sonmarg day trip"],
    highlights: ["Houseboat stay on Dal Lake", "Gulmarg gondola included", "Snow-point at Khilanjmarg", "Shawl + saffron showroom visits"],
  },
  {
    _id: "dest-sikkim",
    _type: "destination",
    name: "Sikkim",
    slug: { _type: "slug", current: "sikkim" },
    country: "India",
    region: "Asia",
    priceFrom: 25000,
    tagline: "Gangtok · Pelling · Lachung · Tsomgo",
    whisper: "Monasteries, snow lakes, and the eastern Himalaya.",
    overview:
      "Sikkim pairs Gangtok's MG Road bustle with Pelling's Kanchenjunga sunrises and the high-altitude Tsomgo and Yumthang valleys. Pony rides at Nathula, monastery hopping at Rumtek, cable-car panoramas — most trips combine Sikkim with neighbouring Darjeeling.",
    bestTimeToVisit: "March – June, October – December",
    idealDuration: "6 – 8 days",
    thingsToDo: ["Gangtok cable car + MG Road", "Tsomgo Lake + Baba Mandir", "Pelling Kanchenjunga sunrise", "Rumtek Monastery", "Nathula Pass (subject to permit)"],
    highlights: ["Permits + inner-line passes arranged", "Hotel in central Gangtok", "Pelling sunrise window", "Tsomgo lake yak-ride included"],
  },
  {
    _id: "dest-seychelles",
    _type: "destination",
    name: "Seychelles",
    slug: { _type: "slug", current: "seychelles" },
    country: "Seychelles",
    region: "Africa",
    priceFrom: 145000,
    tagline: "Mahé · Praslin · La Digue",
    whisper: "Granite boulders, turquoise lagoons, no crowds.",
    overview:
      "Seychelles' three main islands stitch together palm-shaded beaches (Anse Source d'Argent), granite-rock coves, and the Vallée de Mai UNESCO forest. Visa-on-arrival for Indian passports, ~10 hour flights via Sri Lanka or the Gulf, ideal for a 6–8 night honeymoon.",
    bestTimeToVisit: "April – May, October – November",
    idealDuration: "6 – 8 days",
    thingsToDo: ["Anse Lazio + Anse Source d'Argent", "Vallée de Mai UNESCO forest", "Inter-island ferry Mahé → Praslin → La Digue", "Snorkelling at Sainte Anne marine park", "Sunset cruise off Beau Vallon"],
    highlights: ["Ferry-hop across 3 islands", "Beachfront stays on Praslin + La Digue", "Snorkel + glass-bottom boat included", "Visa-on-arrival for Indian passports"],
  },
  {
    _id: "dest-puri",
    _type: "destination",
    name: "Puri & Bhubaneswar",
    slug: { _type: "slug", current: "puri" },
    country: "India",
    region: "Asia",
    priceFrom: 18000,
    tagline: "Jagannath · Konark Sun Temple · Chilika Lake",
    whisper: "Where Lord Jagannath's chariots roll into the sea.",
    overview:
      "Puri's Jagannath temple, the Konark Sun Temple's UNESCO-listed stone wheels, and the Chilika brackish-water lagoon (Asia's largest) anchor a 4–5 day Odisha circuit. Add Bhubaneswar's Lingaraj temple complex for a temple-route trip with beach evenings.",
    bestTimeToVisit: "October – February",
    idealDuration: "4 – 5 days",
    thingsToDo: ["Jagannath Temple darshan", "Konark Sun Temple", "Chilika Lake dolphin spotting", "Puri beach", "Lingaraj Temple, Bhubaneswar"],
    highlights: ["Beachfront stay walking distance to temple", "Konark + Chilika day trips", "VIP darshan assistance", "Odiya thali included"],
  },
  {
    _id: "dest-north-east",
    _type: "destination",
    name: "North East India",
    slug: { _type: "slug", current: "north-east" },
    country: "India",
    region: "Asia",
    priceFrom: 22000,
    tagline: "Guwahati · Shillong · Cherrapunji · Kaziranga",
    whisper: "Living root bridges and one-horned rhinos.",
    overview:
      "The Assam-Meghalaya circuit pairs Kaziranga's rhino safari with Shillong's Scotland-of-the-East rolling hills, Cherrapunji's living-root bridges and waterfalls, and Guwahati's Kamakhya temple. Add Mawlynnong (Asia's cleanest village) for a 6–7 day loop.",
    bestTimeToVisit: "October – April",
    idealDuration: "5 – 7 days",
    thingsToDo: ["Kaziranga jeep + elephant safari", "Cherrapunji living-root bridge trek", "Mawlynnong + Dawki river", "Shillong Umiam Lake", "Kamakhya Temple, Guwahati"],
    highlights: ["Inner-line permit handled", "Shillong + Cherrapunji combo", "Kaziranga safari pre-booked", "Mawlynnong day trip included"],
  },
];

// All possible destination slugs for keyword resolution
const ALL_DESTS = {
  ...EXISTING_DESTS,
  "kashmir":     "dest-kashmir",
  "sikkim":      "dest-sikkim",
  "seychelles":  "dest-seychelles",
  "puri":        "dest-puri",
  "north-east":  "dest-north-east",
};

// ──────────────────────────────────────────────────────────────────────────
// Keyword → destination slug. First match wins. Order matters — more
// specific multi-word patterns must come before single-word fallbacks.
// ──────────────────────────────────────────────────────────────────────────
const KEYWORD_MAP = [
  // Domestic — pilgrim / Uttarakhand circuits
  { rx: /\bchar\s*dham\b|\bchardham\b|\bpanchkedar\b|\bdo\s*dham\b|\bkedarnath\b/i,        slug: "char-dham" },
  { rx: /\bharidwar\b|\brishikesh\b|\bmussoorie\b|\bnainital\b|\bcorbett\b|\bauli\b|\bchopta\b/i, slug: "uttarakhand" },
  // Domestic — UP yatra circuits (Varanasi cluster)
  { rx: /\bvaranasi\b|\bayodhya\b|\bprayagraj\b|\bchitrakoot\b|\bkashi\b|\bsarnath\b/i,    slug: "varanasi" },
  { rx: /\bdelhi\b.*\bmathura\b|\bdelhi\b.*\bagra\b/i,                                     slug: "varanasi" },
  // Domestic — Himachal
  { rx: /\bmanali\b|\bsissu\b|\bkasol\b/i,                                                 slug: "manali" },
  { rx: /\bshimla\b/i,                                                                     slug: "shimla" },
  { rx: /\bhimachal\b/i,                                                                   slug: "manali" },
  // Domestic — North + Sikkim/Darjeeling
  { rx: /\bpelling\b|\bgangtok\b|\bsikkim\b|\btsomgo\b|\bnathula\b|\blachung\b/i,          slug: "sikkim" },
  { rx: /\bdarjeeling\b/i,                                                                 slug: "darjeeling" },
  { rx: /\bkashmir\b|\bsrinagar\b|\bgulmarg\b|\bpahalgam\b|\bsonmarg\b/i,                  slug: "kashmir" },
  // Domestic — North East
  { rx: /\bguwahati\b|\bshillong\b|\bcherrapunji\b|\bkaziranga\b|\bmeghalaya\b|\bassam\b|north\s*east/i, slug: "north-east" },
  // Domestic — South
  { rx: /\bkerala\b|\bkochi\b|\bmunnar\b|\bthekkady\b|\balleppey\b|\balappuzha\b|\bcochin\b/i, slug: "kerala" },
  { rx: /\btirupati\b|\btirumala\b/i,                                                      slug: "tirupati" },
  // Domestic — beach / island / state
  { rx: /\bgoa\b/i,                                                                        slug: "goa" },
  { rx: /\bandaman\b|\bhavelock\b|port\s*blair|neil\s*island/i,                            slug: "andaman" },
  { rx: /\blakshadweep\b/i,                                                                slug: "lakshadweep" },
  { rx: /\bpuri\b|\bbhubaneswar\b|\bkonark\b|\bchilika\b|\bodisha\b/i,                     slug: "puri" },
  { rx: /\brajasthan\b|\bjaipur\b|\budaipur\b|\bjodhpur\b|\bjaisalmer\b/i,                 slug: "rajasthan" },
  { rx: /\bpondicherry\b/i,                                                                slug: "pondicherry" },
  { rx: /\bcoorg\b/i,                                                                      slug: "coorg" },
  { rx: /mount\s*abu/i,                                                                    slug: "mount-abu" },
  { rx: /\bpushkar\b/i,                                                                    slug: "pushkar" },
  { rx: /\blonavala\b|\bkhandala\b/i,                                                      slug: "lonavala" },
  { rx: /\bmahabaleshwar\b|\bpanchgani\b/i,                                                slug: "mahabaleshwar" },
  { rx: /\branthambore\b/i,                                                                slug: "ranthambore" },
  { rx: /\bkanha\b/i,                                                                      slug: "kanha" },
  { rx: /\bladakh\b|\bleh\b/i,                                                             slug: "ladakh" },
  { rx: /\bspiti\b/i,                                                                      slug: "spiti-valley" },
  { rx: /\bzanskar\b/i,                                                                    slug: "zanskar-valley" },
  // International
  { rx: /\bvietnam\b|\bhanoi\b|\bhalong\b|ha\s*long|phu\s*quoc|da\s*nang|hoi\s*an|\bsaigon\b|ho\s*chi\s*minh/i, slug: "vietnam" },
  { rx: /\bthailand\b|\bbangkok\b|\bphuket\b|\bkrabi\b|\bpattaya\b|chiang\s*mai/i,         slug: "thailand" },
  { rx: /\bbali\b/i,                                                                       slug: "bali" },
  { rx: /\bsingapore\b/i,                                                                  slug: "singapore" },
  { rx: /\bmalaysia\b|kuala\s*lumpur|\blangkawi\b/i,                                       slug: "malaysia" },
  { rx: /sri\s*lanka|\bcolombo\b|\bkandy\b|\bnuwara\b/i,                                   slug: "sri-lanka" },
  { rx: /\bmaldives\b/i,                                                                   slug: "maldives" },
  { rx: /\bseychelles?\b|\bseychellles\b/i,                                                slug: "seychelles" },
  { rx: /\bnepal\b|\bkathmandu\b|\bpokhara\b|\bchitwan\b/i,                                slug: "nepal" },
  { rx: /\bdubai\b|abu\s*dhabi/i,                                                          slug: "dubai" },
  { rx: /hong\s*kong|\bmacau\b/i,                                                          slug: "hong-kong" },
  { rx: /\bjapan\b|\btokyo\b|\bkyoto\b|\bosaka\b/i,                                        slug: "japan" },
  { rx: /south\s*korea|\bseoul\b|\bjeju\b/i,                                               slug: "south-korea" },
  { rx: /\bturkey\b|\bistanbul\b|\bcappadocia\b/i,                                         slug: "turkey" },
  { rx: /\bswitzerland\b|\bswiss\b/i,                                                      slug: "switzerland" },
  { rx: /\bparis\b/i,                                                                      slug: "paris" },
  { rx: /\bitaly\b|\brome\b|\bvenice\b|\bflorence\b/i,                                     slug: "italy" },
  { rx: /\buk\b|\blondon\b|\bscotland\b|\bengland\b/i,                                     slug: "uk" },
  { rx: /\brussia\b|\bmoscow\b/i,                                                          slug: "russia" },
  { rx: /\bkenya\b|\bmaasai\b|\bsafari\b/i,                                                slug: "kenya" },
  { rx: /\baustralia\b|\bsydney\b|\bmelbourne\b/i,                                         slug: "australia" },
  { rx: /\bcambodia\b|\bangkor\b|siem\s*reap/i,                                            slug: "cambodia" },
];

const STANDARD_INCLUSIONS = [
  "Accommodation in well-maintained hotels/resorts as per the selected category",
  "Daily breakfast at the hotel (or as mentioned in the itinerary)",
  "Airport / Railway Station / Bus Stand transfers as per the itinerary",
  "Sightseeing and transfers by private vehicle as mentioned in the itinerary",
  "All applicable hotel taxes and service charges",
  "Driver allowance, fuel charges, parking fees, and toll taxes (where applicable)",
  "Local on-ground representative assistance",
  "All sightseeing and activities mentioned under the itinerary section",
];

const STANDARD_EXCLUSIONS = [
  "Airfare / Train fare / Bus fare unless explicitly mentioned in inclusions",
  "Any meals other than those specified in the itinerary",
  "Entry fees, monument tickets, adventure activities unless mentioned",
  "Personal expenses such as laundry, tips, telephone calls, room service, minibar",
  "Camera fees, guide charges, and optional activities",
  "Travel insurance, visa fees, and medical expenses",
  "Any cost arising due to natural calamities, weather conditions, or unforeseen circumstances",
  "5% GST / Government taxes (unless explicitly bundled)",
];

// Used when a PDF carries no price (templates without a quote)
const FALLBACK_PRICE_BY_DEST = {
  "char-dham":    32000,
  "uttarakhand":  18500,
  "varanasi":     12000,
  "nepal":        38000,
  "north-east":   28000,
  "kerala":       32000,
  "kashmir":      22000,
  "sikkim":       28000,
  "darjeeling":   24000,
  "manali":       17000,
  "shimla":       12500,
  "goa":          18000,
  "andaman":      45000,
  "puri":         18000,
  "rajasthan":    35000,
  "tirupati":     15500,
  "lakshadweep":  55000,
  "vietnam":      62000,
  "thailand":     45000,
  "bali":         48000,
  "singapore":    65000,
  "malaysia":     55000,
  "sri-lanka":    52000,
  "maldives":    150000,
  "seychelles":  155000,
  "dubai":        65000,
  "japan":       145000,
  "south-korea": 125000,
  "turkey":       95000,
  "switzerland": 195000,
  "italy":       175000,
  "paris":       155000,
  "uk":          185000,
  "russia":      135000,
  "kenya":       175000,
  "australia":   225000,
  "cambodia":     65000,
  "hong-kong":    85000,
};

const STANDARD_FAQS = [
  { q: "How do I confirm this package?", a: "30% advance payment confirms the booking. The balance is due on Day 1 of the trip." },
  { q: "What if I cancel?", a: "Cancellations 30+ days before departure attract 50% cancellation charges. Within 30 days of departure: 100% cancellation charges. Cancellation policy is non-negotiable." },
  { q: "Are flights / trains included?", a: "Unless explicitly listed in the inclusions, airfare and train fare are not part of the package price. We can quote and book them separately." },
  { q: "Can the itinerary be customised?", a: "Yes — every itinerary on Trust and Trip is hand-built. Tell our team your dates, group size, and preferences and we'll re-quote within 24 hours." },
];

// ──────────────────────────────────────────────────────────────────────────
// PDF text extraction — calls poppler's pdftotext via Git Bash if cache miss
// ──────────────────────────────────────────────────────────────────────────
function ensureTxt(pdfPath, txtPath) {
  if (fs.existsSync(txtPath)) return;
  try {
    execSync(`pdftotext -layout "${pdfPath}" "${txtPath}"`, { stdio: "ignore" });
  } catch (err) {
    // Try git bash fallback on Windows
    execSync(`"C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe" -layout "${pdfPath}" "${txtPath}"`, { stdio: "ignore" });
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Parsers
// ──────────────────────────────────────────────────────────────────────────
function cleanText(s) {
  // pdftotext leaves UTF-16 → cp1252 garble for em/en-dash, arrows, smart quotes.
  // Normalise the common artifacts so we don't ship `�` to Sanity.
  return s
    .replace(/\r/g, "")
    .replace(/[�­]/g, " ")           // replacement char + soft hyphen
    .replace(/[→➔➜➡]/g, " → ")
    .replace(/[–—]/g, " — ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
}

function cleanTitle(raw) {
  let t = cleanText(raw);
  // Strip "Mr./Mrs./Miss <Name> | " prefix
  t = t.replace(/^\s*(Mr\.?|Mrs\.?|Miss|Ms\.?|Dr\.?)\s+[A-Za-z][A-Za-z'\s.]*?\s*[|(:]/i, "").trim();
  // Strip "Mr./Mrs. <Name>" anywhere
  t = t.replace(/\b(Mr\.?|Mrs\.?|Miss|Ms\.?|Dr\.?)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g, "").trim();
  // Strip leading parenthetical "(Gangtok/Pelling/Darjeeling)" → "Gangtok Pelling Darjeeling"
  t = t.replace(/^\s*\(([^)]{3,80})\)/, (_, g) => g.replace(/\//g, " · ")).trim();
  // Strip trailing customer/copy marker
  t = t.replace(/\s+(Copy|Ex\s+\w+\s*\(.+?\))\s*$/i, (m, g1) => (g1.toLowerCase() === "copy" ? "" : m));
  // Tidy delimiters
  t = t.replace(/\s*[—–-]\s*/g, " — ").replace(/\s*\|\s*/g, " · ").replace(/\s+/g, " ").trim();
  // Remove "(<Name>)" parenthetical
  t = t.replace(/\([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\)/g, "").trim();
  // Strip trailing duration phrasing — the nights/days/duration fields
  // already carry it, so don't bake it into the title (slug too).
  t = t.replace(/\s*[·—–\-|]\s*\d{1,2}\s*N(?:ights?)?\s*\/?\s*\d{1,2}\s*D(?:ays?)?\s*$/i, "");
  t = t.replace(/\s+\d{1,2}\s*N(?:ights?)?\s*\/?\s*\d{1,2}\s*D(?:ays?)?\s*$/i, "");
  t = t.replace(/\s+\d{1,2}\s*(?:Nights?|Days?)\s*$/i, "");
  t = t.replace(/\s*[·—–|]\s*$/g, "").replace(/\s{2,}/g, " ").trim();
  return t || raw.trim();
}

// Humanise a destination slug for use as a fallback title
function destLabel(slug) {
  const map = {
    "char-dham": "Char Dham Yatra", "uttarakhand": "Uttarakhand", "varanasi": "Varanasi & Ayodhya",
    "manali": "Manali", "shimla": "Shimla", "tirupati": "Tirupati Balaji",
    "kerala": "Kerala", "goa": "Goa", "andaman": "Andaman Islands", "kashmir": "Kashmir",
    "sikkim": "Sikkim", "darjeeling": "Darjeeling", "north-east": "North East India",
    "rajasthan": "Rajasthan", "puri": "Puri & Konark", "ladakh": "Ladakh",
    "spiti-valley": "Spiti Valley", "zanskar-valley": "Zanskar", "lakshadweep": "Lakshadweep",
    "vietnam": "Vietnam", "thailand": "Thailand", "bali": "Bali", "singapore": "Singapore",
    "malaysia": "Malaysia", "sri-lanka": "Sri Lanka", "maldives": "Maldives",
    "seychelles": "Seychelles", "dubai": "Dubai", "japan": "Japan", "south-korea": "South Korea",
    "turkey": "Turkey", "switzerland": "Switzerland", "italy": "Italy", "paris": "Paris",
    "france": "France", "uk": "United Kingdom", "russia": "Russia", "kenya": "Kenya",
    "australia": "Australia", "cambodia": "Cambodia", "hong-kong": "Hong Kong & Macau",
    "nepal": "Nepal",
  };
  return map[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function slugify(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function parsePrice(text) {
  // Strong patterns first — must include a price-token (Rs/INR/per person/+ GST).
  // Bare 4-digit numbers are too risky (years like 2026, PINs like 201301).
  const strong = [
    /Rs\s*([\d,]+)\s*\/?\-?\s*per\s*person/i,
    /Rs\s*([\d,]+)\s*\/?\-/i,
    /INR\s*([\d,]+)/i,
    /([\d,]+)\s*INR/i,
    /([\d,]+)\s*\+\s*5\s*%\s*GST/i,
    /([\d,]+)\s*per\s*person/i,
    /Rs\.?\s*([\d,]+)/i,
  ];
  const isYearOrPin = (n) => (n >= 2020 && n <= 2032) || (n >= 100000 && n <= 999999 && /[1-8]\d{5}/.test(String(n)) && n % 1000 === 301); // crude PIN test 201301
  for (const rx of strong) {
    const m = text.match(rx);
    if (!m) continue;
    const n = parseInt(m[1].replace(/,/g, ""), 10);
    if (n >= 1000 && n <= 5000000 && !isYearOrPin(n)) return n;
  }
  // Bare-price line: a number alone on its own line near the top of the doc
  // (e.g. "102100\n" right under the date). Limit to the first 1500 chars so
  // we don't pick up hotel rate cards or altitude figures buried later.
  const head = text.slice(0, 1500);
  const lineRx = /^\s*([\d,]{4,12})\s*$/gm;
  let m;
  while ((m = lineRx.exec(head)) !== null) {
    const n = parseInt(m[1].replace(/,/g, ""), 10);
    if (n >= 3000 && n <= 5000000 && !isYearOrPin(n)) return n;
  }
  return null;
}

function parseNightsDays(title, text, dateRange) {
  const all = `${title}\n${text}`;
  // Strict patterns first
  let m = all.match(/(\d{1,2})\s*N\s*\/?\s*(\d{1,2})\s*D\b/i)
       || all.match(/(\d{1,2})\s*Night[s]?\s*\/?\s*(\d{1,2})\s*Day[s]?\b/i)
       || all.match(/(\d{1,2})N(\d{1,2})D/i)
       || all.match(/(\d{1,2})\s*Nights?\s*\/\s*(\d{1,2})\s*Days?/i);
  if (m) return { nights: +m[1], days: +m[2] };

  // "X Days / Y Nights" reversed
  m = all.match(/(\d{1,2})\s*Days?\s*\/\s*(\d{1,2})\s*Nights?/i);
  if (m) return { nights: +m[2], days: +m[1] };

  // Just nights ("Manali 3N", "Pooja Jha Nepal 4nts")
  m = title.match(/(\d{1,2})\s*(N\b|nts?\b|Nights?\b)/i);
  if (m) {
    const nights = +m[1];
    return { nights, days: nights + 1 };
  }

  // Derive from date range as last resort
  if (dateRange) {
    const a = Date.parse(dateRange.from);
    const b = Date.parse(dateRange.to);
    if (Number.isFinite(a) && Number.isFinite(b) && b > a) {
      const days = Math.round((b - a) / 86400000) + 1;
      if (days >= 2 && days <= 30) return { nights: days - 1, days };
    }
  }
  return null;
}

function parseDateRange(text) {
  const m = text.match(/(\w{3,9}\s+\d{1,2},\s*\d{4})\s*-\s*(\w{3,9}\s+\d{1,2},\s*\d{4})/);
  if (!m) return null;
  return { from: m[1], to: m[2] };
}

function parseDestinationSlug(title, text) {
  // Pass 1: title-only — most reliable, avoids body-boilerplate false positives
  for (const { rx, slug } of KEYWORD_MAP) {
    if (rx.test(title)) return slug;
  }
  // Pass 2: body fallback. Strip boilerplate first so we don't match phrases
  // like "Char Dham" inside cancellation examples.
  const body = stripBoilerplate(text);
  for (const { rx, slug } of KEYWORD_MAP) {
    if (rx.test(body)) return slug;
  }
  return null;
}

function parseHotels(text) {
  // Lines like "Hotel <Name> or Similar <City> ( <config> )" or "Check in at <Name>"
  const hotels = [];
  const seen = new Set();
  const rx1 = /Hotel\s+([A-Z][\w&\s,'.-]+?)\s+or\s+Similar\s+([\w\s]+?)\s*(?:\(|$)/g;
  let m;
  while ((m = rx1.exec(text)) !== null) {
    const name = m[1].trim();
    const city = m[2].trim();
    const key = `${name}|${city}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hotels.push({ city, name });
  }
  const rx2 = /Check\s+in\s+at\s+([^\n-]{3,80}?)\s*(?:-\s*\1)?\s*$/gm;
  while ((m = rx2.exec(text)) !== null) {
    const name = m[1].trim().replace(/[\s,-]+$/, "");
    if (!name || seen.has(name) || name.length > 80) continue;
    seen.add(name);
    hotels.push({ city: "", name });
  }
  return hotels.slice(0, 8);
}

function stripBoilerplate(s) {
  // Cut at the standard "Information & Documents / Terms / Inclusions" tail
  // so descriptions don't leak the policy block into Sanity.
  const cut = s.search(/Information\s*&\s*Documents|Terms and Policies|IMPORTANT NOTES|Inclusion and Exclusions/i);
  return cut > 0 ? s.slice(0, cut) : s;
}

function cleanDayBody(s) {
  return s
    .replace(/Page\s*\d+\s*of\s*\d+/gi, "")
    .replace(/Trust and Trip[^\n]*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function dedupeDays(days) {
  // Keep one entry per day number; prefer entries with non-empty descriptions.
  const byDay = new Map();
  for (const d of days) {
    const existing = byDay.get(d.day);
    if (!existing) { byDay.set(d.day, d); continue; }
    if ((existing.description || "").length < (d.description || "").length) byDay.set(d.day, d);
  }
  return [...byDay.values()].sort((a, b) => a.day - b.day);
}

function parseItinerary(text) {
  const days = [];
  const norm = stripBoilerplate(cleanText(text));

  // Pattern A: "Day N: Title" form (also tolerate "Day-N", "Day N -")
  const rxA = /Day[\s-]+(\d{1,2})\s*[:\-—–]\s*([^\n]{3,140})/g;
  const matches = [...norm.matchAll(rxA)];
  if (matches.length) {
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const dayNum = +m[1];
      const titlePart = m[2].trim().replace(/\s+/g, " ");
      const start = m.index + m[0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index : Math.min(norm.length, start + 900);
      let body = norm.slice(start, end);
      body = body.replace(/Page \d+ of \d+/g, "").replace(/Trust and Trip[^\n]*/g, "");
      const desc = cleanDayBody(body.split("\n").map(s => s.trim()).filter(Boolean).join(" ")).slice(0, 500);
      days.push({ day: dayNum, title: titlePart, description: desc, meals: { breakfast: dayNum > 1, lunch: false, dinner: true } });
    }
    return dedupeDays(days);
  }

  // Pattern C: "Day N" on its own line, body on the following lines
  // (used by quote-style PDFs with Trip Summary blocks)
  const rxC = /^\s*Day\s+(\d{1,2})\s*$/gm;
  const cMatches = [...norm.matchAll(rxC)];
  if (cMatches.length >= 2) {
    for (let i = 0; i < cMatches.length; i++) {
      const m = cMatches[i];
      const dayNum = +m[1];
      const start = m.index + m[0].length;
      const end = i + 1 < cMatches.length ? cMatches[i + 1].index : Math.min(norm.length, start + 800);
      const slice = norm.slice(start, end).split("\n").map(s => s.trim()).filter(Boolean);
      const titlePart = (slice[0] || "").slice(0, 110);
      const desc = cleanDayBody(slice.join(" ")).slice(0, 500);
      days.push({ day: dayNum, title: titlePart, description: desc, meals: { breakfast: dayNum > 1, lunch: false, dinner: true } });
    }
    return dedupeDays(days);
  }

  // Pattern B: date headers like "May 25 - Monday" followed by activities
  const rxB = /(\b\w{3,9})\s+(\d{1,2})\s*-\s*(\w{6,9})\b\s*\n([^\n]{3,200})/g;
  const m2 = [...norm.matchAll(rxB)];
  if (m2.length) {
    for (let i = 0; i < m2.length; i++) {
      const m = m2[i];
      const start = m.index + m[0].length;
      const end = i + 1 < m2.length ? m2[i + 1].index : Math.min(norm.length, start + 700);
      const body = cleanDayBody(norm.slice(start, end).split("\n").map(s => s.trim()).filter(Boolean).join(" ")).slice(0, 450);
      days.push({
        day: i + 1,
        title: m[4].trim().slice(0, 90),
        description: body,
        meals: { breakfast: i > 0, lunch: false, dinner: true },
      });
    }
    return dedupeDays(days);
  }

  return [];
}

function parseMealPlan(text) {
  const m = text.match(/Meal\s*Plan\s*[:\-]?\s*([A-Z]+)/i);
  return m ? m[1].toUpperCase() : null;
}

function parseCab(text) {
  const m = text.match(/Cab\s*[:\-]?\s*([^\n\r]{2,40})/i);
  return m ? m[1].replace(/\s{2,}/g, " ").trim() : null;
}

// ──────────────────────────────────────────────────────────────────────────
// Build a Sanity package document from one PDF text file
// ──────────────────────────────────────────────────────────────────────────
function buildPackageDoc(pdfNum, txt) {
  // Extract title — first non-fluff line near top
  const lines = txt.split("\n").map(l => l.trim());
  // Find line index of the trustandtrip.com URL header — title is usually 1–4 lines below
  let urlIdx = lines.findIndex(l => /https:\/\/trustandtrip\.com/i.test(l));
  if (urlIdx < 0) urlIdx = 3;

  // Collect candidate title lines (skip empties + page markers)
  let titleRaw = "";
  for (let i = urlIdx + 1; i < urlIdx + 12 && i < lines.length; i++) {
    const l = lines[i];
    if (!l) continue;
    if (/^Page \d+ of \d+/.test(l)) continue;
    if (/^Trip Summary/i.test(l)) break;
    if (/\d{4}\s*-\s*\w+\s+\d/.test(l)) break;          // date range — title done
    if (/^(Rs\.?|INR)\s+[\d,]+/i.test(l)) break;        // price line — title done
    if (/^[\d,]+\s+(INR|per|\+)/i.test(l)) break;
    titleRaw += " " + l;
    if (titleRaw.trim().length > 30 && /[a-z]/.test(l)) break;
  }
  titleRaw = titleRaw.trim() || `Package ${pdfNum}`;
  let title = cleanTitle(titleRaw);

  const date = parseDateRange(txt);
  const parsedPrice = parsePrice(txt);
  // Use the RAW title (still carries "(Darjeeling Gangtok)" hints) so that
  // destination detection sees the customer-attached cue before cleanTitle
  // strips the parenthetical.
  const destSlug = parseDestinationSlug(titleRaw, txt);

  // Replace title only when it's a customer name with NO destination cue.
  // Titles like "4N5D Goa" or "Puri 4N5D" already encode the destination —
  // keep them. "Hina" / "Deepanshu Marken" / empty parens get the swap.
  const titleHasDestCue = KEYWORD_MAP.some(({ rx }) => rx.test(title));
  const looksLikeName   = /^[A-Z][a-z]+(\s+[A-Z][a-z]+){0,2}$/.test(title);
  const isJunkTitle     = !titleHasDestCue && (title.length < 8 || looksLikeName);
  if (isJunkTitle && destSlug) {
    const nd0 = parseNightsDays(title, txt, date);
    title = nd0
      ? `${destLabel(destSlug)} ${nd0.nights}N${nd0.days}D`
      : `${destLabel(destSlug)} Itinerary`;
  }

  const price = parsedPrice ?? (destSlug ? FALLBACK_PRICE_BY_DEST[destSlug] : null) ?? null;
  let nd = parseNightsDays(title, txt, date);

  // Slug — keep the cleaned title; collisions are deduped at the doc-set
  // step in main() (see SLUG_USED below). Don't suffix the pdf number —
  // the cleaned title is already unique enough for ~99% of imports.
  const slug = slugify(title);
  const hotels = parseHotels(txt);
  const itinerary = parseItinerary(txt);
  const mealPlan = parseMealPlan(txt);
  const cab = parseCab(txt);

  // Last-resort nights/days from itinerary length
  if (!nd && itinerary.length >= 2) {
    nd = { nights: itinerary.length - 1, days: itinerary.length };
  }

  const issues = [];
  if (!destSlug) issues.push("destination unmapped");
  if (!price) issues.push("price unparsed");
  if (!nd) issues.push("nights/days unparsed");
  if (itinerary.length === 0) issues.push("itinerary empty");

  const destId = destSlug ? ALL_DESTS[destSlug] : null;

  // Categories — derive from title + the destination slug only.
  // Body text is too noisy (boilerplate mentions Nepal/Vietnam in cancellation
  // examples and would mis-tag Char Dham as International).
  const categories = [];
  const titleLc = title.toLowerCase();
  const INTL_DESTS = new Set([
    "vietnam","thailand","bali","nepal","sri-lanka","maldives","seychelles",
    "dubai","singapore","malaysia","japan","south-korea","turkey","switzerland",
    "italy","paris","france","uk","russia","kenya","australia","cambodia","hong-kong",
  ]);
  if (/honeymoon/.test(titleLc))                                       categories.push("Honeymoon");
  if (/family|kids/.test(titleLc))                                     categories.push("Family");
  if (/yatra|temple|darshan|dham|jyotirlinga|kashi|chardham|panchkedar/.test(titleLc) || destSlug === "char-dham" || destSlug === "varanasi" || destSlug === "tirupati") categories.push("Pilgrim", "Spiritual");
  if (destSlug && INTL_DESTS.has(destSlug))                            categories.push("International");
  if (/beach|island/.test(titleLc) || destSlug === "andaman" || destSlug === "lakshadweep" || destSlug === "maldives") categories.push("Beach");
  if (/hill|mountain|himalaya|trek/.test(titleLc) || ["manali","shimla","ladakh","spiti-valley","zanskar-valley","sikkim","darjeeling","kashmir","north-east"].includes(destSlug)) categories.push("Mountain");
  if (/luxury|5\s*star|premium/.test(titleLc))                         categories.push("Luxury");
  if (/group|\d+\s*pax/.test(titleLc))                                 categories.push("Groups");
  if (categories.length === 0)                                         categories.push("Family", "Cultural");

  const doc = {
    _id: `imported-pdf-${pdfNum}`,
    _type: "package",
    title,
    slug: { _type: "slug", current: slug },
    destination: destId ? { _type: "reference", _ref: destId } : null,
    price: price || 0,
    duration: nd ? `${nd.days} Days / ${nd.nights} Nights` : undefined,
    nights: nd?.nights,
    days: nd?.days,
    travelType:
      /honeymoon|couple/i.test(title) ? "Couple" :
      /family|kids/i.test(title)      ? "Family" :
      /group|\d+\s*pax/i.test(title)  ? "Group" :
      /solo/i.test(title)             ? "Solo"  : "Family",
    description:
      `${title}.${date ? ` Travel window: ${date.from} – ${date.to}.` : ""}` +
      (mealPlan ? ` Meal plan: ${mealPlan}.` : "") +
      (cab ? ` Vehicle: ${cab}.` : "") +
      (hotels.length ? ` Stays at ${hotels.slice(0, 3).map(h => h.name).join(", ")}.` : ""),
    highlights: [
      ...(date ? [`Travel window: ${date.from} – ${date.to}`] : []),
      ...(mealPlan ? [`Meal plan: ${mealPlan}`] : []),
      ...(cab ? [`Vehicle: ${cab}`] : []),
      ...(hotels.slice(0, 4).map(h => h.city ? `${h.name} (${h.city})` : h.name)),
    ].slice(0, 6),
    inclusions: STANDARD_INCLUSIONS,
    exclusions: STANDARD_EXCLUSIONS,
    hotel: hotels[0] ? {
      name: hotels[0].name,
      stars: 3,
      description: hotels[0].city ? `${hotels[0].name} — ${hotels[0].city}` : hotels[0].name,
    } : undefined,
    hotels: hotels.length > 1 ? hotels.map(h => ({
      _key: slugify(`${h.city}-${h.name}`).slice(0, 32) + Math.random().toString(36).slice(2, 6),
      city: h.city || "Stay",
      nights: 1,
      name: h.name,
      stars: 3,
    })) : undefined,
    itinerary: itinerary.length ? itinerary.map((d) => ({
      _key: `day-${d.day}`,
      title: `Day ${d.day} — ${d.title}`,
      description: d.description,
      meals: d.meals,
    })) : undefined,
    categories,
    tags: [
      ...(destSlug ? [destSlug] : []),
      ...(mealPlan ? [`meal-${mealPlan.toLowerCase()}`] : []),
      "imported-from-pdf",
    ],
    trending: false,
    featured: false,
    limitedSlots: false,
    faqs: STANDARD_FAQS.map((f, i) => ({ _key: `faq-${i}`, ...f })),
    bestFor: title,
    visaInfo: {
      required: /^(?!.*(India|Indian|Domestic)).*(vietnam|thailand|bali|nepal|sri\s*lanka|maldives|seychelles|dubai|singapore|malaysia|japan|korea|turkey|switzerland|italy|paris|france|uk|russia|kenya|australia|cambodia|hong\s*kong)/i.test(title),
      notes: /vietnam|thailand|bali|nepal|sri\s*lanka|maldives|seychelles|dubai|singapore|malaysia|japan|korea|turkey|switzerland|italy|paris|france|uk|russia|kenya|australia|cambodia|hong\s*kong/i.test(title)
        ? "International — visa-on-arrival or e-Visa for Indian passports (varies by country). Confirm with our team."
        : "Domestic — Indian ID required.",
    },
  };

  // Strip undefined fields so Sanity doesn't reject
  for (const k of Object.keys(doc)) if (doc[k] === undefined) delete doc[k];

  return { doc, issues };
}

// ──────────────────────────────────────────────────────────────────────────
// Sanity write helper
// ──────────────────────────────────────────────────────────────────────────
async function mutate(docs, label) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}?returnIds=true&visibility=sync`;
  const mutations = docs.map((doc) => ({ createOrReplace: doc }));
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutations }),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) {
    console.error(`[${label}] Sanity error (status ${res.status}):`, JSON.stringify(json, null, 2));
    process.exit(1);
  }
  console.log(`  [${label}] status=${res.status} resultIds=${(json.results || []).length} firstId=${json.results?.[0]?.id ?? "n/a"}`);
  if (json.error || json.errors) {
    console.error(`  [${label}] Sanity reported error in 2xx body:`, JSON.stringify(json, null, 2));
    process.exit(1);
  }
  return json;
}

// ──────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(TXT_DIR, { recursive: true });

  // ── Step 1: enumerate PDFs ─────────────────────────────────────────
  if (!fs.existsSync(PDF_DIR)) {
    console.error(`PDF folder not found: ${PDF_DIR}`);
    process.exit(1);
  }
  const pdfs = fs.readdirSync(PDF_DIR)
    .filter(f => f.endsWith(".pdf"))
    .map(f => ({ num: parseInt(f, 10), file: f }))
    .filter(x => Number.isFinite(x.num))
    .sort((a, b) => a.num - b.num);

  console.log(`Found ${pdfs.length} PDFs.`);

  if (DESTS_ONLY) {
    if (!COMMIT) {
      console.log(`\nWould seed ${NEW_DESTS.length} new destinations:`);
      for (const d of NEW_DESTS) console.log(`  + ${d.name} (${d.slug.current})`);
      console.log("\nRe-run with --create-dests-only --commit to push.");
      return;
    }
    await mutate(NEW_DESTS, "destinations");
    console.log(`Seeded ${NEW_DESTS.length} destinations.`);
    return;
  }

  // ── Step 2: extract + parse all PDFs ───────────────────────────────
  const docs = [];
  const issuesLog = [];

  for (const { num, file } of pdfs) {
    const pdfPath = path.join(PDF_DIR, file);
    const txtPath = path.join(TXT_DIR, `${num}.txt`);
    try {
      ensureTxt(pdfPath, txtPath);
    } catch (err) {
      issuesLog.push({ pdf: num, fatal: `pdftotext failed: ${err.message}` });
      continue;
    }
    const txt = fs.readFileSync(txtPath, "utf8");
    const { doc, issues } = buildPackageDoc(num, txt);
    docs.push(doc);
    if (issues.length) issuesLog.push({ pdf: num, title: doc.title, issues });
  }

  // ── Step 3: report ─────────────────────────────────────────────────
  const withDest    = docs.filter(d => d.destination).length;
  const withPrice   = docs.filter(d => d.price > 0).length;
  const withNights  = docs.filter(d => d.nights).length;
  const withItin    = docs.filter(d => Array.isArray(d.itinerary) && d.itinerary.length > 0).length;

  console.log("\n── Parse summary ───────────────────────────────────────");
  console.log(`  Total parsed:        ${docs.length}/${pdfs.length}`);
  console.log(`  Has destination ref: ${withDest}`);
  console.log(`  Has price:           ${withPrice}`);
  console.log(`  Has nights/days:     ${withNights}`);
  console.log(`  Has itinerary:       ${withItin}`);

  if (issuesLog.length) {
    console.log(`\n── ${issuesLog.length} packages with issues ─────────────────────`);
    for (const e of issuesLog) {
      console.log(`  ${String(e.pdf).padStart(2)}.pdf  ${(e.title || "").slice(0, 60).padEnd(60)}  ${e.fatal || (e.issues || []).join(", ")}`);
    }
  }

  // ── Step 4: dedupe identical titles (keep lowest pdf-num) ──────────
  const byTitle = new Map();
  for (const d of docs) {
    const key = d.title.toLowerCase();
    if (!byTitle.has(key)) byTitle.set(key, d);
  }
  const deduped = [...byTitle.values()];
  const dropped = docs.length - deduped.length;
  if (dropped > 0) console.log(`\nDropped ${dropped} duplicate-title doc(s).`);

  // ── Step 4b: dedupe slugs across the batch (cleaned titles can repeat
  // across PDFs — e.g. several "Goa Family Holiday" quotes). Append -2,
  // -3, … to the second-and-later occurrences so the slug field stays
  // unique without leaking pdf numbers into URLs.
  const slugUsed = new Set();
  for (const d of deduped) {
    const base = d.slug?.current || "package";
    let final = base;
    let n = 1;
    while (slugUsed.has(final)) {
      n += 1;
      final = `${base}-${n}`;
    }
    slugUsed.add(final);
    d.slug = { _type: "slug", current: final };
  }

  // ── Step 5: filter out docs missing required fields ────────────────
  const ready = deduped.filter(d => d.destination && d.price > 0);
  const skipped = deduped.filter(d => !d.destination || !(d.price > 0));
  console.log(`\nReady to upload: ${ready.length}`);
  console.log(`Skipped (missing destination or price): ${skipped.length}`);
  if (skipped.length) {
    for (const d of skipped) {
      console.log(`  SKIP  ${d._id}  ${d.title}  reason: ${!d.destination ? "no-dest" : ""}${!(d.price > 0) ? " no-price" : ""}`);
    }
  }

  // ── Step 5: dry-run sample dump ────────────────────────────────────
  if (!COMMIT) {
    console.log("\n── Sample documents (first 3 ready) ────────────────────");
    for (const d of ready.slice(0, 3)) {
      console.log(JSON.stringify(d, null, 2));
      console.log("");
    }
    console.log(`Re-run with --commit to upload ${NEW_DESTS.length} destinations + ${ready.length} packages to Sanity production.`);
    return;
  }

  // ── Step 6: COMMIT ─────────────────────────────────────────────────
  console.log("\nUploading new destinations…");
  await mutate(NEW_DESTS, "destinations");
  console.log(`Seeded ${NEW_DESTS.length} destinations.`);

  console.log("\nUploading packages in batches of 10…");
  for (let i = 0; i < ready.length; i += 10) {
    const batch = ready.slice(i, i + 10);
    await mutate(batch, `packages ${i + 1}-${i + batch.length}`);
    console.log(`  pushed ${i + batch.length}/${ready.length}`);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
