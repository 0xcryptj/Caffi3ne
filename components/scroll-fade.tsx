"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollFadeProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in ms before the transition starts once in view */
  delay?: number;
  /** Translate direction: "up" (default) | "down" | "left" | "right" | "none" */
  from?: "up" | "down" | "left" | "right" | "none";
}

const translateMap = {
  up:    "translateY(28px)",
  down:  "translateY(-28px)",
  left:  "translateX(28px)",
  right: "translateX(-28px)",
  none:  "none",
} as const;

export function ScrollFade({
  children,
  className = "",
  delay = 0,
  from = "up",
}: ScrollFadeProps) {
  const ref     = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? "none" : translateMap[from],
        transition: visible
          ? `opacity 0.70s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.70s cubic-bezier(0.22,1,0.36,1) ${delay}ms`
          : "none",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
