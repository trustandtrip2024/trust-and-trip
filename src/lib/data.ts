export type Destination = {
  name: string;
  slug: string;
  country: string;
  region: "Asia" | "Europe" | "Americas" | "Africa" | "Oceania" | "Middle East";
  priceFrom: number;
  image: string;
  heroImage: string;
  tagline: string;
  overview: string;
  bestTimeToVisit: string;
  idealDuration: string;
  thingsToDo: string[];
  highlights: string[];
};

export type Package = {
  title: string;
  slug: string;
  destinationSlug: string;
  destinationName: string;
  price: number;
  duration: string;
  nights: number;
  days: number;
  travelType: "Couple" | "Family" | "Group" | "Solo";
  image: string;
  heroImage: string;
  rating: number;
  reviews: number;
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  hotel: {
    name: string;
    category: string;
    description: string;
  };
  itinerary: {
    day: number;
    title: string;
    description: string;
  }[];
  activities: string[];
  trending?: boolean;
  featured?: boolean;
  limitedSlots?: boolean;
};

export type Experience = {
  title: string;
  slug: string;
  category: string;
  image: string;
  description: string;
};

export type Testimonial = {
  name: string;
  location: string;
  rating: number;
  quote: string;
  trip: string;
  image: string;
};

export type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
};

