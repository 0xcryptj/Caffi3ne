"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import {
  accountAvatarUrl,
  accountEmailForMenu,
  navbarAccountInitial,
  navbarAccountLabel
} from "@/lib/account-display";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";

export function AccountMenu() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      document.body.style.overflow = mq.matches ? "hidden" : "";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!user) return null;

  const label = navbarAccountLabel(profile, user);
  const initial = navbarAccountInitial(profile, user);
  const email = accountEmailForMenu(user);
  const avatarUrl = accountAvatarUrl(profile, user);

  const rowClass = cn(
    "flex items-center gap-3 rounded-xl font-medium text-espresso-800 transition hover:bg-espresso-50 active:bg-espresso-50",
    "min-h-[3.25rem] px-4 py-3 text-base md:min-h-0 md:gap-2 md:px-3 md:py-2.5 md:text-sm"
  );

  const menuItems = (
    <>
      <Link
        href="/dashboard"
        className={rowClass}
        role="menuitem"
        onClick={() => setOpen(false)}
      >
        <LayoutDashboard className="h-5 w-5 shrink-0 opacity-60 md:h-4 md:w-4" />
        Dashboard
      </Link>
      <button
        type="button"
        className={cn(rowClass, "w-full text-left text-espresso-700")}
        role="menuitem"
        onClick={() => {
          setOpen(false);
          void signOut();
        }}
      >
        <LogOut className="h-5 w-5 shrink-0 opacity-60 md:h-4 md:w-4" />
        Sign out
      </button>
    </>
  );

  return (
    <div className="relative min-w-0 shrink-0" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-11 max-w-[min(100vw-8rem,11rem)] min-w-0 items-center gap-1 rounded-full border border-espresso-200/90 bg-white py-0.5 pl-0.5 pr-1.5 text-espresso-800 shadow-sm transition active:scale-[0.99] hover:border-espresso-300 sm:max-w-[14rem] md:h-10 md:max-w-[14rem] md:gap-1.5 md:pl-1 md:pr-2"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu, signed in as ${label}`}
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
            {initial}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-left text-xs font-medium leading-none md:text-sm">
          {label}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-espresso-400 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden" role="presentation">
            <button
              type="button"
              className="min-h-0 flex-1 cursor-default bg-espresso-900/40 backdrop-blur-[2px]"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <div
              className="max-h-[min(85dvh,28rem)] overflow-y-auto rounded-t-3xl border border-b-0 border-espresso-100 bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_40px_rgba(38,25,14,0.12)]"
              role="menu"
            >
              <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-espresso-200" aria-hidden />
              {email ? (
                <p
                  className="border-b border-espresso-100 px-1 pb-3 pt-1 text-xs leading-snug text-espresso-500"
                  title={email}
                >
                  {email}
                </p>
              ) : null}
              <div className={email ? "pt-2" : ""}>{menuItems}</div>
            </div>
          </div>

          <div
            className="absolute right-0 z-50 mt-2 hidden w-[min(100vw-2rem,16rem)] min-w-[12rem] rounded-2xl border border-espresso-100 bg-white p-1.5 shadow-[0_12px_40px_rgba(38,25,14,0.12)] md:block"
            role="menu"
          >
            {email ? (
              <p className="truncate px-3 py-2 text-[11px] leading-snug text-espresso-500" title={email}>
                {email}
              </p>
            ) : null}
            <div className="my-1 border-t border-espresso-100" />
            {menuItems}
          </div>
        </>
      )}
    </div>
  );
}
