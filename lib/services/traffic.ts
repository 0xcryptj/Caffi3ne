import { externalServicesConfig } from "@/lib/services/config";

export interface TrafficSignal {
  score: number;
  source: "tomtom" | "fallback";
  raw: Record<string, unknown>;
}

interface TomTomFlowResponse {
  flowSegmentData?: {
    currentSpeed?: number;
    freeFlowSpeed?: number;
    currentTravelTime?: number;
    freeFlowTravelTime?: number;
    confidence?: number;
    roadClosure?: boolean;
  };
}

function congestionToScore(currentSpeed: number, freeFlowSpeed: number): number {
  if (freeFlowSpeed <= 0) return 50;
  const ratio = Math.max(0, 1 - currentSpeed / freeFlowSpeed);
  return Math.round(Math.min(ratio * 100, 100));
}

function tomtomKeys(): string[] {
  const { tomtomApiKey, tomtomApiKeySecondary } = externalServicesConfig;
  return [tomtomApiKey, tomtomApiKeySecondary].filter((k): k is string => Boolean(k));
}

let tomtomRotateIndex = 0;

/** Rotate primary key per request, then fall back through the rest on failure. */
function orderedKeys(keys: string[]): string[] {
  if (keys.length === 0) return [];
  const start = tomtomRotateIndex % keys.length;
  tomtomRotateIndex += 1;
  return [...keys.slice(start), ...keys.slice(0, start)];
}

async function fetchFlowSegment(
  lat: number,
  lng: number,
  key: string
): Promise<{ ok: true; data: TomTomFlowResponse } | { ok: false; status: number }> {
  const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/14/json?point=${lat},${lng}&key=${key}`;
  const res = await fetch(url, { next: { revalidate: 120 } });
  if (!res.ok) {
    return { ok: false, status: res.status };
  }
  const data = (await res.json()) as TomTomFlowResponse;
  return { ok: true, data };
}

function signalFromTomTomData(data: TomTomFlowResponse, lat: number, lng: number): TrafficSignal {
  const seg = data.flowSegmentData;
  if (!seg || seg.currentSpeed === undefined || seg.freeFlowSpeed === undefined) {
    return {
      score: 55,
      source: "tomtom",
      raw: { lat, lng, ...((data ?? {}) as Record<string, unknown>) }
    };
  }
  const score = congestionToScore(seg.currentSpeed, seg.freeFlowSpeed);
  return {
    score,
    source: "tomtom",
    raw: {
      currentSpeed: seg.currentSpeed,
      freeFlowSpeed: seg.freeFlowSpeed,
      confidence: seg.confidence,
      roadClosure: seg.roadClosure
    }
  };
}

export async function getTrafficSignal(lat: number, lng: number): Promise<TrafficSignal> {
  const keys = tomtomKeys();
  if (keys.length === 0) {
    return {
      score: 55,
      source: "fallback",
      raw: { lat, lng, error: "TOMTOM_API_KEY not configured" }
    };
  }

  let lastStatus = 0;
  for (const key of orderedKeys(keys)) {
    try {
      const result = await fetchFlowSegment(lat, lng, key);
      if (result.ok) {
        return signalFromTomTomData(result.data, lat, lng);
      }
      lastStatus = result.status;
      console.error(`TomTom traffic API returned ${result.status} (trying next key if any)`);
    } catch (err) {
      console.error("TomTom traffic fetch failed:", err);
    }
  }

  return {
    score: 55,
    source: "fallback",
    raw: { lat, lng, error: lastStatus || "all_tomtom_keys_failed" }
  };
}
