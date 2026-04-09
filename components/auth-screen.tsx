"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { setAuthReturnPathClient } from "@/lib/auth-return-path";
import { safeInternalPath } from "@/lib/auth-routes";
import { fetchGoogleOAuthEnabled } from "@/lib/auth-provider-settings";
import { formatAuthError } from "@/lib/format-auth-error";
import { buildAuthCallbackUrl } from "@/lib/get-auth-callback-url";
import { startGoogleOAuth } from "@/lib/start-google-oauth";
import { createClient } from "@/utils/supabase/client";
import { GoogleGLogo } from "@/components/google-g-logo";
import { cn } from "@/lib/utils";

type Tab = "signin" | "signup";

type Props = {
  nextPath: string;
  initialTab: Tab;
  initialError: string | null;
  showRedirectHint?: boolean;
};

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 [&_svg]:h-[18px] [&_svg]:w-[18px]">
      {children}
    </span>
  );
}

export function AuthScreen({ nextPath, initialTab, initialError, showRedirectHint = false }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwIn, setShowPwIn] = useState(false);
  const [showPwUp, setShowPwUp] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const [error, setError] = useState<string | null>(initialError);
  const [info, setInfo] = useState<string | null>(null);
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

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const syncUrl = useCallback(
    (t: Tab) => {
      const q = new URLSearchParams();
      q.set("next", nextPath);
      if (t === "signup") q.set("mode", "signup");
      router.replace(`/login?${q.toString()}` as Parameters<typeof router.replace>[0]);
    },
    [nextPath, router]
  );

  const handleTab = (t: Tab) => {
    setTab(t);
    setError(null);
    setInfo(null);
    syncUrl(t);
  };

  const handleGoogle = useCallback(async () => {
    setError(null);
    setInfo(null);
    setGoogleLoading(true);
    try {
      if (tab === "signin") {
        const outcome = await startGoogleOAuth(supabase, nextPath);
        if (outcome === "cancelled") return;
        if (typeof outcome === "object") {
          setError(outcome.error);
          return;
        }
        router.replace(nextPath as Parameters<typeof router.replace>[0]);
        router.refresh();
      } else {
        const continuePath = safeInternalPath(nextPath, "/nearby");
        const outcome = await startGoogleOAuth(supabase, continuePath, "/nearby");
        if (outcome === "cancelled") return;
        if (typeof outcome === "object") {
          setError(outcome.error);
          return;
        }
        router.replace(
          `/onboarding?next=${encodeURIComponent(continuePath)}` as Parameters<typeof router.replace>[0]
        );
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? formatAuthError({ message: e.message }) : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  }, [supabase, nextPath, router, tab]);

  const handleSignIn = async (e: React.FormEvent) => {
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
  };

  const handleSignUp = async (e: React.FormEvent) => {
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
    setSignupLoading(true);
    try {
      const continueAfter = safeInternalPath(nextPath, "/nearby");
      setAuthReturnPathClient(continueAfter, "/nearby");
      const redirect = buildAuthCallbackUrl();
      const { data, error: signError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: redirect
        }
      });
      if (signError) {
        setError(formatAuthError(signError));
        return;
      }
      if (data.session) {
        router.replace(
          `/onboarding?next=${encodeURIComponent(continueAfter)}` as Parameters<typeof router.replace>[0]
        );
        router.refresh();
        return;
      }
      setInfo("Check your email to confirm your account, then sign in to finish onboarding.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
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
      if (otpError) setError(formatAuthError(otpError));
      else setMagicSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the link");
    } finally {
      setMagicLoading(false);
    }
  };

  const busy =
    googleLoading || passwordLoading || signupLoading || magicLoading || googleAvailable === null;
  const googleLabel = tab === "signin" ? "Sign in with Google" : "Sign up with Google";

  const inputBase =
    "w-full rounded-lg border border-zinc-200 bg-white py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-900/10";
  const inputEmail = `${inputBase} pl-10 pr-3`;
  const inputPassword = `${inputBase} pl-10 pr-10`;

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex rounded-lg bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => handleTab("signin")}
            className={cn(
              "flex-1 rounded-md py-2.5 text-sm font-semibold transition",
              tab === "signin"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTab("signup")}
            className={cn(
              "flex-1 rounded-md py-2.5 text-sm font-semibold transition",
              tab === "signup"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div
            className="mb-4 space-y-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            <p>{error}</p>
            {showRedirectHint && origin && (
              <p className="border-t border-red-200/80 pt-2 text-xs leading-relaxed text-red-900/90">
                In Supabase → Authentication → URL configuration → Redirect URLs, include:
                <code className="mt-1 block break-all rounded bg-white/90 px-2 py-1.5 font-mono text-[11px] text-zinc-900">
                  {origin}/auth/callback
                </code>
              </p>
            )}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {info}
          </div>
        )}

        {googleAvailable !== false && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              void handleGoogle();
            }}
            disabled={busy}
            className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600" />
            ) : (
              <GoogleGLogo className="h-5 w-5 shrink-0" />
            )}
            {googleLabel}
          </button>
        )}

        {googleAvailable === false && (
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Google sign-in is off in Supabase. Use email below or enable the Google provider in the
            dashboard.
          </p>
        )}

        {googleAvailable !== false && (
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider text-zinc-400">
              <span className="bg-white px-3">or</span>
            </div>
          </div>
        )}

        {tab === "signin" ? (
          <form onSubmit={(e) => void handleSignIn(e)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-zinc-900">Email</label>
              <div className="relative">
                <FieldIcon>
                  <Mail aria-hidden />
                </FieldIcon>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="Enter your email"
                  className={inputEmail}
                  disabled={busy}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-zinc-900">Password</label>
              <div className="relative">
                <FieldIcon>
                  <Lock aria-hidden />
                </FieldIcon>
                <input
                  type={showPwIn ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  placeholder="Enter your password"
                  className={inputPassword}
                  disabled={busy}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwIn((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  aria-label={showPwIn ? "Hide password" : "Show password"}
                >
                  {showPwIn ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-neutral-950 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={(e) => void handleSignUp(e)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-zinc-900">Email</label>
              <div className="relative">
                <FieldIcon>
                  <Mail aria-hidden />
                </FieldIcon>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="Enter your email"
                  className={inputEmail}
                  disabled={busy}
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-zinc-900">Password</label>
              <div className="relative">
                <FieldIcon>
                  <Lock aria-hidden />
                </FieldIcon>
                <input
                  type={showPwUp ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  placeholder="At least 8 characters"
                  className={inputPassword}
                  disabled={busy}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwUp((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  aria-label={showPwUp ? "Hide password" : "Show password"}
                >
                  {showPwUp ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-zinc-900">Confirm password</label>
              <div className="relative">
                <FieldIcon>
                  <Lock aria-hidden />
                </FieldIcon>
                <input
                  type={showPwConfirm ? "text" : "password"}
                  name="confirm"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(ev) => setConfirm(ev.target.value)}
                  placeholder="Confirm your password"
                  className={inputPassword}
                  disabled={busy}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwConfirm((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  aria-label={showPwConfirm ? "Hide password" : "Show password"}
                >
                  {showPwConfirm ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-neutral-950 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signupLoading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}

        {tab === "signin" && (
          <div className="mt-5 border-t border-zinc-100 pt-4">
            <p className="mb-2 text-center text-xs text-zinc-500">Passwordless sign-in</p>
            <form onSubmit={(e) => void handleMagicLink(e)}>
              <button
                type="submit"
                disabled={busy || !email.trim()}
                className="w-full rounded-lg border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {magicLoading ? "Sending…" : "Email me a login link"}
              </button>
            </form>
            {magicSent && (
              <p className="mt-2 text-center text-xs text-emerald-700">Check your email for the link.</p>
            )}
          </div>
        )}
      </div>

      <p className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm font-semibold text-zinc-900 underline-offset-4 hover:underline"
        >
          Back to Home
        </Link>
      </p>
    </div>
  );
}
