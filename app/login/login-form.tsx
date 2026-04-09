"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchGoogleOAuthEnabled } from "@/lib/auth-provider-settings";
import { formatAuthError } from "@/lib/format-auth-error";
import { buildAuthCallbackUrl } from "@/lib/get-auth-callback-url";
import { startGoogleOAuth } from "@/lib/start-google-oauth";
import { createClient } from "@/utils/supabase/client";

type Props = {
  nextPath: string;
  initialError: string | null;
};

export function LoginForm({ nextPath, initialError }: Props) {
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

  useEffect(() => {
    void fetchGoogleOAuthEnabled().then(setGoogleAvailable);
  }, []);

  const handlePasswordLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const trimmed = email.trim();
      if (!trimmed || !password) {
        setError("Enter email and password.");
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
      const msg = await startGoogleOAuth(supabase, nextPath);
      if (msg) setError(msg);
    } catch (e) {
      setError(e instanceof Error ? formatAuthError({ message: e.message }) : "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  }, [supabase, nextPath]);

  const handleMagicLink = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const trimmed = email.trim();
      if (!trimmed) {
        setError("Enter your email address.");
        return;
      }
      setMagicLoading(true);
      setMagicSent(false);
      try {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: trimmed,
          options: {
            emailRedirectTo: buildAuthCallbackUrl(nextPath),
            shouldCreateUser: true
          }
        });
        if (otpError) {
          setError(formatAuthError(otpError));
        } else {
          setMagicSent(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not send magic link");
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
        <p className="text-sm text-espresso-600">
          {googleAvailable === false
            ? "Email and password, or a magic link."
            : "Email and password, Google, or a magic link."}
        </p>
      </div>

      {(error || initialError) && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error ?? initialError}
        </div>
      )}

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
              Logging in…
            </span>
          ) : (
            "Log in with password"
          )}
        </button>
      </form>

      {googleAvailable !== false && (
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <span className="w-full border-t border-espresso-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-espresso-400">
            <span className="bg-crema/90 px-3">or</span>
          </div>
        </div>
      )}

      {googleAvailable === false ? (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-left text-xs leading-relaxed text-espresso-800">
          <p className="font-semibold text-espresso-900">Google sign-in is off in Supabase</p>
          <p className="mt-1 text-espresso-700">
            Dashboard → Authentication → Providers → Google → enable and save Client ID + Secret.
            In Google Cloud, redirect URI must be{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 text-[10px]">
              https://&lt;ref&gt;.supabase.co/auth/v1/callback
            </code>
            . Or add{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 text-[10px]">SUPABASE_ACCESS_TOKEN</code>,{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 text-[10px]">GOOGLE_OAUTH_CLIENT_*</code> to{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 text-[10px]">.env.local</code> and run{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 text-[10px]">npm run enable-google-auth</code>.
          </p>
        </div>
      ) : (
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

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-espresso-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-espresso-400">
          <span className="bg-crema/90 px-3">or</span>
        </div>
      </div>

      <form onSubmit={handleMagicLink} className="space-y-4">
        <p className="text-center text-xs text-espresso-500">Magic link (passwordless)</p>
        <button
          type="submit"
          disabled={busy || !email.trim()}
          className="w-full rounded-xl border border-espresso-200 bg-white px-4 py-3 text-sm font-semibold text-espresso-800 transition hover:border-espresso-300 disabled:cursor-not-allowed disabled:opacity-60"
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

      {magicSent && (
        <p className="rounded-lg border border-sage/40 bg-sage/10 px-3 py-2 text-center text-sm text-espresso-800">
          Check your email for a login link.
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
