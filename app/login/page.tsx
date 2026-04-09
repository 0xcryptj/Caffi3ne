import { LoginForm } from "./login-form";

type SearchParams = Promise<{ next?: string; error?: string }>;

export default async function LoginPage(props: { searchParams: SearchParams }) {
  const params = await props.searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/dashboard";
  const initialError =
    params.error === "callback"
      ? "Sign-in could not be completed. Try again or use a different method."
      : null;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col items-center justify-center px-6 py-16 lg:px-8">
      <LoginForm nextPath={nextPath} initialError={initialError} />
    </div>
  );
}