export const destinations: Destination[] = [
  {
    name: "Bali",
    slug: "bali",
    country: "Indonesia",
    region: "Asia",
    priceFrom: 45000,
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80&auto=format&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1920&q=80&auto=format&fit=crop",
    tagline: "Island of the Gods",
    overview:
      "Bali is a living poem of emerald rice terraces, cliff-edge temples, and sun-drenched shores. From the spiritual heart of Ubud to the surf breaks of Uluwatu, this Indonesian gem offers a rare balance between ancient ritual and modern indulgence.",
    bestTimeToVisit: "April to October (Dry Season)",
    idealDuration: "6 to 8 days",
    thingsToDo: [
      "Witness sunrise at Mount Batur",
      "Temple hop through Uluwatu and Tanah Lot",
      "Surf the breaks of Canggu",
      "Explore the Tegallalang rice terraces",
      "Experience a traditional Balinese spa ritual",
    ],
    highlights: ["Beach Bliss", "Cultural Depth", "Luxury Wellness", "Island Adventures"],
  },
  {
    name: "Maldives",
    slug: "maldives",
    country: "Maldives",
    region: "Asia",
    priceFrom: 85000,
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80&auto=format&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1920&q=80&auto=format&fit=crop",
    tagline: "Where Turquoise Meets Infinity",
    overview:
      "A constellation of 1,192 coral islands scattered across the Indian Ocean, the Maldives is the definition of escape. Overwater villas, bioluminescent beaches, and vibrant reefs redefine what a holiday can be.",
    bestTimeToVisit: "November to April",
    idealDuration: "5 to 7 days",
    thingsToDo: [
      "Snorkel with manta rays and whale sharks",
      "Dine underwater at Ithaa",
      "Sunset dolphin cruise",
      "Private sandbank picnic",
      "Couples spa over the lagoon",
    ],
    highlights: ["Overwater Villas", "Coral Reefs", "Romantic Escape", "Private Islands"],
  },
  {
    name: "Switzerland",
    slug: "switzerland",
    country: "Switzerland",
    region: "Europe",
    priceFrom: 125000,
    image:
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1200&q=80&auto=format&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1920&q=80&auto=format&fit=crop",
    tagline: "The Alps, Romanced",
    overview:
      "Switzerland is a country sculpted by glaciers and softened by chocolate. Ride the Glacier Express through snow-capped peaks, watch the sun set over Lake Geneva, and lose yourself in fairy-tale villages.",
    bestTimeToVisit: "May to September (Summer) or December to February (Ski)",
    idealDuration: "8 to 10 days",
    thingsToDo: [
      "Ride the Jungfraujoch — Top of Europe",
      "Cruise on Lake Lucerne",
      "Chocolate factory tour in Gruyères",
      "Snow adventures in Zermatt",
      "Interlaken paragliding",
    ],
    highlights: ["Alpine Trains", "Snow Peaks", "Lakeside Towns", "Luxury Resorts"],
  },
  {
    name: "Santorini",
    slug: "santorini",
    country: "Greece",
    region: "Europe",
    priceFrom: 95000,
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80&auto=format&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1920&q=80&auto=format&fit=crop",
    tagline: "Caldera Sunsets, Whitewashed Dreams",
    overview:
      "Born from a volcano and shaped by the Aegean, Santorini's cliff-top villages glow pink at sunset. Oia, Fira, and Imerovigli offer views that have inspired poets for centuries.",
    bestTimeToVisit: "May to October",
    idealDuration: "5 to 6 days",
    thingsToDo: [
      "Catamaran cruise around the caldera",
      "Wine tasting in Megalochori",
      "Sunset dinner in Oia",
      "Black sand beaches of Perissa",
      "Red Beach cliff walk",
    ],
    highlights: ["Caldera Views", "Greek Cuisine", "Island Hopping", "Romantic Sunsets"],
  },
  {
    name: "Dubai",
    slug: "dubai",
    country: "United Arab Emirates",
    region: "Middle East",
    priceFrom: 55000,
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80&auto=format&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1546412414-e1885259563a?w=1920&q=80&auto=format&fit=crop",
    tagline: "Where the Future Shimmers in Gold",
    overview:
      "Dubai is a skyline sculpted by ambition. From the desert silence at dawn to the neon glow of the Marina at night, it's a city where traditional souks sit a metro stop away from the world's tallest tower.",
    bestTimeToVisit: "November to March",
    idealDuration: "4 to 6 days",
    thingsToDo: [
      "Sunset desert safari with dune bashing",
      "Burj Khalifa observation deck",
      "Dhow cruise through Dubai Marina",
      "Gold and spice souk exploration",
      "Aquaventure Waterpark at Atlantis",
    ],
    highlights: ["Luxury Shopping", "Desert Safari", "Skyline Views", "Family Friendly"],
  },
  {
    name: "Kerala",
    slug: "kerala",
    country: "India",
    region: "Asia",
    priceFrom: 28000,
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80&auto=format&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1580889272861-dc2dbea4e4ab?w=1920&q=80&auto=format&fit=crop",
    tagline: "God's Own Country",
    overview:
      "Kerala is a lyrical blend of coconut groves, backwater labyrinths, and hill-station mists. Spend mornings on a houseboat in Alleppey, afternoons among Munnar's tea plantations, and evenings watching Kathakali unfold.",
    bestTimeToVisit: "September to March",
    idealDuration: "6 to 8 days",
    thingsToDo: [
      "Houseboat cruise through the backwaters",
      "Tea plantation walks in Munnar",
      "Ayurvedic wellness retreat",
      "Wildlife safari in Periyar",
      "Kathakali performance in Kochi",
    ],
    highlights: ["Backwaters", "Hill Stations", "Ayurveda", "Cultural Heritage"],
  },
];

