// Pick the inventory provider at runtime. Real-creds providers win over the
// mock; if multiple are wired, INVENTORY_PROVIDER env picks one.

import type { InventoryProvider } from "./types";
import { MockInventoryProvider } from "./mock";
import { TboInventoryProvider } from "./tbo";

export type { InventoryProvider, HotelOption, FlightOption, SearchHotelsParams, SearchFlightsParams } from "./types";

export function getInventoryProvider(): InventoryProvider {
  const explicit = (process.env.INVENTORY_PROVIDER ?? "").toLowerCase();
  if (explicit === "tbo" && TboInventoryProvider.live) return TboInventoryProvider;
  if (explicit === "mock") return MockInventoryProvider;

  // Auto-select: prefer first live provider, fall back to mock.
  if (TboInventoryProvider.live) return TboInventoryProvider;
  return MockInventoryProvider;
}
