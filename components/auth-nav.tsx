"use client";

import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";
import { useAuth } from "@/context/AuthProvider";

export function AuthNav() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-espresso-200 border-t-espresso-600 md:h-5 md:w-5"
        aria-hidden
      />
    );
  }

  if (user) {
    return <AccountMenu />;
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
      <Link
        href="/signup"
        className="inline-flex min-h-11 min-w-[4.75rem] items-center justify-center rounded-full border border-espresso-200 bg-white px-3 text-xs font-semibold text-espresso-800 shadow-sm transition active:scale-[0.98] hover:border-espresso-300 hover:bg-crema sm:min-h-0 sm:min-w-0 sm:py-2 md:px-4 md:text-sm"
      >
        Signup
      </Link>
      <Link
        href="/login"
        className="inline-flex min-h-11 min-w-[4.25rem] items-center justify-center rounded-full px-3 text-xs font-semibold text-espresso-700 transition active:scale-[0.98] hover:bg-espresso-50 hover:text-espresso-900 sm:min-h-0 sm:min-w-0 sm:py-2 md:px-3 md:text-sm"
      >
        Login
      </Link>
    </div>
  );
}
