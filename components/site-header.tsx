"use client";

import Image from "next/image";
import Link from "next/link";
import { AuthNav } from "@/components/auth-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-espresso-100/70 bg-canvas/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur supports-[backdrop-filter]:bg-canvas/80">
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex w-full min-w-0 items-center justify-between gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex min-w-0 max-w-[min(100%,11rem)] shrink items-center gap-1.5 text-espresso-800 active:opacity-80 sm:max-w-none sm:gap-2.5"
          >
            <Image
              src="/logo.png"
              alt="Caffi3ne"
              width={44}
              height={44}
              className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-[52px] sm:w-[52px]"
            />
            <div className="min-w-0">
              <div className="truncate font-display text-[0.95rem] tracking-wide sm:text-lg">Caffi3ne</div>
              <div className="hidden truncate text-[9px] uppercase tracking-[0.22em] text-espresso-400 sm:block sm:text-[10px] sm:tracking-[0.28em]">
                Coffee Intelligence
              </div>
            </div>
          </Link>

          <div className="ml-auto flex shrink-0 items-center justify-end">
            <AuthNav />
          </div>
        </div>
      </div>
    </header>
  );
}
