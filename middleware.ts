import { NextRequest, NextResponse } from "next/server";

// Soft auth check: redirect /portal/staff/* to login if no session cookie.
// Layout-level guard re-verifies the token's validity.
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/portal/staff")) {
    if (!req.cookies.get("cj_staff_session")) {
      const url = req.nextUrl.clone();
      url.pathname = "/portal/login";
      url.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/staff/:path*"],
};
