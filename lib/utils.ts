import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function formatScore(score: number) {
  return Math.round(score);
}

export function formatDistance(distanceMiles?: number) {
  if (distanceMiles === undefined) return "Nearby";
  return `${distanceMiles.toFixed(1)} mi`;
}

export function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
