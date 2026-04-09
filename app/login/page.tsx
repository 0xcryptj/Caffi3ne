import { LoginForm } from "./login-form";

type SearchParams = Promise<{ next?: string; error?: string }>;

export default async function LoginPage(props: { searchParams: SearchParams }) {
  const params = await props.searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/dashboard";
  const initialError =
    params.error === "callback"
      ? "Could not finish sign-in. For Google, add https://your-domain/auth/callback to Supabase → Authentication → Redirect URLs (and use only Supabase’s callback URL in Google Cloud OAuth). You can still use the magic link."
      : null;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col items-center justify-center px-6 py-16 lg:px-8">
      <LoginForm nextPath={nextPath} initialError={initialError} />
    </div>
  );
}
