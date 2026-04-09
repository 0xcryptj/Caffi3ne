import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublishableKey, getSupabaseUrl } from "./env";

export type SessionUpdateResult = {
  user: User | null;
  response: NextResponse;
  /** false until `profiles.onboarding_completed` is true; true when logged out or on fetch error (fail-open). */
  onboardingCompleted: boolean;
};

/**
 * Refreshes the auth session and returns the user plus the response carrying updated cookies.
 * Loads `profiles.onboarding_completed` when the `profiles` table exists.
 */
export async function updateSession(request: NextRequest): Promise<SessionUpdateResult> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  let onboardingCompleted = true;
  if (user) {
    const { data, error } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      onboardingCompleted = true;
    } else {
      onboardingCompleted = data?.onboarding_completed === true;
    }
  }

  return { user, response: supabaseResponse, onboardingCompleted };
}
