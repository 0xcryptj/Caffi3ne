import { calculateCrowdScore } from "@/lib/crowd-score";
import type {
  CrowdInsight,
  ExternalSignals,
  MerchantSubmissionRecord,
  Shop,
  ShopWithInsight
} from "@/lib/types";

const baseShops: Shop[] = [
  {
    id: "brooklyn-roast-lab",
    googlePlaceId: "mock-place-1",
    name: "Brooklyn Roast Lab",
    address: "214 Wythe Ave, Brooklyn, NY",
    lat: 40.7185,
    lng: -73.9601,
    rating: 4.7,
    userRatingsTotal: 894,
    website: "https://example.com/brooklyn-roast-lab",
    phone: "(718) 555-0110",
    hours: ["6:30 AM - 7:00 PM", "Daily"],
    distanceMiles: 0.5,
    tags: ["Specialty", "Pastries", "Fast Wi-Fi"]
  },
  {
    id: "atlas-espresso-room",
    googlePlaceId: "mock-place-2",
    name: "Atlas Espresso Room",
    address: "89 Houston St, New York, NY",
    lat: 40.7241,
    lng: -73.9954,
    rating: 4.5,
    userRatingsTotal: 522,
    website: "https://example.com/atlas-espresso-room",
    phone: "(212) 555-0199",
    hours: ["7:00 AM - 6:00 PM", "Mon-Sun"],
    distanceMiles: 1.1,
    tags: ["Pour-over", "Meetings", "Latte Art"]
  },
  {
    id: "crema-terminal",
    googlePlaceId: "mock-place-3",
    name: "Crema Terminal",
    address: "16 Bond St, New York, NY",
    lat: 40.7268,
    lng: -73.9932,
    rating: 4.8,
    userRatingsTotal: 1204,
    website: "https://example.com/crema-terminal",
    phone: "(646) 555-0135",
    hours: ["6:00 AM - 8:30 PM", "Daily"],
    distanceMiles: 1.4,
    tags: ["High Volume", "Retail Beans", "Outdoor Seating"]
  }
];

function mockSignals(shopId: string): ExternalSignals {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  const presets: Record<string, Partial<ExternalSignals>> = {
    "brooklyn-roast-lab": {
      trafficScore: 72,
      weatherScore: 66,
      eventScore: 20
    },
    "atlas-espresso-room": {
      trafficScore: 54,
      weatherScore: 58,
      eventScore: 10
    },
    "crema-terminal": {
      trafficScore: 84,
      weatherScore: 74,
      eventScore: 38
    }
  };

  const commuteBoost = hour >= 7 && hour <= 10 ? 82 : hour >= 12 && hour <= 14 ? 68 : 42;
  const weekendShape = day === 0 || day === 6 ? 64 : 52;
  const base = presets[shopId] ?? {};

  return {
    weatherScore: base.weatherScore ?? 55,
    trafficScore: base.trafficScore ?? 50,
    timeScore: commuteBoost,
    dayScore: weekendShape,
    eventScore: base.eventScore ?? 0,
    merchantOverrideScore: 0,
    rawInputs: {
      temperatureF: 61,
      precipitationProbability: 0.14,
      congestionIndex: base.trafficScore ?? 50,
      localHour: hour,
      dayOfWeek: day
    }
  };
}

export function getMockShops(): Shop[] {
  return baseShops;
}

export function getMockShopById(id: string): Shop | undefined {
  return baseShops.find((shop) => shop.id === id);
}

export function getMockInsightForShop(shopId: string): CrowdInsight {
  const breakdown = mockSignals(shopId);
  const result = calculateCrowdScore(breakdown);

  return {
    score: result.score,
    label: result.label,
    breakdown,
    explanation: [
      "Traffic conditions suggest current demand near this location.",
      "Time-of-day weighting reflects morning rush and lunch behavior.",
      "Weather and day-of-week are blended to estimate demand swings."
    ],
    updatedAt: new Date().toISOString()
  };
}

export function getMockShopsWithInsights(): ShopWithInsight[] {
  return baseShops.map((shop) => ({
    ...shop,
    insight: getMockInsightForShop(shop.id)
  }));
}

const mockSubmissions: MerchantSubmissionRecord[] = [];

export function addMockSubmission(
  submission: Omit<MerchantSubmissionRecord, "id" | "status" | "createdAt">
) {
  const record: MerchantSubmissionRecord = {
    ...submission,
    id: `submission-${mockSubmissions.length + 1}`,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  mockSubmissions.push(record);
  return record;
}
