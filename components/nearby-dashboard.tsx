"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Coffee, LocateFixed, MapPin, Search } from "lucide-react";
import { MapPanel } from "@/components/map-panel";
import { ShopCard } from "@/components/shop-card";
import type { ShopWithInsight } from "@/lib/types";

interface WeatherData {
  tempF: number;
  precipProbability: number;
  conditionLabel: string;
  conditionEmoji: string;
}

interface NearbyDashboardProps {
  initialShops: ShopWithInsight[];
}

// Charleston, SC — overridden by geolocation or zip search
const DEFAULT_COORDS = { lat: 32.7765, lng: -79.9311 };

type LocationMode = "gps" | "zip";

export function NearbyDashboard({ initialShops }: NearbyDashboardProps) {
  const [shops, setShops] = useState(initialShops);
  const [status, setStatus] = useState("Getting your location…");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [radius, setRadius] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locationMode, setLocationMode] = useState<LocationMode>("gps");
  const [zipInput, setZipInput] = useState("");
  const [zipLoading, setZipLoading] = useState(false);

  // Refs so async callbacks always see latest values without re-subscribing
  const coordsRef = useRef(DEFAULT_COORDS);
  const radiusRef = useRef(0);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doFetch = useCallback(async (lat: number, lng: number, miles: number) => {
    if (miles === 0) { setShops([]); return; }
    setLoading(true);
    try {
      const meters = Math.round(miles * 1609.34);
      const res = await fetch(`/api/shops/nearby?lat=${lat}&lng=${lng}&radius=${meters}`);
      const data = (await res.json()) as { data: ShopWithInsight[] };
      setShops(data.data ?? []);
    } catch {
      // keep current list on network error
    } finally {
      setLoading(false);
    }
  }, []);

  // Geolocation fires on mount and when switching back to GPS mode
  useEffect(() => {
    if (locationMode !== "gps") return;
    if (!navigator.geolocation) {
      setStatus("Using Charleston (demo)");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        coordsRef.current = { lat, lng };
        setStatus("Using your location");

        fetch(`/api/weather?lat=${lat}&lng=${lng}`)
          .then((r) => r.json())
          .then((w: WeatherData | null) => { if (w) setWeather(w); })
          .catch(() => {});

        if (radiusRef.current > 0) {
          doFetch(lat, lng, radiusRef.current);
        }
      },
      () => {
        setStatus("Using Charleston (location blocked)");
        if (radiusRef.current > 0) {
          doFetch(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng, radiusRef.current);
        }
      }
    );
  }, [doFetch, locationMode]);

  const handleZipSearch = async () => {
    if (!zipInput.trim()) return;
    setZipLoading(true);
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(zipInput)}`);
      if (!res.ok) throw new Error("Not found");
      const data = (await res.json()) as { lat: number; lng: number; formattedAddress: string };
      coordsRef.current = { lat: data.lat, lng: data.lng };
      setStatus(data.formattedAddress);
      if (radiusRef.current > 0) {
        doFetch(data.lat, data.lng, radiusRef.current);
      }
    } catch {
      setStatus("ZIP not found — try again");
    } finally {
      setZipLoading(false);
    }
  };

  const handleRadiusChange = (miles: number) => {
    setRadius(miles);
    radiusRef.current = miles;
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    if (miles === 0) { setShops([]); return; }
    fetchTimerRef.current = setTimeout(() => {
      doFetch(coordsRef.current.lat, coordsRef.current.lng, miles);
    }, 350);
  };

  const switchMode = (mode: LocationMode) => {
    setLocationMode(mode);
    setZipInput("");
    if (mode === "gps") {
      coordsRef.current = DEFAULT_COORDS;
      setStatus("Getting your location…");
    }
  };

  const radiusLabel =
    radius === 0 ? "Off"
    : radius < 1 ? `${Math.round(radius * 5280)} ft`
    : `${radius} mi`;

  const sliderPct = (radius / 25) * 100;

  return (
    <div className="space-y-5">

      {/* ── Header card ────────────────────────────────────────────────── */}
      <div className="animate-fade-in rounded-[2rem] border border-espresso-100 bg-white p-4 shadow-panel sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Nearby Intelligence</p>
            <h1 className="mt-2 font-display text-2xl text-espresso-900 sm:text-3xl">
              Coffee shops around you
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-espresso-600 sm:leading-7 sm:text-base">
              Discover nearby cafes, compare demand, and understand what&apos;s happening right now.
            </p>
          </div>

          {/* Status + weather pills */}
          <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
            <div className="flex min-w-0 items-center gap-1.5 rounded-full bg-espresso-50 px-3 py-1.5">
              <LocateFixed className="h-3.5 w-3.5 shrink-0 text-espresso-500" />
              <span className="min-w-0 max-w-[180px] truncate text-xs text-espresso-700">{status}</span>
            </div>
            {weather && (
              <div className="flex items-center gap-1.5 rounded-full bg-espresso-50 px-3 py-1.5 text-xs text-espresso-700">
                <span>{weather.conditionEmoji}</span>
                <span className="truncate">
                  {weather.tempF}°F · {weather.conditionLabel}
                  {weather.precipProbability > 10 ? ` · ${weather.precipProbability}%` : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Location mode toggle ──────────────────────────────────────── */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => switchMode("gps")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
              locationMode === "gps"
                ? "bg-espresso-800 text-crema shadow-sm"
                : "bg-espresso-50 text-espresso-600 hover:bg-espresso-100"
            }`}
          >
            <LocateFixed className="h-3 w-3" />
            GPS
          </button>
          <button
            onClick={() => switchMode("zip")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
              locationMode === "zip"
                ? "bg-espresso-800 text-crema shadow-sm"
                : "bg-espresso-50 text-espresso-600 hover:bg-espresso-100"
            }`}
          >
            <MapPin className="h-3 w-3" />
            Zip Code
          </button>
        </div>

        {/* ── Zip code input ────────────────────────────────────────────── */}
        {locationMode === "zip" && (
          <div className="mt-3 flex gap-2 animate-slide-up">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter ZIP or city name"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleZipSearch()}
              className="min-w-0 flex-1 rounded-xl border border-espresso-200 bg-white px-4 py-2.5 text-sm text-espresso-900 outline-none placeholder:text-espresso-300 focus:border-espresso-400 focus:ring-1 focus:ring-espresso-400/50 transition"
            />
            <button
              onClick={handleZipSearch}
              disabled={zipLoading || !zipInput.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-espresso-800 px-4 py-2.5 text-sm font-semibold text-crema transition hover:bg-espresso-900 disabled:opacity-50"
            >
              {zipLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-crema/30 border-t-crema" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </button>
          </div>
        )}

        {/* ── Radius slider ─────────────────────────────────────────────── */}
        <div className="mt-4 rounded-2xl bg-espresso-50 px-3 py-3.5 sm:px-4 sm:py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-espresso-700 sm:text-sm">Search radius</span>
            <span className="rounded-full bg-espresso-900 px-2.5 py-0.5 text-xs font-semibold text-crema tabular-nums">
              {radiusLabel}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            step={0.5}
            value={radius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="radius-slider"
            style={{
              background: `linear-gradient(to right, #452815 0%, #452815 ${sliderPct}%, #e8d5bf ${sliderPct}%, #e8d5bf 100%)`
            }}
          />
          <div className="mt-1.5 flex justify-between text-[9px] text-espresso-400 sm:text-[10px]">
            <span>0</span>
            <span>5 mi</span>
            <span>10 mi</span>
            <span>15 mi</span>
            <span>20 mi</span>
            <span>25 mi</span>
          </div>
        </div>
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {radius === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-espresso-100 bg-white py-16 px-6 text-center shadow-panel animate-scale-in">
          <div className="mb-4 rounded-full bg-espresso-50 p-5">
            <Coffee className="h-8 w-8 text-espresso-400" />
          </div>
          <h2 className="font-display text-2xl text-espresso-900">Ready when you are</h2>
          <p className="mt-2 max-w-sm text-sm text-espresso-500">
            Slide the radius above to explore coffee shops around your location.
          </p>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {radius > 0 && (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {/* List */}
          <div className="space-y-3">
            {loading && shops.length === 0 && (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[88px] animate-pulse rounded-2xl bg-espresso-50"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            )}
            {!loading && shops.length === 0 && (
              <div className="rounded-2xl border border-espresso-100 bg-white p-8 text-center animate-fade-in">
                <MapPin className="mx-auto mb-3 h-7 w-7 text-espresso-300" />
                <p className="text-espresso-600">No shops found within {radiusLabel}.</p>
                <p className="mt-1 text-sm text-espresso-400">Try increasing the radius.</p>
              </div>
            )}
            {shops.map((shop, index) => (
              <ShopCard key={shop.id} shop={shop} index={index} />
            ))}
          </div>

          {/* Map — hidden on mobile when no shops */}
          <div className={shops.length === 0 && !loading ? "hidden lg:block" : "animate-fade-in"}>
            <MapPanel shops={shops} />
          </div>
        </div>
      )}
    </div>
  );
}
