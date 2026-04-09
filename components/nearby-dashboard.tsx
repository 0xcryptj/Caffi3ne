"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Coffee, LayoutList, LocateFixed, Map, MapPin } from "lucide-react";
import { LocationSearchRow } from "@/components/location-search-input";
import { MapPanel } from "@/components/map-panel";
import { ShopCard } from "@/components/shop-card";
import { getThumbCenterPercent, RANGE_THUMB_WIDTH_PX } from "@/lib/slider-geometry";
import type { ShopWithInsight } from "@/lib/types";

interface WeatherData {
  tempF: number;
  precipProbability: number;
  conditionLabel: string;
  conditionEmoji: string;
}

interface IpLocation {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

interface NearbyDashboardProps {
  initialShops: ShopWithInsight[];
}

type LocationMode = "gps" | "search";

const RADIUS_MIN = 0;
const RADIUS_MAX = 25;
/** Matches tick marks; slider snaps to these values only. */
const RADIUS_STEP = 5;
const RADIUS_TICKS = [0, 5, 10, 15, 20, 25] as const;
/** After a place search, pre-select 5 mi so users do not need to move the slider. */
const DEFAULT_PLACE_SEARCH_RADIUS_MI = 5;

export function NearbyDashboard({ initialShops }: NearbyDashboardProps) {
  const [shops, setShops] = useState(initialShops);
  const [status, setStatus] = useState("Detecting your location…");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [radius, setRadius] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locationMode, setLocationMode] = useState<LocationMode>("gps");
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  // null until a location is confirmed — no hardcoded fallback city
  const coordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const radiusRef = useRef(0);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Prevents the slider from firing before we have real coordinates
  const locationReadyRef = useRef(false);
  // Tracks whether precise GPS has already won — prevents IP fallback from overwriting it
  const gpsResolvedRef = useRef(false);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const [sliderTrackWidthPx, setSliderTrackWidthPx] = useState(0);

  const doFetch = useCallback(async (lat: number, lng: number, miles: number) => {
    if (miles === 0) { setShops([]); return; }
    setLoading(true);
    try {
      const meters = Math.round(miles * 1609.34);
      const res = await fetch(`/api/shops/nearby?lat=${lat}&lng=${lng}&radius=${meters}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = (await res.json()) as { data: ShopWithInsight[] };
      setShops(data.data ?? []);
    } catch {
      // keep current list on network error
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeather = useCallback((lat: number, lng: number) => {
    fetch(`/api/weather?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then((w: WeatherData | null) => { if (w) setWeather(w); })
      .catch(() => {});
  }, []);

  /**
   * Apply a resolved location. GPS (precise=true) always wins over IP location.
   */
  const applyLocation = useCallback(
    (lat: number, lng: number, label: string, precise: boolean) => {
      // Don't let an IP result overwrite a GPS result
      if (!precise && gpsResolvedRef.current) return;

      coordsRef.current = { lat, lng };
      locationReadyRef.current = true;
      if (precise) gpsResolvedRef.current = true;

      setStatus(label);
      fetchWeather(lat, lng);

      if (radiusRef.current > 0) {
        doFetch(lat, lng, radiusRef.current);
      }
    },
    [doFetch, fetchWeather]
  );

  // On mount (and when returning to GPS mode):
  // 1. Auto-request precise GPS — browser will prompt the user for permission.
  //    GPS gives accurate street-level location (unlike IP which can be off by miles).
  // 2. Simultaneously fetch IP location as an instant fallback so the UI isn't
  //    blank while the permission dialog is pending or if GPS is denied.
  // 3. applyLocation's gpsResolvedRef guard ensures GPS always wins over IP.
  useEffect(() => {
    if (locationMode !== "gps") return;

    gpsResolvedRef.current = false;
    locationReadyRef.current = false;
    coordsRef.current = null;
    setStatus("Requesting your location…");

    // IP location: resolves instantly, used as a coordinate fallback only.
    // We intentionally do NOT display the IP city name — IP geolocation is tied to
    // carrier NAT gateways and can show a city many miles from the user's real location.
    fetch("/api/location")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((loc: IpLocation) => {
        // Always show "Approximate location" — never the IP city string
        applyLocation(loc.lat, loc.lng, "Approximate location · allow GPS for accuracy", false);
      })
      .catch(() => {
        if (!locationReadyRef.current) setStatus("Location unavailable — try place search");
      });

    // GPS: precise location — overwrites IP result once user grants permission.
    // maximumAge: 0 forces a fresh reading (never serve a stale cached position).
    // timeout: 15000 gives slower mobile GPS chips extra time to acquire a fix.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyLocation(pos.coords.latitude, pos.coords.longitude, "Using your location", true);
        },
        () => {
          // Denied or timed out — IP fallback stays, no further action needed
          if (!gpsResolvedRef.current && locationReadyRef.current) {
            setStatus("Approximate location · allow GPS for accuracy");
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
  }, [applyLocation, locationMode]);

  useEffect(() => {
    const el = sliderTrackRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setSliderTrackWidthPx(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Re-request GPS — called when user explicitly taps the GPS button.
  // Useful if they denied on first load and want to retry, or to refresh location.
  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("GPS not available — try place search");
      return;
    }
    setStatus("Requesting GPS…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyLocation(pos.coords.latitude, pos.coords.longitude, "Using your location", true);
      },
      () => {
        if (!locationReadyRef.current) setStatus("Location unavailable — try place search");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [applyLocation]);

  /** Single source of truth: slider value === React state === API miles (0,5,…,25). */
  const applyRadius = useCallback(
    (raw: number) => {
      if (!Number.isFinite(raw)) return;
      const snapped = Math.round(raw / RADIUS_STEP) * RADIUS_STEP;
      const next = Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, snapped));
      setRadius(next);
      radiusRef.current = next;
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
      if (next === 0) {
        setShops([]);
        return;
      }
      if (!locationReadyRef.current) return;
      fetchTimerRef.current = setTimeout(() => {
        const coords = coordsRef.current;
        if (!coords) return;
        doFetch(coords.lat, coords.lng, next);
      }, 350);
    },
    [doFetch]
  );

  const applySearchPlace = useCallback(
    async (payload: { lat: number; lng: number; formattedAddress: string; query: string }) => {
      coordsRef.current = { lat: payload.lat, lng: payload.lng };
      locationReadyRef.current = true;
      setStatus(payload.formattedAddress);
      fetchWeather(payload.lat, payload.lng);
      applyRadius(DEFAULT_PLACE_SEARCH_RADIUS_MI);
      void fetch("/api/user/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: payload.lat,
          longitude: payload.lng,
          source: "general",
          metadata: {
            context: "place_search",
            query: payload.query,
            formattedAddress: payload.formattedAddress
          }
        })
      });
    },
    [applyRadius, fetchWeather]
  );

