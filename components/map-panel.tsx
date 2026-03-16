"use client";

import { useEffect, useRef, useState } from "react";
import type { ShopWithInsight } from "@/lib/types";

interface MapPanelProps {
  shops: ShopWithInsight[];
}

function scoreToColor(score: number) {
  if (score >= 78) return "#c0392b";
  if (score >= 55) return "#e67e22";
  if (score >= 30) return "#27ae60";
  return "#7f8c8d";
}

const LABEL_STYLE: Record<string, { bg: string; color: string }> = {
  "Below Average":     { bg: "#f1f5f9", color: "#475569" },
  "Average":           { bg: "#f0fdf4", color: "#15803d" },
  "Busier Than Usual": { bg: "#fffbeb", color: "#b45309" },
  "Packed":            { bg: "#fef2f2", color: "#b91c1c" },
};

function buildPopupHtml(shop: ShopWithInsight): string {
  const ls = LABEL_STYLE[shop.insight.label] ?? { bg: "#f5ebe0", color: "#452815" };
  const scoreColor = scoreToColor(shop.insight.score);
  const isClosed = shop.isOpenNow === false;
  const isOpen   = shop.isOpenNow === true;
  const distStr  = shop.distanceMiles !== undefined
    ? `<span style="font-size:11px;color:#8f562d">📍 ${shop.distanceMiles.toFixed(1)} mi</span>`
    : "";
  const openBadge = isClosed
    ? `<span style="color:#dc2626;font-size:11px;font-weight:700;letter-spacing:0.03em">CLOSED</span>`
    : isOpen
    ? `<span style="color:#16a34a;font-size:11px;font-weight:600">Open now</span>`
    : "";

  return `
<div style="font-family:system-ui,-apple-system,sans-serif;padding:14px 16px;max-width:260px;min-width:210px;box-sizing:border-box">
  <div style="font-weight:700;font-size:15px;color:#2b1b0e;line-height:1.3;margin-bottom:3px">${shop.name}</div>
  <div style="font-size:11px;color:#8f562d;margin-bottom:10px;line-height:1.4">${shop.address}</div>
  <div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px">
    <span style="background:${ls.bg};color:${ls.color};border-radius:999px;padding:2px 9px;font-size:11px;font-weight:600">${shop.insight.label}</span>
    <span style="font-size:13px;font-weight:700;color:${scoreColor}">${shop.insight.score}</span><span style="font-size:11px;color:#b47d4d">/100</span>
    ${openBadge}
  </div>
  <div style="display:flex;align-items:center;gap:10px;font-size:12px;color:#704221;margin-bottom:12px">
    ${shop.rating > 0 ? `<span>⭐ ${shop.rating}</span>` : ""}
    ${distStr}
  </div>
  <a href="/shops/${shop.id}"
     style="display:block;text-align:center;background:#2b1b0e;color:#fff8ef;border-radius:999px;padding:8px 16px;font-size:12px;font-weight:600;text-decoration:none">
    View details →
  </a>
</div>`;
}

