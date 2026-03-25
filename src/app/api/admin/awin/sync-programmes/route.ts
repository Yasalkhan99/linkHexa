import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchAwinProgrammes } from "@/lib/awin/client";

export async function POST(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  try {
    const programmes = await fetchAwinProgrammes();
    const supabase = createServerSupabaseClient();
    const now = new Date().toISOString();

    const rows = programmes.map((p) => ({
      programme_id: p.id,
      name: p.name ?? "Unnamed programme",
      description: p.description ?? null,
      display_url: p.displayUrl ?? null,
      logo_url: p.logoUrl ?? null,
      click_through_url: p.clickThroughUrl ?? null,
      currency_code: p.currencyCode ?? null,
      programme_status: p.status ?? null,
      primary_region: p.primaryRegion ?? null,
      synced_at: now,
    }));

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, upserted: 0, message: "Awin returned no programmes." });
    }

    const { error } = await supabase.from("awin_programmes").upsert(rows, {
      onConflict: "programme_id",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, upserted: rows.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
