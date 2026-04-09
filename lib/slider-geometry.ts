/** Linear scale 0–100% (thumb travel without width correction). */
export function getLinearPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return ((value - min) / (max - min)) * 100;
}

/**
 * Where the center of a native range thumb sits along the track, as % of track width.
 * Matches browser math so fill + tick labels line up with the thumb.
 */
export function getThumbCenterPercent(
  value: number,
  min: number,
  max: number,
  trackWidthPx: number,
  thumbWidthPx: number
): number {
  if (trackWidthPx <= 0 || max <= min) {
    return getLinearPercent(value, min, max);
  }
  if (trackWidthPx <= thumbWidthPx) {
    return getLinearPercent(value, min, max);
  }
  const t = (value - min) / (max - min);
  const half = thumbWidthPx / 2;
  const centerPx = half + t * (trackWidthPx - thumbWidthPx);
  return (centerPx / trackWidthPx) * 100;
}

/** Must match `.radius-slider` thumb width in `app/globals.css`. */
export const RANGE_THUMB_WIDTH_PX = 22;
