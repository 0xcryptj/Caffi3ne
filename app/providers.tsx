"use client";

import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthProvider";
import type { Profile } from "@/lib/types";

type Props = {
  children: ReactNode;
  /** From root layout server read — keeps first paint aligned with cookies and avoids auth UI flash. */
  initialSession: Session | null;
  initialProfile: Profile | null;
};

export function Providers({ children, initialSession, initialProfile }: Props) {
  return (
    <AuthProvider initialSession={initialSession} initialProfile={initialProfile}>
      {children}
    </AuthProvider>
  );
}
