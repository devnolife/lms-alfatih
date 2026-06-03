import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "funpython_session";
const SECRET = process.env.SESSION_SECRET;
if (!SECRET) throw new Error("SESSION_SECRET env var is required");
const ENC_SECRET = new TextEncoder().encode(SECRET);

const PROTECTED_PREFIXES = ["/app", "/learn", "/dashboard", "/test"];
const TEACHER_PREFIXES = ["/dashboard"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, ENC_SECRET);
    const role = typeof payload.role === "string" ? payload.role : null;
    if (
      TEACHER_PREFIXES.some((p) => pathname.startsWith(p)) &&
      role !== "TEACHER" &&
      role !== "ADMIN"
    ) {
      const url = req.nextUrl.clone();
      url.pathname = "/app";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/app/:path*", "/learn/:path*", "/dashboard/:path*", "/test/:path*"],
};