export const packages: Package[] = [
  {
    title: "Bali 4N/5D Honeymoon Escape",
    slug: "bali-4n5d-honeymoon",
    destinationSlug: "bali",
    destinationName: "Bali",
    price: 55000,
    duration: "4N/5D",
    nights: 4,
    days: 5,
    travelType: "Couple",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80&auto=format&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1920&q=80&auto=format&fit=crop",
    rating: 4.9,
    reviews: 327,
    description:
      "A curated honeymoon designed for couples who crave both intimacy and adventure. Private pool villas, candlelit dinners over rice paddies, and a sunset cruise along the Uluwatu coastline.",
    highlights: [
      "Private pool villa in Seminyak",
      "Floating breakfast experience",
      "Romantic candlelight dinner",
      "Uluwatu sunset cruise",
      "Couples spa ritual in Ubud",
    ],
    inclusions: [
      "4 nights in a 5-star private pool villa",
      "Daily breakfast and one romantic dinner",
      "Airport transfers in a private vehicle",
      "All entrance fees and sightseeing",
      "English-speaking local host",
      "24/7 Trust and Trip concierge",
    ],
    exclusions: [
      "International flights",
      "Indonesian visa on arrival fees",
      "Personal expenses and tips",
      "Lunch (except where mentioned)",
      "Travel insurance",
    ],
    hotel: {
      name: "The Samaya Seminyak",
      category: "5-Star Luxury Villa Resort",
      description:
        "A sanctuary of private pool villas steps from the ocean, known for its personalized butler service and serene Balinese architecture.",
    },
    itinerary: [
      {
        day: 1,
        title: "Arrival in Paradise",
        description:
          "Welcome to Bali. Private transfer to your pool villa in Seminyak. Evening at leisure — stroll the black-sand beach and catch the sunset with cocktails at Ku De Ta.",
      },
      {
        day: 2,
        title: "Ubud's Soul",
        description:
          "Morning floating breakfast. Drive to Ubud for the sacred Monkey Forest, Tegallalang rice terraces, and a couples' Balinese massage. Return to Seminyak for a quiet dinner.",
      },
      {
        day: 3,
        title: "Uluwatu & Kecak Fire Dance",
        description:
          "Discover the surfing cliffs of Uluwatu, visit the clifftop temple, and witness the Kecak fire dance at sunset, followed by a seafood dinner on Jimbaran beach.",
      },
      {
        day: 4,
        title: "Nusa Penida Day Trip",
        description:
          "Speedboat to Nusa Penida. Explore Kelingking Beach (the T-Rex cliff), Broken Beach, and Angel's Billabong. Return for a romantic candlelight dinner at your villa.",
      },
      {
        day: 5,
        title: "Farewell, Island of Gods",
        description:
          "Leisurely breakfast and private transfer to the airport. Depart with memories worth more than any currency.",
      },
    ],
    activities: ["Floating Breakfast", "Spa Ritual", "Sunset Cruise", "Temple Visits", "Private Dinner"],
    trending: true,
    featured: true,
    limitedSlots: true,
  },
  {
    title: "Maldives 5N/6D Overwater Villa Retreat",
    slug: "maldives-5n6d-overwater",
    destinationSlug: "maldives",
    destinationName: "Maldives",
    price: 120000,
    duration: "5N/6D",
    nights: 5,
    days: 6,
    travelType: "Couple",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80&auto=format&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1920&q=80&auto=format&fit=crop",
    rating: 4.95,
    reviews: 189,
    description:
      "Wake to the sound of the Indian Ocean beneath your villa's glass floor. This escape includes snorkeling with manta rays, a sandbank picnic, and a private spa over the water.",
    highlights: [
      "Overwater villa with private pool",
      "Seaplane transfers included",
      "All-inclusive meal plan",
      "Snorkeling with marine life",
      "Private sandbank picnic",
    ],
    inclusions: [
      "5 nights in an overwater pool villa",
      "All meals (breakfast, lunch, dinner)",
      "Seaplane transfers from Male",
      "Non-motorized water sports",
      "Couples spa session (60 minutes)",
      "24/7 butler service",
    ],
    exclusions: [
      "International flights",
      "Premium alcoholic beverages",
      "Motorized water sports",
      "Personal shopping",
      "Travel insurance",
    ],
    hotel: {
      name: "Conrad Maldives Rangali Island",
      category: "5-Star Private Island Resort",
      description:
        "Spread across two islands connected by a 500-meter bridge, featuring the world-famous underwater restaurant Ithaa.",
    },
    itinerary: [
      {
        day: 1,
        title: "Arrival by Seaplane",
        description:
          "Scenic seaplane flight from Male. Check-in to your overwater pool villa. Welcome champagne at sunset and dinner at the beach grill.",
      },
      {
        day: 2,
        title: "Reef Discovery",
        description:
          "Guided snorkeling tour of the house reef. Afternoon at leisure. Evening sunset dolphin cruise.",
      },
      {
        day: 3,
        title: "Sandbank & Spa",
        description:
          "Private sandbank picnic with champagne. Return for a couples spa session in an overwater pavilion.",
      },
      {
        day: 4,
        title: "Undersea Dining",
        description:
          "Morning kayaking. Afternoon at your private pool. Evening dinner at Ithaa — the iconic underwater restaurant.",
      },
      {
        day: 5,
        title: "Island Life",
        description:
          "Day at leisure — swim, sleep, read, repeat. Farewell dinner under the stars with private violin performance.",
      },
      {
        day: 6,
        title: "Farewell Paradise",
        description:
          "Last breakfast in the ocean breeze. Seaplane transfer back to Male. Depart with saltwater in your hair and warmth in your heart.",
      },
    ],
    activities: ["Snorkeling", "Seaplane Ride", "Couples Spa", "Sunset Cruise", "Underwater Dining"],
    trending: true,
    featured: true,
  },
  {
    title: "Switzerland 7N/8D Alpine Odyssey",
    slug: "switzerland-7n8d-alps",
    destinationSlug: "switzerland",
    destinationName: "Switzerland",
    price: 185000,
    duration: "7N/8D",
    nights: 7,
    days: 8,
    travelType: "Family",
    image:
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1200&q=80&auto=format&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1920&q=80&auto=format&fit=crop",
    rating: 4.85,
    reviews: 142,
    description:
      "Ride the most scenic trains in the world, stand atop the Jungfraujoch, and let the Alps slow time down. A family-perfect loop across Zurich, Interlaken, Zermatt, and Lucerne.",
    highlights: [
      "Swiss Travel Pass included",
      "Jungfraujoch — Top of Europe",
      "Matterhorn views in Zermatt",
      "Lake Lucerne cruise",
      "Rhine Falls visit",
    ],
    inclusions: [
      "7 nights in 4-star hotels",
      "Daily breakfast",
      "Swiss Travel Pass (2nd class)",
      "Jungfraujoch excursion tickets",
      "Lake Lucerne cruise",
      "City tours as per itinerary",
    ],
    exclusions: [
      "International flights",
      "Schengen visa fees",
      "Lunch and dinner",
      "Personal expenses",
      "Travel insurance",
    ],
    hotel: {
      name: "Selection of 4-star Swiss properties",
      category: "4-Star City and Mountain Hotels",
      description:
        "Carefully chosen hotels in the hearts of Zurich, Interlaken, Zermatt, and Lucerne — each within walking distance of major sights.",
    },
    itinerary: [
      { day: 1, title: "Zurich Arrival", description: "Arrive in Zurich. Afternoon city walking tour." },
      { day: 2, title: "Zurich to Interlaken", description: "Scenic train ride to Interlaken via Lucerne pass." },
      { day: 3, title: "Jungfraujoch Excursion", description: "Full-day trip to the Top of Europe." },
      { day: 4, title: "Interlaken to Zermatt", description: "Travel to Zermatt, car-free alpine village." },
      { day: 5, title: "Matterhorn Views", description: "Gornergrat railway for panoramic Matterhorn views." },
      { day: 6, title: "Zermatt to Lucerne", description: "Travel to Lucerne, afternoon lake cruise." },
      { day: 7, title: "Mount Pilatus", description: "Cogwheel railway up Mount Pilatus and cable car descent." },
      { day: 8, title: "Departure", description: "Train to Zurich airport. Au revoir, Switzerland." },
    ],
    activities: ["Scenic Trains", "Cable Cars", "Lake Cruise", "Glacier Walks", "Village Tours"],
    featured: true,
  },
  {
    title: "Santorini 5N/6D Caldera Romance",
    slug: "santorini-5n6d-caldera",
    destinationSlug: "santorini",
    destinationName: "Santorini",
    price: 115000,
    duration: "5N/6D",
    nights: 5,
    days: 6,
    travelType: "Couple",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80&auto=format&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1920&q=80&auto=format&fit=crop",
    rating: 4.88,
    reviews: 203,
    description:
      "Private cave suites, sunset catamaran cruises, and wine tastings at volcanic vineyards — Santorini unfolds like a love letter.",
    highlights: [
      "Cave suite with plunge pool",
      "Sunset catamaran cruise",
      "Wine tasting tour",
      "Private Oia sunset dinner",
      "Black sand beach visit",
    ],
    inclusions: [
      "5 nights in a Caldera-view cave suite",
      "Daily breakfast",
      "Private catamaran cruise with meals",
      "Wine tasting at three vineyards",
      "Airport transfers",
      "Trust and Trip local guide",
    ],
    exclusions: ["International flights", "Schengen visa", "Lunches and non-included dinners", "Travel insurance"],
    hotel: {
      name: "Canaves Oia Suites",
      category: "5-Star Cliffside Luxury",
      description: "Whitewashed suites carved into the caldera cliffs, with infinity pools facing the Aegean.",
    },
    itinerary: [
      { day: 1, title: "Arrive in Santorini", description: "Private transfer to Oia. Sunset welcome dinner." },
      { day: 2, title: "Oia & Fira Exploration", description: "Walking tour of Oia's blue domes and Fira's galleries." },
      { day: 3, title: "Catamaran Sunset Cruise", description: "Full-day cruise with BBQ and hot springs swim." },
      { day: 4, title: "Wine & Volcanic Vineyards", description: "Tour three wineries. Afternoon at Red Beach." },
      { day: 5, title: "Akrotiri & Beach Day", description: "Visit the Bronze Age ruins. Evening at Perissa beach." },
      { day: 6, title: "Departure", description: "Breakfast with caldera views. Transfer to airport." },
    ],
    activities: ["Catamaran Cruise", "Wine Tasting", "Beach Visits", "Sunset Dining", "Archaeological Tours"],
    trending: true,
  },
  {
    title: "Dubai 4N/5D Skyline & Desert",
    slug: "dubai-4n5d-skyline",
    destinationSlug: "dubai",
    destinationName: "Dubai",
    price: 68000,
    duration: "4N/5D",
    nights: 4,
    days: 5,
    travelType: "Family",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80&auto=format&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1546412414-e1885259563a?w=1920&q=80&auto=format&fit=crop",
    rating: 4.75,
    reviews: 412,
    description:
      "The perfect family escape balancing dazzling skylines, desert adventures, and world-class theme parks — all under the Arabian sun.",
    highlights: [
      "Burj Khalifa 124th floor access",
      "Desert safari with BBQ dinner",
      "Dhow cruise at Dubai Marina",
      "Dubai Mall and aquarium visit",
      "Abu Dhabi city tour",
    ],
    inclusions: [
      "4 nights in a 4-star hotel",
      "Daily breakfast",
      "Desert safari with dinner",
      "Burj Khalifa tickets",
      "Dhow cruise with buffet dinner",
      "All transfers in A/C vehicle",
    ],
    exclusions: ["International flights", "UAE visa fees", "Optional tours", "Personal expenses"],
    hotel: {
      name: "Rove Dubai Marina",
      category: "4-Star Modern Boutique",
      description: "Hip, contemporary hotel walking distance from the marina and JBR beach.",
    },
    itinerary: [
      { day: 1, title: "Welcome to Dubai", description: "Arrival. Evening Dhow cruise at Dubai Marina." },
      { day: 2, title: "City Tour & Burj Khalifa", description: "Old and New Dubai tour. Burj Khalifa at sunset." },
      { day: 3, title: "Desert Safari", description: "Dune bashing, camel ride, and BBQ in a Bedouin camp." },
      { day: 4, title: "Abu Dhabi Day Trip", description: "Sheikh Zayed Mosque and Ferrari World." },
      { day: 5, title: "Departure", description: "Shopping at Mall of Emirates. Transfer to airport." },
    ],
    activities: ["Desert Safari", "Skyline Views", "Dhow Cruise", "Theme Parks", "Shopping"],
    featured: true,
  },
  {
    title: "Kerala 6N/7D Backwaters & Hills",
    slug: "kerala-6n7d-backwaters",
    destinationSlug: "kerala",
    destinationName: "Kerala",
    price: 42000,
    duration: "6N/7D",
    nights: 6,
    days: 7,
    travelType: "Family",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80&auto=format&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1580889272861-dc2dbea4e4ab?w=1920&q=80&auto=format&fit=crop",
    rating: 4.8,
    reviews: 289,
    description:
      "Slow down into Kerala's rhythm — houseboats drifting through palm-lined canals, mist rolling over tea gardens, and temple bells ringing at dawn.",
    highlights: [
      "Overnight houseboat in Alleppey",
      "Tea plantation stay in Munnar",
      "Periyar wildlife sanctuary",
      "Kathakali dance performance",
      "Ayurvedic wellness session",
    ],
    inclusions: [
      "6 nights in hand-picked properties",
      "1 night on a private houseboat",
      "Daily breakfast and all houseboat meals",
      "A/C vehicle for all transfers",
      "Kathakali show tickets",
      "All sightseeing as per itinerary",
    ],
    exclusions: ["Flights to and from Kochi", "Lunch and dinner (except houseboat)", "Entrance fees", "Personal expenses"],
    hotel: {
      name: "Curated Heritage and Hill Stays",
      category: "4-Star and Heritage Properties",
      description: "A mix of colonial bungalows, tea estate stays, and a private rice-boat houseboat.",
    },
    itinerary: [
      { day: 1, title: "Arrive in Kochi", description: "Fort Kochi walking tour. Kathakali performance in the evening." },
      { day: 2, title: "Kochi to Munnar", description: "Scenic drive through spice plantations to the hills." },
      { day: 3, title: "Munnar Tea Country", description: "Tea museum, Mattupetty Dam, and Echo Point." },
      { day: 4, title: "Munnar to Thekkady", description: "Drive to Periyar. Evening spice garden tour." },
      { day: 5, title: "Periyar & Alleppey", description: "Morning wildlife boat safari. Drive to board your houseboat." },
      { day: 6, title: "Houseboat to Kovalam", description: "Backwater cruise, then transfer to Kovalam beach." },
      { day: 7, title: "Departure from Trivandrum", description: "Ayurvedic massage, then airport transfer." },
    ],
    activities: ["Houseboat Cruise", "Tea Plantation Walk", "Wildlife Safari", "Ayurveda", "Cultural Performance"],
    trending: true,
  },
];