  const switchMode = (mode: LocationMode) => {
    setLocationMode(mode);
    if (mode === "gps") {
      locationReadyRef.current = false;
      gpsResolvedRef.current = false;
      setStatus("Detecting your location…");
    }
  };

  const radiusLabel = radius === 0 ? "Off" : `${radius} mi`;

  const thumbCenterPct = (v: number) =>
    getThumbCenterPercent(v, RADIUS_MIN, RADIUS_MAX, sliderTrackWidthPx, RANGE_THUMB_WIDTH_PX);

  const fillEndPct = radius <= 0 ? 0 : thumbCenterPct(radius);

  return (
    <div
      className={`w-full min-w-0 space-y-5 ${
        radius > 0 ? "pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] lg:pb-0" : ""
      }`}
    >

      {/* ── Header card ────────────────────────────────────────────────── */}
      <div className="animate-fade-in rounded-3xl border border-espresso-100 bg-white p-3.5 shadow-panel sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-espresso-500 sm:text-xs sm:tracking-[0.3em]">
              Nearby Intelligence
            </p>
            <h1 className="mt-1.5 font-display text-[1.35rem] leading-tight text-espresso-900 sm:mt-2 sm:text-3xl sm:leading-snug">
              Coffee shops around you
            </h1>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-espresso-600 sm:text-base sm:leading-7">
              Discover nearby cafes, compare demand, and understand what&apos;s happening right now.
            </p>
          </div>

          {/* Status + weather pills */}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:shrink-0 sm:justify-end">
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl bg-espresso-50 px-3 py-2 sm:max-w-none sm:flex-initial sm:items-center sm:rounded-full sm:py-1.5">
              <LocateFixed className="mt-0.5 h-3.5 w-3.5 shrink-0 text-espresso-500 sm:mt-0" />
              <span className="min-w-0 flex-1 text-xs leading-snug text-espresso-700 sm:max-w-[200px] sm:truncate">
                {status}
              </span>
            </div>
            {weather && (
              <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-espresso-50 px-3 py-2 text-xs text-espresso-700 sm:rounded-full sm:py-1.5">
                <span className="text-lg leading-none sm:text-base">{weather.conditionEmoji}</span>
                <span className="min-w-0 leading-snug sm:truncate">
                  {weather.tempF}°F · {weather.conditionLabel}
                  {weather.precipProbability > 10 ? ` · ${weather.precipProbability}%` : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Location mode toggle ──────────────────────────────────────── */}
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
          <button
            type="button"
            onClick={() => { if (locationMode === "gps") requestGPS(); else switchMode("gps"); }}
            className={`flex min-h-11 min-w-[5.5rem] items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 active:scale-[0.98] sm:min-h-0 sm:min-w-0 sm:py-1.5 ${
              locationMode === "gps"
                ? "bg-espresso-800 text-crema shadow-sm"
                : "bg-espresso-50 text-espresso-600 hover:bg-espresso-100"
            }`}
          >
            <LocateFixed className="h-3 w-3" />
            GPS
          </button>
          <button
            type="button"
            onClick={() => switchMode("search")}
            className={`flex min-h-11 min-w-[5.5rem] items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 active:scale-[0.98] sm:min-h-0 sm:min-w-0 sm:py-1.5 ${
              locationMode === "search"
                ? "bg-espresso-800 text-crema shadow-sm"
                : "bg-espresso-50 text-espresso-600 hover:bg-espresso-100"
            }`}
          >
            <MapPin className="h-3 w-3" />
            Search place
          </button>
        </div>

        {locationMode === "search" && (
          <LocationSearchRow
            key="place-search-panel"
            onLocationResolved={applySearchPlace}
            onError={(msg) => setStatus(msg)}
          />
        )}

        {/* ── Radius slider (native range = source of truth; fill + ticks share same 0–100% scale) ─ */}
        <div className="mt-4 w-full min-w-0 rounded-2xl bg-espresso-50 px-3 py-3.5 sm:px-4 sm:py-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-espresso-700 sm:text-sm">Search radius</span>
            <span className="rounded-full bg-espresso-900 px-2.5 py-0.5 text-xs font-semibold text-crema tabular-nums">
              {radiusLabel}
            </span>
          </div>
          <div ref={sliderTrackRef} className="relative w-full min-w-0">
            <div
              className="pointer-events-none absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#e8d5bf]"
              aria-hidden
            />
            <div
              className={`pointer-events-none absolute left-0 top-1/2 h-2 max-w-full -translate-y-1/2 bg-[#452815] ${
                radius >= RADIUS_MAX ? "rounded-full" : "rounded-l-full"
              }`}
              style={{
                width: `${fillEndPct}%`,
                opacity: radius <= 0 ? 0 : 1
              }}
              aria-hidden
            />
            <input
              type="range"
              min={RADIUS_MIN}
              max={RADIUS_MAX}
              step={RADIUS_STEP}
              value={radius}
              onChange={(e) => applyRadius(Number(e.target.value))}
              className="radius-slider relative z-10"
              aria-valuemin={RADIUS_MIN}
              aria-valuemax={RADIUS_MAX}
              aria-valuenow={radius}
              aria-valuetext={radius === 0 ? "Off" : `${radius} miles`}
              aria-label="Search radius in miles (steps of 5)"
            />
          </div>
          <div className="relative mt-3 h-5 w-full min-w-0 text-[10px] font-medium tabular-nums text-espresso-500 sm:h-6 sm:text-xs">
            {RADIUS_TICKS.map((t) => (
              <span
                key={t}
                className="absolute top-0 -translate-x-1/2 whitespace-nowrap"
                style={{ left: `${thumbCenterPct(t)}%` }}
              >
                {t === 0 ? "0" : `${t} mi`}
              </span>
            ))}
          </div>
          <p className="mt-1 text-center text-[9px] text-espresso-400 sm:text-[10px]">
            5-mile steps · same scale everywhere (not country-specific)
          </p>
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
            Choose a search radius in 5-mile steps to explore coffee shops around you.
          </p>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {radius > 0 && (
        <>
          <div className="grid w-full min-w-0 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            {/* List — full width on mobile (hidden when map tab active), left col on desktop */}
            <div
              className={`w-full min-w-0 ${mobileView === "map" ? "hidden lg:block" : "block"}`}
            >
              <div className="space-y-3 pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
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
            </div>

            {/* Map — full viewport height on mobile (hidden when list tab active), right col on desktop */}
            <div className={`${mobileView === "list" ? "hidden lg:block" : "block"} animate-fade-in`}>
              <MapPanel
                shops={shops}
                mapHeight="min-h-[52svh] h-[min(70svh,32rem)] lg:min-h-[420px] lg:h-[420px]"
              />
            </div>
          </div>

          {/* Mobile: thumb-friendly List / Map bar fixed above home indicator */}
          <div
            className="fixed inset-x-0 bottom-0 z-30 border-t border-espresso-100/90 bg-canvas/95 px-3 pt-2 shadow-[0_-6px_28px_rgba(38,25,14,0.1)] backdrop-blur-md supports-[backdrop-filter]:bg-canvas/85 lg:hidden"
            style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="mx-auto flex max-w-7xl gap-1.5 rounded-2xl bg-espresso-50/95 p-1.5">
              <button
                type="button"
                onClick={() => setMobileView("list")}
                className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.99] ${
                  mobileView === "list"
                    ? "bg-white text-espresso-900 shadow-sm"
                    : "text-espresso-500 hover:text-espresso-700"
                }`}
              >
                <LayoutList className="h-4 w-4 shrink-0" />
                List
                {shops.length > 0 && (
                  <span className="rounded-full bg-espresso-100 px-1.5 py-0.5 text-[10px] font-bold text-espresso-600 tabular-nums">
                    {shops.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setMobileView("map")}
                className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.99] ${
                  mobileView === "map"
                    ? "bg-white text-espresso-900 shadow-sm"
                    : "text-espresso-500 hover:text-espresso-700"
                }`}
              >
                <Map className="h-4 w-4 shrink-0" />
                Map
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
