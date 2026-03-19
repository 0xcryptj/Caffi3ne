"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

// 4×4 Bayer ordered-dither matrix, normalised to [0, 1)
const BAYER: readonly (readonly number[])[] = [
  [ 0 / 16,  8 / 16,  2 / 16, 10 / 16],
  [12 / 16,  4 / 16, 14 / 16,  6 / 16],
  [ 3 / 16, 11 / 16,  1 / 16,  9 / 16],
  [15 / 16,  7 / 16, 13 / 16,  5 / 16],
];

// 1-bit palette: near-black espresso  ↔  warm roasted brown
const DARK  = [22,  10,  3]  as const; // #160a03
const LIGHT = [168, 104, 52] as const; // #a86834

/** Pointed coffee-bean silhouette SDF.
 *  Returns 0 outside the bean, or a 0-1 depth value increasing toward the centre. */
function beanSDF(nx: number, ny: number): number {
  if (Math.abs(ny) >= 1) return 0;
  const xBound = Math.pow(1 - ny * ny, 0.52);
  if (Math.abs(nx) > xBound) return 0;
  const xDepth = xBound > 0 ? 1 - Math.abs(nx) / xBound : 0;
  return Math.min(xDepth, 1 - Math.abs(ny));
}

function renderBean(canvas: HTMLCanvasElement, displaySize: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1/3 scale → 3×3 screen-pixel blocks, 12×12 visible Bayer cell
  const R = Math.max(1, Math.round(displaySize / 3));
  canvas.width  = R;
  canvas.height = R;

  const img  = ctx.createImageData(R, R);
  const data = img.data;

  const cx = R / 2, cy = R / 2;
  const rx = R * 0.37, ry = R * 0.47;

  for (let py = 0; py < R; py++) {
    for (let px = 0; px < R; px++) {
      const nx = (px - cx) / rx;
      const ny = (py - cy) / ry;
      const depth = beanSDF(nx, ny);
      if (depth === 0) continue;

      // Shading
      const spherical   = Math.pow(depth, 0.6) * 0.76;
      const dir         = Math.max(0, -nx * 0.48 - ny * 0.58) * 0.42;

      // ── Crease — the defining feature of a coffee bean ────────────────
      // S-curve running pole-to-pole, shifted slightly right of centre
      const creaseX  = Math.sin(ny * Math.PI * 0.60) * 0.12 + 0.04;
      const dCrease  = Math.abs(nx - creaseX);
      // Crease width: widest at equator, tapers toward tips
      const cWidth   = 0.13 * Math.pow(1 - Math.abs(ny) * 0.80, 0.5);

      // 1. Dark groove — wide shadow on the right side of the crease line
      const shadowWidth = cWidth * 3.2;
      const creaseShadow = (nx > creaseX - cWidth * 0.5 && dCrease < shadowWidth)
        ? -0.42 * (1 - dCrease / shadowWidth)
        : 0;
      // 2. Bright ridge — narrow highlight on the left (lit) side
      const ridgeWidth = cWidth * 0.8;
      const creaseGlow = (nx < creaseX && dCrease < ridgeWidth)
        ? 0.28 * (1 - dCrease / ridgeWidth)
        : 0;

      const rim         = depth < 0.15 ? -0.38 * (1 - depth / 0.15) : 0;
      const specDist    = Math.sqrt((nx + 0.26) ** 2 + (ny + 0.30) ** 2);
      const spec        = Math.max(0, 1 - specDist / 0.20) ** 3 * 0.22;

      let brightness = spherical + dir + creaseShadow + creaseGlow + rim + spec;
      brightness = Math.max(0, Math.min(1, brightness));

      const threshold   = BAYER[py % 4][px % 4];
      const [r, g, b]   = brightness > threshold ? LIGHT : DARK;
      const i           = (py * R + px) * 4;
      data[i] = r; data[i+1] = g; data[i+2] = b; data[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

interface DitherBeanProps {
  displaySize?: number;
  rotate?: number;
  className?: string;
  /** Delay (seconds) before the idle float begins — staggers beans so they're out of phase */
  idleDelay?: number;
}

export function DitherBean({ displaySize = 340, rotate = 0, className = "", idleDelay = 0 }: DitherBeanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (canvasRef.current) renderBean(canvasRef.current, displaySize);
  }, [displaySize]);

  return (
    <motion.div
      className={`select-none ${className}`}
      style={{
        cursor: "pointer",
        originX: "50%",
        originY: "50%",
        aspectRatio: "1",
        filter: "drop-shadow(0 8px 18px rgba(70, 32, 6, 0.38))",
      }}
      initial={{ y: 0, rotate, scale: 1 }}
      animate={
        hovered
          ? {
              y: [0, -13, 0],
              rotate: [rotate, rotate - 5, rotate + 3, rotate],
              scale: 1.06,
            }
          : {
              y: [0, -5, 0],
              rotate: [rotate, rotate + 1.5, rotate - 1, rotate],
              scale: 1,
            }
      }
      transition={
        hovered
          ? {
              y:      { duration: 3.0, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 4.0, repeat: Infinity, ease: "easeInOut" },
              scale:  { duration: 0.35, ease: "easeOut" },
            }
          : {
              y:      { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: idleDelay },
              rotate: { duration: 6.0, repeat: Infinity, ease: "easeInOut", delay: idleDelay + 0.5 },
              scale:  { duration: 0.4, ease: "easeOut" },
            }
      }
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <canvas
        ref={canvasRef}
        style={{
          imageRendering: "pixelated",
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </motion.div>
  );
}