export const experiences: Experience[] = [
  {
    title: "Honeymoon Escapes",
    slug: "honeymoon",
    category: "Couples",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80&auto=format&fit=crop",
    description: "Private villas, candlelit dinners, and destinations designed for two.",
  },
  {
    title: "Family Adventures",
    slug: "family",
    category: "Family",
    image:
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200&q=80&auto=format&fit=crop",
    description: "Journeys that bring generations closer with room for every age.",
  },
  {
    title: "Solo Journeys",
    slug: "solo",
    category: "Solo",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80&auto=format&fit=crop",
    description: "Curated trips for solo travelers who seek meaning on the move.",
  },
  {
    title: "Wellness Retreats",
    slug: "wellness",
    category: "Wellness",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80&auto=format&fit=crop",
    description: "Yoga, ayurveda, and digital detox in world's most serene corners.",
  },
  {
    title: "Adventure Expeditions",
    slug: "adventure",
    category: "Adventure",
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80&auto=format&fit=crop",
    description: "Trek, dive, raft and climb through nature's most dramatic landscapes.",
  },
  {
    title: "Cultural Immersions",
    slug: "cultural",
    category: "Cultural",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80&auto=format&fit=crop",
    description: "Home-stays, master classes, and rituals beyond the tourist trail.",
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Ananya & Rohan Mehta",
    location: "Mumbai, India",
    rating: 5,
    quote:
      "Trust and Trip didn't just plan our honeymoon — they curated memories. Every detail from the floating breakfast to the sunset photographer felt personal.",
    trip: "Bali Honeymoon",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&auto=format&fit=crop",
  },
  {
    name: "Priya Ramachandran",
    location: "Bangalore, India",
    rating: 5,
    quote:
      "I traveled solo to Switzerland and never once felt alone. Their 24/7 concierge and thoughtful touchpoints made it feel like family was watching over me.",
    trip: "Switzerland Solo Journey",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&auto=format&fit=crop",
  },
  {
    name: "The Kapoor Family",
    location: "Delhi, India",
    rating: 5,
    quote:
      "Three generations, one trip, zero complaints. From my seven-year-old to my seventy-year-old mother, everyone had the holiday of their dreams.",
    trip: "Dubai Family Getaway",
    image:
      "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400&q=80&auto=format&fit=crop",
  },
  {
    name: "Karan Singh",
    location: "Chandigarh, India",
    rating: 5,
    quote:
      "I've used many travel companies. None come close. The itinerary was flawless, the hotels exceeded expectations, and the support was instant.",
    trip: "Maldives Anniversary",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&auto=format&fit=crop",
  },
];

