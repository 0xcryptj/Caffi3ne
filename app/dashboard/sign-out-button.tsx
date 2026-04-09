"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";

export function DashboardSignOut() {
  const { signOut } = useAuth();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void signOut().finally(() => setPending(false));
      }}
      className="rounded-xl border border-espresso-200 bg-white px-4 py-2 text-sm font-semibold text-espresso-800 transition hover:bg-espresso-50 disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
