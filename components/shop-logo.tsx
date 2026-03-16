"use client";

import { useState } from "react";

type LogoStage = "clearbit" | "favicon" | "letter";

interface ShopLogoProps {
  website?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

export function ShopLogo({ website, name, size = "md" }: ShopLogoProps) {
  const [stage, setStage] = useState<LogoStage>(website ? "clearbit" : "letter");

  const sizeClass =
    size === "sm" ? "h-8 w-8 rounded-lg text-xs" :
    size === "lg" ? "h-14 w-14 rounded-2xl text-base" :
    "h-10 w-10 rounded-xl text-sm";

  if (stage === "letter" || !website) {
    // Deterministic warm color from first char
    const colors = [
      "bg-amber-100 text-amber-700",
      "bg-orange-100 text-orange-700",
      "bg-stone-200 text-stone-700",
      "bg-yellow-100 text-yellow-700",
      "bg-espresso-100 text-espresso-600",
    ];
    const color = colors[(name.charCodeAt(0) ?? 0) % colors.length];
    return (
      <div className={`flex shrink-0 items-center justify-center font-bold ${sizeClass} ${color}`}>
        {name[0]?.toUpperCase() ?? "C"}
      </div>
    );
  }

  const domain = website.replace(/^https?:\/\//, "").split("/")[0];

  if (stage === "clearbit") {
    return (
      <div className={`flex shrink-0 items-center justify-center overflow-hidden bg-white shadow-sm ${sizeClass}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://logo.clearbit.com/${domain}?size=80`}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain p-0.5"
          onError={() => setStage("favicon")}
        />
      </div>
    );
  }

  // Google favicon service — works for most sites including local businesses
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden bg-white shadow-sm ${sizeClass}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
        alt=""
        aria-hidden="true"
        className="h-3/4 w-3/4 object-contain"
        onError={() => setStage("letter")}
      />
    </div>
  );
}
