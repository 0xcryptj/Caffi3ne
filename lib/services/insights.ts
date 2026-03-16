import { calculateCrowdScore, toLabel } from "@/lib/crowd-score";
import { clamp } from "@/lib/utils";
import { getMockInsightForShop } from "@/lib/data/mock-shops";
import { getTrafficSignal } from "@/lib/services/traffic";
import { getWeatherSignal } from "@/lib/services/weather";
import type { CrowdInsight, ExternalSignals, Shop } from "@/lib/types";

// Deterministic per-shop variance so shops at the same location don't all show identical scores
function locationVariance(shopId: string): number {
  let hash = 0;
  for (let i = 0; i < shopId.length; i++) {
    hash = (hash * 31 + shopId.charCodeAt(i)) & 0xffff;
  }
  return (hash % 25) - 12; // -12 to +12
}

/**
 * Returns the current hour in the shop's local timezone.
 * Uses utcOffsetMinutes if available (from Google Places); falls back to server local time.
 */
export function getLocalHour(utcOffsetMinutes?: number, now = new Date()): number {
  if (utcOffsetMinutes !== undefined) {
    const utcMs = now.getTime();
    const localMs = utcMs + utcOffsetMinutes * 60 * 1000;
    return new Date(localMs).getUTCHours();
  }
  return now.getHours();
}

/**
 * Returns the current day-of-week (0=Sun) in the shop's local timezone.
 */
export function getLocalDay(utcOffsetMinutes?: number, now = new Date()): number {
  if (utcOffsetMinutes !== undefined) {
    const utcMs = now.getTime();
    const localMs = utcMs + utcOffsetMinutes * 60 * 1000;
    return new Date(localMs).getUTCDay();
  }
  return now.getDay();
}

export function getTimeScore(utcOffsetMinutes?: number, now = new Date()): number {
  const hour = getLocalHour(utcOffsetMinutes, now);
  if (hour >= 7 && hour <= 10) return 85;
  if (hour >= 11 && hour <= 14) return 68;
  if (hour >= 15 && hour <= 18) return 52;
  return 34;
}

export function getDayScore(utcOffsetMinutes?: number, now = new Date()): number {
  const day = getLocalDay(utcOffsetMinutes, now);
  if (day === 0) return 44;
  if (day === 6) return 70;
  return 58;
}

const CLOSED_INSIGHT: CrowdInsight = {
  score: 0,
  label: "Below Average",
  breakdown: {
    weatherScore: 0,
    trafficScore: 0,
    timeScore: 0,
    dayScore: 0,
    eventScore: 0,
    merchantOverrideScore: 0,
    rawInputs: { closed: true }
  },
  explanation: ["Shop is currently closed."],
  updatedAt: new Date().toISOString()
};

export async function getCrowdInsightForShop(shop: Shop): Promise<CrowdInsight> {
  // Closed shops always score 0 — never rank as live recommendations
  if (shop.isOpenNow === false) {
    return { ...CLOSED_INSIGHT, updatedAt: new Date().toISOString() };
  }

  if (process.env.USE_MOCK_DATA !== "false") {
    return getMockInsightForShop(shop.id);
  }

  const [weather, traffic] = await Promise.all([
    getWeatherSignal(shop.lat, shop.lng),
    getTrafficSignal(shop.lat, shop.lng)
  ]);

  const breakdown: ExternalSignals = {
    weatherScore: weather.score,
    trafficScore: traffic.score,
    timeScore: getTimeScore(shop.utcOffsetMinutes),
    dayScore: getDayScore(shop.utcOffsetMinutes),
    eventScore: 12,
    merchantOverrideScore: 0,
    rawInputs: {
      weather: weather.raw,
      traffic: traffic.raw
    }
  };

  const result = calculateCrowdScore(breakdown);
  const finalScore = clamp(Math.round(result.score + locationVariance(shop.id)), 0, 100);
  const finalLabel = toLabel(finalScore);

  return {
    score: finalScore,
    label: finalLabel,
    breakdown,
    explanation: [
      "Live score blends weather, traffic, and temporal demand signals.",
      "Merchant override support is reserved for future claimed-shop workflows.",
      "POS integrations can be added later without changing page contracts."
    ],
    updatedAt: new Date().toISOString()
  };
}
