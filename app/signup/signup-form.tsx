"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setAuthReturnPathClient } from "@/lib/auth-return-path";
import { safeInternalPath } from "@/lib/auth-routes";
import { fetchGoogleOAuthEnabled } from "@/lib/auth-provider-settings";
import { formatAuthError } from "@/lib/format-auth-error";
import { buildAuthCallbackUrl } from "@/lib/get-auth-callback-url";
import { startGoogleOAuth } from "@/lib/start-google-oauth";
import { createClient } from "@/utils/supabase/client";

type Props = {
  nextPath: string;
};

export function SignupForm({ nextPath }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);

  const busy = loading || googleLoading;

  useEffect(() => {
    void fetchGoogleOAuthEnabled().then(setGoogleAvailable);
  }, []);

  const handleGoogle = useCallback(async () => {
    setError(null);
    setInfo(null);
    setGoogleLoading(true);
    try {
      const msg = await startGoogleOAuth(
        supabase,
        safeInternalPath(nextPath, "/nearby"),
        "/nearby"
      );
      if (msg) setError(msg);
    } catch (e) {
      setError(e instanceof Error ? formatAuthError({ message: e.message }) : "Google sign-up failed");
    } finally {
      setGoogleLoading(false);
    }
  }, [supabase, nextPath]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || password.length < 8) {
      setError("Use a valid email and a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const continueAfter = safeInternalPath(nextPath, "/nearby");
      setAuthReturnPathClient(continueAfter, "/nearby");
      const redirect = buildAuthCallbackUrl();
      const { data, error: signError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: redirect,
          data: {
            full_name: displayName.trim() || undefined
          }
        }
      });
      if (signError) {
        setError(formatAuthError(signError));
        return;
      }
      if (data.session) {
        router.replace(
          `/onboarding?next=${encodeURIComponent(continueAfter)}` as Parameters<
            typeof router.replace
          >[0]
        );
        router.refresh();
        return;
      }
      setInfo(
        "Check your email to confirm your account. After confirming, log in and finish onboarding."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-espresso-100 bg-crema/80 p-8 shadow-panel backdrop-blur">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-2xl text-espresso-900">Create account</h1>
        <p className="text-sm text-espresso-600">
          {googleAvailable === false
            ? "Sign up with your email and a password."
            : "Continue with Google or sign up with email and a password."}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-lg border border-sage/40 bg-sage/10 px-3 py-2 text-sm text-espresso-800">
          {info}
        </div>
      )}

      {googleAvailable !== false && (
        <button
          type="button"
          onClick={() => void handleGoogle()}
          disabled={busy || googleAvailable === null}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-espresso-200 bg-white px-4 py-3 text-sm font-semibold text-espresso-800 shadow-sm transition hover:border-espresso-300 hover:bg-crema disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading || googleAvailable === null ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-espresso-200 border-t-espresso-600" />
          ) : null}
          Continue with Google
        </button>
      )}

      {googleAvailable === false && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-left text-xs leading-relaxed text-espresso-800">
          <p className="font-semibold text-espresso-900">Google sign-in is off</p>
          <p className="mt-1 text-espresso-700">
            Supabase → Authentication → Providers → Google → enable and save Client ID + Secret.
          </p>
        </div>
      )}

      {googleAvailable !== false && (
        <div className="relative py-0.5">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <span className="w-full border-t border-espresso-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-espresso-400">
            <span className="bg-crema/90 px-3">or</span>
          </div>
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <label className="block text-sm font-medium text-espresso-700">
          Display name <span className="font-normal text-espresso-400">(optional)</span>
          <input
            type="text"
            name="displayName"
            autoComplete="name"
            value={displayName}
            onChange={(ev) => setDisplayName(ev.target.value)}
            placeholder="Alex"
            className="mt-1.5 w-full rounded-xl border border-espresso-200 bg-white px-3 py-2.5 text-espresso-900 outline-none ring-espresso-300 placeholder:text-espresso-400 focus:ring-2"
            disabled={busy}
          />
        </label>
        <label className="block text-sm font-medium text-espresso-700">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-xl border border-espresso-200 bg-white px-3 py-2.5 text-espresso-900 outline-none ring-espresso-300 placeholder:text-espresso-400 focus:ring-2"
            disabled={busy}
            required
          />
        </label>
        <label className="block text-sm font-medium text-espresso-700">
          Password
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            placeholder="At least 8 characters"
            className="mt-1.5 w-full rounded-xl border border-espresso-200 bg-white px-3 py-2.5 text-espresso-900 outline-none ring-espresso-300 placeholder:text-espresso-400 focus:ring-2"
            disabled={busy}
            required
            minLength={8}
          />
        </label>
        <label className="block text-sm font-medium text-espresso-700">
          Confirm password
          <input
            type="password"
            name="confirm"
            autoComplete="new-password"
            value={confirm}
            onChange={(ev) => setConfirm(ev.target.value)}
            placeholder="Repeat password"
            className="mt-1.5 w-full rounded-xl border border-espresso-200 bg-white px-3 py-2.5 text-espresso-900 outline-none ring-espresso-300 placeholder:text-espresso-400 focus:ring-2"
            disabled={busy}
            required
            minLength={8}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-espresso-700 px-4 py-3 text-sm font-semibold text-crema transition hover:bg-espresso-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-crema/40 border-t-crema" />
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-espresso-600">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className="font-semibold text-espresso-800 underline-offset-2 hover:underline"
        >
          Login
        </Link>
      </p>

      <p className="text-center text-xs text-espresso-500">
        <Link href="/" className="underline-offset-2 hover:text-espresso-700 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
