import { NormalizedTripPlan } from "@/src/types/interfaces";

export const normalizeItinerary = (data: Record<string, unknown>): NormalizedTripPlan => {
  const days: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};

  for (const key in data) {
    const match = key.match(/^day(\d+)$/i);
    if (match) {
      days[match[1]] = data[key];
    } else {
      rest[key] = data[key];
    }
  }

  return {
    ...(rest as Omit<NormalizedTripPlan, "days">),
    days,
  };
};
