export interface WeatherSignal {
  score: number;
  source: "mock" | "tomorrow";
  raw: Record<string, unknown>;
}

export interface WeatherCondition {
  tempF: number;
  precipProbability: number; // 0–100
  weatherCode: number;
  conditionLabel: string;
  conditionEmoji: string;
}

interface TomorrowRealtimeResponse {
  data?: {
    values?: {
      temperature?: number;
      precipitationProbability?: number;
      weatherCode?: number;
      humidity?: number;
      windSpeed?: number;
    };
  };
}

const WEATHER_CODES: Record<number, { label: string; emoji: string }> = {
  1000: { label: "Clear", emoji: "☀️" },
  1100: { label: "Mostly Clear", emoji: "🌤️" },
  1101: { label: "Partly Cloudy", emoji: "⛅" },
  1102: { label: "Mostly Cloudy", emoji: "🌥️" },
  1001: { label: "Cloudy", emoji: "☁️" },
  2000: { label: "Foggy", emoji: "🌫️" },
  2100: { label: "Light Fog", emoji: "🌫️" },
  4000: { label: "Drizzle", emoji: "🌦️" },
  4001: { label: "Rain", emoji: "🌧️" },
  4200: { label: "Light Rain", emoji: "🌦️" },
  4201: { label: "Heavy Rain", emoji: "⛈️" },
  5000: { label: "Snow", emoji: "❄️" },
  5001: { label: "Flurries", emoji: "🌨️" },
  5100: { label: "Light Snow", emoji: "🌨️" },
  5101: { label: "Heavy Snow", emoji: "❄️" },
  6000: { label: "Freezing Drizzle", emoji: "🌨️" },
  6001: { label: "Freezing Rain", emoji: "🌨️" },
  7000: { label: "Ice Pellets", emoji: "🧊" },
  8000: { label: "Thunderstorm", emoji: "⛈️" }
};

function decodeWeatherCode(code: number) {
  return WEATHER_CODES[code] ?? { label: "Variable", emoji: "🌡️" };
}

// Cold + rainy days drive people into coffee shops → higher score
function toWeatherScore(tempF: number, precipProb: number, weatherCode: number): number {
  let tempScore: number;
  if (tempF <= 32) tempScore = 40;       // freezing — people stay home
  else if (tempF <= 50) tempScore = 78;  // cold — perfect coffee weather
  else if (tempF <= 65) tempScore = 68;  // cool
  else if (tempF <= 78) tempScore = 52;  // mild
  else if (tempF <= 90) tempScore = 42;  // warm
  else tempScore = 30;                    // very hot

  const rainScore = precipProb > 70 ? 82 : precipProb > 40 ? 72 : precipProb > 20 ? 60 : 48;

  // Extreme conditions (blizzard, thunderstorm) keep people home
  const extreme = (weatherCode >= 5100 || weatherCode === 8000) ? -12 : 0;

  return Math.round(Math.max(0, Math.min(100, tempScore * 0.4 + rainScore * 0.6 + extreme)));
}

export async function getWeatherSignal(lat: number, lng: number): Promise<WeatherSignal> {
  if (!process.env.TOMORROW_IO_API_KEY || process.env.USE_MOCK_DATA !== "false") {
    return {
      score: 64,
      source: "mock",
      raw: { lat, lng, temperatureF: 61, precipitationProbability: 14 }
    };
  }

  try {
    const url = `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lng}&apikey=${process.env.TOMORROW_IO_API_KEY}&units=imperial`;
    const res = await fetch(url, { next: { revalidate: 600 } });

    if (!res.ok) {
      console.error(`Tomorrow.io returned ${res.status}`);
      return { score: 60, source: "mock", raw: { error: res.status } };
    }

    const data = (await res.json()) as TomorrowRealtimeResponse;
    const v = data.data?.values;

    if (!v) return { score: 60, source: "tomorrow", raw: data as Record<string, unknown> };

    const tempF = v.temperature ?? 65;
    const precipProb = v.precipitationProbability ?? 0;
    const weatherCode = v.weatherCode ?? 1000;
    const score = toWeatherScore(tempF, precipProb, weatherCode);

    return {
      score,
      source: "tomorrow",
      raw: {
        tempF,
        precipProbability: precipProb,
        weatherCode,
        humidity: v.humidity,
        windSpeed: v.windSpeed
      }
    };
  } catch (err) {
    console.error("Tomorrow.io fetch failed:", err);
    return { score: 60, source: "mock", raw: { error: String(err) } };
  }
}

// Standalone: fetch current conditions for display (not just a score)
export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherCondition | null> {
  const apiKey = process.env.TOMORROW_IO_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lng}&apikey=${apiKey}&units=imperial`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) return null;

    const data = (await res.json()) as TomorrowRealtimeResponse;
    const v = data.data?.values;
    if (!v) return null;

    const code = v.weatherCode ?? 1000;
    const { label, emoji } = decodeWeatherCode(code);

    return {
      tempF: Math.round(v.temperature ?? 65),
      precipProbability: Math.round(v.precipitationProbability ?? 0),
      weatherCode: code,
      conditionLabel: label,
      conditionEmoji: emoji
    };
  } catch {
    return null;
  }
}
