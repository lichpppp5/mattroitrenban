import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Lấy activity theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const activity = await prisma.activity.findUnique({
      where: { id },
    })
    
    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }
    
    // Public users chỉ xem published activities
    const session = await getServerSession(authOptions)
    if (!session && !activity.isPublished) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(activity)
  } catch (error: any) {
    console.error("Error fetching activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity", message: error.message },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật activity (chỉ admin/editor)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "admin" && session.user.role !== "editor")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { id } = await params
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
    
    // Check if activity exists
    const existing = await prisma.activity.findUnique({
      where: { id },
    })
    
    if (!existing) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }
    
    // Check if slug changed and conflicts with another activity
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.activity.findUnique({
        where: { slug },
      })
      
      if (slugExists) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        )
      }
    }
    
    // Convert images array to JSON string if provided
    let imagesJson = undefined
    if (images !== undefined) {
      if (Array.isArray(images)) {
        imagesJson = images.length > 0 ? JSON.stringify(images) : null
      } else if (typeof images === 'string') {
        // If already a string, check if it's valid JSON array
        try {
          const parsed = JSON.parse(images)
          imagesJson = Array.isArray(parsed) && parsed.length > 0 ? images : null
        } catch {
          imagesJson = images || null
        }
      } else {
        imagesJson = null
      }
    }
    
    // Ensure status and isPublished are synchronized
    const finalIsPublished = isPublished !== undefined ? isPublished : existing.isPublished
    const finalStatus = status !== undefined 
      ? (finalIsPublished ? "published" : status) 
      : (finalIsPublished ? "published" : existing.status)
    
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        slug: slug !== undefined ? slug : existing.slug,
        content: content !== undefined ? content : existing.content,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        images: imagesJson !== undefined ? imagesJson : existing.images,
        videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
        category: category !== undefined ? category : existing.category,
        location: location !== undefined ? location : existing.location,
        tripDate: tripDate !== undefined ? (tripDate ? new Date(tripDate) : null) : existing.tripDate,
        duration: duration !== undefined ? (duration ? parseInt(duration) : null) : existing.duration,
        volunteerCount: volunteerCount !== undefined ? (volunteerCount ? parseInt(volunteerCount) : null) : existing.volunteerCount,
        status: finalStatus, // Synchronized with isPublished
        isPublished: finalIsPublished, // Explicitly set
        isUpcoming: isUpcoming !== undefined ? isUpcoming : existing.isUpcoming,
      },
    })
    
    return NextResponse.json(activity)
  } catch (error: any) {
    console.error("Error updating activity:", error)
    return NextResponse.json(
      { error: "Failed to update activity", message: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Xóa activity (chỉ admin/editor)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "admin" && session.user.role !== "editor")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { id } = await params
    
    // Check if activity exists
    const existing = await prisma.activity.findUnique({
      where: { id },
    })
    
    if (!existing) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }
    
    await prisma.activity.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true, message: "Activity deleted" })
  } catch (error: any) {
    console.error("Error deleting activity:", error)
    return NextResponse.json(
      { error: "Failed to delete activity", message: error.message },
      { status: 500 }
    )
  }
}

