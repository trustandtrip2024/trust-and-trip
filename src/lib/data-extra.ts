// Catalogue extension — 30 additional destinations (15 Indian, 15 international)
// popular with Indian travellers, plus 3 new experience verticals (safari,
// camping, trekking). Packages are built programmatically from a theme matrix
// so each destination ships with five tour shapes (couple, family, group,
// solo, weekend) without 4,000 lines of boilerplate.
//
// To add another destination: append to NEW_DESTINATIONS, give it an entry
// in DEST_BASE_PRICE, and the five packages spawn for free.

import type { Destination, Package, Experience } from "./data";

// ─── Image palette ──────────────────────────────────────────────────────────
// Reused Unsplash IDs grouped by destination flavour. Keeps the catalogue
// visually coherent without hardcoding 60 distinct URLs. Each destination
// picks a flavour below.

const IMG = {
  beachIsland:  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop",
  beachIslandH: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format&fit=crop",
  tropicHero:   "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1920&q=80&auto=format&fit=crop",
  tropic:       "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80&auto=format&fit=crop",
  mountainSnow: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop",
  mountainSnowH:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80&auto=format&fit=crop",
  alpine:       "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?w=1200&q=80&auto=format&fit=crop",
  alpineH:      "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?w=1920&q=80&auto=format&fit=crop",
  desert:       "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80&auto=format&fit=crop",
  desertH:      "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1920&q=80&auto=format&fit=crop",
  heritage:     "https://images.unsplash.com/photo-1538970272646-f61fabb3a1f0?w=1200&q=80&auto=format&fit=crop",
  heritageH:    "https://images.unsplash.com/photo-1538970272646-f61fabb3a1f0?w=1920&q=80&auto=format&fit=crop",
  forest:       "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80&auto=format&fit=crop",
  forestH:      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80&auto=format&fit=crop",
  lake:         "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1200&q=80&auto=format&fit=crop",
  lakeH:        "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1920&q=80&auto=format&fit=crop",
  cityNight:    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=80&auto=format&fit=crop",
  cityNightH:   "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80&auto=format&fit=crop",
  safari:       "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80&auto=format&fit=crop",
  safariH:      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80&auto=format&fit=crop",
  trek:         "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=1200&q=80&auto=format&fit=crop",
  trekH:        "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=1920&q=80&auto=format&fit=crop",
};

// ─── 15 Indian + 15 International destinations ─────────────────────────────

