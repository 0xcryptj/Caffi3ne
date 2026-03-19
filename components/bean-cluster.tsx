"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { DitherBean } from "./dither-bean";

/**
 * Two dithered coffee beans grouped together with mouse-parallax reactivity.
 * The beans float at slightly different depths, so cursor movement creates
 * a subtle 3-D separation effect.
 */
export function BeanCluster() {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics: smooth but responsive
  const springX = useSpring(mouseX, { stiffness: 55, damping: 20, mass: 0.6 });
  const springY = useSpring(mouseY, { stiffness: 55, damping: 20, mass: 0.6 });

  // Big bean (back layer) moves less
  const b1x = useTransform(springX, (v) => v * 0.05);
  const b1y = useTransform(springY, (v) => v * 0.05);

  // Small bean (front layer) moves more → parallax depth
  const b2x = useTransform(springX, (v) => v * 0.13);
  const b2y = useTransform(springY, (v) => v * 0.13);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      // Container sized to the big bean — small bean overflows via absolute
      className="relative"
      style={{ width: "clamp(160px, 20vw, 220px)", height: "clamp(160px, 20vw, 220px)" }}
    >
      {/* Big bean — centered, behind */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ x: b1x, y: b1y, zIndex: 10 }}
      >
        <DitherBean
          displaySize={240}
          rotate={-13}
          className="w-full"
          idleDelay={0}
        />
      </motion.div>

      {/* Small bean — bottom-right, in front, slightly overlapping */}
      <motion.div
        className="absolute"
        style={{
          x: b2x,
          y: b2y,
          bottom: "-6%",
          right: "-8%",
          zIndex: 20,
          width: "clamp(68px, 8vw, 98px)",
        }}
      >
        <DitherBean
          displaySize={160}
          rotate={27}
          className="w-full"
          idleDelay={1.4}
        />
      </motion.div>
    </div>
  );
}
