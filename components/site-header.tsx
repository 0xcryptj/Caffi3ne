"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { AuthNav } from "@/components/auth-nav";
import { useAuth } from "@/context/AuthProvider";

type NavEntry =
  | { type: "link"; href: string; label: string }
  | { type: "soon"; label: string };

const navEntries: NavEntry[] = [
  { type: "link", href: "/nearby", label: "Nearby Shops" },
  { type: "soon", label: "API Docs" },
  { type: "soon", label: "Pricing" },
  { type: "soon", label: "Merchants" }
];

function NavLabel({ entry }: { entry: NavEntry }) {
  if (entry.type === "soon") {
    return (
      <span
        className="cursor-not-allowed text-espresso-300"
        title="Coming soon"
      >
        {entry.label}
        <span className="ml-1.5 rounded-md bg-espresso-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-espresso-500">
          Soon
        </span>
      </span>
    );
  }
  return (
    <Link href={entry.href as never} className="transition hover:text-espresso-900">
      {entry.label}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-espresso-100/70 bg-canvas/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex min-w-0 items-center justify-between gap-2 md:gap-4">
          <Link
            href="/"
            className="flex min-w-0 max-w-[min(100%,12rem)] shrink items-center gap-2 text-espresso-800 sm:max-w-none sm:gap-2.5"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/logo.png"
              alt="Caffi3ne"
              width={44}
              height={44}
              className="shrink-0 rounded-full object-cover sm:h-[52px] sm:w-[52px]"
            />
            <div className="min-w-0">
              <div className="truncate font-display text-base tracking-wide sm:text-lg">Caffi3ne</div>
              <div className="truncate text-[9px] uppercase tracking-[0.22em] text-espresso-400 sm:text-[10px] sm:tracking-[0.28em]">
                Coffee Intelligence
              </div>
            </div>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-6 text-sm text-espresso-700 md:flex">
            {navEntries.map((entry) => (
              <div key={entry.label}>
                <NavLabel entry={entry} />
              </div>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <AuthNav />
            <button
              type="button"
              className="flex items-center justify-center rounded-xl p-2 text-espresso-700 transition hover:bg-espresso-50 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-espresso-100 bg-canvas/95 px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-0.5">
            {navEntries.map((entry) => (
              <div key={entry.label}>
                {entry.type === "link" ? (
                  <Link
                    href={entry.href as never}
                    className="block rounded-xl px-3 py-3 text-sm font-medium text-espresso-700 transition hover:bg-espresso-50 hover:text-espresso-900"
                    onClick={() => setOpen(false)}
                  >
                    {entry.label}
                  </Link>
                ) : (
                  <span className="block rounded-xl px-3 py-3 text-sm text-espresso-400">
                    {entry.label}{" "}
                    <span className="text-[10px] font-bold uppercase text-espresso-400">Soon</span>
                  </span>
                )}
              </div>
            ))}
            {!loading && user && (
              <button
                type="button"
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-medium text-espresso-700 transition hover:bg-espresso-50 hover:text-espresso-900"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
              >
                <LogOut className="h-4 w-4 shrink-0 opacity-70" strokeWidth={2} />
                Sign out
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
