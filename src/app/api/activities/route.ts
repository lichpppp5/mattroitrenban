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
        { tripDate: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        imageUrl: true,
        images: true,
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
      },
    })
    
    return NextResponse.json(activities)
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
      },
    })
    
    return NextResponse.json(activity, { status: 201 })
  } catch (error: any) {
    console.error("Error creating activity:", error)
    return NextResponse.json(
      { error: "Failed to create activity", message: error.message },
      { status: 500 }
    )
  }
}

