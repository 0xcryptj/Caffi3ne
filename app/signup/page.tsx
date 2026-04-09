import { redirect } from "next/navigation";
import { safeInternalPath } from "@/lib/auth-routes";

type SearchParams = Promise<{ next?: string }>;

/** Legacy URL: send to unified auth screen on /login. */
export default async function SignupPage(props: { searchParams: SearchParams }) {
  const params = await props.searchParams;
  const nextPath = safeInternalPath(params.next, "/nearby");
  redirect(`/login?mode=signup&next=${encodeURIComponent(nextPath)}`);
}
