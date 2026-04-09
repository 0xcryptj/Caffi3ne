"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setAuthReturnPathClient } from "@/lib/auth-return-path";
import { fetchGoogleOAuthEnabled } from "@/lib/auth-provider-settings";
import { formatAuthError } from "@/lib/format-auth-error";
import { buildAuthCallbackUrl } from "@/lib/get-auth-callback-url";
import { startGoogleOAuth } from "@/lib/start-google-oauth";
import { createClient } from "@/utils/supabase/client";

type Props = {
  nextPath: string;
  initialError: string | null;
  /** When true, show exact callback URL for Supabase dashboard (after any auth error redirect). */
  showRedirectHint?: boolean;
};

export function LoginForm({ nextPath, initialError, showRedirectHint = false }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);
  const [origin, setOrigin] = useState<string | null>(null);

  useEffect(() => {
    void fetchGoogleOAuthEnabled().then(setGoogleAvailable);
  }, []);

  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : null);
  }, []);

  const handlePasswordLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const trimmed = email.trim();
      if (!trimmed || !password) {
        setError("Enter your email and password.");
        return;
      }
      setPasswordLoading(true);
      try {
        const { error: signError } = await supabase.auth.signInWithPassword({
          email: trimmed,
          password
        });
        if (signError) {
          setError(formatAuthError(signError));
          return;
        }
        router.replace(nextPath as Parameters<typeof router.replace>[0]);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
      } finally {
        setPasswordLoading(false);
      }
    },
    [email, password, nextPath, router, supabase]
  );

  const handleGoogle = useCallback(async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const outcome = await startGoogleOAuth(supabase, nextPath);
      if (outcome === "cancelled") return;
      if (typeof outcome === "object") {
        setError(outcome.error);
        return;
      }
      router.replace(nextPath as Parameters<typeof router.replace>[0]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? formatAuthError({ message: e.message }) : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  }, [supabase, nextPath, router]);

  const handleMagicLink = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const trimmed = email.trim();
      if (!trimmed) {
        setError("Enter your email for the magic link.");
        return;
      }
      setMagicLoading(true);
      setMagicSent(false);
      try {
        setAuthReturnPathClient(nextPath, "/dashboard");
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: trimmed,
          options: {
            emailRedirectTo: buildAuthCallbackUrl(),
            shouldCreateUser: true
          }
        });
        if (otpError) {
          setError(formatAuthError(otpError));
        } else {
          setMagicSent(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not send the link");
      } finally {
        setMagicLoading(false);
      }
    },
    [email, supabase, nextPath]
  );

  const busy = googleLoading || magicLoading || passwordLoading;

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-espresso-100 bg-crema/80 p-8 shadow-panel backdrop-blur">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-2xl text-espresso-900">Log in</h1>
        <p className="text-sm text-espresso-600">Continue with Google or your email and password.</p>
      </div>

      {error && (
        <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          <p>{error}</p>
          {showRedirectHint && origin && (
            <p className="border-t border-red-200/80 pt-2 text-xs leading-relaxed text-red-900/90">
              In Supabase → Authentication → URL configuration → Redirect URLs, include exactly:
              <code className="mt-1 block break-all rounded bg-white/90 px-2 py-1.5 font-mono text-[11px] text-espresso-900">
                {origin}/auth/callback
              </code>
              In Google Cloud, the OAuth client’s redirect must be only your Supabase project callback (
              <code className="break-all font-mono text-[10px]">https://&lt;ref&gt;.supabase.co/auth/v1/callback</code>
              ).
            </p>
          )}
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

      <div className="relative py-0.5">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-espresso-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-espresso-400">
          <span className="bg-crema/90 px-3">or</span>
        </div>
      </div>

      <form onSubmit={handlePasswordLogin} className="space-y-4">
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
          />
        </label>
        <label className="block text-sm font-medium text-espresso-700">
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            placeholder="••••••••"
            className="mt-1.5 w-full rounded-xl border border-espresso-200 bg-white px-3 py-2.5 text-espresso-900 outline-none ring-espresso-300 placeholder:text-espresso-400 focus:ring-2"
            disabled={busy}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-espresso-700 px-4 py-3 text-sm font-semibold text-crema transition hover:bg-espresso-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {passwordLoading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-crema/40 border-t-crema" />
              Signing in…
            </span>
          ) : (
            "Log in"
          )}
        </button>
      </form>

      <details className="group rounded-xl border border-espresso-100 bg-white/50 px-4 py-2 text-sm text-espresso-700">
        <summary className="cursor-pointer select-none font-medium text-espresso-800 outline-none marker:text-espresso-500">
          Prefer a magic link?
        </summary>
        <p className="mt-2 text-xs text-espresso-600">
          We’ll email you a one-time link. Use the same email field above.
        </p>
        <form onSubmit={handleMagicLink} className="mt-3 space-y-2">
          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="w-full rounded-xl border border-espresso-200 bg-white px-4 py-2.5 text-sm font-semibold text-espresso-800 transition hover:border-espresso-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {magicLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-espresso-200 border-t-espresso-600" />
                Sending…
              </span>
            ) : (
              "Email me a login link"
            )}
          </button>
        </form>
      </details>

      {magicSent && (
        <p className="rounded-lg border border-sage/40 bg-sage/10 px-3 py-2 text-center text-sm text-espresso-800">
          Check your email for the link.
        </p>
      )}

      <p className="text-center text-sm text-espresso-600">
        New here?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(nextPath)}`}
          className="font-semibold text-espresso-800 underline-offset-2 hover:underline"
        >
          Create an account
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
