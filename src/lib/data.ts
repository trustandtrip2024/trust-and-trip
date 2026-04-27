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
  whisper?: string;
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
    stars?: number;
    category?: string;
    description: string;
  };
  itinerary: {
    day?: number;
    title: string;
    description: string;
  }[];
  activities: string[];
  categories?: string[];
  tags?: string[];
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
  travelType?: string; // maps to Package.travelType for filtering
  tagline?: string;
  highlights?: string[];
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
    travelType: "Couple",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80&auto=format&fit=crop",
    description: "Private villas, candlelit dinners, and destinations designed for two.",
    tagline: "Just the two of you. Just the way it should be.",
    highlights: ["Private villa stays", "Candlelit beach dinners", "Couples spa rituals", "Sunrise experiences", "Photographer-included packages"],
  },
  {
    title: "Family Adventures",
    slug: "family",
    category: "Family",
    travelType: "Family",
    image: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200&q=80&auto=format&fit=crop",
    description: "Journeys that bring generations closer with room for every age.",
    tagline: "Every age, every smile, one trip.",
    highlights: ["Kid-friendly itineraries", "Three-generation friendly stays", "Theme parks & wildlife", "Safe & supervised activities", "Flexible pacing"],
  },
  {
    title: "Solo Journeys",
    slug: "solo",
    category: "Solo",
    travelType: "Solo",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80&auto=format&fit=crop",
    description: "Curated trips for solo travelers who seek meaning on the move.",
    tagline: "Your pace. Your rules. Your story.",
    highlights: ["24/7 concierge support", "Solo-friendly accommodations", "Meet-local experiences", "Safe destination guides", "Flexible booking"],
  },
  {
    title: "Wellness Retreats",
    slug: "wellness",
    category: "Wellness",
    travelType: "Solo",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80&auto=format&fit=crop",
    description: "Yoga, ayurveda, and digital detox in world's most serene corners.",
    tagline: "Come back lighter than you left.",
    highlights: ["Ayurveda & spa resorts", "Yoga & meditation retreats", "Digital detox stays", "Nature immersion", "Healthy cuisine experiences"],
  },
  {
    title: "Adventure Expeditions",
    slug: "adventure",
    category: "Adventure",
    travelType: "Group",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80&auto=format&fit=crop",
    description: "Trek, dive, raft and climb through nature's most dramatic landscapes.",
    tagline: "For those who need a bigger horizon.",
    highlights: ["High-altitude treks", "Scuba & snorkelling", "White-water rafting", "Camping under stars", "Expert-guided expeditions"],
  },
  {
    title: "Cultural Immersions",
    slug: "cultural",
    category: "Cultural",
    travelType: "Group",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80&auto=format&fit=crop",
    description: "Home-stays, master classes, and rituals beyond the tourist trail.",
    tagline: "Travel that changes the way you see the world.",
    highlights: ["Local home-stays", "Cooking & craft classes", "Festival & ritual access", "Heritage walks", "Off-the-beaten-path routes"],
  },
  {
    title: "Pilgrim Yatras",
    slug: "pilgrim",
    category: "Spiritual",
    travelType: "Group",
    image: "https://images.unsplash.com/photo-1545569756-7e39db71a14e?w=1200&q=80&auto=format&fit=crop",
    description: "Char Dham, Kedarnath, Vaishno Devi and sacred circuits arranged with devotion.",
    tagline: "Where faith meets the mountains.",
    highlights: ["Char Dham by road or helicopter", "Kedarnath & Badrinath", "Vaishno Devi yatra", "Registration & permit handling", "Temple-entry assistance"],
  },
  {
    title: "Luxury Escapes",
    slug: "luxury",
    category: "Luxury",
    travelType: "Couple",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80&auto=format&fit=crop",
    description: "Overwater villas, Michelin-starred tables, and private island stays.",
    tagline: "Because some moments deserve more.",
    highlights: ["5-star & boutique resorts", "Private transfers", "Butler services", "Exclusive dining", "Curated shore excursions"],
  },
  {
    title: "Weekend Getaways",
    slug: "weekend",
    category: "Quick Trips",
    travelType: "Couple",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop",
    description: "2–3 day escapes from your city — hills, beaches, and hidden retreats.",
    tagline: "You don't need two weeks to reset.",
    highlights: ["2N/3D packages", "Close-to-city destinations", "Hassle-free booking", "Road-trip friendly routes", "Hill stations & beach retreats"],
  },
  {
    title: "Group Tours",
    slug: "group",
    category: "Groups",
    travelType: "Group",
    image: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1200&q=80&auto=format&fit=crop",
    description: "Corporate offsites, college trips, and friend groups done right.",
    tagline: "Every group has a story. Let's write yours.",
    highlights: ["10–500 person groups", "Customised team activities", "Bulk pricing", "Dedicated group manager", "End-to-end logistics"],
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
    title: "Phu Quoc Travel Guide: 15 Amazing Reasons to Visit Vietnam's Island Paradise",
    slug: "phu-quoc-travel-guide",
    excerpt:
      "Phu Quoc is where soft white beaches, warm turquoise waters and incredible seafood meet some of Southeast Asia's most affordable luxury resorts.",
    content:
      "Tucked off the southwestern coast of Vietnam, Phu Quoc is the country's largest island — and one of its best-kept secrets. With powdery white sands at Long Beach, coral reefs teeming with marine life, and pepper plantations covering the interior hills, Phu Quoc offers something rare: genuine tropical beauty without the crowds of Bali or Phuket.\n\nHere are 15 reasons why Phu Quoc deserves a place on every Indian traveller's bucket list.\n\n1. Sao Beach — consistently rated one of Asia's top beaches, with water so clear you can see the bottom at 3 metres. 2. Grand World entertainment complex — a 24-hour Venice-inspired canal town with gondola rides, restaurants and shows. 3. Sunset Sanato Beach Club — the island's most iconic sundowner spot. 4. Vinpearl Safari — Vietnam's only open-air zoo and wildlife conservation park. 5. Phu Quoc Night Market — fresh seafood, local snacks and Vietnamese street food at its cheapest. 6. An Thoi Archipelago — a chain of 18 islets perfect for snorkelling and island hopping. 7. The Rach Vem Floating Village — a stilted village community built entirely over the sea. 8. Pepper plantations and fish sauce factories — a glimpse into Phu Quoc's unique culinary heritage. 9. Phu Quoc Prison — a sobering but important historical monument from the Vietnam War. 10. Sunset cable car — 8 kilometres of sea-crossing cable car to Hon Thom island. 11. Diving — visibility up to 15 metres with vibrant corals and diverse reef fish. 12. Duong Dong Market — the island's main market, packed with fresh produce, dried seafood and local crafts. 13. Starfish Beach — walk among hundreds of red starfish in shallow crystal-clear water. 14. Jungle trekking — Phu Quoc National Park covers over half the island with dense jungle trails. 15. Luxury at Indian budget prices — 5-star resorts that would cost ₹30,000+ per night elsewhere start from ₹12,000 here.\n\nFor Indian travellers, Phu Quoc is visa-free for stays under 45 days (subject to current regulations) and direct flights operate from major metros via Ho Chi Minh City. Trust and Trip packages to Phu Quoc start from ₹31,599 per person.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop",
    author: "Trust and Trip",
    date: "March 18, 2026",
    readTime: "11 min read",
    category: "International",
  },
  {
    title: "Char Dham Temple Opening & Closing Dates for 2026: Complete Yatra Guide for Devotees",
    slug: "char-dham-2026-opening-dates",
    excerpt:
      "The sacred Char Dham shrines open each year as the Himalayan snow melts. Here are the confirmed opening dates for 2026 and everything you need to plan your Yatra.",
    content:
      "Every year, millions of Hindu devotees undertake the Char Dham Yatra — a pilgrimage to four of the most sacred shrines in the Himalayas. Located in the Garhwal region of Uttarakhand, these temples — Yamunotri, Gangotri, Kedarnath and Badrinath — are closed during winter due to heavy snowfall and reopen in spring, usually in April or May.\n\nChar Dham 2026 Opening Dates (Approximate):\n\nYamunotri: Expected to open on Akshaya Tritiya — typically in late April/early May 2026.\nGangotri: Opens the same day as Yamunotri on Akshaya Tritiya.\nKedarnath: Opens on Shivratri muhurat — typically May 2026.\nBadrinath: Opens a few days after Kedarnath, usually in early-to-mid May 2026.\n\nThe exact dates are announced by temple committees based on the Hindu calendar (Panchang) and are confirmed 1-2 months before opening.\n\nYamunotri — The Source of Yamuna: Located at 3,293 metres, Yamunotri is reached via a 6km trek from Janki Chatti. The hot springs of Surya Kund, where pilgrims cook rice to offer as prasad, are a highlight.\n\nGangotri — The Birthplace of Ganga: At 3,048 metres, Gangotri is the origin point of the sacred Bhagirathi river (which later becomes the Ganges). The town has dozens of ashrams, and the Gangotri Glacier — Gaumukh — is 18km further for trekkers.\n\nKedarnath — Jyotirlinga of Lord Shiva: One of the 12 Jyotirlingas, Kedarnath at 3,583 metres is one of the most emotionally powerful pilgrimage sites in India. A 16km trek (or helicopter service) leads to the ancient stone temple.\n\nBadrinath — The Abode of Vishnu: The final and most visited Char Dham shrine, Badrinath sits at 3,133 metres surrounded by the peaks of Nar and Narayan. The hot water spring Tapt Kund beside the temple is a must-visit.\n\nRegistration: Online registration is mandatory for Kedarnath and Yamunotri. The Uttarakhand Tourism portal opens registration approximately 60-90 days before the shrines open.\n\nBest Time: May–June (before monsoon) and September–October (after monsoon, before closing) are the ideal months. Avoid July–August due to landslide risk.\n\nTrust and Trip organises complete Char Dham Yatra packages from Haridwar or Rishikesh with accommodation, transport, guide and registration assistance.",
    image:
      "https://images.unsplash.com/photo-1566296314736-6eafac81fd59?w=1200&q=80&auto=format&fit=crop",
    author: "Trust and Trip",
    date: "March 18, 2026",
    readTime: "9 min read",
    category: "Pilgrim",
  },
  {
    title: "5 Most Affordable Countries to Travel from India in 2026: Budget-Friendly International Destinations",
    slug: "affordable-countries-from-india-2026",
    excerpt:
      "International travel doesn't have to drain your savings. These five countries offer world-class experiences that Indian travellers can reach for under ₹50,000 per person.",
    content:
      "The belief that international travel is expensive is one of the most stubborn myths in Indian travel. The reality? With the right planning, you can fly to world-class destinations, stay in comfortable hotels, eat amazing food, and return home with memories — all for less than a domestic flight-hotel package to Goa.\n\nHere are five countries that offer the best value for Indian passport holders in 2026.\n\n1. Vietnam — The Undisputed Budget King\nVietnam consistently tops budget travel lists, and for good reason. Return flights from Indian metros hover around ₹18,000–₹25,000. A decent hotel in Hanoi or Ho Chi Minh City costs ₹1,500–₹3,000 per night. Street food pho and banh mi cost under ₹100. A full 5-night Vietnam trip can be done for ₹30,000–₹45,000 per person including flights. Phu Quoc, Da Nang and Ha Long Bay are all stunning, accessible and affordable.\n\n2. Thailand — The Classic for a Reason\nDespite its popularity, Thailand remains one of the best-value destinations from India. Flights to Bangkok start from ₹12,000 return. Bangkok's street food scene, temples and rooftop bars, Chiang Mai's elephant sanctuaries, and Phuket's beaches all offer incredible value. Budget 5-7 nights for ₹35,000–₹55,000 per person with flights.\n\n3. Nepal — The Himalayan Neighbour\nFor sheer mountain drama per rupee, nothing beats Nepal. No visa required for Indians (just a valid passport). Kathmandu's heritage sites, Pokhara's lakeside cafes, and Chitwan's wildlife safaris are all accessible on modest budgets. Flights from Delhi start at ₹5,000 return. A comfortable 5-night trip with accommodation and activities costs ₹18,000–₹30,000 per person.\n\n4. Sri Lanka — The Indian Ocean Gem\nSri Lanka offers colonial heritage, Buddhist temples, hill country tea estates, and beaches — often all in one trip. Flights from Chennai or Bengaluru cost ₹8,000–₹15,000 return. A 6-night trip covering Colombo, Kandy, Ella and Mirissa can be done for ₹35,000–₹50,000 per person with comfortable mid-range hotels.\n\n5. Malaysia — Kuala Lumpur & Beyond\nKuala Lumpur is one of Asia's most underrated cities — world-class food, modern infrastructure, Petronas Towers, and incredible diversity. Add a Penang extension for one of the world's best street food scenes. Flights from India are well-priced at ₹12,000–₹22,000 return. A 5-night trip runs ₹40,000–₹65,000 per person.\n\nTrust and Trip offers fully customised packages to all five destinations. Contact us for a personalised quote.",
    image:
      "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80&auto=format&fit=crop",
    author: "Trust and Trip",
    date: "November 16, 2025",
    readTime: "12 min read",
    category: "International",
  },
  {
    title: "How E-Gates and E-Passports Will Transform International Travel for Indian Passport Holders",
    slug: "e-gates-e-passports-indian-travellers",
    excerpt:
      "India's rollout of e-passports and the expanding network of e-gates at international airports mean faster, easier immigration for Indian travellers. Here's what you need to know.",
    content:
      "For anyone who has stood in long immigration queues at international airports, the promise of e-gates — automated passport control booths that verify biometric data in seconds — is genuinely exciting. And with India's e-passport programme gaining momentum, this future is arriving faster than most travellers realise.\n\nWhat is an E-Passport?\nAn e-passport (electronic passport) contains a microchip embedded in the cover that stores the holder's biographic data and a digital photograph. The chip uses cryptographic security to prevent counterfeiting. India began issuing e-passports in 2024, initially through select Passport Seva Kendras, with a phased rollout planned across the country.\n\nHow E-Gates Work\nE-gates (Automated Border Control gates) use optical character recognition (OCR) to read your passport and facial recognition to match the holder. The process takes 10–15 seconds compared to 3–5 minutes for a manual immigration check. Many airports in the UK, Europe, UAE, Singapore and Australia already operate e-gates for compatible passports.\n\nWhich Countries Currently Accept Indian E-Passports at E-Gates?\nAs of 2025, Indian e-passports are accepted at e-gates in: Singapore (Changi Airport), UAE (Dubai, Abu Dhabi), UK (select airports for pre-registered travellers via ETA), Australia (SmartGate for eligible travellers). More countries are expected to add Indian e-passport compatibility as the programme scales.\n\nBenefits for Indian Travellers:\n- Dramatically shorter immigration queues — especially at busy hubs like Dubai and Singapore\n- Reduced risk of human error in passport verification\n- Faster connection times at transit airports\n- A step towards visa-on-arrival or e-visa expansion as India's biometric credibility improves\n\nHow to Apply for an Indian E-Passport\nApply through the Passport Seva portal (passportindia.gov.in) as you would for a regular passport. E-passport issuance depends on availability at your local PSK — call ahead to confirm. The fee structure is the same as a standard passport.\n\nThe Bigger Picture: India's Travel Ambitions\nThe e-passport rollout is part of a broader Indian government effort to ease international travel for citizens. Combined with the expanding list of countries offering visa-on-arrival or e-visa to Indian passport holders (now over 60 countries), Indian travellers are enjoying genuinely improved access to the world.\n\nTrust and Trip's travel planners stay updated on visa requirements and immigration procedures for all destinations we cover. Ask us for the latest advice when planning your next international trip.",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80&auto=format&fit=crop",
    author: "Trust and Trip",
    date: "November 16, 2025",
    readTime: "12 min read",
    category: "Travel Tips",
  },
  {
    title: "Chardham Yatra 2025: Complete Guide, Route Map & Registration Tips",
    slug: "chardham-yatra-2025-guide",
    excerpt:
      "Everything you need to plan a smooth, spiritually fulfilling Char Dham Yatra — from registration to route planning, accommodation and the best time to go.",
    content:
      "The Char Dham Yatra is one of the most sacred pilgrimages in Hinduism — a circular journey through four high-altitude Himalayan shrines in Uttarakhand. Completing the Yatra is believed to wash away lifelong sins and help attain moksha. For millions of devotees, it's the journey of a lifetime.\n\nThe Four Dhams:\nYamunotri (3,293m) → Gangotri (3,048m) → Kedarnath (3,583m) → Badrinath (3,133m)\n\nThe traditional route follows this west-to-east sequence, starting and ending at Haridwar or Rishikesh.\n\nComplete Route Map:\n\nDay 1-2: Delhi/NCR → Haridwar → Barkot (Yamunotri base)\nDay 3: Barkot → Janki Chatti → Yamunotri trek (6km one-way) → return to Barkot\nDay 4: Barkot → Uttarkashi (Gangotri base)\nDay 5: Uttarkashi → Gangotri darshan → Uttarkashi\nDay 6: Uttarkashi → Guptkashi/Sonprayag (Kedarnath base)\nDay 7: Sonprayag → Gaurikund → Kedarnath trek (16km) or helicopter\nDay 8: Kedarnath → return to Sonprayag → drive to Badrinath\nDay 9: Badrinath darshan → Mana village (last Indian village before Tibet)\nDay 10: Badrinath → Rishikesh/Haridwar → Delhi\n\nRegistration (Mandatory):\nOnline registration is compulsory for Kedarnath and Yamunotri to manage crowd flow. Register at registrationandtouristcare.uk.gov.in. You'll need a valid photo ID and recent photograph. Registration opens approximately 2-3 months before the temples open. Biometric registration kiosks are also available at Haridwar, Rishikesh, Sonprayag and Phata.\n\nHelicopter Services:\nHelicopter services to Kedarnath operate from: Phata, Sitapur, Guptkashi, Sersi and Agustmuni. Book well in advance — seats fill up 2-3 months ahead. IRCTC and private operators (UTT, Heritage Aviation) offer packages. One-way costs ₹4,000–₹8,000 per person.\n\nBest Time to Go:\n- April–June: Ideal. Clear skies, manageable crowds, full facilities operational.\n- September–October: Post-monsoon. Lush, scenic, cooler. Lower crowds than peak season.\n- Avoid July–August: Monsoon brings heavy rain, landslide risk and road closures.\n\nMedical Precautions:\n- Consult a doctor before travel if you have cardiac or respiratory conditions.\n- Carry prescribed medications + basic first aid.\n- Acclimatise in Haridwar/Rishikesh for 1-2 days before ascending.\n- Oxygen cylinders are available at Kedarnath and Badrinath.\n\nPacking Essentials:\nWarm layers (temperature can drop to 0°C at night even in May), rainproof jacket, trekking shoes, thermal innerwear, sunscreen, lip balm, energy snacks, water bottle, walking stick.\n\nTrust and Trip organises complete Char Dham Yatra packages from Haridwar with all accommodation, transport, porters, registration assistance and a dedicated local guide.",
    image:
      "https://images.unsplash.com/photo-1566296314736-6eafac81fd59?w=1200&q=80&auto=format&fit=crop",
    author: "Trust and Trip",
    date: "March 30, 2025",
    readTime: "8 min read",
    category: "Pilgrim",
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
    title: "Stay Worry Free",
    description: "Transparent, reliable, and trustworthy — from first inquiry to safe return. No surprises.",
    stat: "24/7",
    statLabel: "Support: 8 AM – 10 PM",
  },
  {
    title: "No Hidden Costs. Ever.",
    description: "What we quote is what you pay. All taxes included. Every inclusion listed upfront.",
    stat: "100%",
    statLabel: "Price transparency",
  },
  {
    title: "10% Early Bird Savings",
    description: "Book 60 days or more in advance and get 10% off any package. Premium trips, honest prices.",
    stat: "10%",
    statLabel: "Off on early bookings",
  },
];

export const stats = [
  { value: "15K+", label: "Travelers" },
  { value: "60+", label: "Destinations" },
  { value: "4.9", label: "Avg. Rating" },
  { value: "12yrs", label: "Crafting Journeys" },
];
