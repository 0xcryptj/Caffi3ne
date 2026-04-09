"use client";

import { useEffect, useRef } from "react";
import { googleAdSenseClientId } from "@/lib/adsense-config";

const slot = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT?.trim();

/**
 * Responsive display ad. Create an "Display" ad unit in AdSense and set
 * NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT to the slot id. If unset, renders nothing
 * (loader script in layout still supports Auto ads when enabled in AdSense).
 */
export function AdSenseDisplay() {
  const didPush = useRef(false);

  useEffect(() => {
    if (!slot || didPush.current) return;
    didPush.current = true;
    try {
      const w = window as Window & { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle ?? [];
      w.adsbygoogle.push({});
    } catch {
      didPush.current = false;
    }
  }, []);

  if (!slot) return null;

  return (
    <div className="flex min-h-[100px] w-full justify-center overflow-hidden py-4">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={googleAdSenseClientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
