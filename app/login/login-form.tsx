"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { buildAuthCallbackUrl } from "@/lib/get-auth-callback-url";
import { createClient } from "@/utils/supabase/client";

type Props = {
  nextPath: string;
  initialError: string | null;
};

export function LoginForm({ nextPath, initialError }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const handleGoogle = useCallback(async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: buildAuthCallbackUrl(nextPath),
          scopes: "openid email profile",
          queryParams: {
            access_type: "offline",
            prompt: "select_account"
          }
        }
      });
      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed");
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
          setError(otpError.message);
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

  const busy = googleLoading || magicLoading;

  return (
    <div className="mx-auto w-full max-w-md space-y-8 rounded-2xl border border-espresso-100 bg-crema/80 p-8 shadow-panel backdrop-blur">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-2xl text-espresso-900">Sign in</h1>
        <p className="text-sm text-espresso-600">Use Google or a magic link sent to your email.</p>
      </div>

      {(error || initialError) && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error ?? initialError}
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleGoogle()}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-espresso-200 bg-white px-4 py-3 text-sm font-semibold text-espresso-800 shadow-sm transition hover:border-espresso-300 hover:bg-crema disabled:cursor-not-allowed disabled:opacity-60"
      >
        {googleLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-espresso-200 border-t-espresso-600" />
        ) : null}
        Continue with Google
      </button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-espresso-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-espresso-400">
          <span className="bg-crema/90 px-3">or</span>
        </div>
      </div>

      <form onSubmit={handleMagicLink} className="space-y-4">
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
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-espresso-700 px-4 py-3 text-sm font-semibold text-crema transition hover:bg-espresso-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {magicLoading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-crema/40 border-t-crema" />
              Sending…
            </span>
          ) : (
            "Send magic link"
          )}
        </button>
      </form>

      {magicSent && (
        <p className="rounded-lg border border-sage/40 bg-sage/10 px-3 py-2 text-center text-sm text-espresso-800">
          Check your email for a sign-in link.
        </p>
      )}

      <p className="text-center text-xs text-espresso-500">
        <Link href="/" className="underline-offset-2 hover:text-espresso-700 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
