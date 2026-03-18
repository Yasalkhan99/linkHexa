import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with service role. Use only in API routes
 * (e.g. admin APIs) to bypass RLS and read/update all profiles.
 */
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}