export const extraDestinations: Destination[] = [
  // ── INDIA (15) ───────────────────────────────────────────────────────────
  {
    name: "Goa", slug: "goa", country: "India", region: "Asia", priceFrom: 18000,
    image: IMG.beachIsland, heroImage: IMG.beachIslandH,
    tagline: "Sunsets, Susegad, and Sea Breeze",
    overview: "Goa is two coasts in one — North's bustling beach shacks and live music, South's quieter palm-lined sands. Portuguese churches, fiery vindaloo, and feni at sundown round out a holiday that resets the soul.",
    bestTimeToVisit: "November to February",
    idealDuration: "4 to 6 days",
    thingsToDo: ["Sunset cruise on the Mandovi", "Dudhsagar waterfall day trip", "Anjuna flea market", "Spice plantation tour", "Old Goa cathedral walk"],
    highlights: ["Beach Bliss", "Nightlife", "Heritage Walks", "Goan Cuisine"],
  },
  {
    name: "Rajasthan", slug: "rajasthan", country: "India", region: "Asia", priceFrom: 32000,
    image: IMG.desert, heroImage: IMG.desertH,
    tagline: "Forts, Sands, and Silken Stories",
    overview: "Rajasthan is a journey through India's most theatrical landscapes — Jaipur's pink palaces, Udaipur's lake-side City Palace, Jaisalmer's golden sandstone fort, and the rolling Thar dunes that turn copper at sunset.",
    bestTimeToVisit: "October to March",
    idealDuration: "7 to 10 days",
    thingsToDo: ["Camel safari in the Thar", "Udaipur lake palace boat ride", "Hot-air balloon over Jaipur", "Jaisalmer Fort sound-and-light", "Block-printing workshop in Bagru"],
    highlights: ["Royal Heritage", "Desert Adventures", "Folk Music", "Palace Stays"],
  },
  {
    name: "Ladakh", slug: "ladakh", country: "India", region: "Asia", priceFrom: 35000,
    image: IMG.mountainSnow, heroImage: IMG.mountainSnowH,
    tagline: "Where Earth Touches the Sky",
    overview: "Ladakh is high-altitude desert at its rawest — Pangong's surreal blue, Nubra's twin-humped camels, monasteries clinging to cliffs, and roads that climb to 18,000 ft. A place that recalibrates what scale means.",
    bestTimeToVisit: "May to September",
    idealDuration: "7 to 9 days",
    thingsToDo: ["Drive over Khardung La", "Camp by Pangong Lake", "Monastery hop — Hemis, Thiksey, Diskit", "Bactrian camel ride in Hunder", "Magnetic Hill optical illusion"],
    highlights: ["High-Altitude Lakes", "Buddhist Heritage", "Bike Trips", "Adventure"],
  },
  {
    name: "Andaman Islands", slug: "andaman", country: "India", region: "Asia", priceFrom: 30000,
    image: IMG.tropic, heroImage: IMG.tropicHero,
    tagline: "India's Own Maldives",
    overview: "Powder-white beaches, glass-clear water, and a coral world most Indians don't realise we own. Havelock's Radhanagar Beach, Neil's Bharatpur reef, and the haunting silence of Cellular Jail's history.",
    bestTimeToVisit: "November to April",
    idealDuration: "5 to 7 days",
    thingsToDo: ["Scuba dive at Havelock", "Sea-walk at North Bay", "Glass-bottom boat at Jolly Buoy", "Bioluminescent night kayak", "Cellular Jail light-and-sound show"],
    highlights: ["Coral Reefs", "Scuba & Snorkel", "Island Hopping", "Honeymoon"],
  },
  {
    name: "Manali", slug: "manali", country: "India", region: "Asia", priceFrom: 16000,
    image: IMG.alpine, heroImage: IMG.alpineH,
    tagline: "Apple Orchards, Apple-Cheeked Kids",
    overview: "Manali is the easiest mountain reset from Delhi — pine-cloaked Old Manali, snow at Solang and Rohtang, paragliding above Kullu, and cosy cafes that smell of cinnamon and woodsmoke.",
    bestTimeToVisit: "March to June, September to December",
    idealDuration: "4 to 6 days",
    thingsToDo: ["Solang Valley snow play", "Paragliding above Solang", "Hadimba Devi temple walk", "Manikaran Sahib day trip", "Old Manali cafe-hopping"],
    highlights: ["Snow Play", "Adventure Sports", "Riverside Stays", "Family Friendly"],
  },
  {
    name: "Shimla & Kasol", slug: "shimla-kasol", country: "India", region: "Asia", priceFrom: 17500,
    image: IMG.forest, heroImage: IMG.forestH,
    tagline: "Colonial Charm Meets Parvati Dreams",
    overview: "Shimla's Mall Road colonial bones layered with Kasol's Israeli-cafe Parvati Valley counterculture. Toy trains, slate-roof villages, and rivers loud enough to drown the city in your head.",
    bestTimeToVisit: "March to June, October to February",
    idealDuration: "5 to 7 days",
    thingsToDo: ["Kalka–Shimla toy train", "Hike to Kheerganga hot springs", "Tosh village stay", "Manikaran gurudwara langar", "Mall Road and Christ Church walk"],
    highlights: ["Toy Train", "Hippie Trail", "Hot Springs", "Riverside Cafes"],
  },
  {
    name: "Rishikesh & Mussoorie", slug: "rishikesh-mussoorie", country: "India", region: "Asia", priceFrom: 14000,
    image: IMG.forest, heroImage: IMG.forestH,
    tagline: "Ganga Aarti to Queen of Hills",
    overview: "Rishikesh is the world's yoga capital — river rafting by morning, evening aarti by the Ganges. A short drive away, Mussoorie's mist, Kempty Falls, and a Mall Road that smells of pakoras.",
    bestTimeToVisit: "September to June",
    idealDuration: "4 to 5 days",
    thingsToDo: ["Ganga aarti at Triveni Ghat", "White-water rafting Marine Drive to Shivpuri", "Beatles Ashram graffiti walk", "Gun Hill cable car", "Camel's Back Road trek"],
    highlights: ["Yoga & Wellness", "River Rafting", "Hill Station", "Spiritual Walks"],
  },
  {
    name: "Sikkim — Gangtok & Pelling", slug: "sikkim", country: "India", region: "Asia", priceFrom: 22000,
    image: IMG.mountainSnow, heroImage: IMG.mountainSnowH,
    tagline: "Where Kanchenjunga Watches Over",
    overview: "Sikkim is small, but the views are vast. Gangtok's MG Marg, Tsomgo's mirror lake, Nathula's barbed-wire frontier, and Pelling's pink-sky Kanchenjunga that looks Photoshopped.",
    bestTimeToVisit: "March to May, September to December",
    idealDuration: "6 to 8 days",
    thingsToDo: ["Tsomgo Lake & Baba Mandir day trip", "Kanchenjunga sunrise from Pelling", "Rumtek Monastery walk", "Yumthang Valley of Flowers", "Cable car to Hanuman Tok"],
    highlights: ["Mountain Views", "Buddhist Monasteries", "High Lakes", "Quiet Roads"],
  },
  {
    name: "Meghalaya — Shillong & Cherrapunji", slug: "meghalaya", country: "India", region: "Asia", priceFrom: 21000,
    image: IMG.forest, heroImage: IMG.forestH,
    tagline: "The Wettest, Greenest Corner",
    overview: "Living-root bridges that take 20 years to grow. Caves longer than your patience. Waterfalls so loud they drown out conversation. Meghalaya is monsoon-veined, music-loving, and entirely its own.",
    bestTimeToVisit: "October to May",
    idealDuration: "6 to 8 days",
    thingsToDo: ["Double Decker Living Root Bridge trek", "Mawlynnong — Asia's cleanest village", "Dawki river boating on glass water", "Mawsmai Cave exploration", "Shillong cafe and music scene"],
    highlights: ["Root Bridges", "Caves", "Waterfalls", "Cleanest Village"],
  },
  {
    name: "Tawang, Arunachal Pradesh", slug: "tawang", country: "India", region: "Asia", priceFrom: 28000,
    image: IMG.mountainSnow, heroImage: IMG.mountainSnowH,
    tagline: "Last Frontier, First Light",
    overview: "Tawang sits at 10,000 ft on the edge of India's Northeast — birthplace of the 6th Dalai Lama, home to the country's largest monastery, and host to lakes that mirror snow peaks more than the sky.",
    bestTimeToVisit: "March to October",
    idealDuration: "8 to 10 days",
    thingsToDo: ["Tawang Monastery dawn prayer", "Madhuri Lake / Sangetsar drive", "Sela Pass photo stop", "Bumla Pass with permit (India–China border)", "Bomdila viewpoint"],
    highlights: ["Highest Monastery", "Mountain Passes", "Frontier Travel", "Buddhist Heritage"],
  },
  {
    name: "Kashmir", slug: "kashmir", country: "India", region: "Asia", priceFrom: 26000,
    image: IMG.lake, heroImage: IMG.lakeH,
    tagline: "If There Is a Paradise",
    overview: "Srinagar's shikara-strewn Dal, Gulmarg's gondola to 13,000 ft, Pahalgam's Lidder valley, and Sonmarg's golden meadows. Kashmir delivers, in postcard form, the India most Indians dream of.",
    bestTimeToVisit: "March to October (summer), December to February (snow)",
    idealDuration: "6 to 8 days",
    thingsToDo: ["Shikara ride on Dal Lake", "Gulmarg gondola — Phase 1 and Phase 2", "Pahalgam pony ride to Aru Valley", "Sonmarg snowline trek", "Mughal Gardens — Nishat & Shalimar"],
    highlights: ["Houseboats", "Snow & Skiing", "Saffron Fields", "Mughal Gardens"],
  },
  {
    name: "Spiti Valley", slug: "spiti", country: "India", region: "Asia", priceFrom: 32000,
    image: IMG.mountainSnow, heroImage: IMG.mountainSnowH,
    tagline: "Middle Land Between Worlds",
    overview: "Spiti is what Ladakh feels like before it became Instagram. Mud-roofed villages at 14,000 ft, the world's highest motorable post office at Hikkim, and Key Monastery clinging to a hillside like a prayer.",
    bestTimeToVisit: "May to October",
    idealDuration: "7 to 9 days",
    thingsToDo: ["Key Monastery photo essay", "Highest village stay at Komic", "Chandratal Lake camp", "Hikkim post office postcard send", "Pin Valley national park drive"],
    highlights: ["Cold Desert", "Remote Villages", "Camping", "Bike Trips"],
  },
  {
    name: "Coorg", slug: "coorg", country: "India", region: "Asia", priceFrom: 14000,
    image: IMG.forest, heroImage: IMG.forestH,
    tagline: "Scotland of the South",
    overview: "Coffee plantations curling around hillsides, Kodava cuisine that smells of pork curry and pandhi, Abbey Falls thundering through monsoon, and homestays where the rain doesn't stop and you stop minding.",
    bestTimeToVisit: "October to March, June to September (monsoon lovers)",
    idealDuration: "3 to 5 days",
    thingsToDo: ["Coffee plantation walk and tasting", "Abbey Falls and Raja's Seat", "Dubare elephant camp", "Tibetan Golden Temple at Bylakuppe", "Tadiandamol trek"],
    highlights: ["Coffee Estates", "Homestays", "Waterfalls", "Quiet Hills"],
  },
  {
    name: "Ooty & Coonoor (Nilgiris)", slug: "ooty-coonoor", country: "India", region: "Asia", priceFrom: 13000,
    image: IMG.forest, heroImage: IMG.forestH,
    tagline: "Tea Toy-Train Twosome",
    overview: "The Nilgiri Mountain Railway from Mettupalayam to Ooty is a UNESCO heritage ride. Coonoor's tea estates are quieter than Ooty's lakes. Eucalyptus, fudge, and a chill that needs a sweater even in May.",
    bestTimeToVisit: "October to June",
    idealDuration: "3 to 5 days",
    thingsToDo: ["Nilgiri toy train Mettupalayam to Coonoor", "Doddabetta Peak viewpoint", "Botanical Garden walk", "Sim's Park in Coonoor", "Tea factory tour"],
    highlights: ["UNESCO Toy Train", "Tea Gardens", "Cool Climate", "Family Hill Station"],
  },
  {
    name: "Hampi", slug: "hampi", country: "India", region: "Asia", priceFrom: 12000,
    image: IMG.heritage, heroImage: IMG.heritageH,
    tagline: "Boulders, Ruins, and Forgotten Empires",
    overview: "Hampi is what happens when a 14th-century empire crumbles into surrealist sculpture. Vijayanagara temples scattered across a Mars-like boulder landscape — bouldering by day, coracle rides on the Tungabhadra by evening.",
    bestTimeToVisit: "October to February",
    idealDuration: "3 to 4 days",
    thingsToDo: ["Vittala Temple stone chariot", "Virupaksha Temple aarti", "Sunset from Matanga Hill", "Coracle ride on Tungabhadra", "Anegundi village walk"],
    highlights: ["UNESCO Heritage", "Bouldering", "Ruins & Temples", "Backpacker Trail"],
  },
  // ── INTERNATIONAL (15) ────────────────────────────────────────────────────
  {
    name: "Thailand", slug: "thailand", country: "Thailand", region: "Asia", priceFrom: 38000,
    image: IMG.beachIsland, heroImage: IMG.beachIslandH,
    tagline: "Beach, Buddha, Bangkok Buzz",
    overview: "Thailand is three trips bundled into one — Bangkok's grand palace and chaotic charm, Phuket's full-moon island energy, and Krabi's limestone-cliff serenity. Visa on arrival, vegetarian-friendly, and friendly to first-time international travellers.",
    bestTimeToVisit: "November to March",
    idealDuration: "6 to 8 days",
    thingsToDo: ["Phi Phi & Maya Bay speedboat", "Floating market at Damnoen Saduak", "James Bond Island day trip", "Bangkok grand palace and Wat Pho", "Phuket Big Buddha sunset"],
    highlights: ["Beaches", "Visa-on-Arrival", "Street Food", "Island Hopping"],
  },
  {
    name: "Singapore", slug: "singapore", country: "Singapore", region: "Asia", priceFrom: 55000,
    image: IMG.cityNight, heroImage: IMG.cityNightH,
    tagline: "Garden City of Tomorrow",
    overview: "Singapore is a six-day blueprint of how a city can be clean, green, and unrelentingly fun. Universal Studios, Sentosa, Marina Bay Sands, hawker stalls with Michelin stars, and the most Indian-friendly metro in the world.",
    bestTimeToVisit: "Year-round (avoid Nov–Jan rains)",
    idealDuration: "4 to 6 days",
    thingsToDo: ["Universal Studios Sentosa", "Gardens by the Bay Supertree show", "Marina Bay Sands SkyPark", "Singapore Zoo Night Safari", "Little India and Hawker Center crawl"],
    highlights: ["Family Friendly", "Theme Parks", "Indian Food", "Visa Friendly"],
  },
  {
    name: "Vietnam", slug: "vietnam", country: "Vietnam", region: "Asia", priceFrom: 48000,
    image: IMG.lake, heroImage: IMG.lakeH,
    tagline: "Halong Mist to Saigon Buzz",
    overview: "Vietnam is a north-to-south journey of contrasts — Hanoi's old quarter, Halong Bay's emerald karsts on an overnight cruise, Hoi An's lantern-lit lanes, and Ho Chi Minh City's motorbike thunder.",
    bestTimeToVisit: "October to April",
    idealDuration: "7 to 10 days",
    thingsToDo: ["Overnight Halong Bay cruise", "Hoi An lantern-walk evening", "Cu Chi Tunnels half-day", "Ninh Binh Tam Coc rowboat", "Ho Chi Minh City Mekong Delta day trip"],
    highlights: ["Halong Bay", "Cuisine", "Ancient Towns", "Affordable Luxury"],
  },
  {
    name: "Sri Lanka", slug: "sri-lanka", country: "Sri Lanka", region: "Asia", priceFrom: 36000,
    image: IMG.tropic, heroImage: IMG.tropicHero,
    tagline: "Pearl of the Indian Ocean",
    overview: "Sigiriya's lion rock, Kandy's sacred tooth, Ella's nine-arch bridge train ride, and Galle's Dutch fort. Add yala leopards, hill-country tea, and beaches Bali wishes it had.",
    bestTimeToVisit: "December to April (west/south), May to September (east)",
    idealDuration: "7 to 9 days",
    thingsToDo: ["Climb Sigiriya at sunrise", "Kandy temple of the tooth", "Ella to Kandy scenic train", "Yala safari for leopards", "Galle Fort sunset walk"],
    highlights: ["Visa Free for Indians", "Heritage", "Wildlife Safaris", "Tea Country"],
  },
  {
    name: "Nepal", slug: "nepal", country: "Nepal", region: "Asia", priceFrom: 24000,
    image: IMG.mountainSnow, heroImage: IMG.mountainSnowH,
    tagline: "Himalayan Soul",
    overview: "Kathmandu's stupas and durbar squares, Pokhara's lake-and-mountain combo, Chitwan's jungle elephants, and an Everest mountain flight that delivers the world's tallest peak in one hour.",
    bestTimeToVisit: "October to December, March to May",
    idealDuration: "6 to 8 days",
    thingsToDo: ["Everest mountain flight from Kathmandu", "Pokhara Phewa Lake boating", "Sarangkot sunrise viewpoint", "Chitwan jungle safari", "Boudhanath Stupa kora walk"],
    highlights: ["No Visa", "Mountain Flights", "Jungle Safari", "Adventure Sports"],
  },
  {
    name: "Bhutan", slug: "bhutan", country: "Bhutan", region: "Asia", priceFrom: 42000,
    image: IMG.mountainSnow, heroImage: IMG.mountainSnowH,
    tagline: "Land of the Thunder Dragon",
    overview: "Bhutan is what monasteries, low-traffic roads, and Gross National Happiness look like in 2026. Tiger's Nest, Punakha's dzong, Thimphu's giant Buddha, and Paro's red-rice fields.",
    bestTimeToVisit: "March to May, September to November",
    idealDuration: "6 to 8 days",
    thingsToDo: ["Tiger's Nest hike (Paro Taktsang)", "Punakha Dzong rivers confluence", "Buddha Dordenma in Thimphu", "Dochula Pass with 108 chortens", "Paro Rinpung Dzong walk"],
    highlights: ["Carbon Negative", "Buddhist Heritage", "Quiet Roads", "Friendly Visa"],
  },
  {
    name: "Malaysia", slug: "malaysia", country: "Malaysia", region: "Asia", priceFrom: 42000,
    image: IMG.cityNight, heroImage: IMG.cityNightH,
    tagline: "Truly Asia, Truly Affordable",
    overview: "Kuala Lumpur's twin towers and Batu Caves, Langkawi's cable car and beach hopping, Genting's casino-and-cool-air weekends. Halal-friendly, English-friendly, Indian-passport-friendly.",
    bestTimeToVisit: "December to February",
    idealDuration: "5 to 7 days",
    thingsToDo: ["Petronas Twin Towers SkyBridge", "Langkawi Sky Bridge cable car", "Batu Caves climb", "Genting Highlands theme park", "KL Bird Park family visit"],
    highlights: ["Twin Towers", "Beaches", "Indian Food", "eVisa"],
  },
  {
    name: "Mauritius", slug: "mauritius", country: "Mauritius", region: "Africa", priceFrom: 75000,
    image: IMG.beachIsland, heroImage: IMG.beachIslandH,
    tagline: "Honeymoon, Defined",
    overview: "Mauritius is the honeymoon island Indian couples grew up dreaming of — Le Morne's blue lagoon, the seven-coloured earth at Chamarel, dolphin watching at Tamarin, and resorts staffed by Hindi-speaking hosts.",
    bestTimeToVisit: "May to December",
    idealDuration: "6 to 8 days",
    thingsToDo: ["Ile aux Cerfs catamaran day", "Underwater seabed walk", "Chamarel Seven Coloured Earth", "Black River Gorges hike", "Dolphin swim at Tamarin"],
    highlights: ["Honeymoon", "Visa Free", "Beach Resorts", "Watersports"],
  },
  {
    name: "Turkey", slug: "turkey", country: "Turkey", region: "Europe", priceFrom: 78000,
    image: IMG.heritage, heroImage: IMG.heritageH,
    tagline: "Where Continents Kiss",
    overview: "Istanbul where Europe meets Asia, Cappadocia where the dawn fills with hot-air balloons, and Pamukkale's white travertine pools. Turkey is one of the most photogenic 8 days an Indian passport can afford.",
    bestTimeToVisit: "April to June, September to November",
    idealDuration: "8 to 10 days",
    thingsToDo: ["Cappadocia hot air balloon at sunrise", "Hagia Sophia and Blue Mosque tour", "Bosphorus dinner cruise", "Ephesus ancient ruins", "Pamukkale travertine pools"],
    highlights: ["Hot Air Balloons", "eVisa", "Cuisine", "History"],
  },
  {
    name: "Egypt", slug: "egypt", country: "Egypt", region: "Africa", priceFrom: 70000,
    image: IMG.desert, heroImage: IMG.desertH,
    tagline: "Pharaohs, Pyramids, Pure Awe",
    overview: "Pyramids of Giza, the Sphinx that has watched 4,500 sunsets, Luxor's Valley of Kings, and a Nile cruise where dinner is served as Karnak's pillars roll past. Egypt is bucket-list, simplified.",
    bestTimeToVisit: "October to April",
    idealDuration: "7 to 9 days",
    thingsToDo: ["Pyramids and Sphinx tour", "Khan el-Khalili bazaar", "Nile dinner cruise in Cairo", "Luxor Valley of the Kings", "Sharm el-Sheikh Red Sea snorkel"],
    highlights: ["Pyramids", "Nile Cruise", "Visa on Arrival", "Ancient History"],
  },
  {
    name: "Georgia", slug: "georgia", country: "Georgia", region: "Asia", priceFrom: 65000,
    image: IMG.mountainSnow, heroImage: IMG.mountainSnowH,
    tagline: "Caucasus's Best-Kept Secret",
    overview: "Tbilisi's cobblestone old town, Kazbegi's Trinity Church floating against snow peaks, the wine country of Kakheti, and bread fresh from clay-oven tone bakeries. Visa-friendly. Selfie-perfect.",
    bestTimeToVisit: "May to October",
    idealDuration: "6 to 8 days",
    thingsToDo: ["Gergeti Trinity Church day from Tbilisi", "Old Tbilisi sulphur bath", "Mtskheta UNESCO town visit", "Kakheti wine country tasting", "Cable car to Narikala Fortress"],
    highlights: ["eVisa", "Mountain Views", "Wine Country", "Affordable Europe"],
  },
  {
    name: "Azerbaijan", slug: "azerbaijan", country: "Azerbaijan", region: "Asia", priceFrom: 60000,
    image: IMG.cityNight, heroImage: IMG.cityNightH,
    tagline: "Land of Fire",
    overview: "Baku is futuristic — Flame Towers, Heydar Aliyev Centre's curves, and a Caspian boulevard that reads like Dubai met Paris. Day-trip to Gobustan's mud volcanoes and Yanardag's eternal flame.",
    bestTimeToVisit: "April to June, September to October",
    idealDuration: "5 to 7 days",
    thingsToDo: ["Flame Towers viewpoint", "Heydar Aliyev Centre architecture walk", "Gobustan mud volcanoes", "Yanardag burning mountain", "Old City (Icherisheher) tour"],
    highlights: ["eVisa", "Modern Architecture", "Affordable", "Caspian Coast"],
  },
  {
    name: "Japan", slug: "japan", country: "Japan", region: "Asia", priceFrom: 145000,
    image: IMG.cityNight, heroImage: IMG.cityNightH,
    tagline: "Tradition Wired to Tomorrow",
    overview: "Tokyo's neon, Kyoto's temples, Mount Fuji at sunrise, and the Shinkansen that turns 500 km into a meal. Cherry blossoms in April, autumn maples in November, and ramen at midnight all year.",
    bestTimeToVisit: "March to May (sakura), September to November (koyo)",
    idealDuration: "8 to 10 days",
    thingsToDo: ["Tokyo Shibuya crossing and TeamLab", "Kyoto Fushimi Inari shrine", "Mount Fuji and Hakone day", "Bullet train to Osaka", "Nara deer park"],
    highlights: ["Cherry Blossoms", "Bullet Trains", "Cuisine", "Pop Culture"],
  },
  {
    name: "Australia — East Coast", slug: "australia", country: "Australia", region: "Oceania", priceFrom: 165000,
    image: IMG.beachIsland, heroImage: IMG.beachIslandH,
    tagline: "Sydney to Surfers",
    overview: "Sydney's Opera House and Bondi, Gold Coast's beaches and theme parks, Cairns and the Great Barrier Reef. Long flight, but the kind of trip that pays off across two generations of family memory.",
    bestTimeToVisit: "September to November, March to May",
    idealDuration: "8 to 12 days",
    thingsToDo: ["Sydney Harbour Bridge climb", "Bondi to Coogee coastal walk", "Great Barrier Reef snorkel", "Gold Coast theme parks (Movie World, Sea World)", "Blue Mountains day trip"],
    highlights: ["Reef", "Theme Parks", "Beach + City", "Family"],
  },
  {
    name: "Iceland", slug: "iceland", country: "Iceland", region: "Europe", priceFrom: 195000,
    image: IMG.alpine, heroImage: IMG.alpineH,
    tagline: "Land of Fire and Ice",
    overview: "Iceland is a 7-day drive around a single Ring Road that hands you waterfalls, glaciers, lava fields, and — in winter — the Northern Lights. Few destinations on earth pack this much geological theatre into one trip.",
    bestTimeToVisit: "September to March (Aurora), June to August (midnight sun)",
    idealDuration: "6 to 9 days",
    thingsToDo: ["Northern Lights chase from Reykjavik", "Golden Circle — Geysir, Thingvellir, Gullfoss", "Blue Lagoon thermal bath", "Glacier walk on Vatnajokull", "Black sand beach at Reynisfjara"],
    highlights: ["Northern Lights", "Glaciers", "Volcanoes", "Bucket-List"],
  },

  // ── INDIA · 2026 catalogue refresh — 12 destinations big with family
  // and group travellers ────────────────────────────────────────────────
  {
    name: "Char Dham Yatra", slug: "char-dham", country: "India", region: "Asia", priceFrom: 22000,
    image: IMG.mountainSnow, heroImage: IMG.mountainSnowH,
    tagline: "Four Sacred Peaks, One Lifetime Journey",
    overview: "The Char Dham circuit — Yamunotri, Gangotri, Kedarnath, Badrinath — threads four of Hinduism's holiest shrines across the Garhwal Himalayas. Helicopter and road packages run May–October, with multi-generational families making up most of every batch.",
    bestTimeToVisit: "May to June, September to October",
    idealDuration: "9 to 11 days",
    thingsToDo: ["Helicopter darshan circuit", "Kedarnath trek or chopper", "Gangotri Aarti by the river", "Badrinath morning pooja", "Mana — last village before Tibet"],
    highlights: ["Pilgrim Yatra", "Multi-Gen Family", "Helicopter Option", "Group Departures"],
  },
  {
    name: "Varanasi", slug: "varanasi", country: "India", region: "Asia", priceFrom: 14000,
    image: IMG.heritage, heroImage: IMG.heritageH,
    tagline: "Where the Ganga Writes the Day",
    overview: "Varanasi is older than history and louder than any guidebook lets on. Sunrise boat rides, Ganga aarti at Dashashwamedh, narrow lanes thick with kachori and benarasi silk — a city that hits Indian families and groups exactly where memory lives.",
    bestTimeToVisit: "October to March",
    idealDuration: "3 to 5 days",
    thingsToDo: ["Sunrise boat ride on the Ganga", "Dashashwamedh evening aarti", "Sarnath Buddhist circuit", "Banaras silk weaver visit", "Walking food tour through Vishwanath gali"],
    highlights: ["Spiritual Core", "Cultural Walks", "Family Friendly", "Group Tours"],
  },
  {
    name: "Ranthambore", slug: "ranthambore", country: "India", region: "Asia", priceFrom: 26000,
    image: IMG.safari, heroImage: IMG.safariH,
    tagline: "Where the Tiger Still Owns the Forest",
    overview: "India's most reliable tiger sighting park. Ranthambore mixes Aravalli forest, ancient ruins, and Range-1-to-10 jeep safaris that consistently put families and group travellers in front of the big cat — kids 5+ welcome on the morning drives.",
    bestTimeToVisit: "October to June (park closes July–September)",
    idealDuration: "3 to 5 days",
    thingsToDo: ["Morning and evening jeep safari", "Ranthambore Fort and Ganesh temple", "Naturalist-led walking tour", "Rajiv Gandhi tiger conservation talk", "Padam Talao photography point"],
    highlights: ["Jungle Safari", "Tiger Reserve", "Family Friendly", "Permit Handled"],
  },
  {
    name: "Kanha National Park", slug: "kanha", country: "India", region: "Asia", priceFrom: 30000,
    image: IMG.forest, heroImage: IMG.forestH,
    tagline: "The Real Jungle Book",
    overview: "Kipling's Jungle Book was set here. Kanha's sal forest and meadows are home to tigers, leopards, gaur, and the endemic barasingha. Forest-edge lodges run dawn safaris built for families who want the wild without the rough edges.",
    bestTimeToVisit: "November to June",
    idealDuration: "3 to 5 days",
    thingsToDo: ["Dawn jeep safari in Mukki zone", "Barasingha meadow drive", "Naturalist village walk", "Bandhavgarh add-on extension", "Family-friendly lodge campfire"],
    highlights: ["Jungle Safari", "Tiger Sightings", "Barasingha", "Family Lodges"],
  },
  {
    name: "Pondicherry", slug: "pondicherry", country: "India", region: "Asia", priceFrom: 18000,
    image: IMG.beachIsland, heroImage: IMG.beachIslandH,
    tagline: "France on the Coromandel Coast",
    overview: "Pondicherry — or Puducherry — is yellow-walled French Quarter cafés, surf-side Auroville bohemia, and Tamil temples a few lanes apart. A favourite long-weekend escape from Chennai and Bangalore for families and friend groups.",
    bestTimeToVisit: "October to March",
    idealDuration: "3 to 4 days",
    thingsToDo: ["Promenade walk at sunrise", "French Quarter café crawl", "Auroville Matrimandir visit", "Paradise Beach speedboat", "Sri Aurobindo Ashram morning meditation"],
    highlights: ["French Quarter", "Beach Town", "Long Weekends", "Family Friendly"],
  },
  {
    name: "Darjeeling", slug: "darjeeling", country: "India", region: "Asia", priceFrom: 20000,
    image: IMG.alpine, heroImage: IMG.alpineH,
    tagline: "Where India Sips Its Morning Light",
    overview: "Darjeeling pairs Kanchenjunga sunrises with hillside tea estates, the UNESCO toy train, and Tibetan-monastery quiet. Three-generation family parties love its compact loop — Tiger Hill at dawn, Happy Valley by tea, Mall Road by twilight.",
    bestTimeToVisit: "March to May, October to December",
    idealDuration: "4 to 6 days",
    thingsToDo: ["Tiger Hill sunrise", "Toy train joy ride to Ghoom", "Happy Valley tea estate tour", "Padmaja Naidu Himalayan Zoological Park", "Tea-tasting at Margaret's Deck"],
    highlights: ["Hill Station", "Tea Estates", "Toy Train", "Multi-Gen Family"],
  },
  {
    name: "Mount Abu", slug: "mount-abu", country: "India", region: "Asia", priceFrom: 13000,
    image: IMG.lake, heroImage: IMG.lakeH,
    tagline: "Rajasthan's Only Hill Station",
    overview: "A green oasis 1,200 m above the Thar — Nakki Lake boat rides, Dilwara Jain temples, and Sunset Point evenings. Mount Abu pulls Gujarati and Rajasthani families back every summer for its cool air and pilgrim-meets-picnic mix.",
    bestTimeToVisit: "October to March, summer escape April to June",
    idealDuration: "3 to 4 days",
    thingsToDo: ["Nakki Lake paddle boat", "Dilwara Jain temples tour", "Sunset Point and Honeymoon Point", "Guru Shikhar — Rajasthan's highest peak", "Brahma Kumari Peace Park visit"],
    highlights: ["Hill Station", "Family Friendly", "Pilgrim Add-On", "Quick Trips"],
  },
  {
    name: "Mahabaleshwar & Panchgani", slug: "mahabaleshwar", country: "India", region: "Asia", priceFrom: 12000,
    image: IMG.forest, heroImage: IMG.forestH,
    tagline: "Strawberry Country in the Sahyadris",
    overview: "A two-hill cluster six hours from Mumbai and Pune, Mahabaleshwar layers strawberry farms, Venna Lake boat rides, and Sahyadri viewpoints. Weekend regular for Mumbai families and Pune friend groups all year round.",
    bestTimeToVisit: "October to June",
    idealDuration: "2 to 4 days",
    thingsToDo: ["Strawberry farm picking visit", "Venna Lake horse-cab ride", "Pratapgad Fort day trip", "Arthur's Seat viewpoint walk", "Mapro chocolate factory tour"],
    highlights: ["Weekend Hills", "Family Friendly", "Strawberry Farms", "Maharashtra"],
  },
  {
    name: "Lonavala & Khandala", slug: "lonavala", country: "India", region: "Asia", priceFrom: 9500,
    image: IMG.forest, heroImage: IMG.forestH,
    tagline: "The Twin Hills That Never Stop Trending",
    overview: "Two hours from Mumbai, three from Pune. Lonavala-Khandala's monsoon waterfalls, Bhushi Dam splashes, and Della-Adlabs adrenaline parks make it the default group-friend and young-family weekend reset.",
    bestTimeToVisit: "June to October (monsoon), November to February (winter)",
    idealDuration: "2 to 3 days",
    thingsToDo: ["Bhushi Dam monsoon visit", "Karla and Bhaja caves walk", "Tiger Point and Lion's Point sunset", "Della Adventure Park", "Pawna Lake camping add-on"],
    highlights: ["Weekend Hills", "Group Friendly", "Monsoon Magic", "Maharashtra"],
  },
  {
    name: "Lakshadweep", slug: "lakshadweep", country: "India", region: "Asia", priceFrom: 58000,
    image: IMG.tropic, heroImage: IMG.tropicHero,
    tagline: "India's Own Atolls",
    overview: "Thirty-six coral atolls 400 km off the Kerala coast — Bangaram, Agatti, Kadmat. Lakshadweep delivers Maldives-grade reefs at Indian-passport prices, ideal for adventurous families and small group dive trips.",
    bestTimeToVisit: "October to May",
    idealDuration: "5 to 7 days",
    thingsToDo: ["Snorkel the Bangaram lagoon", "Glass-bottom boat over coral gardens", "Scuba intro dive at Kadmat", "Sunset kayak in Agatti", "Traditional jasari dance evening"],
    highlights: ["Coral Reefs", "Beach Bliss", "Family Adventure", "Visa-Free India"],
  },
  {
    name: "Pushkar", slug: "pushkar", country: "India", region: "Asia", priceFrom: 15000,
    image: IMG.desert, heroImage: IMG.desertH,
    tagline: "The Sacred Lake & the Camel Fair",
    overview: "Pushkar wraps the world's only Brahma temple, a 52-ghat holy lake, and one of the planet's last folk-music camel fairs. A tight Rajasthan loop with Jaipur or Jodhpur — favourite of multi-gen Indian families and friend groups.",
    bestTimeToVisit: "October to March (Pushkar Fair: November)",
    idealDuration: "2 to 4 days",
    thingsToDo: ["Brahma Temple visit", "Pushkar Lake aarti walk", "Pushkar Camel Fair attendance", "Sunset camel safari in the dunes", "Folk music evening at Savitri Temple hill"],
    highlights: ["Pilgrim Town", "Camel Fair", "Cultural Family", "Rajasthan Loop"],
  },
  {
    name: "Tirupati & Tirumala", slug: "tirupati", country: "India", region: "Asia", priceFrom: 11000,
    image: IMG.heritage, heroImage: IMG.heritageH,
    tagline: "India's Most-Visited Temple Town",
    overview: "Tirumala's Sri Venkateswara temple is the world's busiest pilgrimage site. Trust and Trip handles VIP darshan slots, Tirupati lodging, and a Chandragiri or Kalahasti add-on — engineered for multi-gen families and senior-citizen groups.",
    bestTimeToVisit: "September to February",
    idealDuration: "2 to 3 days",
    thingsToDo: ["Tirumala VIP darshan", "Sri Padmavathi temple visit", "Chandragiri Fort tour", "Sri Kalahasti shrine extension", "Kapila Theertham waterfall walk"],
    highlights: ["Pilgrim Yatra", "VIP Darshan", "Senior-Citizen Friendly", "Multi-Gen Family"],
  },

  // ── INTERNATIONAL · 2026 catalogue refresh — 8 destinations big with
  // Indian family and group travellers ─────────────────────────────────
  {
    name: "France — Paris & Disneyland", slug: "france", country: "France", region: "Europe", priceFrom: 145000,
    image: IMG.cityNight, heroImage: IMG.cityNightH,
    tagline: "Eiffel by Night, Disney by Day",
    overview: "Paris with kids is Eiffel illumination, Seine cruises, Louvre's headline rooms, and a full day at Disneyland Paris. Families pair it with London or Switzerland on a 7–10 day Europe loop most summers.",
    bestTimeToVisit: "April to October",
    idealDuration: "5 to 7 days",
    thingsToDo: ["Eiffel Tower second-level access", "Seine river cruise with dinner", "Disneyland Paris full-day pass", "Louvre Mona Lisa & Egyptian wing", "Versailles Palace day trip"],
    highlights: ["Family Europe", "Disneyland", "Iconic Sights", "Group Tours"],
  },
  {
    name: "Italy — Rome, Florence, Venice", slug: "italy", country: "Italy", region: "Europe", priceFrom: 165000,
    image: IMG.heritage, heroImage: IMG.heritageH,
    tagline: "Three Cities, Three Centuries",
    overview: "Italy is Rome's Colosseum, Florence's Renaissance, and Venice's gondola lanes — wired together by fast trains. Vegetarian-friendly food, 4-star comfort, and a slower pace make it a hit with Indian multi-gen families.",
    bestTimeToVisit: "April to June, September to October",
    idealDuration: "7 to 9 days",
    thingsToDo: ["Colosseum + Roman Forum guided tour", "Vatican Museums skip-the-line", "Florence Duomo and Uffizi", "Venice gondola ride", "Pisa leaning tower photo stop"],
    highlights: ["Heritage Trail", "Vegetarian-Friendly", "Multi-Gen Family", "Group Friendly"],
  },
  {
    name: "United Kingdom — London & Scotland", slug: "uk", country: "United Kingdom", region: "Europe", priceFrom: 195000,
    image: IMG.cityNight, heroImage: IMG.cityNightH,
    tagline: "From Big Ben to the Highlands",
    overview: "London's Buckingham Palace, Tower Bridge, and Harry Potter Studios pull big Indian family bookings; pair with Scotland's Edinburgh and Loch Ness for the perfect 9-day loop. Visa support and Indian-meal hotels included.",
    bestTimeToVisit: "May to September",
    idealDuration: "8 to 10 days",
    thingsToDo: ["Buckingham Palace + Changing of the Guard", "Harry Potter Warner Bros studio", "Stonehenge and Bath day trip", "Edinburgh Castle and Royal Mile", "Loch Ness scenic cruise"],
    highlights: ["Family Europe", "Visa Support", "Indian-Meals Stays", "Group Tours"],
  },
  {
    name: "Hong Kong & Macau", slug: "hong-kong", country: "Hong Kong SAR", region: "Asia", priceFrom: 85000,
    image: IMG.cityNight, heroImage: IMG.cityNightH,
    tagline: "Disney Days, Skyline Nights",
    overview: "Hong Kong Disneyland, Ocean Park, Victoria Peak, and the Macau ferry add-on. Asia's most family-friendly short-haul Europe-feel city, with vegetarian food sorted and 5-night packages that fit Indian school breaks.",
    bestTimeToVisit: "October to March",
    idealDuration: "5 to 6 days",
    thingsToDo: ["Hong Kong Disneyland full day", "Ocean Park half day", "Victoria Peak tram and skyline", "Lantau Island Big Buddha + Ngong Ping cable car", "Macau day trip — Senado Square + Ruins of St Paul"],
    highlights: ["Disney Asia", "Family Friendly", "Short Haul", "Group Tours"],
  },
  {
    name: "Cambodia — Siem Reap & Angkor", slug: "cambodia", country: "Cambodia", region: "Asia", priceFrom: 55000,
    image: IMG.heritage, heroImage: IMG.heritageH,
    tagline: "Sunrise Over the World's Largest Hindu Temple",
    overview: "Angkor Wat sunrise pulls in lakhs of Indian pilgrim and heritage travellers each year. Pair the temple loop with Tonle Sap floating villages and a Phnom Penh extension — all visa-on-arrival, all under-budget for groups.",
    bestTimeToVisit: "November to March",
    idealDuration: "4 to 6 days",
    thingsToDo: ["Angkor Wat sunrise tour", "Bayon and Ta Prohm temple loop", "Tonle Sap floating village cruise", "Apsara dance evening with dinner", "Phnom Penh Royal Palace add-on"],
    highlights: ["Hindu Heritage", "Visa on Arrival", "Group Pilgrim", "Cultural Family"],
  },
  {
    name: "South Korea — Seoul & Jeju", slug: "south-korea", country: "South Korea", region: "Asia", priceFrom: 95000,
    image: IMG.cityNight, heroImage: IMG.cityNightH,
    tagline: "K-Pop, Cherry Blossoms, Lotte World",
    overview: "Seoul's palaces, Lotte World theme park, K-pop fan stops, and Jeju's volcanic island beaches. South Korea has become the rising-star Asian destination for Indian young families and friend groups since 2024.",
    bestTimeToVisit: "March to May, September to November",
    idealDuration: "6 to 8 days",
    thingsToDo: ["Gyeongbokgung Palace + hanbok photoshoot", "Lotte World theme park day", "Myeongdong street-food crawl", "Nami Island day trip", "Jeju lava tube + Seongsan Ilchulbong"],
    highlights: ["K-Tour", "Cherry Blossom", "Family Theme Parks", "Group Trending"],
  },
  {
    name: "Kenya — Maasai Mara Safari", slug: "kenya", country: "Kenya", region: "Africa", priceFrom: 165000,
    image: IMG.safari, heroImage: IMG.safariH,
    tagline: "The Big Five, Live and Loud",
    overview: "Maasai Mara delivers the Big Five and the Great Migration river crossings (July–October). Trust and Trip pairs Mara lodges with Lake Nakuru flamingos and Amboseli's elephant herds for an 8-day family-grade safari loop.",
    bestTimeToVisit: "July to October (Migration), January to February",
    idealDuration: "7 to 9 days",
    thingsToDo: ["Maasai Mara Big-Five game drives", "Mara River crossing (in season)", "Lake Nakuru flamingo safari", "Amboseli elephants vs Kilimanjaro", "Maasai village cultural visit"],
    highlights: ["Big Five Safari", "Great Migration", "Family Adventure", "Group Departures"],
  },
  {
    name: "Russia — Moscow & St Petersburg", slug: "russia", country: "Russia", region: "Europe", priceFrom: 115000,
    image: IMG.heritage, heroImage: IMG.heritageH,
    tagline: "Red Square, Rivers, Romanov Palaces",
    overview: "Moscow's Red Square and Kremlin, the bullet-train ride to St Petersburg, and Hermitage halls older than Tsarist Russia. A perennial favourite of Indian senior-citizen group tours and adventurous family circuits.",
    bestTimeToVisit: "May to September",
    idealDuration: "7 to 9 days",
    thingsToDo: ["Red Square + Kremlin guided tour", "Sapsan bullet train Moscow → St Petersburg", "Hermitage Museum half day", "Peterhof Palace + fountains", "Moscow Metro architecture walk"],
    highlights: ["Senior-Citizen Group", "Visa Support", "Heritage Tour", "Indian Meals"],
  },
];

