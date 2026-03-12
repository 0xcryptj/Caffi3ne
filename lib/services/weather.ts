export interface WeatherSignal {
  score: number;
  source: "mock" | "tomorrow";
  raw: Record<string, unknown>;
}

export async function getWeatherSignal(lat: number, lng: number): Promise<WeatherSignal> {
  if (!process.env.TOMORROW_IO_API_KEY || process.env.USE_MOCK_DATA !== "false") {
    return {
      score: 64,
      source: "mock",
      raw: {
        lat,
        lng,
        temperatureF: 61,
        precipitationProbability: 0.14
      }
    };
  }

  // TODO: Replace with a live Tomorrow.io request once API credentials are configured.
  return {
    score: 64,
    source: "tomorrow",
    raw: {
      lat,
      lng
    }
  };
}
