"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";

export function AuthNav() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div
        className="h-5 w-5 animate-spin rounded-full border-2 border-espresso-200 border-t-espresso-600"
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-espresso-200 bg-white px-4 py-2 text-sm font-semibold text-espresso-800 transition hover:border-espresso-300"
      >
        Sign in
      </Link>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const label = user.email ?? "Account";

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-full border border-espresso-100 bg-white/90 py-1 pl-1 pr-3 text-sm text-espresso-800 transition hover:border-espresso-200"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-espresso-100 text-xs font-semibold text-espresso-700">
            {label.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="max-w-[140px] truncate">{label}</span>
      </Link>
      <button
        type="button"
        onClick={() => void signOut()}
        className="text-sm font-medium text-espresso-600 underline-offset-2 hover:text-espresso-900 hover:underline"
      >
        Sign out
      </button>
    </div>
  );
}
