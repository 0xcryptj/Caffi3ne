import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Shop } from "@/lib/types";

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock("@/lib/services/weather", () => ({
  getWeatherSignal: vi.fn().mockResolvedValue({ score: 60, raw: {} })
}));
vi.mock("@/lib/services/traffic", () => ({
  getTrafficSignal: vi.fn().mockResolvedValue({ score: 60, raw: {} })
}));
vi.mock("@/lib/data/mock-shops", () => ({
  getMockInsightForShop: vi.fn().mockReturnValue({
    score: 55,
    label: "Average",
    breakdown: {},
    explanation: [],
    updatedAt: ""
  })
}));

// Ensure real API path is used (not mock mode)
vi.stubEnv("USE_MOCK_DATA", "false");

import { getCrowdInsightForShop, getLocalHour, getLocalDay, getTimeScore, getDayScore } from "@/lib/services/insights";

// ── Helpers ────────────────────────────────────────────────────────────────────
function makeShop(overrides: Partial<Shop> = {}): Shop {
  return {
    id: "test-shop-1",
    googlePlaceId: "test-shop-1",
    name: "Test Café",
    address: "123 Main St",
    lat: 40.7128,
    lng: -74.006,
    rating: 4.2,
    userRatingsTotal: 200,
    hours: [],
    tags: [],
    source: "google",
    ...overrides
  };
}

// ── Bug 1: Closed shops always score 0 ────────────────────────────────────────
describe("getCrowdInsightForShop — closed shop", () => {
  it("returns score 0 when isOpenNow is false", async () => {
    const shop = makeShop({ isOpenNow: false });
    const insight = await getCrowdInsightForShop(shop);
    expect(insight.score).toBe(0);
  });

  it("returns label 'Below Average' when closed", async () => {
    const shop = makeShop({ isOpenNow: false });
    const insight = await getCrowdInsightForShop(shop);
    expect(insight.label).toBe("Below Average");
  });

  it("sets closed:true in rawInputs when closed", async () => {
    const shop = makeShop({ isOpenNow: false });
    const insight = await getCrowdInsightForShop(shop);
    expect(insight.breakdown.rawInputs).toMatchObject({ closed: true });
  });

  it("does NOT short-circuit when isOpenNow is true", async () => {
    const shop = makeShop({ isOpenNow: true });
    const insight = await getCrowdInsightForShop(shop);
    // Score should be > 0 (driven by mocked signals)
    expect(insight.score).toBeGreaterThan(0);
  });

  it("does NOT short-circuit when isOpenNow is undefined (unknown hours)", async () => {
    const shop = makeShop({ isOpenNow: undefined });
    const insight = await getCrowdInsightForShop(shop);
    expect(insight.score).toBeGreaterThan(0);
  });
});

// ── Timezone-aware time scoring ───────────────────────────────────────────────
describe("getLocalHour / getLocalDay", () => {
  it("uses utcOffsetMinutes to compute local hour", () => {
    // UTC midnight = hour 0; UTC+5 should be hour 5
    const utcMidnight = new Date("2024-03-15T00:00:00Z");
    expect(getLocalHour(300, utcMidnight)).toBe(5);
  });

  it("falls back to server time when utcOffsetMinutes is undefined", () => {
    const d = new Date();
    expect(getLocalHour(undefined, d)).toBe(d.getHours());
  });

  it("crosses day boundary correctly (UTC 23:00 + UTC+2 = next day 01:00)", () => {
    const utc23 = new Date("2024-03-15T23:00:00Z");
    expect(getLocalHour(120, utc23)).toBe(1);
    // Day should be Saturday (March 16 in UTC+2)
    expect(getLocalDay(120, utc23)).toBe(6); // Saturday
  });
});

describe("getTimeScore", () => {
  it("returns 85 during morning rush (7–10 local)", () => {
    const utc7am = new Date("2024-03-15T07:00:00Z");
    expect(getTimeScore(0, utc7am)).toBe(85);   // UTC shop at 7 AM local → morning rush
    expect(getTimeScore(60, utc7am)).toBe(85);  // UTC+1 shop: 7 AM UTC = 8 AM local → morning rush
    expect(getTimeScore(-120, utc7am)).toBe(34); // UTC-2 shop: 7 AM UTC = 5 AM local → late night
  });

  it("returns 34 for late night", () => {
    const utc2am = new Date("2024-03-15T02:00:00Z");
    expect(getTimeScore(0, utc2am)).toBe(34);
  });
});

describe("getDayScore", () => {
  it("returns 70 for Saturday", () => {
    // 2024-03-16 is a Saturday
    const saturday = new Date("2024-03-16T12:00:00Z");
    expect(getDayScore(0, saturday)).toBe(70);
  });

  it("returns 44 for Sunday", () => {
    const sunday = new Date("2024-03-17T12:00:00Z");
    expect(getDayScore(0, sunday)).toBe(44);
  });

  it("returns 58 for weekdays", () => {
    const monday = new Date("2024-03-18T12:00:00Z");
    expect(getDayScore(0, monday)).toBe(58);
  });
});
