"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeInternalPath } from "@/lib/auth-routes";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthProvider";

const RADIUS_OPTIONS = [5, 10, 15, 20, 25] as const;

export function OnboardingForm() {
  const { user, profile, refreshProfile } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [homeCity, setHomeCity] = useState(profile?.home_city ?? "");
  const [radius, setRadius] = useState<number | "">(
    profile?.preferred_radius ?? 10
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    const dn = displayName.trim();
    const un = username.trim().toLowerCase();
    if (!dn || !un) {
      setError("Display name and username are required.");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(un)) {
      setError("Username: 3–20 characters, lowercase letters, numbers, or underscores.");
      return;
    }
    setLoading(true);
    try {
      const { error: upError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email ?? null,
          display_name: dn,
          username: un,
          home_city: homeCity.trim() || null,
          preferred_radius: radius === "" ? null : Number(radius),
          onboarding_completed: true,
          role: "user"
        },
        { onConflict: "id" }
      );

      if (upError) {
        if (upError.code === "23505" || upError.message.includes("unique")) {
          setError("That username is already taken. Try another.");
        } else {
          setError(upError.message);
        }
        return;
      }
      await refreshProfile();
      const dest = safeInternalPath(searchParams.get("next"), "/nearby");
      router.replace(dest as Parameters<typeof router.replace>[0]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 rounded-2xl border border-espresso-100 bg-crema/80 p-8 shadow-panel backdrop-blur">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-2xl text-espresso-900">Welcome to Caffi3ne</h1>
        <p className="text-sm text-espresso-600">
          Tell us a bit about you. You can change this later from your account settings.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <label className="block text-sm font-medium text-espresso-700">
          Display name
          <input
            type="text"
            value={displayName}
            onChange={(ev) => setDisplayName(ev.target.value)}
            placeholder="How we greet you"
            className="mt-1.5 w-full rounded-xl border border-espresso-200 bg-white px-3 py-2.5 text-espresso-900 outline-none ring-espresso-300 focus:ring-2"
            disabled={loading}
            required
            autoComplete="name"
          />
        </label>
        <label className="block text-sm font-medium text-espresso-700">
          Username
          <input
            type="text"
            value={username}
            onChange={(ev) => setUsername(ev.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="coffee_explorer"
            className="mt-1.5 w-full rounded-xl border border-espresso-200 bg-white px-3 py-2.5 font-mono text-sm text-espresso-900 outline-none ring-espresso-300 focus:ring-2"
            disabled={loading}
            required
            minLength={3}
            maxLength={20}
            autoComplete="username"
          />
          <span className="mt-1 block text-xs text-espresso-500">Lowercase, numbers, underscores only.</span>
        </label>
        <label className="block text-sm font-medium text-espresso-700">
          Home city <span className="font-normal text-espresso-400">(optional)</span>
          <input
            type="text"
            value={homeCity}
            onChange={(ev) => setHomeCity(ev.target.value)}
            placeholder="Charleston, SC"
            className="mt-1.5 w-full rounded-xl border border-espresso-200 bg-white px-3 py-2.5 text-espresso-900 outline-none ring-espresso-300 focus:ring-2"
            disabled={loading}
          />
        </label>
        <label className="block text-sm font-medium text-espresso-700">
          Preferred search radius (miles)
          <select
            value={radius === "" ? "" : String(radius)}
            onChange={(ev) => {
              const v = ev.target.value;
              setRadius(v === "" ? "" : Number(v));
            }}
            className="mt-1.5 w-full rounded-xl border border-espresso-200 bg-white px-3 py-2.5 text-espresso-900 outline-none ring-espresso-300 focus:ring-2"
            disabled={loading}
          >
            {RADIUS_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} mi
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-espresso-700 px-4 py-3 text-sm font-semibold text-crema transition hover:bg-espresso-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-crema/40 border-t-crema" />
              Saving…
            </span>
          ) : (
            "Finish setup"
          )}
        </button>
      </form>
    </div>
  );
}
