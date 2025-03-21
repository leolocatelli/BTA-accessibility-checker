import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/", "/index", "/api/auth"],
};

export function middleware(req) {
  const basicAuth = req.headers.get("authorization");
  const url = req.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    const validUser = process.env.BASIC_AUTH_USER;
    const validPassWord = process.env.BASIC_AUTH_PASSWORD;

    if (user === validUser && pwd === validPassWord) {
      return NextResponse.next();
    }
  }

  // Redirect to authentication API
  url.pathname = "/api/auth";
  return NextResponse.rewrite(url);
}
