// Mock inventory provider — returns deterministic stub data so the rest of
// the app can call the inventory API even before TBO / Hotelbeds is wired.

import type {
  InventoryProvider,
  HotelOption,
  FlightOption,
  SearchHotelsParams,
  SearchFlightsParams,
} from "./types";

const HOTEL_SAMPLES: Record<string, HotelOption[]> = {
  bali: [
    { providerId: "mock-bali-1", name: "Padma Resort Legian", stars: 5, inrPerNight: 18000, live: false, cancellation: "free" },
    { providerId: "mock-bali-2", name: "Alila Ubud",          stars: 5, inrPerNight: 22000, live: false, cancellation: "partial" },
    { providerId: "mock-bali-3", name: "The Anvaya Beach",    stars: 4, inrPerNight: 11000, live: false, cancellation: "free" },
  ],
  maldives: [
    { providerId: "mock-mle-1", name: "Centara Ras Fushi",     stars: 4, inrPerNight: 30000, live: false, cancellation: "partial" },
    { providerId: "mock-mle-2", name: "OBLU Select Sangeli",   stars: 5, inrPerNight: 42000, live: false, cancellation: "non-refundable" },
  ],
  switzerland: [
    { providerId: "mock-swiss-1", name: "Hotel Edelweiss Lucerne", stars: 4, inrPerNight: 16000, live: false, cancellation: "free" },
    { providerId: "mock-swiss-2", name: "Riffelalp Resort Zermatt",stars: 5, inrPerNight: 38000, live: false, cancellation: "partial" },
  ],
  kerala: [
    { providerId: "mock-kerala-1", name: "Spice Tree Munnar",      stars: 4, inrPerNight: 8500,  live: false, cancellation: "free" },
    { providerId: "mock-kerala-2", name: "Alleppey Houseboat Deluxe", stars: 4, inrPerNight: 12000, live: false, cancellation: "free" },
  ],
};

export const MockInventoryProvider: InventoryProvider = {
  name: "mock",
  live: false,

  async searchHotels(params: SearchHotelsParams): Promise<HotelOption[]> {
    const list = HOTEL_SAMPLES[params.destinationSlug] ?? [];
    if (params.starsMin) {
      return list.filter((h) => h.stars >= (params.starsMin as number));
    }
    return list;
  },

  async searchFlights(params: SearchFlightsParams): Promise<FlightOption[]> {
    const base = 25000;
    const isInternational = params.toIata !== params.fromIata && !["BOM", "DEL", "BLR", "MAA", "HYD", "CCU"].includes(params.toIata);
    const price = isInternational ? base + 18000 : base;
    return [
      {
        providerId: "mock-flt-1",
        carrier: "Indigo",
        flightNumber: "6E-1287",
        departIso: `${params.departDate}T06:30:00+05:30`,
        arriveIso: `${params.departDate}T09:45:00+05:30`,
        inrTotal: price,
        baggageKg: 15,
      },
      {
        providerId: "mock-flt-2",
        carrier: "Vistara",
        flightNumber: "UK-805",
        departIso: `${params.departDate}T14:00:00+05:30`,
        arriveIso: `${params.departDate}T17:10:00+05:30`,
        inrTotal: price + 4500,
        baggageKg: 25,
      },
    ];
  },
};