// ─── Per-destination base price (for couple package) ─────────────────────
// All other theme prices are derived via THEMES.priceMult.
const DEST_BASE_PRICE: Record<string, number> = {
  goa: 32000, rajasthan: 56000, ladakh: 62000, andaman: 52000, manali: 28000,
  "shimla-kasol": 30000, "rishikesh-mussoorie": 24000, sikkim: 38000, meghalaya: 36000,
  tawang: 48000, kashmir: 44000, spiti: 55000, coorg: 22000, "ooty-coonoor": 21000, hampi: 19000,
  thailand: 64000, singapore: 78000, vietnam: 72000, "sri-lanka": 58000, nepal: 38000,
  bhutan: 68000, malaysia: 64000, mauritius: 110000, turkey: 115000, egypt: 105000,
  georgia: 92000, azerbaijan: 86000, japan: 195000, australia: 220000, iceland: 265000,

  // 2026 catalogue refresh — India family/group bookings
  "char-dham": 26000, varanasi: 18000, ranthambore: 32000, kanha: 36000,
  pondicherry: 22000, darjeeling: 24000, "mount-abu": 16000, mahabaleshwar: 14000,
  lonavala: 11000, lakshadweep: 64000, pushkar: 18000, tirupati: 14000,
  // 2026 catalogue refresh — international family/group bookings
  france: 145000, italy: 165000, uk: 195000, "hong-kong": 95000,
  cambodia: 65000, "south-korea": 110000, kenya: 175000, russia: 120000,
};

