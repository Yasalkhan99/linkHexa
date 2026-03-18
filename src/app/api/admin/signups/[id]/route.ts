import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = requireAdmin(request);
  if (err) return err;
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const body = await request.json();
    const approval_status = body?.approval_status;
    if (approval_status !== "approved" && approval_status !== "rejected") {
      return NextResponse.json({ error: "approval_status must be 'approved' or 'rejected'" }, { status: 400 });
    }
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({ approval_status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, approval_status")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, profile: data });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