// Warm coffee-toned map style
const COFFEE_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#ebe3d5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1eb" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#c9b49a" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#6b4a3b" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#ddd6c8" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#93817c" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#b8c89e" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#4e7a3c" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#7a5c44" }] },
  { featureType: "road.arterial", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#d4a96a" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#c49050" }] },
  { featureType: "road.highway", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.local", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#9bbfb8" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4a7a73" }] }
];

export function MapPanel({ shops }: MapPanelProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [heatmapOn, setHeatmapOn] = useState(false);
  const markersRef = useRef<unknown[]>([]);
  const heatmapRef = useRef<{ setMap: (m: unknown) => void } | null>(null);
  const mapInstanceRef = useRef<unknown>(null);

  // Toggle heat map / markers
  useEffect(() => {
    if (status !== "ready") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (!g?.maps) return;

    markersRef.current.forEach((m) => {
      (m as { setVisible: (v: boolean) => void }).setVisible(!heatmapOn);
    });
    if (heatmapRef.current) {
      heatmapRef.current.setMap(heatmapOn ? mapInstanceRef.current : null);
    }
  }, [heatmapOn, status]);

  useEffect(() => {
    if (!mapRef.current || shops.length === 0) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { setStatus("error"); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;

    const initMap = () => {
      if (!mapRef.current) return;
      const g = w.google;
      if (!g?.maps) { setStatus("error"); return; }

      const map = new g.maps.Map(mapRef.current, {
        zoom: 14,
        center: { lat: shops[0].lat, lng: shops[0].lng },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: { position: g.maps.ControlPosition.RIGHT_CENTER },
        styles: COFFEE_MAP_STYLE
      });

      mapInstanceRef.current = map;
      const bounds = new g.maps.LatLngBounds();
      let openWindow: { close: () => void } | null = null;
      const markers: unknown[] = [];

      shops.forEach((shop) => {
        const pos = { lat: shop.lat, lng: shop.lng };
        bounds.extend(pos);

        const isClosed = shop.isOpenNow === false;

        const marker = new g.maps.Marker({
          position: pos,
          map,
          title: shop.name,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: isClosed ? 8 : 11,
            fillColor: isClosed ? "#9ca3af" : scoreToColor(shop.insight.score),
            fillOpacity: isClosed ? 0.5 : 1,
            strokeColor: "#ffffff",
            strokeWeight: 2.5
          }
        });
        markers.push(marker);

        const infoWindow = new g.maps.InfoWindow({
          content: buildPopupHtml(shop),
          maxWidth: 280
        });

        marker.addListener("click", () => {
          if (openWindow) openWindow.close();
          infoWindow.open(map, marker);
          openWindow = infoWindow;
        });
      });

      markersRef.current = markers;

      // Busyness heat map layer (open shops only)
      if (g.maps.visualization?.HeatmapLayer) {
        const heatData = shops
          .filter((s) => s.isOpenNow !== false)
          .map((shop) => ({
            location: new g.maps.LatLng(shop.lat, shop.lng),
            weight: shop.insight.score / 100
          }));
        const heatmap = new g.maps.visualization.HeatmapLayer({
          data: heatData,
          radius: 60,
          opacity: 0.75,
          gradient: [
            "rgba(255,236,216,0)",
            "rgba(255,213,163,0.4)",
            "rgba(230,126,34,0.7)",
            "rgba(192,57,43,1.0)"
          ]
        });
        heatmapRef.current = heatmap;
      }

      map.fitBounds(bounds);
      g.maps.event.addListenerOnce(map, "bounds_changed", () => {
        if (map.getZoom() > 16) map.setZoom(16);
      });

      setStatus("ready");
    };

    if (w.google?.maps) { initMap(); return; }

    const existing = document.getElementById("gmap-script");
    if (existing) { existing.addEventListener("load", initMap); return; }

    const script = document.createElement("script");
    script.id = "gmap-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization`;
    script.async = true;
    script.onload = initMap;
    script.onerror = () => setStatus("error");
    document.head.appendChild(script);
  }, [shops]);

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-espresso-100 bg-[#efe5d5] p-4 shadow-panel sm:p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Map View</p>
          <div className="flex items-center gap-2 sm:gap-3">
            {status === "ready" && (
              <button
                onClick={() => setHeatmapOn((v) => !v)}
                className="rounded-full border border-espresso-200 bg-white px-3 py-1.5 text-xs font-medium text-espresso-700 shadow-sm transition hover:bg-espresso-50"
              >
                {heatmapOn ? "Show Pins" : "Heat Map"}
              </button>
            )}
            {!heatmapOn && (
              <div className="hidden gap-3 text-xs text-espresso-600 sm:flex">
                <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#27ae60]" />Quiet</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#e67e22]" />Busy</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#c0392b]" />Packed</span>
              </div>
            )}
          </div>
        </div>
        <h3 className="mt-1 font-display text-xl text-espresso-900 sm:text-2xl">Coffee density snapshot</h3>
      </div>

      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/60 h-64 sm:h-80 lg:h-[420px]">
        <div ref={mapRef} className="h-full w-full" />
        {status === "loading" && (
          <div className="absolute inset-0 grid place-items-center bg-[#e8dcc8]">
            <p className="animate-pulse text-sm text-espresso-500">Loading map…</p>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 grid place-items-center bg-[#e8dcc8]">
            <p className="max-w-xs text-center text-sm text-espresso-500">
              Map unavailable — enable <strong>Maps JavaScript API</strong> in Google Cloud Console
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
