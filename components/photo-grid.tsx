"use client";

import { useState } from "react";

interface CellProps {
  name: string;
  alt: string;
  className?: string;
}

function Cell({ name, alt, className = "" }: CellProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div className={`relative overflow-hidden bg-espresso-50 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/photos?name=${encodeURIComponent(name)}`}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

interface PhotoGridProps {
  photos: string[];
  shopName: string;
}

export function PhotoGrid({ photos, shopName }: PhotoGridProps) {
  if (photos.length === 0) return null;

  if (photos.length === 1) {
    return (
      <div className="group mb-5 h-44 overflow-hidden rounded-2xl animate-fade-in sm:mb-7 sm:h-60 sm:rounded-3xl lg:h-72">
        <Cell name={photos[0]} alt={shopName} className="h-full w-full" />
      </div>
    );
  }

  if (photos.length === 2) {
    return (
      <div className="mb-5 grid h-40 grid-cols-2 gap-1 overflow-hidden rounded-2xl animate-fade-in sm:mb-7 sm:h-52 sm:gap-1.5 sm:rounded-3xl lg:h-64">
        <Cell name={photos[0]} alt={`${shopName} · 1`} className="group h-full" />
        <Cell name={photos[1]} alt={`${shopName} · 2`} className="group h-full" />
      </div>
    );
  }

  // 3+ — magazine: large left + two stacked right
  return (
    <div className="mb-5 grid h-48 grid-cols-[3fr_2fr] gap-1 overflow-hidden rounded-2xl animate-fade-in sm:mb-7 sm:h-64 sm:gap-1.5 sm:rounded-3xl lg:h-80">
      <Cell name={photos[0]} alt={`${shopName} · main`} className="group h-full" />
      <div className="flex flex-col gap-1 sm:gap-1.5">
        <Cell name={photos[1]} alt={`${shopName} · 2`} className="group flex-1" />
        <Cell name={photos[2]} alt={`${shopName} · 3`} className="group flex-1" />
      </div>
    </div>
  );
}
