import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect from old /admin/* to /root-admin/*
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/api")) {
    const newPath = pathname.replace("/admin", "/root-admin")
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  // Note: Authentication check is handled at the page level using getServerSession
  // This avoids Edge runtime compatibility issues with next-auth/jwt
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/root-admin/:path*",
    "/admin/:path*",
  ],
}
