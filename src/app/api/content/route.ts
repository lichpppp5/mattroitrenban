import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Lấy tất cả content hoặc theo key
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get("key")

    if (key) {
      const content = await prisma.siteContent.findUnique({
        where: { key },
      })

      if (!content) {
        return NextResponse.json(null)
      }

      const response = NextResponse.json(content)
      // Cache for 5 minutes, stale-while-revalidate for 10 minutes
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
      return response
    }

    // Lấy tất cả
    const contents = await prisma.siteContent.findMany({
      orderBy: { key: "asc" },
    })

    // Convert to key-value object for easier access
    const contentMap: Record<string, any> = {}
    contents.forEach((item) => {
      contentMap[item.key] = item.type === "json"
        ? JSON.parse(item.value)
        : item.value
    })

    const response = NextResponse.json(contentMap)
    // Cache for 5 minutes, stale-while-revalidate for 10 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return response
  } catch (error: any) {
    console.error("Error fetching content:", error)
    return NextResponse.json(
      { error: "Failed to fetch content", message: error.message },
      { status: 500 }
    )
  }
}

// POST - Tạo hoặc cập nhật content (upsert)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "admin" && session.user.role !== "editor")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { key, value, type } = body
    
    if (!key) {
      return NextResponse.json(
        { error: "Key is required" },
        { status: 400 }
      )
    }
    
    // Convert value to string if it's an object/array
    let stringValue = value
    if (typeof value === "object") {
      stringValue = JSON.stringify(value)
    } else {
      stringValue = String(value)
    }
    
    const content = await prisma.siteContent.upsert({
      where: { key },
      update: {
        value: stringValue,
        type: type || "text",
      },
      create: {
        key,
        value: stringValue,
        type: type || "text",
      },
    })
    
    // Auto-revalidate homepage if banner/content changed
    if (key === "site.banner" || key === "heroBannerImage" || key.startsWith("hero") || key.startsWith("site.")) {
      try {
        // Fire and forget - don't wait for revalidation
        fetch(`${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/revalidate?path=/`, {
          method: "GET",
        }).catch(() => {}) // Ignore errors
      } catch (e) {
        // Ignore revalidation errors
      }
    }
    
    return NextResponse.json(content)
  } catch (error: any) {
    console.error("Error saving content:", error)
    return NextResponse.json(
      { error: "Failed to save content", message: error.message },
      { status: 500 }
    )
  }
}

