import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "development-secret"
  })
  const { pathname } = request.nextUrl

  // Protect admin routes (but allow login page)
  if (pathname.startsWith("/root-admin") && !pathname.startsWith("/root-admin/login")) {
    if (!token) {
      const loginUrl = new URL("/root-admin/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has admin role
    const userRole = token.role as string
    if (userRole !== "admin" && userRole !== "editor") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Redirect from old /admin/* to /root-admin/*
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/api")) {
    const newPath = pathname.replace("/admin", "/root-admin")
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/root-admin/:path*",
    "/admin/:path*",
  ],
}