export const blogPosts: BlogPost[] = [
  {
    title: "The Ten Sunsets You Must Witness in Your Lifetime",
    slug: "ten-sunsets-lifetime",
    excerpt:
      "From the burning caldera of Santorini to the quiet glow of Varanasi's ghats, these are the sunsets worth crossing oceans for.",
    content:
      "The world has many beautiful moments, but none quite like the golden hour when the sun surrenders to the horizon. Here are ten sunsets that deserve a spot on every traveler's lifetime list.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop",
    author: "Maya Verma",
    date: "April 12, 2026",
    readTime: "6 min read",
    category: "Inspiration",
  },
  {
    title: "How to Plan a Honeymoon You'll Still Talk About in 30 Years",
    slug: "honeymoon-planning-guide",
    excerpt:
      "A practical, romantic guide to choosing the destination, timing, and experiences that will turn a trip into a story.",
    content: "Honeymoons are more than a trip. They're a memory fund that your marriage will draw on for decades.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80&auto=format&fit=crop",
    author: "Rishi Kapoor",
    date: "April 5, 2026",
    readTime: "8 min read",
    category: "Guides",
  },
  {
    title: "Why Slow Travel is the New Luxury",
    slug: "slow-travel-new-luxury",
    excerpt:
      "In a world that rewards speed, choosing to linger has become the most radical — and rewarding — way to see the world.",
    content:
      "There's a quiet revolution happening in travel. Travelers are swapping crowded itineraries for single-destination deep dives.",
    image:
      "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1200&q=80&auto=format&fit=crop",
    author: "Ishaan Patel",
    date: "March 28, 2026",
    readTime: "5 min read",
    category: "Perspectives",
  },
  {
    title: "A First-Timer's Guide to the Maldives",
    slug: "maldives-first-timers-guide",
    excerpt:
      "Which island? Which resort? When to go? Everything you need to know before booking your Maldives escape.",
    content: "The Maldives isn't one destination. It's 1,192 islands, each with its own personality.",
    image:
      "https://images.unsplash.com/photo-1540202404-1b927e27fa8b?w=1200&q=80&auto=format&fit=crop",
    author: "Maya Verma",
    date: "March 21, 2026",
    readTime: "10 min read",
    category: "Guides",
  },
];

export const whyChooseUs = [
  {
    title: "Handcrafted, Never Templated",
    description: "Every itinerary is built from scratch for your group, budget, and pace. No cookie-cutter tours.",
    stat: "500+",
    statLabel: "Unique itineraries crafted",
  },
  {
    title: "Real Humans, Always Available",
    description: "24/7 concierge support through WhatsApp, phone, or email — wherever in the world you are.",
    stat: "24/7",
    statLabel: "Concierge on-call",
  },
  {
    title: "No Hidden Costs. Ever.",
    description: "What we quote is what you pay. Every inclusion is listed upfront in black and gold.",
    stat: "100%",
    statLabel: "Price transparency",
  },
  {
    title: "Trusted by Thousands",
    description: "With over a decade of curating trips, we've built a legacy of repeat travelers and referrals.",
    stat: "15,000+",
    statLabel: "Happy travelers",
  },
];

export const stats = [
  { value: "15K+", label: "Travelers" },
  { value: "60+", label: "Destinations" },
  { value: "4.9", label: "Avg. Rating" },
  { value: "12yrs", label: "Crafting Journeys" },
];
