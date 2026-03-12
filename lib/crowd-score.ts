import { clamp } from "@/lib/utils";
import type { BusynessLabel, ExternalSignals } from "@/lib/types";

export interface CrowdScoreResult {
  score: number;
  label: BusynessLabel;
}

function toLabel(score: number): BusynessLabel {
  if (score < 30) return "Below Average";
  if (score < 55) return "Average";
  if (score < 78) return "Busier Than Usual";
  return "Packed";
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