// ─── Per-destination flavour tags + extra category ────────────────────────
// Sidecar maps the generator merges into every package built for a slug.
// Keeps the buildPackage signature unchanged while letting the listing
// page surface dest-specific filters (e.g. "Jungle Safari" pulls
// Ranthambore + Kanha; "Pilgrim" pulls Char Dham + Varanasi + Tirupati).

const DEST_FLAVOUR_TAGS: Record<string, string[]> = {
  // existing extras left untagged — generator falls back to []
  "char-dham": ["Pilgrim", "Yatra", "Helicopter Option"],
  varanasi: ["Spiritual", "Ganga Aarti", "Cultural"],
  ranthambore: ["Wildlife", "Jungle Safari", "Tiger Reserve"],
  kanha: ["Wildlife", "Jungle Safari", "Tiger Reserve"],
  pondicherry: ["Beach Town", "French Quarter", "Long Weekend"],
  darjeeling: ["Hill Station", "Tea Estates", "Toy Train"],
  "mount-abu": ["Hill Station", "Family", "Pilgrim Add-On"],
  mahabaleshwar: ["Hill Station", "Strawberry Country", "Sahyadris"],
  lonavala: ["Weekend Hills", "Monsoon Magic", "Maharashtra"],
  lakshadweep: ["Beach Bliss", "Coral Reefs", "India Islands"],
  pushkar: ["Pilgrim", "Camel Fair", "Folk Music"],
  tirupati: ["Pilgrim", "VIP Darshan", "Senior-Citizen Friendly"],
  france: ["Disneyland", "Eiffel", "Family Europe"],
  italy: ["Heritage", "Vegetarian-Friendly", "Multi-Gen"],
  uk: ["Visa Support", "Harry Potter Studio", "Family Europe"],
  "hong-kong": ["Disney Asia", "Short Haul", "Family"],
  cambodia: ["Hindu Heritage", "Angkor Wat", "Visa on Arrival"],
  "south-korea": ["K-Tour", "Cherry Blossom", "Trending"],
  kenya: ["Big Five Safari", "Great Migration", "Adventure Family"],
  russia: ["Senior-Citizen Group", "Heritage", "Indian Meals"],
};

