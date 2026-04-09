"use client";

import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthProvider";

type Props = {
  children: ReactNode;
  /** From root layout server read — keeps first paint aligned with cookies and avoids auth UI flash. */
  initialSession: Session | null;
};

export function Providers({ children, initialSession }: Props) {
  return <AuthProvider initialSession={initialSession}>{children}</AuthProvider>;
}
