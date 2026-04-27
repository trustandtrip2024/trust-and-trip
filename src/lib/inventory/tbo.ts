// TBO Holidays B2B API stub.
//
// Replace the TODO bodies once the operator hands over:
//   TBO_API_BASE          e.g. https://api.tboholidays.com
//   TBO_USERNAME / TBO_PASSWORD
//   TBO_API_KEY           (used in some endpoints)
//
// Until creds land, .live = false → getInventoryProvider falls back to mock.

import type {
  InventoryProvider,
  HotelOption,
  FlightOption,
  SearchHotelsParams,
  SearchFlightsParams,
} from "./types";

const BASE = process.env.TBO_API_BASE;
const USER = process.env.TBO_USERNAME;
const PASS = process.env.TBO_PASSWORD;

export const TboInventoryProvider: InventoryProvider = {
  name: "tbo",
  live: !!(BASE && USER && PASS),

  async searchHotels(_params: SearchHotelsParams): Promise<HotelOption[]> {
    if (!this.live) return [];
    // TODO: implement TBO Hotel/Search → normalize response into HotelOption[].
    // Endpoints typically:
    //   POST /HotelAPI_V10/HotelService.svc/rest/HotelSearch
    // Auth: Bearer token from /SharedServices/SharedData.svc/rest/Authenticate
    return [];
  },

  async searchFlights(_params: SearchFlightsParams): Promise<FlightOption[]> {
    if (!this.live) return [];
    // TODO: implement TBO Air/Search → normalize.
    return [];
  },
};
