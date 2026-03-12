export interface TrafficSignal {
  score: number;
  source: "mock" | "tomtom";
  raw: Record<string, unknown>;
}

export async function getTrafficSignal(lat: number, lng: number): Promise<TrafficSignal> {
  if (!process.env.TOMTOM_API_KEY || process.env.USE_MOCK_DATA !== "false") {
    return {
      score: 71,
      source: "mock",
      raw: {
        lat,
        lng,
        congestionIndex: 71
      }
    };
  }

  // TODO: Replace with a live TomTom flow after credentials are added.
  return {
    score: 71,
    source: "tomtom",
    raw: {
      lat,
      lng
    }
  };
}
