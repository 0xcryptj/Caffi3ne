import { clamp } from "@/lib/utils";
import type { BusynessLabel, ExternalSignals, WaitEstimate } from "@/lib/types";

export interface CrowdScoreResult {
  score: number;
  label: BusynessLabel;
}

export function toLabel(score: number): BusynessLabel {
  if (score < 30) return "Below Average";
  if (score < 55) return "Average";
  if (score < 78) return "Busier Than Usual";
  return "Packed";
}

/**
 * Derives an estimated queue wait time from crowd score + time-of-day.
 * Score drives the base range; rush-hour timeScore stretches it upward.
 *
 * Score bands  →  base range
 *   < 30        →  0–3 min   (quiet)
 *  30–54        →  3–8 min   (normal)
 *  55–77        →  8–18 min  (busy)
 *  78–100       →  18–35 min (packed)
 *
 * timeScore modifier
 *   ≥ 80 (morning rush)  ×1.40
 *   ≥ 65 (lunch rush)    ×1.15
 *   otherwise            ×1.00
 */
export function estimateWait(score: number, timeScore: number): WaitEstimate {
  let low: number, high: number;

  if (score < 30)       { low = 0;  high = 3;  }
  else if (score < 55)  { low = 3;  high = 8;  }
  else if (score < 78)  { low = 8;  high = 18; }
  else                  { low = 18; high = 35; }

  const mod = timeScore >= 80 ? 1.40 : timeScore >= 65 ? 1.15 : 1.0;
  low  = Math.round(low  * mod);
  high = Math.round(high * mod);

  const label =
    high >= 30  ? "20+ min" :
    low  === 0  ? `Under ${high} min` :
                  `${low}–${high} min`;

  return { low, high, label };
}

export function calculateCrowdScore(signals: ExternalSignals): CrowdScoreResult {
  const weightedScore =
    signals.trafficScore * 0.3 +
    signals.weatherScore * 0.2 +
    signals.timeScore * 0.25 +
    signals.dayScore * 0.15 +
    signals.eventScore * 0.05 +
    (signals.merchantOverrideScore ?? 0) * 0.05;

  const score = clamp(weightedScore, 0, 100);
  return {
    score,
    label: toLabel(score)
  };
}
