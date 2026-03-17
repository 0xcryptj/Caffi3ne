"use client";

import { useEffect, useRef } from "react";

// 4×4 Bayer ordered-dither matrix, normalised to [0, 1)
const BAYER: readonly (readonly number[])[] = [
  [ 0 / 16,  8 / 16,  2 / 16, 10 / 16],
  [12 / 16,  4 / 16, 14 / 16,  6 / 16],
  [ 3 / 16, 11 / 16,  1 / 16,  9 / 16],
  [15 / 16,  7 / 16, 13 / 16,  5 / 16],
];

/**
 * Returns steam density at canvas-normalised coords (nx ∈ [-1,1], ny ∈ [0,1])
 * at time t. ny=0 is top of canvas, ny=1 is bottom.
 * Steam rises upward (from bottom) and sways gently left/right.
 */
function steamDensity(nx: number, ny: number, t: number): number {
  // Rising: add time to ny so the field scrolls upward
  const drift = ny + t * 0.22;

  // Four overlapping sinusoidal layers at different frequencies → wispy tendrils
  const a = (Math.sin(nx * 2.2 + drift * 4.0 + t * 0.18) + 1) * 0.5;
  const b = (Math.sin(nx * 1.5 - drift * 3.1 + t * 0.24 + 1.9) + 1) * 0.5;
  const c = (Math.sin(nx * 3.6 + drift * 5.5 - t * 0.20 + 3.2) + 1) * 0.5;
  const d = (Math.sin(nx * 0.9 + drift * 1.8 + t * 0.30 + 5.0) + 1) * 0.5;

  // Multiply → sparse, wispy tendrils; raise to fractional power to spread them out
  const raw = Math.pow(a * b * c * d, 0.42);

  // Column shaping: wider as it rises (steam spreads upward)
  const spread      = 0.30 + Math.max(0, 1 - ny) * 0.40;
  const columnFade  = Math.exp(-(nx * nx) / (spread * spread * 2.2));

  // Vertical fade: dense at bottom (source), thin at top
  const bottomFull  = Math.min(1, (ny - 0.15) / 0.25);      // ramp in from 15 % up
  const topFade     = Math.max(0, 1 - Math.pow(1 - ny, 0.4) * 0.7); // thin near top

  return raw * columnFade * Math.max(0, bottomFull) * topFade;
}

interface DitherSteamProps {
  className?: string;
  /** Overall pixel opacity (0–255) of steam pixels, default 110 */
  alpha?: number;
  /** r,g,b of steam pixels — defaults to warm espresso */
  color?: [number, number, number];
}

export function DitherSteam({
  className = "",
  alpha = 110,
  color = [90, 48, 18],
}: DitherSteamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Low-res canvas — CSS will scale it up for chunky dither look.
    // 260×160 displayed at full section width ≈ 5–6× scale at 1280 px wide.
    const W = 260, H = 160;
    canvas.width  = W;
    canvas.height = H;

    const [sr, sg, sb] = color;
    let t = 0;
    let last = 0;

    const draw = (ts: number) => {
      // Throttle to ~20 fps — perceptually smooth for a slow-rising steam effect
      if (ts - last >= 50) {
        last = ts;

        const img  = ctx.createImageData(W, H);
        const data = img.data;

        for (let py = 0; py < H; py++) {
          for (let px = 0; px < W; px++) {
            const nx = (px / W) * 2 - 1;   // -1 … 1
            const ny = py / H;              //  0 (top) … 1 (bottom)

            const density   = steamDensity(nx, ny, t);
            const threshold = BAYER[py % 4][px % 4];

            if (density > threshold) {
              const i   = (py * W + px) * 4;
              data[i]   = sr;
              data[i+1] = sg;
              data[i+2] = sb;
              data[i+3] = alpha;
            }
            // else: fully transparent (ImageData is zeroed by default)
          }
        }

        ctx.clearRect(0, 0, W, H);
        ctx.putImageData(img, 0, 0);
        t += 0.008;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [alpha, color]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        imageRendering: "pixelated",
        width:  "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}
