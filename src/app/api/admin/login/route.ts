import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_PASSWORD = "admin*123";
const COOKIE_NAME = "admin_session";
const SEVEN_DAYS = 7 * 24 * 60 * 60;

function signToken(): string {
  const secret = process.env.ADMIN_SECRET || "linkhexa-admin-dev-secret";
  const payload = "admin_ok";
  return payload + "." + crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function verifyToken(token: string): boolean {
  const secret = process.env.ADMIN_SECRET || "linkhexa-admin-dev-secret";
  const [payload, sig] = token.split(".");
  if (!payload || !sig || payload !== "admin_ok") return false;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
}

export function getAdminTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1] ? decodeURIComponent(match[1]) : null;
  if (!value || !verifyToken(value)) return null;
  return value;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    const token = signToken();
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SEVEN_DAYS,
      path: "/",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
