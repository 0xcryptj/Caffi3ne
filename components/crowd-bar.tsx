import type { BusynessLabel } from "@/lib/types";

const colorMap: Record<BusynessLabel, { filled: string; empty: string }> = {
  "Below Average":     { filled: "#94a3b8", empty: "#e2e8f0" },
  "Average":           { filled: "#22c55e", empty: "#dcfce7" },
  "Busier Than Usual": { filled: "#f59e0b", empty: "#fef3c7" },
  "Packed":            { filled: "#ef4444", empty: "#fee2e2" },
};

// Heights in px — tallest bar on the right, shortest on the left
const BAR_HEIGHTS = [3, 5, 7, 9, 11];

function scoreToBars(score: number): number {
  if (score < 20) return 1;
  if (score < 40) return 2;
  if (score < 60) return 3;
  if (score < 80) return 4;
  return 5;
}

interface CrowdBarProps {
  label: BusynessLabel;
  score: number;
}

export function CrowdBar({ label, score }: CrowdBarProps) {
  const filledCount = scoreToBars(score);
  const colors = colorMap[label];

  return (
    <span
      className="inline-flex items-end gap-[2px]"
      aria-label={`${label}, score ${score} out of 100`}
    >
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 2,
            backgroundColor: i < filledCount ? colors.filled : colors.empty,
            transition: "background-color 0.25s ease",
          }}
        />
      ))}
    </span>
  );
}
