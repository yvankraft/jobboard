import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

export function proxy(req: NextRequest) {
  const hasSession = COOKIE_NAMES.some((name) =>
    req.cookies.get(name)?.value,
  );

  if (!hasSession) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/apprendre/:path*"],
};
