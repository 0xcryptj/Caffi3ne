"use client";

import { useEffect, useState } from "react";
import { LocateFixed, SlidersHorizontal } from "lucide-react";
import { MapPanel } from "@/components/map-panel";
import { ShopCard } from "@/components/shop-card";
import type { ShopWithInsight } from "@/lib/types";

interface NearbyDashboardProps {
  initialShops: ShopWithInsight[];
}

export function NearbyDashboard({ initialShops }: NearbyDashboardProps) {
  const [shops, setShops] = useState(initialShops);
  const [status, setStatus] = useState("Using demo location in Brooklyn");

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setStatus("Refreshing shops for your current location");

        try {
          const response = await fetch(`/api/shops/nearby?lat=${lat}&lng=${lng}&radius=2500`);
          const data = (await response.json()) as { data: ShopWithInsight[] };
          setShops(data.data);
          setStatus("Using browser geolocation");
        } catch {
          setStatus("Geolocation available, but the app stayed on mock data");
        }
      },
      () => {
        setStatus("Geolocation blocked, using demo location in Brooklyn");
      }
    );
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-espresso-100 bg-white p-6 shadow-panel lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Nearby Intelligence</p>
          <h1 className="mt-2 font-display text-4xl text-espresso-900">Coffee shops around you</h1>
          <p className="mt-2 max-w-2xl text-espresso-600">
            Discover nearby cafes, compare demand, and understand what is likely happening right now.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-espresso-700">
          <div className="flex items-center gap-2 rounded-full bg-espresso-50 px-4 py-2">
            <LocateFixed className="h-4 w-4" />
            <span>{status}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-espresso-50 px-4 py-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters: rating, crowd, distance</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
        <MapPanel shops={shops} />
      </div>
    </div>
  );
}
