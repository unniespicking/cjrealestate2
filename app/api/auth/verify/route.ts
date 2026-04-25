import { NextResponse } from "next/server";
import { consumeMagicToken, setSessionCookie } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const next = url.searchParams.get("next") || "/portal/staff";

  if (!token) {
    return NextResponse.redirect(new URL("/portal/login?error=missing", url.origin));
  }

  const session = await consumeMagicToken(token);
  if (!session) {
    return NextResponse.redirect(new URL("/portal/login?error=invalid", url.origin));
  }

  await setSessionCookie(token);
  return NextResponse.redirect(new URL(next, url.origin));
}
