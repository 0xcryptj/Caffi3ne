"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

type Prediction = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

function clientLanguageTag(): string {
  if (typeof navigator === "undefined") return "en";
  return navigator.language || "en";
}

export type LocationResolvedPayload = {
  lat: number;
  lng: number;
  formattedAddress: string;
  query: string;
};

type Props = {
  onLocationResolved: (p: LocationResolvedPayload) => void | Promise<void>;
  onError?: (message: string) => void;
  onBusyChange?: (busy: boolean) => void;
};

/**
 * Google Places Autocomplete (geocode types) + manual search. Worldwide; uses browser language for suggestions.
 */
export function LocationSearchRow({ onLocationResolved, onError, onBusyChange }: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Prediction[]>([]);
  const [busy, setBusy] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useRef(`loc-ac-${Math.random().toString(36).slice(2, 9)}`).current;
  const lang = clientLanguageTag();

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const fetchPredictions = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (t.length < 2) {
        setItems([]);
        return;
      }
      setListLoading(true);
      try {
        const res = await fetch(
          `/api/places/autocomplete?q=${encodeURIComponent(t)}&lang=${encodeURIComponent(lang)}`
        );
        if (!res.ok) {
          setItems([]);
          return;
        }
        const data = (await res.json()) as { predictions?: Prediction[] };
        setItems(data.predictions ?? []);
        setActiveIdx(-1);
        setOpen((data.predictions?.length ?? 0) > 0);
      } catch {
        setItems([]);
      } finally {
        setListLoading(false);
      }
    },
    [lang]
  );

  const resolveGeocode = useCallback(
    async (params: { placeId?: string; address?: string; query: string }) => {
      setBusy(true);
      try {
        const sp = new URLSearchParams();
        sp.set("lang", lang);
        if (params.placeId) sp.set("placeId", params.placeId);
        else sp.set("address", params.address ?? "");
        const res = await fetch(`/api/geocode?${sp.toString()}`);
        if (!res.ok) throw new Error("not found");
        const data = (await res.json()) as { lat: number; lng: number; formattedAddress: string };
        setOpen(false);
        setItems([]);
        setActiveIdx(-1);
        await onLocationResolved({
          lat: data.lat,
          lng: data.lng,
          formattedAddress: data.formattedAddress,
          query: params.query
        });
      } catch {
        onError?.("Place not found — try another search");
      } finally {
        setBusy(false);
      }
    },
    [lang, onError, onLocationResolved]
  );

  const selectPrediction = (p: Prediction) => {
    setQ(p.description);
    void resolveGeocode({ placeId: p.placeId, query: p.description });
  };

  const manualSearch = () => {
    const text = q.trim();
    if (!text) return;
    void resolveGeocode({ address: text, query: text });
  };

  const onInputChange = (v: string) => {
    setQ(v);
    setActiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim().length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => void fetchPredictions(v), 280);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
      return;
    }
    if (!open || items.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        manualSearch();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % items.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? items.length - 1 : i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0) {
        const pick = items[activeIdx];
        if (pick) selectPrediction(pick);
      } else {
        manualSearch();
      }
    }
  };

  return (
    <div className="mt-3 flex animate-slide-up flex-col gap-2 sm:flex-row sm:gap-2">
      <div ref={wrapRef} className="relative min-w-0 flex-1">
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          placeholder="City, postal code, or address — worldwide"
          value={q}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (items.length > 0) setOpen(true);
          }}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-busy={listLoading || busy}
          disabled={busy}
          className="min-h-11 min-w-0 w-full rounded-xl border border-espresso-200 bg-white px-4 py-2.5 text-base text-espresso-900 outline-none placeholder:text-espresso-300 focus:border-espresso-400 focus:ring-1 focus:ring-espresso-400/50 sm:min-h-0 sm:text-sm"
        />
        {open && (items.length > 0 || listLoading) && (
          <ul
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-40 mt-1 max-h-60 overflow-auto rounded-xl border border-espresso-200 bg-white py-1 shadow-lg"
          >
            {listLoading && items.length === 0 ? (
              <li className="px-3 py-2 text-xs text-espresso-500">Searching…</li>
            ) : null}
            {items.map((p, idx) => (
              <li key={p.placeId} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={idx === activeIdx}
                  className={`flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left text-sm transition hover:bg-espresso-50 ${
                    idx === activeIdx ? "bg-espresso-50" : ""
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectPrediction(p)}
                >
                  <span className="font-medium text-espresso-900">{p.mainText}</span>
                  {p.secondaryText ? (
                    <span className="text-xs text-espresso-500">{p.secondaryText}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        onClick={manualSearch}
        disabled={busy || !q.trim()}
        className="flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-espresso-800 px-4 py-2.5 text-sm font-semibold text-crema transition hover:bg-espresso-900 active:scale-[0.99] disabled:opacity-50 sm:min-h-0"
      >
        {busy ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-crema/30 border-t-crema" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        Search
      </button>
    </div>
  );
}
