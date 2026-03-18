import { NextResponse } from "next/server";
import { getAdminTokenFromCookie } from "./login/route";

export function requireAdmin(request: Request): NextResponse | null {
  const cookieHeader = request.headers.get("cookie");
  const valid = getAdminTokenFromCookie(cookieHeader) !== null;
  if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}
