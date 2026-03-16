"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";

// 4×4 Bayer ordered-dither matrix, normalised to [0, 1)
const BAYER: readonly (readonly number[])[] = [
  [ 0 / 16,  8 / 16,  2 / 16, 10 / 16],
  [12 / 16,  4 / 16, 14 / 16,  6 / 16],
  [ 3 / 16, 11 / 16,  1 / 16,  9 / 16],
  [15 / 16,  7 / 16, 13 / 16,  5 / 16],
];

// 1-bit palette — high contrast for maximum dither visibility
// DARK:  very dark espresso   LIGHT: warm roasted-coffee brown
const DARK  = [22,  10,  3]  as const;  // #160a03
const LIGHT = [168, 104, 52] as const;  // #a86834

/** Pointed coffee-bean silhouette.
 *  nx / ny are normalised to [-1,1] relative to the bean's own radii.
 *  Returns 0 if outside, or a smooth 0→1 "depth" increasing toward the centre. */
function beanSDF(nx: number, ny: number): number {
  if (Math.abs(ny) >= 1) return 0;
  // (1−ny²)^0.52 — pointed oval, narrowing sharply at the tips
  const xBound = Math.pow(1 - ny * ny, 0.52);
  if (Math.abs(nx) > xBound) return 0;
  // Smooth interior distance (0 = edge, 1 = deepest interior)
  const xDepth = xBound > 0 ? 1 - Math.abs(nx) / xBound : 0;
  const yDepth = 1 - Math.abs(ny);
  return Math.min(xDepth, yDepth);
}

function renderBean(canvas: HTMLCanvasElement, displaySize: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1/3 scale → 3×3 screen pixels per canvas pixel.
  // With the 4×4 Bayer matrix this gives a 12×12 px visible dither cell —
  // perfectly "chunky / technical" without losing the bean shape.
  const R = Math.max(1, Math.round(displaySize / 3));
  canvas.width  = R;
  canvas.height = R;

  const img  = ctx.createImageData(R, R);
  const data = img.data;

  const cx = R / 2;
  const cy = R / 2;
  const rx = R * 0.37;
  const ry = R * 0.47;

  for (let py = 0; py < R; py++) {
    for (let px = 0; px < R; px++) {
      const nx = (px - cx) / rx;
      const ny = (py - cy) / ry;

      const depth = beanSDF(nx, ny);
      if (depth === 0) continue;

      // ── Shading ─────────────────────────────────────────────────────
      // Heavy spherical falloff → dark edges, bright centre
      const spherical = Math.pow(depth, 0.6) * 0.78;

      // Strong directional key light from upper-left
      const dir = Math.max(0, -nx * 0.50 - ny * 0.60) * 0.45;

      // Coffee-bean crease — S-curve running pole-to-pole
      const creaseX     = Math.sin(ny * Math.PI * 0.55) * 0.11;
      const dCrease     = Math.abs(nx - creaseX);
      const cWidth      = 0.10 * (1 - Math.abs(ny) * 0.45);
      const inCrease    = dCrease < cWidth;

      // Deep shadow on the shadow side of the crease
      const creaseShadow = nx > creaseX && dCrease < cWidth * 2.5
        ? -0.22 * (1 - dCrease / (cWidth * 2.5))
        : 0;
      // Specular ridge along the lit side of the crease
      const creaseGlow = inCrease
        ? 0.15 * (1 - dCrease / cWidth)
        : 0;

      // Hard rim: very dark band around the silhouette edge
      const rim = depth < 0.15 ? -0.35 * (1 - depth / 0.15) : 0;

      // Specular hotspot — upper-left
      const specDist = Math.sqrt((nx + 0.26) ** 2 + (ny + 0.30) ** 2);
      const spec = Math.max(0, 1 - specDist / 0.20) ** 3 * 0.22;

      let brightness = spherical + dir + creaseShadow + creaseGlow + rim + spec;
      brightness = Math.max(0, Math.min(1, brightness));

      // ── 1-bit ordered dither ────────────────────────────────────────
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
}

interface DitherBeanProps {
  displaySize?: number;
  rotate?: number;
  className?: string;
}

export function DitherBean({ displaySize = 340, rotate = 0, className = "" }: DitherBeanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) renderBean(canvasRef.current, displaySize);
  }, [displaySize]);

  return (
    <motion.div
      className={`cursor-pointer select-none ${className}`}
      style={{ rotate, originX: "50%", originY: "50%" }}
      whileHover={{
        y: [0, -16, -4, -18, 0],
        rotate: [rotate, rotate - 5, rotate + 3, rotate - 3, rotate],
        scale: 1.05,
        transition: {
          y:      { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          scale:  { duration: 0.35, ease: "easeOut" },
        },
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          imageRendering: "pixelated",
          width:  displaySize,
          height: displaySize,
          display: "block",
        }}
      />
    </motion.div>
  );
}
