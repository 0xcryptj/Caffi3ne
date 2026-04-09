"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { accountPrimaryLabel, accountShortLabel } from "@/lib/account-display";
import { useAuth } from "@/context/AuthProvider";

export function AuthNav() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div
        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-espresso-200 border-t-espresso-600 md:h-5 md:w-5"
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="shrink-0 rounded-full border border-espresso-200 bg-white px-3 py-1.5 text-xs font-semibold text-espresso-800 transition hover:border-espresso-300 md:px-4 md:py-2 md:text-sm"
      >
        Sign in
      </Link>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const fullLabel = accountPrimaryLabel(user);
  const shortLabel = accountShortLabel(user);

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2 md:gap-3">
      <Link
        href="/dashboard"
        title={fullLabel}
        aria-label={`Open dashboard (${fullLabel})`}
        className="inline-flex h-9 max-w-[10rem] min-w-0 items-center gap-1.5 rounded-full border border-espresso-200/90 bg-white py-0.5 pl-0.5 pr-2.5 text-espresso-800 shadow-sm transition hover:border-espresso-300 md:h-10 md:max-w-[min(100%,18rem)] md:gap-2 md:pl-1 md:pr-3"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-espresso-100 text-[11px] font-semibold leading-none text-espresso-700">
            {fullLabel.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="min-w-0 truncate text-xs font-medium leading-none md:hidden">{shortLabel}</span>
        <span className="hidden min-w-0 truncate text-sm font-medium leading-none md:inline">
          {fullLabel}
        </span>
      </Link>
      <button
        type="button"
        onClick={() => void signOut()}
        className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-espresso-600 underline-offset-2 transition hover:bg-espresso-50 hover:text-espresso-900 hover:underline md:inline-flex"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4 opacity-70" strokeWidth={2} />
        Sign out
      </button>
    </div>
  );
}
