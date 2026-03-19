import { unstable_cache } from "next/cache";
import { externalServicesConfig } from "@/lib/services/config";
import type { PopularTimes, PopularTimesDay, PopularTimesHour } from "@/lib/types";

const BESTTIME_API = "https://besttime.app/api/v1/forecasts";

// ── BestTime.app response shapes ─────────────────────────────────────────────

interface BtHour {
  hour: number;
  /** -1 = venue closed that hour; 0–5 = busyness level */
  intensity_nr: number;
  intensity_txt: string;
  /** Typical busyness at the 50th percentile (0–100) */
  perc_50: number;
}

interface BtDay {
  day_info: {
    day_int: number;   // 0 = Monday … 6 = Sunday
    day_text: string;
  };
  hour_analysis: BtHour[];
}

interface BtResponse {
  analysis: BtDay[];
  venue_info: { venue_name: string; venue_id?: string };
  status: string;
}

// ── Fetch (wrapped in unstable_cache for 24-h server-side persistence) ────────

async function _fetchBestTime(
  venueName: string,
  venueAddress: string
): Promise<PopularTimes | null> {
  const apiKey = externalServicesConfig.bestTimeApiKey;
  if (!apiKey) return null;

  try {
    const res = await fetch(BESTTIME_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key_private: apiKey,
        venue_name: venueName,
        venue_address: venueAddress,
      }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as BtResponse;
    if (data.status !== "OK" || !Array.isArray(data.analysis)) return null;

    const days: PopularTimesDay[] = data.analysis.map((d) => {
      const hours: PopularTimesHour[] = d.hour_analysis.map((h) => ({
        hour: h.hour,
        perc: h.intensity_nr === -1 ? 0 : h.perc_50,
        intensity: h.intensity_txt,
        closed: h.intensity_nr === -1,
      }));
      return {
        dayInt: d.day_info.day_int,
        dayText: d.day_info.day_text,
        hours,
      };
    });

    return { days, fetchedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}

/**
 * Fetch popular-times data for a venue, cached for 24 hours per venue.
 * BestTime.app free tier: 100 new venue analyses / month.
 * Subsequent fetches for the same venue are free (cached by BestTime and by Next.js).
 */
export function getPopularTimes(
  venueName: string,
  venueAddress: string
): Promise<PopularTimes | null> {
  return unstable_cache(
    () => _fetchBestTime(venueName, venueAddress),
    ["besttime-v1", venueName, venueAddress],
    { revalidate: 86400 } // 24 hours
  )();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the busyness percentile (0–100) for the shop's current local hour/day,
 * or null if data is unavailable / venue is closed at that hour.
 *
 * BestTime day convention: 0=Monday … 6=Sunday
 * JS Date.getDay():        0=Sunday … 6=Saturday
 */
export function getBestTimeCurrentPerc(
  popularTimes: PopularTimes,
  utcOffsetMinutes?: number,
  now = new Date()
): number | null {
  const localMs = now.getTime() + (utcOffsetMinutes ?? 0) * 60_000;
  const local   = new Date(localMs);
  const jsDay   = local.getUTCDay();    // 0=Sun
  const hour    = local.getUTCHours();

  // Convert JS day → BestTime day (0=Mon)
  const btDay = (jsDay + 6) % 7;

  const day  = popularTimes.days.find((d) => d.dayInt === btDay);
  const slot = day?.hours.find((h) => h.hour === hour);
  return slot && !slot.closed ? slot.perc : null;
}

/**
 * Returns the BestTime day index (0=Mon … 6=Sun) for the shop's current local day.
 */
export function getBestTimeCurrentDay(
  utcOffsetMinutes?: number,
  now = new Date()
): number {
  const localMs = now.getTime() + (utcOffsetMinutes ?? 0) * 60_000;
  return ((new Date(localMs).getUTCDay()) + 6) % 7;
}
