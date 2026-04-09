"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