const DEST_EXTRA_CATEGORY: Record<string, string> = {
  "char-dham": "Pilgrim",
  varanasi: "Spiritual",
  ranthambore: "Wildlife",
  kanha: "Wildlife",
  pondicherry: "Beach",
  darjeeling: "Mountain",
  "mount-abu": "Mountain",
  mahabaleshwar: "Mountain",
  lonavala: "Quick Trips",
  lakshadweep: "Beach",
  pushkar: "Cultural",
  tirupati: "Pilgrim",
  france: "Cultural",
  italy: "Cultural",
  uk: "Cultural",
  "hong-kong": "Family",
  cambodia: "Spiritual",
  "south-korea": "Cultural",
  kenya: "Adventure",
  russia: "Cultural",
};

// ─── Theme matrix ──────────────────────────────────────────────────────────
// Five package shapes spawn for every destination. Couple is the 1.0 anchor;
// other multipliers are calibrated to read believable on the listing grid.

type ThemeKey = "couple" | "family" | "group" | "weekend";

const THEMES: Record<ThemeKey, {
  travelType: Package["travelType"];
  nights: number; days: number; duration: string;
  priceMult: number;
  themeLabel: string;
  titleSuffix: string;
  bestFor: string;
  trending?: boolean;
  category: string;
}> = {
  couple: {
    travelType: "Couple", nights: 5, days: 6, duration: "5N/6D",
    priceMult: 1.00, themeLabel: "Honeymoon",
    titleSuffix: "Romantic Escape",
    bestFor: "Couples planning a honeymoon, anniversary, or first-trip-together.",
    trending: true,
    category: "Honeymoon",
  },
  family: {
    travelType: "Family", nights: 5, days: 6, duration: "5N/6D",
    priceMult: 1.10, themeLabel: "Family Holiday",
    titleSuffix: "Family Holiday",
    bestFor: "Families with kids 6+, multi-generational trips, school-break travel.",
    category: "Family",
  },
  group: {
    travelType: "Group", nights: 6, days: 7, duration: "6N/7D",
    priceMult: 0.82, themeLabel: "Group Adventure",
    titleSuffix: "Group Adventure",
    bestFor: "Friends, college groups, and adventurous families travelling together.",
    trending: true,
    category: "Adventure",
  },
  weekend: {
    travelType: "Couple", nights: 2, days: 3, duration: "2N/3D",
    priceMult: 0.42, themeLabel: "Weekend",
    titleSuffix: "Long Weekend",
    bestFor: "Quick recharge trips for busy professionals and short school breaks.",
    category: "Weekend",
  },
};

