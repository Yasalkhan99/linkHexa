import { NextResponse } from "next/server";
import { requireAdmin } from "../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, email, role, company_name, website, payment_email, city, country, approval_status, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ signups: data ?? [] });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
