import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServerSupabaseClientFromCookies } from "@/lib/supabase/server-route";

export type PublisherSessionResult =
  | { ok: true; userId: string; email: string; username: string }
  | { ok: false; status: 401 | 403; message: string };

/**
 * Requires Supabase session + approved publisher profile.
 */
export async function requireApprovedPublisher(): Promise<PublisherSessionResult> {
  const auth = await createServerSupabaseClientFromCookies();
  const {
    data: { session },
  } = await auth.auth.getSession();
  if (!session?.user) {
    return { ok: false, status: 401, message: "Not authenticated" };
  }

  const server = createServerSupabaseClient();
  const { data: profile, error } = await server
    .from("profiles")
    .select("username, email, role, approval_status")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    return { ok: false, status: 403, message: "Profile not found" };
  }
  if (profile.role !== "publisher") {
    return { ok: false, status: 403, message: "Publisher access only" };
  }
  if (profile.approval_status !== "approved") {
    return { ok: false, status: 403, message: "Account pending approval" };
  }

  return {
    ok: true,
    userId: session.user.id,
    email: profile.email ?? session.user.email ?? "",
    username: profile.username,
  };
}
