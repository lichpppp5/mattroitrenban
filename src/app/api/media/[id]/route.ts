import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"
import { unlink } from "fs/promises"
import { join } from "path"

// Configure Cloudinary if available
if (process.env.CLOUDINARY_URL) {
  try {
    // Parse CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
    const url = process.env.CLOUDINARY_URL
    const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/)
    if (match) {
      cloudinary.config({
        cloud_name: match[3],
        api_key: match[1],
        api_secret: match[2],
      })
    } else {
      // Try parsing from NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME if URL format is different
      cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
      })
    }
  } catch (err) {
    console.error("Error configuring Cloudinary:", err)
  }
}

// DELETE - Xóa media
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

    // Get media from database
    const media = await prisma.media.findUnique({
      where: { id },
    })

    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      )
    }

    // Delete from Cloudinary if it's a Cloudinary URL
    if (media.url.includes("cloudinary.com") && process.env.CLOUDINARY_URL) {
      try {
        const publicId = media.url.split("/").slice(-2).join("/").split(".")[0]
        await cloudinary.uploader.destroy(publicId)
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError)
        // Continue with database deletion even if Cloudinary delete fails
      }
    } else if (media.url.startsWith("/uploads/")) {
      // Delete local file
      try {
        const filePath = join(process.cwd(), "public", media.url)
        await unlink(filePath)
      } catch (fileError) {
        console.error("Error deleting local file:", fileError)
        // Continue with database deletion even if file delete fails
      }
    }

    // Delete from database
    await prisma.media.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting media:", error)
    return NextResponse.json(
      { error: "Failed to delete media", message: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Cập nhật media (altText)
export async function PATCH(
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
    const { altText } = body

    const media = await prisma.media.update({
      where: { id },
      data: { altText: altText || null },
    })

    return NextResponse.json(media)
  } catch (error: any) {
    console.error("Error updating media:", error)
    return NextResponse.json(
      { error: "Failed to update media", message: error.message },
      { status: 500 }
    )
  }
}

