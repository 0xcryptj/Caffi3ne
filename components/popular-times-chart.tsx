"use client";

import { useState } from "react";
import type { PopularTimes } from "@/lib/types";

// BestTime.app uses 0=Monday … 6=Sunday
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Format hour number → compact label
function fmtHour(h: number): string {
  if (h === 0)  return "12a";
  if (h === 12) return "12p";
  return h < 12 ? `${h}a` : `${h - 12}p`;
}

interface Props {
  popularTimes: PopularTimes;
  /** Current local hour at the shop (0–23) */
  currentHour: number;
  /** Current BestTime day at the shop (0=Mon … 6=Sun) */
  currentBtDay: number;
}

export function PopularTimesChart({ popularTimes, currentHour, currentBtDay }: Props) {
  const [selectedDay, setSelectedDay] = useState(currentBtDay);

  const sortedDays = [...popularTimes.days].sort((a, b) => a.dayInt - b.dayInt);
  const dayData    = sortedDays.find((d) => d.dayInt === selectedDay);
  const hours      = dayData?.hours ?? [];

  // Normalise bar heights against the busiest hour on this day
  const maxPerc = Math.max(...hours.map((h) => h.perc), 1);

  // Find peak hour (excluding closed slots)
  const openHours = hours.filter((h) => !h.closed);
  const peakHour  = openHours.reduce(
    (best, h) => (h.perc > best.perc ? h : best),
    openHours[0]
  );

  return (
    <div>
      {/* ── Day selector tabs ─────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {sortedDays.map((day) => {
          const isToday    = day.dayInt === currentBtDay;
          const isSelected = day.dayInt === selectedDay;
          return (
            <button
              key={day.dayInt}
              onClick={() => setSelectedDay(day.dayInt)}
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                isSelected
                  ? "bg-espresso-800 text-crema"
                  : "bg-espresso-50 text-espresso-600 hover:bg-espresso-100",
                isToday && !isSelected ? "ring-1 ring-espresso-400" : "",
              ].join(" ")}
            >
              {DAY_LABELS[day.dayInt]}
              {isToday && (
                <span className="ml-1 text-[9px] leading-none opacity-60">●</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Bar chart ────────────────────────────────────────────────── */}
      <div className="flex items-end gap-px" style={{ height: 72 }}>
        {hours.map((h) => {
          const isCurrent =
            h.hour === currentHour && selectedDay === currentBtDay;
          const barH = h.closed
            ? 4
            : Math.max(5, (h.perc / maxPerc) * 100);

          return (
            <div
              key={h.hour}
              className="group relative flex flex-1 flex-col items-center justify-end"
              style={{ height: "100%" }}
            >
              {/* Hover tooltip */}
              <div className="pointer-events-none absolute bottom-full mb-1.5 hidden -translate-x-1/2 group-hover:block">
                <div className="whitespace-nowrap rounded-lg bg-espresso-900 px-2 py-1 text-[10px] text-white shadow-lg">
                  {fmtHour(h.hour)}: {h.closed ? "Closed" : h.intensity}
                </div>
              </div>

              <div
                className={[
                  "w-full rounded-t-[2px] transition-all duration-150",
                  isCurrent
                    ? "bg-amber-500"
                    : h.closed
                    ? "bg-espresso-100"
                    : "bg-espresso-600",
                ].join(" ")}
                style={{ height: `${barH}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* ── X-axis hour labels (sparse) ───────────────────────────────── */}
      <div className="mt-1.5 flex">
        {hours.map((h) => (
          <div key={h.hour} className="flex-1 text-center">
            {[0, 6, 12, 18].includes(h.hour) && (
              <span className="text-[9px] leading-none text-espresso-400">
                {fmtHour(h.hour)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Peak annotation ──────────────────────────────────────────── */}
      {peakHour && peakHour.perc > 15 && (
        <p className="mt-4 text-xs text-espresso-500">
          Usually busiest around{" "}
          <span className="font-semibold text-espresso-700">
            {fmtHour(peakHour.hour)}
          </span>
          {" · "}
          <span className="capitalize">{peakHour.intensity.toLowerCase()}</span>
        </p>
      )}

      <p className="mt-2 text-[10px] text-espresso-400">
        Historical foot traffic · BestTime.app
      </p>
    </div>
  );
}
