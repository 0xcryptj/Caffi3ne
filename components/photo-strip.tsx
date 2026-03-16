"use client";

import { useState } from "react";

interface PhotoStripProps {
  photos: string[];
  shopName: string;
}

function PhotoItem({ name, shopName, index }: { name: string; shopName: string; index: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div className="relative h-52 w-72 shrink-0 overflow-hidden rounded-3xl border border-espresso-100 bg-espresso-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/photos?name=${encodeURIComponent(name)}`}
        alt={`${shopName} photo ${index + 1}`}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function PhotoStrip({ photos, shopName }: PhotoStripProps) {
  if (photos.length === 0) return null;
  return (
    <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
      {photos.slice(0, 4).map((name, i) => (
        <PhotoItem key={name} name={name} shopName={shopName} index={i} />
      ))}
    </div>
  );
}
