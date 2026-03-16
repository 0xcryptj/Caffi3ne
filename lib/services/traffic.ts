export interface TrafficSignal {
  score: number;
  source: "mock" | "tomtom";
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
  // High congestion (slow traffic) = more people around = higher busyness score
  const ratio = Math.max(0, 1 - currentSpeed / freeFlowSpeed);
  return Math.round(Math.min(ratio * 100, 100));
}

export async function getTrafficSignal(lat: number, lng: number): Promise<TrafficSignal> {
  if (!process.env.TOMTOM_API_KEY || process.env.USE_MOCK_DATA !== "false") {
    return { score: 71, source: "mock", raw: { lat, lng, congestionIndex: 71 } };
  }

  try {
    // Traffic Flow Segment Data API — zoom 14 = street level
    const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/14/json?point=${lat},${lng}&key=${process.env.TOMTOM_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 120 } });

    if (!res.ok) {
      console.error(`TomTom traffic API returned ${res.status}`);
      return { score: 60, source: "mock", raw: { error: res.status } };
    }

    const data = (await res.json()) as TomTomFlowResponse;
    const seg = data.flowSegmentData;

    if (!seg || seg.currentSpeed === undefined || seg.freeFlowSpeed === undefined) {
      return { score: 60, source: "tomtom", raw: data as Record<string, unknown> };
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
  } catch (err) {
    console.error("TomTom traffic fetch failed:", err);
    return { score: 60, source: "mock", raw: { error: String(err) } };
  }
}
