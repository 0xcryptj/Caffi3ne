import { calculateCrowdScore } from "@/lib/crowd-score";
import { getMockInsightForShop } from "@/lib/data/mock-shops";
import { getTrafficSignal } from "@/lib/services/traffic";
import { getWeatherSignal } from "@/lib/services/weather";
import type { CrowdInsight, ExternalSignals, Shop } from "@/lib/types";

function getTimeScore(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 7 && hour <= 10) return 85;
  if (hour >= 11 && hour <= 14) return 68;
  if (hour >= 15 && hour <= 18) return 52;
  return 34;
}

function getDayScore(date = new Date()) {
  const day = date.getDay();
  if (day === 0) return 44;
  if (day === 6) return 70;
  return 58;
}

export async function getCrowdInsightForShop(shop: Shop): Promise<CrowdInsight> {
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
    timeScore: getTimeScore(),
    dayScore: getDayScore(),
    eventScore: 12,
    merchantOverrideScore: 0,
    rawInputs: {
      weather: weather.raw,
      traffic: traffic.raw
    }
  };

  const result = calculateCrowdScore(breakdown);

  return {
    score: result.score,
    label: result.label,
    breakdown,
    explanation: [
      "Live score blends weather, traffic, and temporal demand signals.",
      "Merchant override support is reserved for future claimed-shop workflows.",
      "POS integrations can be added later without changing page contracts."
    ],
    updatedAt: new Date().toISOString()
  };
}