// ─── Itinerary template ────────────────────────────────────────────────────
// Builds a credible day-by-day from the destination's existing thingsToDo
// list. Day 1 is always arrival, the last day is departure, the days in
// between cycle through the dest's signature experiences.

function buildItinerary(dest: Destination, days: number): Package["itinerary"] {
  const out: Package["itinerary"] = [];
  out.push({
    day: 1,
    title: `Welcome to ${dest.name}`,
    description: `Land in ${dest.name}, private transfer to your stay, and an evening at leisure to settle in. ${dest.tagline ? `${dest.tagline}.` : ""}`.trim(),
  });
  const things = dest.thingsToDo.length > 0 ? dest.thingsToDo : ["Sightseeing"];
  for (let d = 2; d < days; d++) {
    const idx = (d - 2) % things.length;
    out.push({
      day: d,
      title: `Day ${d - 1} — ${things[idx]}`,
      description: `${things[idx]}. Add a relaxed lunch with locals, an afternoon stop at a hidden corner of ${dest.name}, and an evening that's yours to shape.`,
      meals: { breakfast: true },
    });
  }
  out.push({
    day: days,
    title: `Farewell, ${dest.name}`,
    description: `Final breakfast, last-minute souvenir run, and a private transfer to the airport. Fly home with stories worth more than the suitcase you arrived with.`,
    meals: { breakfast: true },
  });
  return out;
}

