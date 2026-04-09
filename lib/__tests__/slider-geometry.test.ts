import { describe, expect, it } from "vitest";
import { getLinearPercent, getThumbCenterPercent, RANGE_THUMB_WIDTH_PX } from "@/lib/slider-geometry";

describe("slider-geometry", () => {
  it("getLinearPercent is linear 0–100", () => {
    expect(getLinearPercent(0, 0, 25)).toBe(0);
    expect(getLinearPercent(25, 0, 25)).toBe(100);
    expect(getLinearPercent(5, 0, 25)).toBe(20);
  });

  it("getThumbCenterPercent matches thumb travel when track wider than thumb", () => {
    const w = 200;
    const tw = RANGE_THUMB_WIDTH_PX;
    expect(getThumbCenterPercent(0, 0, 25, w, tw)).toBeCloseTo((tw / 2 / w) * 100, 5);
    expect(getThumbCenterPercent(25, 0, 25, w, tw)).toBeCloseTo(((w - tw / 2) / w) * 100, 5);
    expect(getThumbCenterPercent(5, 0, 25, w, tw)).toBeCloseTo(((tw / 2 + (5 / 25) * (w - tw)) / w) * 100, 5);
  });

  it("falls back to linear when track not measured", () => {
    expect(getThumbCenterPercent(10, 0, 25, 0, 22)).toBe(getLinearPercent(10, 0, 25));
  });
});
