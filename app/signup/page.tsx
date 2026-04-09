import { safeInternalPath } from "@/lib/auth-routes";
import { SignupForm } from "./signup-form";

type SearchParams = Promise<{ next?: string }>;

export default async function SignupPage(props: { searchParams: SearchParams }) {
  const params = await props.searchParams;
  const nextPath = safeInternalPath(params.next, "/nearby");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col items-center justify-center px-6 py-16 lg:px-8">
      <SignupForm nextPath={nextPath} />
    </div>
  );
}
