import { safeInternalPath } from "@/lib/auth-routes";
import { AuthScreen } from "@/components/auth-screen";

type SearchParams = Promise<{ next?: string; error?: string; hint?: string; mode?: string }>;

function messageForAuthError(error: string | undefined, hintRaw: string | undefined): string | null {
  if (!error) return null;
  let hint: string | null = null;
  if (hintRaw) {
    try {
      hint = decodeURIComponent(hintRaw);
    } catch {
      hint = hintRaw;
    }
  }
  switch (error) {
    case "callback":
      return "Sign-in did not complete (no authorization code). This usually means the redirect URL is not allowlisted in Supabase, or the link expired. Use the URL below.";
    case "oauth":
      return hint
        ? `Sign-in was cancelled or the provider returned an error: ${hint}`
        : "Sign-in was cancelled or could not start. Try again.";
    case "session":
      return hint
        ? `We could not establish your session: ${hint}`
        : "We could not establish your session. Try Google or password again.";
    default:
      return hint ?? "Something went wrong. Try again.";
  }
}

export default async function LoginPage(props: { searchParams: SearchParams }) {
  const params = await props.searchParams;
  const nextPath = safeInternalPath(params.next, "/dashboard");
  const initialError = messageForAuthError(params.error, params.hint);
  const initialTab = params.mode === "signup" ? "signup" : "signin";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col items-center justify-center bg-zinc-50/80 px-6 py-16 lg:px-8">
      <AuthScreen
        nextPath={nextPath}
        initialTab={initialTab}
        initialError={initialError}
        showRedirectHint={!!params.error}
      />
    </div>
  );
}
