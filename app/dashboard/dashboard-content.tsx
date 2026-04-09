"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { DashboardSignOut } from "./sign-out-button";

export function DashboardContent() {
  const { user } = useAuth();
  const src = user?.user_metadata?.avatar_url as string | undefined;
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Account";
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <div className="rounded-2xl border border-espresso-100 bg-crema/90 p-8 shadow-panel">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {src ? (
              <Image
                src={src}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 rounded-full border border-espresso-200 object-cover"
                unoptimized
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full border border-espresso-200 bg-espresso-100 font-display text-lg text-espresso-700"
                aria-hidden
              >
                {initial}
              </div>
            )}
            <div>
              <h1 className="font-display text-xl text-espresso-900">Dashboard</h1>
              <p className="text-sm text-espresso-600">{user?.email}</p>
            </div>
          </div>
          <DashboardSignOut />
        </div>
        <p className="mt-6 text-sm text-espresso-600">
          You are signed in. Explore{" "}
          <Link href="/nearby" className="font-medium text-espresso-800 underline-offset-2 hover:underline">
            nearby shops
          </Link>{" "}
          or return{" "}
          <Link href="/" className="font-medium text-espresso-800 underline-offset-2 hover:underline">
            home
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
