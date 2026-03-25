import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { isAwinConfigured, testAwinConnection } from "@/lib/awin/client";

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const configured = isAwinConfigured();
  if (!configured) {
    return NextResponse.json({
      configured: false,
      ok: false,
      message: "Set AWIN_API_TOKEN and AWIN_PUBLISHER_ID in your environment.",
    });
  }

  const result = await testAwinConnection();
  if (!result.ok) {
    return NextResponse.json({
      configured: true,
      ok: false,
      message: result.error,
    });
  }

  return NextResponse.json({
    configured: true,
    ok: true,
    joinedProgrammeCount: result.programmeSampleCount,
    message: "Connection successful (sample: joined programmes count).",
  });
}
