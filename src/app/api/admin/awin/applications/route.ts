import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const supabase = createServerSupabaseClient();
  const { data: apps, error: appsErr } = await supabase
    .from("publisher_awin_applications")
    .select("id, status, created_at, publisher_id, programme_id")
    .order("created_at", { ascending: false });

  if (appsErr) {
    return NextResponse.json({ error: appsErr.message }, { status: 500 });
  }

  const list = apps ?? [];
  const publisherIds = [...new Set(list.map((a) => a.publisher_id))];
  const programmeIds = [...new Set(list.map((a) => a.programme_id))];

  const profilesById = new Map<string, { username: string; email: string }>();
  const programmesById = new Map<number, string>();

  if (publisherIds.length > 0) {
    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("id, username, email")
      .in("id", publisherIds);
    if (!pErr && profiles) {
      for (const p of profiles) {
        profilesById.set(p.id, { username: p.username, email: p.email });
      }
    }
  }

  if (programmeIds.length > 0) {
    const { data: progs, error: prErr } = await supabase
      .from("awin_programmes")
      .select("programme_id, name")
      .in("programme_id", programmeIds);
    if (!prErr && progs) {
      for (const p of progs) {
        programmesById.set(Number(p.programme_id), p.name);
      }
    }
  }

  const rows = list.map((row) => {
    const prof = profilesById.get(row.publisher_id);
    return {
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      publisher_id: row.publisher_id,
      programme_id: row.programme_id,
      publisher_email: prof?.email ?? "",
      publisher_name: prof?.username ?? "",
      programme_name: programmesById.get(Number(row.programme_id)) ?? "Programme",
    };
  });

  return NextResponse.json({ applications: rows });
}

const MAX_BULK_IDS = 200;

export async function PATCH(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  let body: { ids?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
  }

  const ids = body.ids
    .filter((id): id is string => typeof id === "string" && id.length > 0)
    .slice(0, MAX_BULK_IDS);

  if (ids.length === 0) {
    return NextResponse.json({ error: "No valid ids" }, { status: 400 });
  }

  const status = body.status === "approved" || body.status === "rejected" ? body.status : null;
  if (!status) {
    return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("publisher_awin_applications")
    .update({ status, updated_at: now })
    .in("id", ids)
    .eq("status", "pending")
    .select("id, status");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, updated: data ?? [] });
}
