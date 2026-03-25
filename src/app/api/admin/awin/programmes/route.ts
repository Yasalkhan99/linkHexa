import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchAwinProgrammes } from "@/lib/awin/client";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const viewRaw = searchParams.get("view");
  const view: "active" | "all" | "joined" =
    viewRaw === "all" ? "all" : viewRaw === "joined" ? "joined" : "active";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  let limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  limit = Math.min(Math.max(10, limit), MAX_LIMIT);

  const supabase = createServerSupabaseClient();

  const { count: totalSynced, error: totalErr } = await supabase
    .from("awin_programmes")
    .select("*", { count: "exact", head: true });

  if (totalErr) {
    return NextResponse.json({ error: totalErr.message }, { status: 500 });
  }

  const { count: activeCatalogueCount, error: activeErr } = await supabase
    .from("awin_programmes")
    .select("*", { count: "exact", head: true })
    .or("programme_status.eq.active,programme_status.eq.Active");

  if (activeErr) {
    return NextResponse.json({ error: activeErr.message }, { status: 500 });
  }

  let joinedOnAwinCount: number | null = null;
  let joinedOnAwinArrayLength: number | null = null;
  let joinedOnAwinError: string | null = null;
  let joinedOnAwinFetchedAt: string | null = null;
  let joinedIds: number[] = [];

  try {
    const joined = await fetchAwinProgrammes({ relationship: "joined" });
    joinedOnAwinArrayLength = joined.length;
    joinedIds = [...new Set(joined.map((p) => p.id))];
    joinedOnAwinCount = joinedIds.length;
    joinedOnAwinFetchedAt = new Date().toISOString();
  } catch (e) {
    joinedOnAwinError = e instanceof Error ? e.message : "Could not load joined programmes from Awin";
  }

  let joinedPresentInDbCount: number | null = null;
  if (joinedIds.length > 0) {
    const { count, error: jdbErr } = await supabase
      .from("awin_programmes")
      .select("*", { count: "exact", head: true })
      .in("programme_id", joinedIds);
    if (!jdbErr) joinedPresentInDbCount = count ?? 0;
  }

  let programmes: {
    programme_id: number;
    name: string;
    display_url: string | null;
    logo_url: string | null;
    programme_status: string | null;
    synced_at: string;
  }[] = [];

  let total = 0;
  let totalPages = 1;
  let safePage = 1;

  if (view === "joined") {
    if (joinedOnAwinError || joinedIds.length === 0) {
      total = 0;
      totalPages = 1;
      safePage = 1;
      programmes = [];
    } else {
      const { data: allJoinedRows, error: listErr } = await supabase
        .from("awin_programmes")
        .select("programme_id, name, display_url, logo_url, programme_status, synced_at")
        .in("programme_id", joinedIds)
        .order("name", { ascending: true });

      if (listErr) {
        return NextResponse.json({ error: listErr.message }, { status: 500 });
      }

      const rows = allJoinedRows ?? [];
      total = rows.length;
      totalPages = Math.max(1, Math.ceil(total / limit));
      safePage = Math.min(page, totalPages);
      const from = (safePage - 1) * limit;
      programmes = rows.slice(from, from + limit);
    }
  } else {
    total = view === "active" ? activeCatalogueCount ?? 0 : totalSynced ?? 0;
    totalPages = Math.max(1, Math.ceil(total / limit));
    safePage = Math.min(page, totalPages);
    const from = (safePage - 1) * limit;
    const to = from + limit - 1;

    let listQuery = supabase
      .from("awin_programmes")
      .select("programme_id, name, display_url, logo_url, programme_status, synced_at")
      .order("name", { ascending: true });

    if (view === "active") {
      listQuery = listQuery.or("programme_status.eq.active,programme_status.eq.Active");
    }

    const { data, error: listErr } = await listQuery.range(from, to);

    if (listErr) {
      return NextResponse.json({ error: listErr.message }, { status: 500 });
    }
    programmes = data ?? [];
  }

  const { count: approvedApplicationCount, error: appCountErr } = await supabase
    .from("publisher_awin_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  if (appCountErr) {
    return NextResponse.json({ error: appCountErr.message }, { status: 500 });
  }

  let approvedProgrammeCount = 0;
  let afrom = 0;
  const pageSize = 1000;
  const progSet = new Set<number>();
  for (;;) {
    const { data: chunk, error: chErr } = await supabase
      .from("publisher_awin_applications")
      .select("programme_id")
      .eq("status", "approved")
      .range(afrom, afrom + pageSize - 1);
    if (chErr) {
      return NextResponse.json({ error: chErr.message }, { status: 500 });
    }
    if (!chunk?.length) break;
    for (const r of chunk) progSet.add(Number(r.programme_id));
    if (chunk.length < pageSize) break;
    afrom += pageSize;
  }
  approvedProgrammeCount = progSet.size;

  return NextResponse.json({
    programmes,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
      view,
    },
    stats: {
      totalSynced: totalSynced ?? 0,
      activeCatalogueCount: activeCatalogueCount ?? 0,
      joinedOnAwinCount,
      joinedOnAwinArrayLength,
      joinedPresentInDbCount,
      joinedOnAwinFetchedAt,
      joinedOnAwinError,
      approvedApplicationCount: approvedApplicationCount ?? 0,
      approvedProgrammeCount,
    },
  });
}