// ─── Package builder ───────────────────────────────────────────────────────

// Deterministic small hash so reviews/ratings are stable across SSR and
// client renders. Math.random() in this builder would cause hydration
// mismatches when the module is evaluated separately on the server and
// client bundles.
function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildPackage(dest: Destination, themeKey: ThemeKey): Package {
  const t = THEMES[themeKey];
  const base = DEST_BASE_PRICE[dest.slug] ?? dest.priceFrom * 1.6;
  const price = Math.round((base * t.priceMult) / 500) * 500;
  const isInternational = dest.country !== "India";
  const seed = hash(`${dest.slug}-${themeKey}`);

  // Description blends destination tagline with theme intent — keeps each
  // package's marketing copy unique without per-spec hand-authoring.
  const description = (() => {
    switch (themeKey) {
      case "couple":
        return `A ${t.duration} romantic getaway through ${dest.name} — handpicked stays, candlelit dinners, and quiet hours in the corners locals love. ${dest.tagline}.`;
      case "family":
        return `A ${t.duration} family-friendly journey through ${dest.name}, paced for kids and grandparents alike — comfortable transfers, must-see sights, and breathing room between activities.`;
      case "group":
        return `A ${t.duration} group adventure across ${dest.name} — built for friends and adventurous families who want their itinerary loaded with action, photos, and shared meals.`;
      case "weekend":
        return `A ${t.duration} long-weekend escape to ${dest.name} — leave Friday night, return Sunday refreshed. Hotels, transfers, and the highlights, all done for you.`;
    }
  })();

  // Highlights mix the destination's own marquee experiences with one or
  // two theme-specific lines so each card reads distinct on the listing.
  const themeHighlights: Record<ThemeKey, string[]> = {
    couple:  ["Romantic candlelight dinner", "Couples' spa or massage session"],
    family: ["Kid-friendly hotels with pools", "Flexible pace with rest afternoons"],
    group:  ["Adventure activities included", "Group-friendly stays and meals"],
    weekend:["Late-night Friday check-in support", "Compact 3-day highlights itinerary"],
  };
  const highlights = [...dest.thingsToDo.slice(0, 3), ...themeHighlights[themeKey]];

  return {
    title: `${dest.name} ${t.duration} ${t.titleSuffix}`,
    slug: `${dest.slug}-${themeKey}`,
    destinationSlug: dest.slug,
    destinationName: dest.name,
    price,
    duration: t.duration,
    nights: t.nights,
    days: t.days,
    travelType: t.travelType,
    image: dest.image,
    heroImage: dest.heroImage,
    rating: themeKey === "couple" ? 4.9 : themeKey === "weekend" ? 4.7 : 4.8,
    reviews: 60 + (seed % 240),
    description,
    highlights,
    inclusions: [
      `${t.nights} nights in handpicked stays`,
      "Daily breakfast and select meals as per itinerary",
      "All transfers in private air-conditioned vehicle",
      "Sightseeing and entrance fees per itinerary",
      "Local English-speaking host or guide",
      "24/7 Trust and Trip concierge support",
    ],
    exclusions: [
      isInternational ? "International flights from your city" : "Domestic flights or train fares from your city",
      isInternational ? "Visa fees and travel insurance" : "Travel insurance",
      "Personal expenses, tips, and laundry",
      "Meals and activities not specified in inclusions",
    ],
    hotel: {
      name: `Selected ${t.themeLabel.toLowerCase()} stay in ${dest.name}`,
      stars: themeKey === "couple" ? 5 : themeKey === "weekend" ? 3 : 4,
      category: themeKey === "couple" ? "5-star or boutique luxury" : themeKey === "weekend" ? "3-star comfort" : "4-star or above",
      description: `Hand-picked property matched to the ${t.themeLabel.toLowerCase()} pace and the rhythm of ${dest.name}.`,
    },
    itinerary: buildItinerary(dest, t.days),
    activities: dest.thingsToDo.slice(0, 5),
    categories: Array.from(new Set([
      t.category,
      isInternational ? "International" : "Domestic",
      ...(DEST_EXTRA_CATEGORY[dest.slug] ? [DEST_EXTRA_CATEGORY[dest.slug]] : []),
    ])),
    tags: Array.from(new Set([
      t.themeLabel,
      dest.region,
      ...(DEST_FLAVOUR_TAGS[dest.slug] ?? []),
    ])),
    trending: t.trending && (themeKey === "couple" || themeKey === "group"),
    bestFor: t.bestFor,
    whyThisPackage: [
      `${t.themeLabel} pace, designed for ${t.travelType.toLowerCase()} travellers.`,
      `Every transfer, hotel, and activity vetted by a real planner who's been to ${dest.name}.`,
      `Free changes until you approve the final itinerary — pay only when it feels right.`,
    ],
  };
}

