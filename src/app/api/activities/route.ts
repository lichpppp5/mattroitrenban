import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Lấy danh sách activities (public hoặc admin)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const publishedParam = searchParams.get("published")
    const category = searchParams.get("category")
    const upcomingParam = searchParams.get("upcoming")
    
    // Public users chỉ xem published activities
    const where: any = {}
    
    // Kiểm tra session để phân biệt public và admin
    const session = await getServerSession(authOptions)
    
    // Admin và editor có thể xem TẤT CẢ activities (published và draft)
    // Chỉ public và viewer mới bị filter
    if (!session || session.user.role === "viewer") {
      // Public hoặc viewer chỉ xem published
      where.isPublished = true
    }
    
    // Apply published filter từ query param (nếu có và user không phải admin/editor)
    if (publishedParam !== null && (!session || session.user.role === "viewer")) {
      where.isPublished = publishedParam === "true"
    }
    
    // Apply upcoming filter from query param
    if (upcomingParam !== null) {
      where.isUpcoming = upcomingParam === "true"
    }
    
    if (category) {
      where.category = category
    }
    
    const activities = await prisma.activity.findMany({
      where,
      orderBy: [
        // cast to any to avoid prisma type narrow issues in dev
        { tripDate: "desc" } as any,
        { createdAt: "desc" } as any,
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        imageUrl: true,
        images: true as any,
        videoUrl: true,
        category: true,
        location: true,
        tripDate: true,
        duration: true,
        volunteerCount: true,
        status: true,
        isPublished: true,
        isUpcoming: true,
        createdAt: true,
        updatedAt: true,
      } as any,
    }) as any
    // Enrich with confirmed donation sum per activity (for UI badges like "Số tiền đã quyên góp")
    const activityIds = (activities as any[]).map((a: any) => a.id)
    if (activityIds.length === 0) {
      return NextResponse.json(activities)
    }

    const donationWhere: any = { isConfirmed: true, activityId: { in: activityIds } }
    const donationRows: any[] = await prisma.donation.findMany({
      where: donationWhere,
      select: { activityId: true, amount: true } as any,
    }) as any

    const sumMap = new Map<string, number>()
    donationRows.forEach((row: any) => {
      const key = row.activityId as string | null
      if (key) {
        sumMap.set(key, (sumMap.get(key) || 0) + (row.amount || 0))
      }
    })

    const enriched = (activities as any[]).map((a: any) => ({
      ...a,
      donationTotal: sumMap.get(a.id) || 0,
    }))

    const response = NextResponse.json(enriched)
    
    // Add caching headers for GET requests
    // Cache for 2 minutes, stale-while-revalidate for 5 minutes
    // This allows fast updates while still serving cached content
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')
    
    return response
  } catch (error: any) {
    console.error("Error fetching activities:", error)
    return NextResponse.json(
      { error: "Failed to fetch activities", message: error.message },
      { status: 500 }
    )
  }
}

// POST - Tạo activity mới (chỉ admin/editor)
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
    const {
      title,
      slug,
      content,
      imageUrl,
      images,
      videoUrl,
      category,
      location,
      tripDate,
      duration,
      volunteerCount,
      status,
      isPublished,
      isUpcoming,
    } = body
    
    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      )
    }
    
    // Check if slug already exists
    const existing = await prisma.activity.findUnique({
      where: { slug },
    })
    
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      )
    }
    
    // Convert images array to JSON string if provided
    let imagesJson = null
    if (images !== undefined && images !== null) {
      if (Array.isArray(images)) {
        imagesJson = images.length > 0 ? JSON.stringify(images) : null
      } else if (typeof images === 'string') {
        // If already a string, validate it's valid JSON array
        try {
          const parsed = JSON.parse(images)
          imagesJson = Array.isArray(parsed) && parsed.length > 0 ? images : null
        } catch {
          // If not valid JSON, treat as single image URL
          imagesJson = images.trim() !== '' ? images : null
        }
      }
    }
    
    // Ensure status and isPublished are synchronized
    const finalIsPublished = isPublished || false
    const finalStatus = finalIsPublished ? "published" : (status || "draft")
    
    const activity = await prisma.activity.create({
      data: {
        title,
        slug,
        content: content || "",
        imageUrl: imageUrl || null,
        images: imagesJson,
        videoUrl: videoUrl || null,
        category: category || null,
        location: location || null,
        tripDate: tripDate ? new Date(tripDate) : null,
        duration: duration ? parseInt(duration) : null,
        volunteerCount: volunteerCount ? parseInt(volunteerCount) : null,
        status: finalStatus,
        isPublished: finalIsPublished, // Explicitly set
        isUpcoming: isUpcoming || false,
      } as any,
    })
    
    // Auto-revalidate pages if published
    if (finalIsPublished) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        // Revalidate homepage, activities page, and activity detail page
        fetch(`${baseUrl}/api/revalidate?path=/,/activities,/activities/${activity.slug}`, {
          method: "GET",
        }).catch(() => {}) // Fire and forget
      } catch (e) {
        // Ignore revalidation errors
      }
    }
    
    return NextResponse.json(activity, { status: 201 })
  } catch (error: any) {
    console.error("Error creating activity:", error)
    return NextResponse.json(
      { error: "Failed to create activity", message: error.message },
      { status: 500 }
    )
  }
}

