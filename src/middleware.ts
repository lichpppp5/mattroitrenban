import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const { pathname } = request.nextUrl

  // Protect admin routes (but allow login page)
  if (pathname.startsWith("/root-admin") && !pathname.startsWith("/root-admin/login")) {
    if (!session) {
      const loginUrl = new URL("/root-admin/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has admin role
    if (session.user.role !== "admin" && session.user.role !== "editor") {
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
