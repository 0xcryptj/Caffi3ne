"use client";

import { useEffect, useRef } from "react";

// 4×4 Bayer ordered-dither matrix, values normalised to [0, 1)
const BAYER: readonly (readonly number[])[] = [
  [ 0 / 16,  8 / 16,  2 / 16, 10 / 16],
  [12 / 16,  4 / 16, 14 / 16,  6 / 16],
  [ 3 / 16, 11 / 16,  1 / 16,  9 / 16],
  [15 / 16,  7 / 16, 13 / 16,  5 / 16],
];

// espresso-900 dark  →  crema light
const DARK  = [33,  20,  9]  as const;   // #211409
const LIGHT = [245, 235, 224] as const;  // #f5ebe0

interface DitherBeanProps {
  /** CSS display size in px (canvas renders at half for chunky 2× pixel look) */
  displaySize?: number;
  className?: string;
}

export function DitherBean({ displaySize = 380, className = "" }: DitherBeanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Render at half resolution → displayed at 2× gives the crunchy dither look
    const R = Math.round(displaySize / 2);
    canvas.width  = R;
    canvas.height = R;

    const img  = ctx.createImageData(R, R);
    const data = img.data;

    const cx = R / 2;
    const cy = R / 2;
    const rx = R * 0.37;   // ellipse half-width
    const ry = R * 0.47;   // ellipse half-height

    for (let py = 0; py < R; py++) {
      for (let px = 0; px < R; px++) {
        const nx = (px - cx) / rx;
        const ny = (py - cy) / ry;
        const dist = Math.sqrt(nx * nx + ny * ny);

        // Outside bean — transparent / skip
        if (dist > 1.0) continue;

        // ── Shading model ────────────────────────────────────────────────
        // Spherical falloff: bright centre, dark rim
        const spherical = 1.0 - dist * 0.72;

        // Directional light from top-left
        const directional = Math.max(0, -nx * 0.38 - ny * 0.52) * 0.32;

        // Coffee-bean crease: subtle S-curve from top to bottom
        const creaseX = Math.sin(ny * Math.PI * 0.6) * 0.09;
        const dCrease  = Math.abs(nx - creaseX);
        const cWidth   = 0.09 * (1 - dist * 0.35);
        const crease   = dCrease < cWidth
          ? 0.12 * (1 - dCrease / cWidth)   // faint highlight inside crease
          : 0;

        // Small shadow on the inner side of the crease
        const creaseShadow = (nx > creaseX && dCrease < cWidth * 1.8)
          ? -0.08 * (1 - dCrease / (cWidth * 1.8))
          : 0;

        let brightness = spherical + directional + crease + creaseShadow;
        brightness = Math.max(0, Math.min(1, brightness));

        // ── Bayer ordered dithering ──────────────────────────────────────
        const threshold = BAYER[py % 4][px % 4];
        const isLight   = brightness > threshold;
        const [r, g, b] = isLight ? LIGHT : DARK;

        const i   = (py * R + px) * 4;
        data[i]   = r;
        data[i+1] = g;
        data[i+2] = b;
        data[i+3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
  }, [displaySize]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        imageRendering: "pixelated",
        width:  displaySize,
        height: displaySize,
      }}
    />
  );
}
