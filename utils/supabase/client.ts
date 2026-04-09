import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "./env";

let browserSingleton: SupabaseClient | undefined;

/**
 * Browser Supabase client. Uses publishable (or anon) key from env.
 * Singleton on the client to avoid multiple GoTrue instances.
 */
export const createClient = (): SupabaseClient => {
  if (typeof window !== "undefined" && browserSingleton) {
    return browserSingleton;
  }

  let url: string;
  let key: string;
  try {
    url = getSupabaseUrl();
    key = getSupabasePublishableKey();
  } catch {
    url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
    key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder";
  }

  const client = createBrowserClient(url, key);
  if (typeof window !== "undefined") {
    browserSingleton = client;
  }
  return client;
};
