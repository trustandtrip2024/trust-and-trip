// Central registry for all live A/B experiments. Keep this file as the only
// place that defines variants — components import from here so we can grep
// for usage and retire experiments cleanly.

import type { Experiment } from "./ab-test";

export const EXPERIMENTS = {
  heroHeadline: {
    key: "hero_headline_v1",
    variants: ["control", "outcome", "speed"] as const,
  } satisfies Experiment<"control" | "outcome" | "speed">,

  heroCta: {
    key: "hero_cta_v1",
    variants: ["plan_my_trip", "find_my_trip"] as const,
  } satisfies Experiment<"plan_my_trip" | "find_my_trip">,
} as const;
