import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

// Mock heavy service dependencies
vi.mock("@/lib/services/places", () => ({
  getNearbyCoffeeShops: vi.fn().mockResolvedValue([])
}));
vi.mock("@/lib/services/insights", () => ({
  getCrowdInsightForShop: vi.fn().mockResolvedValue({
    score: 50, label: "Average", breakdown: {}, explanation: [], updatedAt: ""
  })
}));
vi.mock("@/lib/config", () => ({
  appConfig: { useMockData: false }
}));

import { GET } from "@/app/api/shops/nearby/route";

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/shops/nearby");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

// ── Bug 2: No hardcoded Charleston defaults ───────────────────────────────────
describe("GET /api/shops/nearby — coordinate validation", () => {
  it("returns 400 when lat is missing", async () => {
    const req = makeRequest({ lng: "-74.006", radius: "1000" });
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/lat/i);
  });

  it("returns 400 when lng is missing", async () => {
    const req = makeRequest({ lat: "40.7128", radius: "1000" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for out-of-range latitude", async () => {
    const req = makeRequest({ lat: "999", lng: "-74.006", radius: "1000" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for out-of-range longitude", async () => {
    const req = makeRequest({ lat: "40.7128", lng: "200", radius: "1000" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for negative radius", async () => {
    const req = makeRequest({ lat: "40.7128", lng: "-74.006", radius: "-1" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for radius exceeding 50000m", async () => {
    const req = makeRequest({ lat: "40.7128", lng: "-74.006", radius: "99999" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with valid coordinates", async () => {
    const req = makeRequest({ lat: "40.7128", lng: "-74.006", radius: "1000" });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("echoes the provided coordinates in the response meta", async () => {
    const req = makeRequest({ lat: "40.7128", lng: "-74.006", radius: "5000" });
    const res = await GET(req);
    const body = await res.json() as { meta: { lat: number; lng: number; radius: number } };
    expect(body.meta.lat).toBe(40.7128);
    expect(body.meta.lng).toBe(-74.006);
    expect(body.meta.radius).toBe(5000);
  });

  it("never defaults to Charleston coordinates (32.7765, -79.9311)", async () => {
    // Request with valid but non-Charleston coords
    const req = makeRequest({ lat: "51.5074", lng: "-0.1278", radius: "2000" });
    const res = await GET(req);
    const body = await res.json() as { meta: { lat: number; lng: number } };
    expect(body.meta.lat).not.toBe(32.7765);
    expect(body.meta.lng).not.toBe(-79.9311);
  });
});
