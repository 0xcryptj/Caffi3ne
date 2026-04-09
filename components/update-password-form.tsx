"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { formatAuthError } from "@/lib/format-auth-error";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

export function UpdatePasswordForm() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setChecking(false);
      if (!session) {
        const q = new URLSearchParams();
        q.set("error", "recovery");
        q.set("hint", "Session expired. Request a new reset link.");
        router.replace(`/login?${q.toString()}` as Parameters<typeof router.replace>[0]);
      }
    });
  }, [router, supabase]);

  const inputBase =
    "w-full rounded-lg border border-espresso-200/80 bg-crema py-2.5 text-sm text-espresso-900 outline-none transition placeholder:text-espresso-400 focus:border-espresso-400 focus:ring-1 focus:ring-espresso-500/20";
  const inputPassword = `${inputBase} pl-10 pr-10`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error: upError } = await supabase.auth.updateUser({ password });
      if (upError) {
        setError(formatAuthError(upError));
        return;
      }
      await supabase.auth.signOut();
      router.replace("/login?message=password_updated");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex justify-center py-12">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-espresso-200 border-t-espresso-600"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="rounded-2xl border border-espresso-200/80 bg-crema p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-xl font-semibold text-espresso-900">Set a new password</h1>
        <p className="mt-1 text-sm text-espresso-600">Choose a strong password you have not used here before.</p>

        {error && (
          <div
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-espresso-900">New password</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-espresso-400 [&_svg]:h-[18px] [&_svg]:w-[18px]">
                <Lock aria-hidden />
              </span>
              <input
                type={showPw ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                placeholder="At least 8 characters"
                className={inputPassword}
                disabled={loading}
                required
                minLength={8}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-espresso-400 hover:bg-espresso-100 hover:text-espresso-700"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-espresso-900">Confirm password</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-espresso-400 [&_svg]:h-[18px] [&_svg]:w-[18px]">
                <Lock aria-hidden />
              </span>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm"
                autoComplete="new-password"
                value={confirm}
                onChange={(ev) => setConfirm(ev.target.value)}
                placeholder="Confirm your password"
                className={inputPassword}
                disabled={loading}
                required
                minLength={8}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-espresso-400 hover:bg-espresso-100 hover:text-espresso-700"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full rounded-lg bg-espresso-600 py-3 text-sm font-semibold text-crema shadow-sm transition",
              "hover:bg-espresso-700 disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {loading ? "Saving…" : "Update password"}
          </button>
        </form>
      </div>
      <p className="mt-8 text-center">
        <Link
          href="/login"
          className="text-sm font-semibold text-espresso-800 underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
