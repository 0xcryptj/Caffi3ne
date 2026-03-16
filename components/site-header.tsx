"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/nearby", label: "Nearby Shops" },
  { href: "/docs", label: "API Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/merchant", label: "Merchants" }
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-espresso-100/70 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-espresso-800"
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
            <div className="font-display text-base tracking-wide sm:text-lg">Caffi3ne</div>
            <div className="truncate text-[9px] uppercase tracking-[0.22em] text-espresso-400 sm:text-[10px] sm:tracking-[0.28em]">
              Coffee Intelligence
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm text-espresso-700 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href as never}
              className="transition hover:text-espresso-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="flex items-center justify-center rounded-xl p-2 text-espresso-700 transition hover:bg-espresso-50 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-espresso-100 bg-canvas/95 px-4 pb-4 pt-2 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-0.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href as never}
                className="rounded-xl px-3 py-3 text-sm font-medium text-espresso-700 transition hover:bg-espresso-50 hover:text-espresso-900"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
