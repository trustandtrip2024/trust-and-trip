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
};

// ─── Theme matrix ──────────────────────────────────────────────────────────
// Five package shapes spawn for every destination. Couple is the 1.0 anchor;
// other multipliers are calibrated to read believable on the listing grid.

type ThemeKey = "couple" | "family" | "group" | "solo" | "weekend";

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
  solo: {
    travelType: "Solo", nights: 4, days: 5, duration: "4N/5D",
    priceMult: 0.78, themeLabel: "Solo Explorer",
    titleSuffix: "Solo Explorer",
    bestFor: "Independent travellers, sabbatical takers, and weekend introverts.",
    category: "Solo",
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
      case "solo":
        return `A ${t.duration} solo route through ${dest.name} with safe-stay vetted hotels, meet-local moments, and a 24/7 concierge who feels like a friend on the ground.`;
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
    solo:   ["Safe-stay vetted accommodation", "Meet-local guided experiences"],
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
    categories: [t.category, isInternational ? "International" : "Domestic"],
    tags: [t.themeLabel, dest.region],
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

const ALL_THEMES: ThemeKey[] = ["couple", "family", "group", "solo", "weekend"];

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
];
