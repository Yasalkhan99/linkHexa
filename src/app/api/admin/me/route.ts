import { NextResponse } from "next/server";
import { getAdminTokenFromCookie } from "../login/route";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const valid = getAdminTokenFromCookie(cookieHeader) !== null;
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
