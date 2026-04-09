import { Suspense } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { OnboardingForm } from "./onboarding-form";

function OnboardingFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-espresso-200 border-t-espresso-600" />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col items-center justify-center px-6 py-16 lg:px-8">
        <Suspense fallback={<OnboardingFallback />}>
          <OnboardingForm />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
