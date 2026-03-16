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

// Warm espresso brown palette — matches the site's color tokens
const DARK  = [50,  28,  11] as const;   // ~espresso-800  #321c0b
const MID   = [143, 86,  45] as const;   // ~espresso-400  #8f562d
const LIGHT = [196, 147, 94] as const;   // ~espresso-200  #c4935e

/** Pointed coffee-bean silhouette check.
 *  nx / ny are coordinates normalised to [-1, 1] by half-width / half-height.
 *  Returns fraction 0-1 of how far inside the bean (1 = centre, 0 = edge). */
function beanMask(nx: number, ny: number): number {
  if (Math.abs(ny) >= 1) return 0;
  // (1 - ny²)^0.55 gives a "pointed-oval" that narrows sharply at the tips
  const xBound = Math.pow(1 - ny * ny, 0.55);
  if (Math.abs(nx) > xBound) return 0;
  // Smooth distance from edge (0 = edge, 1 = centre)
  const xFrac = xBound > 0 ? 1 - Math.abs(nx) / xBound : 0;
  const yFrac = 1 - Math.abs(ny);
  return Math.min(xFrac, yFrac);
}

function renderBean(canvas: HTMLCanvasElement, displaySize: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Render at 1/2.5 resolution → 2.5× pixel scale for chunky dither look
  const R = Math.round(displaySize / 2.5);
  canvas.width  = R;
  canvas.height = R;

  const img  = ctx.createImageData(R, R);
  const data = img.data;

  const cx = R / 2;
  const cy = R / 2;
  const rx = R * 0.38;
  const ry = R * 0.48;

  for (let py = 0; py < R; py++) {
    for (let px = 0; px < R; px++) {
      const nx = (px - cx) / rx;
      const ny = (py - cy) / ry;

      const inside = beanMask(nx, ny);
      if (inside === 0) continue;

      // ── Shading ───────────────────────────────────────────────────────
      // Spherical falloff
      const spherical = inside * 0.9;

      // Directional key light from upper-left
      const dir = Math.max(0, -nx * 0.42 - ny * 0.55) * 0.38;

      // Crease: a gentle S-curve from tip to tip
      const creaseX   = Math.sin(ny * Math.PI * 0.55) * 0.10;
      const dCrease   = Math.abs(nx - creaseX);
      const cWidth    = 0.11 * (1 - Math.abs(ny) * 0.4);
      const inCrease  = dCrease < cWidth;

      // Shadow on the right side of the crease (adds groove depth)
      const creaseShadow = (nx > creaseX && dCrease < cWidth * 2.2)
        ? -0.14 * (1 - dCrease / (cWidth * 2.2))
        : 0;
      // Faint highlight running through the crease centre
      const creaseHighlight = inCrease
        ? 0.10 * (1 - dCrease / cWidth)
        : 0;

      // Rim darkening around the edge of the bean
      const rim = inside < 0.18 ? (inside / 0.18) * 0.25 - 0.25 : 0;

      // Small specular hotspot — upper-left quadrant
      const specX = -0.28; const specY = -0.32;
      const specDist = Math.sqrt((nx - specX) ** 2 + (ny - specY) ** 2);
      const spec = Math.max(0, 1 - specDist / 0.22) ** 3 * 0.18;

      let brightness = spherical + dir + creaseShadow + creaseHighlight + rim + spec;
      brightness = Math.max(0, Math.min(1, brightness));

      // ── Two-tone dithering ────────────────────────────────────────────
      // Map brightness to a 3-tone space: DARK (0–0.38), MID (0.38–0.70), LIGHT (0.70–1)
      // We dither between adjacent tones so the result looks fully continuous.
      const threshold = BAYER[py % 4][px % 4];

      let r: number, g: number, b: number;
      if (brightness < 0.38) {
        // Dither DARK ↔ MID
        const local = brightness / 0.38;
        const useMid = local > threshold;
        [r, g, b] = useMid ? MID : DARK;
      } else if (brightness < 0.72) {
        // Dither MID ↔ LIGHT
        const local = (brightness - 0.38) / 0.34;
        const useLight = local > threshold;
        [r, g, b] = useLight ? LIGHT : MID;
      } else {
        // Full light (only near the specular spot)
        [r, g, b] = LIGHT;
      }

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
  /** Initial CSS rotation in degrees */
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
      className={`cursor-pointer ${className}`}
      style={{ rotate, originX: "50%", originY: "50%" }}
      whileHover={{
        y: [0, -14, 0, -10, 0],
        rotate: [rotate, rotate - 4, rotate + 4, rotate - 2, rotate],
        scale: 1.04,
        transition: {
          y:      { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
          scale:  { duration: 0.25, ease: "easeOut" },
        },
      }}
      transition={{ scale: { duration: 0.3 } }}
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
