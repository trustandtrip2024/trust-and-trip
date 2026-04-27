// Inventory provider abstraction.
//
// Today: prices in Sanity / data.ts are static. Once we wire a real B2B
// supplier (TBO, Hotelbeds, MakeMyTrip B2B, RezLive) the engine + booking
// flow needs live availability + per-supplier pricing.
//
// Strategy:
//   - One InventoryProvider interface, multiple impls (TboProvider,
//     HotelbedsProvider, MockProvider) selected by env.
//   - All consumers (itinerary engine tool, /admin/agents, booking checkout)
//     go through getInventoryProvider() — never import a specific impl.
//
// Real wiring is gated by env vars. With no env, the Mock provider returns
// the static Sanity data so nothing breaks.

export interface HotelOption {
  /** Provider-specific id, opaque to the rest of the app. */
  providerId: string;
  /** Hotel chain / property name. */
  name: string;
  /** Star rating, 1-5. */
  stars: number;
  /** Per-night INR rate for the requested room type + occupancy. */
  inrPerNight: number;
  /** True if pricing is live, false if it's a static rate-card snapshot. */
  live: boolean;
  cancellation?: "free" | "partial" | "non-refundable";
}

export interface FlightOption {
  providerId: string;
  carrier: string;
  flightNumber: string;
  departIso: string;
  arriveIso: string;
  inrTotal: number;
  baggageKg?: number;
}

export interface SearchHotelsParams {
  destinationSlug: string;
  checkIn: string;          // YYYY-MM-DD
  checkOut: string;         // YYYY-MM-DD
  adults: number;
  children?: number;
  starsMin?: number;
}

export interface SearchFlightsParams {
  fromIata: string;         // BLR, BOM, DEL, etc.
  toIata: string;           // MLE, DPS, ZRH...
  departDate: string;       // YYYY-MM-DD
  returnDate?: string;
  adults: number;
}

export interface InventoryProvider {
  /** Friendly name for logging + dashboards. */
  readonly name: string;
  /** True if this provider has live API credentials available. */
  readonly live: boolean;

  searchHotels(params: SearchHotelsParams): Promise<HotelOption[]>;
  searchFlights(params: SearchFlightsParams): Promise<FlightOption[]>;
}
