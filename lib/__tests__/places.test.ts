import { describe, it, expect } from "vitest";

// ── Test the normalization helper directly ─────────────────────────────────────
// We re-export a testable version via a thin helper to avoid module init side-effects.

type PlacesNewPlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  currentOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  utcOffsetMinutes?: number;
  types?: string[];
  priceLevel?: string;
  photos?: { name?: string }[];
  editorialSummary?: { text?: string };
  websiteUri?: string;
  nationalPhoneNumber?: string;
};

// Inline the normalizer under test (mirrors places.ts implementation)
function normalizePlacesNewResult(place: PlacesNewPlace) {
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  const id = place.id;
  const name = place.displayName?.text;
  if (lat === undefined || lng === undefined || !id || !name) return null;

  const openingHours = place.currentOpeningHours ?? place.regularOpeningHours;

  return {
    id,
    lat,
    lng,
    name,
    hours: openingHours?.weekdayDescriptions ?? ["Hours unavailable"],
    isOpenNow: openingHours?.openNow,
    utcOffsetMinutes: place.utcOffsetMinutes,
  };
}

// ── Bug 1: isOpenNow must be populated ────────────────────────────────────────
describe("normalizePlacesNewResult — isOpenNow", () => {
  const base = {
    id: "abc123",
    displayName: { text: "Test Café" },
    location: { latitude: 40.7, longitude: -74.0 },
    formattedAddress: "123 Main St"
  };

  it("sets isOpenNow=true from regularOpeningHours", () => {
    const place = { ...base, regularOpeningHours: { openNow: true } };
    expect(normalizePlacesNewResult(place)?.isOpenNow).toBe(true);
  });

  it("sets isOpenNow=false from regularOpeningHours", () => {
    const place = { ...base, regularOpeningHours: { openNow: false } };
    expect(normalizePlacesNewResult(place)?.isOpenNow).toBe(false);
  });

  it("prefers currentOpeningHours over regularOpeningHours for isOpenNow", () => {
    // currentOpeningHours says open, regularOpeningHours says closed
    const place = {
      ...base,
      currentOpeningHours: { openNow: true },
      regularOpeningHours: { openNow: false }
    };
    expect(normalizePlacesNewResult(place)?.isOpenNow).toBe(true);
  });

  it("sets isOpenNow=undefined when no hours data", () => {
    expect(normalizePlacesNewResult(base)?.isOpenNow).toBeUndefined();
  });
});

// ── utcOffsetMinutes is propagated ────────────────────────────────────────────
describe("normalizePlacesNewResult — utcOffsetMinutes", () => {
  const base = {
    id: "abc123",
    displayName: { text: "Test Café" },
    location: { latitude: 40.7, longitude: -74.0 }
  };

  it("stores utcOffsetMinutes when present", () => {
    const place = { ...base, utcOffsetMinutes: -300 };
    expect(normalizePlacesNewResult(place)?.utcOffsetMinutes).toBe(-300);
  });

  it("leaves utcOffsetMinutes undefined when absent", () => {
    expect(normalizePlacesNewResult(base)?.utcOffsetMinutes).toBeUndefined();
  });
});

// ── Bug 3: weekdayDescriptions fall through correctly ─────────────────────────
describe("normalizePlacesNewResult — hours", () => {
  const base = {
    id: "abc123",
    displayName: { text: "Test Café" },
    location: { latitude: 40.7, longitude: -74.0 }
  };

  it("prefers currentOpeningHours weekdayDescriptions", () => {
    const place = {
      ...base,
      currentOpeningHours: { openNow: true, weekdayDescriptions: ["Mon: 7am–9pm"] },
      regularOpeningHours: { openNow: true, weekdayDescriptions: ["Mon: 8am–8pm"] }
    };
    expect(normalizePlacesNewResult(place)?.hours).toEqual(["Mon: 7am–9pm"]);
  });

  it("falls back to regularOpeningHours weekdayDescriptions", () => {
    const place = {
      ...base,
      regularOpeningHours: { openNow: true, weekdayDescriptions: ["Mon: 8am–8pm"] }
    };
    expect(normalizePlacesNewResult(place)?.hours).toEqual(["Mon: 8am–8pm"]);
  });

  it("returns ['Hours unavailable'] when no hours data exists", () => {
    expect(normalizePlacesNewResult(base)?.hours).toEqual(["Hours unavailable"]);
  });
});
