import { NextResponse } from "next/server";
import { createServerSupabaseClientFromCookies } from "@/lib/supabase/server-route";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClientFromCookies();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const body = await request.json();
    const id = session.user.id;
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const role = body.role === "publisher" || body.role === "advertiser" ? body.role : "publisher";
    const email = typeof body.email === "string" ? body.email.trim() : session.user.email ?? "";
    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }
    const serverSupabase = createServerSupabaseClient();
    const { error } = await serverSupabase.from("profiles").insert({
      id,
      username,
      role,
      email,
      company_name: typeof body.company_name === "string" ? body.company_name.trim() || null : null,
      website: typeof body.website === "string" ? body.website.trim() || null : null,
      company_description: typeof body.company_description === "string" ? body.company_description.trim() || null : null,
      payment_email: typeof body.payment_email === "string" ? body.payment_email.trim() || null : null,
      tax_id: typeof body.tax_id === "string" ? body.tax_id.trim() || null : null,
      address: typeof body.address === "string" ? body.address.trim() || null : null,
      city: typeof body.city === "string" ? body.city.trim() || null : null,
      country: typeof body.country === "string" ? body.country.trim() || null : null,
      approval_status: "pending",
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
