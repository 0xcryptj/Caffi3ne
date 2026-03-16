"use client";

import { motion, type Transition } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  onAnimationComplete?: () => void;
}

export function BlurText({
  text = "",
  delay = 80,
  className = "",
  animateBy = "words",
  direction = "bottom",
  threshold = 0.1,
  rootMargin = "0px",
  onAnimationComplete,
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const from = direction === "bottom"
    ? { filter: "blur(10px)", opacity: 0, y: 24 }
    : { filter: "blur(10px)", opacity: 0, y: -24 };

  const to = [
    { filter: "blur(4px)", opacity: 0.5, y: direction === "bottom" ? 6 : -6 },
    { filter: "blur(0px)", opacity: 1, y: 0 },
  ];

  const duration = 0.55;
  const times = [0, 0.5, 1];

  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {elements.map((segment, i) => {
        const keyframes: Record<string, (string | number)[]> = {
          filter: [from.filter, to[0].filter, to[1].filter],
          opacity: [from.opacity, to[0].opacity, to[1].opacity],
          y: [from.y, to[0].y, to[1].y],
        };
        const spanTransition: Transition = {
          duration,
          times,
          delay: (i * delay) / 1000,
          ease: "easeOut",
        };
        return (
          <motion.span
            key={i}
            initial={from}
            animate={inView ? keyframes : from}
            transition={spanTransition}
            onAnimationComplete={i === elements.length - 1 ? onAnimationComplete : undefined}
            style={{ display: "inline-block", willChange: "transform, filter, opacity" }}
          >
            {segment === " " ? "\u00A0" : segment}
            {animateBy === "words" && i < elements.length - 1 && "\u00A0"}
          </motion.span>
        );
      })}
    </p>
  );
}
