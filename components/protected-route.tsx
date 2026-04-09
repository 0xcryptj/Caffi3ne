"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";

function Spinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-espresso-200 border-t-espresso-600"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Spinner />;
  }

  return <>{children}</>;
}