// ─── Final exports ─────────────────────────────────────────────────────────

const ALL_THEMES: ThemeKey[] = ["couple", "family", "group", "weekend"];

export const extraPackages: Package[] = extraDestinations.flatMap((dest) =>
  ALL_THEMES.map((theme) => buildPackage(dest, theme)),
);

// 3 new experience verticals — Wildlife Safaris, Camping, Trekking.
// Trekking deliberately overlaps Adventure Expeditions but stands alone
// because group + adventurous-family enquiries consistently search for
// "trek" by name.
export const extraExperiences: Experience[] = [
  {
    title: "Wildlife Safaris",
    slug: "wildlife-safari",
    category: "Wildlife",
    travelType: "Family",
    image: IMG.safari,
    description: "Tigers in Ranthambore, leopards in Yala, the Big Five on the African plains — guided safaris with naturalist hosts and family-safe jeeps.",
    tagline: "Where the wild still has the right of way.",
    highlights: [
      "Naturalist-led morning and evening drives",
      "Lodge stays inside or adjoining national parks",
      "Family-safe jeeps with experienced drivers",
      "Big-5 Africa, Big-Cat India, leopard country Sri Lanka",
      "Flexible departure dates with permit handling",
    ],
  },
  {
    title: "Camping & Glamping",
    slug: "camping",
    category: "Adventure",
    travelType: "Group",
    image: IMG.alpine,
    description: "Pitch your tent under Spiti's stars, glamp in Jaisalmer's dunes, or sleep beside Pangong's water. Curated camps with hot meals, real beds, and clean washrooms.",
    tagline: "Sleep where the sky is the ceiling.",
    highlights: [
      "Switzerland-tents with real beds and hot showers",
      "Bonfires, BBQ dinners, and stargazing nights",
      "Group-friendly itineraries with optional tent upgrades",
      "Pangong, Spiti, Jaisalmer, Rann of Kutch, Bir-Billing",
      "Safe for adventurous families — kids 8+",
    ],
  },
  {
    title: "Treks & High-Altitude Hikes",
    slug: "treks",
    category: "Adventure",
    travelType: "Group",
    image: IMG.trek,
    description: "Kheerganga, Hampta Pass, Roopkund, Everest Base Camp, and Annapurna circuits — fitness-graded treks with certified guides, porters, and rescue protocols.",
    tagline: "The summit is bonus. The walk is the trip.",
    highlights: [
      "Fitness-graded routes — beginner to expert",
      "Certified mountain guides and porter support",
      "Acclimatisation days and rescue protocols",
      "EBC, Annapurna, Roopkund, Hampta, Kedarkantha, Goecha La",
      "Group departures + private custom treks",
    ],
  },
  {
    title: "Jungle Safari Trips",
    slug: "jungle-safari",
    category: "Wildlife",
    travelType: "Family",
    image: IMG.safari,
    description: "Ranthambore tigers, Kanha's barasingha meadows, Bandhavgarh leopards, and Jim Corbett's elephants — Indian-jungle safaris booked through Trust and Trip with permits, naturalists, and forest-edge lodges sorted.",
    tagline: "India's wild side, with kids in the jeep.",
    highlights: [
      "Permit handling for Ranthambore, Kanha, Bandhavgarh, Corbett, Pench",
      "Naturalist-led morning and evening jeep drives",
      "Forest-edge lodges with family rooms",
      "Kids 5+ welcome on most morning safaris",
      "2N–4N modular trips — pair with Khajuraho, Agra, or Nagpur",
    ],
  },
  {
    title: "Trekking Expeditions",
    slug: "trekking",
    category: "Adventure",
    travelType: "Group",
    image: IMG.trek,
    description: "Beginner-friendly Triund and Chopta day hikes, mid-grade Hampta and Kedarkantha, plus advanced Goecha La, EBC, and Annapurna circuits. Group departures every weekend, custom treks any time.",
    tagline: "Boots on, headphones off.",
    highlights: [
      "Beginner to expert grading — match your fitness honestly",
      "Trust-and-Trip-vetted local guides and porters",
      "Pre-trek fitness checklist + gear rental support",
      "Weekend group departures from Delhi, Mumbai, Bangalore",
      "Custom corporate-team and college-group treks",
    ],
  },
  {
    title: "Pre-Wedding Shoot Trips",
    slug: "pre-wedding",
    category: "Couple",
    travelType: "Couple",
    image: IMG.beachIsland,
    description: "Udaipur palaces, Goa beaches, Bali rice fields, Santorini caldera, Kashmir's snowy meadows — pre-wedding destinations curated with photographer coordination, outfit logistics, and permit handling.",
    tagline: "Your story, framed before the wedding starts.",
    highlights: [
      "Destination + photographer combo packages",
      "Permit handling for Taj Mahal, Mehrangarh, Hawa Mahal",
      "Outfit luggage logistics and getting-ready stays",
      "Top picks: Udaipur, Jaisalmer, Goa, Bali, Santorini, Kashmir",
      "2N–4N shoot trips with editing-ready raw delivery",
    ],
  },
  {
    title: "Solo Travel Trips",
    slug: "solo",
    category: "Solo",
    travelType: "Solo",
    image: IMG.alpine,
    description: "Solo trips for first-time and seasoned travellers — safe routes, women-friendly stays, group joins on request, and a 24/7 planner on WhatsApp. Spiti bike loops, Kerala backwater stays, Switzerland rail trips, Vietnam circuits.",
    tagline: "Travel light. Travel alone. Travel safe.",
    highlights: [
      "Verified solo-friendly stays + women-only floors where available",
      "Optional small-group joins for trekking and bike trips",
      "Real planner on WhatsApp through the trip — not a chatbot",
      "Top picks: Spiti, Kerala, Switzerland, Vietnam, Bali, Sikkim",
      "Pickup from your source city, no coach-tour lock-in",
    ],
  },
];
