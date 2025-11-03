import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"
import { writeFile, unlink } from "fs/promises"
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

// GET - Lấy danh sách media
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "admin" && session.user.role !== "editor")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {}
    if (type) {
      where.type = type
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { uploadedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.media.count({ where }),
    ])

    return NextResponse.json({
      media,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("Error fetching media:", error)
    return NextResponse.json(
      { error: "Failed to fetch media", message: error.message },
      { status: 500 }
    )
  }
}

// POST - Upload media
export async function POST(request: NextRequest) {
  try {
    // Check session first
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: No session found. Please log in again." },
        { status: 401 }
      )
    }
    
    if (session.user.role !== "admin" && session.user.role !== "editor") {
      return NextResponse.json(
        { error: "Unauthorized: Insufficient permissions. Admin or Editor role required." },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      )
    }

    // Determine file type
    let fileType = "document"
    if (file.type.startsWith("image/")) {
      fileType = "image"
    } else if (file.type.startsWith("video/")) {
      fileType = "video"
    }

    let fileUrl: string
    let uploadedFilename = file.name

    // Get base URL for absolute URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

    // Upload to Cloudinary if configured, otherwise save locally
    if (process.env.CLOUDINARY_URL) {
      try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: fileType === "video" ? "video" : "image",
              folder: "mattroitrenban",
              use_filename: true,
              unique_filename: true,
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          ).end(buffer)
        }) as any

        fileUrl = uploadResult.secure_url
      } catch (cloudinaryError: any) {
        console.error("Cloudinary upload error:", cloudinaryError)
        // Fallback to local storage
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const fallbackFilename = `${Date.now()}-${file.name}`
        const fallbackPath = join(process.cwd(), "public", "media", fallbackFilename)
        
        // Ensure media directory exists
        const fs = require("fs")
        const mediaDir = join(process.cwd(), "public", "media")
        
        try {
          if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, { recursive: true })
          }
          
          await writeFile(fallbackPath, buffer)
          // Use absolute URL for local files
          fileUrl = `${baseUrl}/media/${fallbackFilename}`
        } catch (writeError: any) {
          console.error("Fallback write also failed:", writeError)
          throw new Error(`Cannot upload file: Cloudinary failed (${cloudinaryError.message}) and local storage failed (${writeError.message})`)
        }
      }
    } else {
      // Save to local storage in /media directory
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}` // Sanitize filename
      const path = join(process.cwd(), "public", "media", filename)
      
        // Ensure media directory exists with correct permissions
        const fs = require("fs")
        const mediaDir = join(process.cwd(), "public", "media")
        
        try {
          if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, { recursive: true })
            // Set permissions (0o755 = rwxr-xr-x)
            fs.chmodSync(mediaDir, 0o755)
          }
          
          // Ensure directory is writable
          try {
            await fs.promises.access(mediaDir, fs.constants.W_OK)
          } catch (accessError) {
            // Try to fix permissions
            fs.chmodSync(mediaDir, 0o755)
            console.log(`Fixed permissions for ${mediaDir}`)
          }
          
          // Check write permissions
          await writeFile(path, buffer)
        // Use absolute URL for local files to ensure they load correctly
        fileUrl = `${baseUrl}/media/${filename}`
        console.log(`✅ File saved to: ${path}`)
        console.log(`✅ File URL: ${fileUrl}`)
      } catch (writeError: any) {
        console.error("❌ Error writing file to disk:", writeError)
        console.error(`   Path: ${path}`)
        console.error(`   Error: ${writeError.message}`)
        
        // If write fails, try alternative location
        const altPath = join(process.cwd(), "media", filename)
        const altDir = join(process.cwd(), "media")
        try {
          console.log(`⚠️  Trying alternative location: ${altPath}`)
          if (!fs.existsSync(altDir)) {
            fs.mkdirSync(altDir, { recursive: true })
            fs.chmodSync(altDir, 0o755)
            console.log(`✅ Created alternative directory: ${altDir}`)
          }
          await writeFile(altPath, buffer)
          
          // IMPORTANT: Copy to correct location for Nginx to serve
          try {
            const correctPath = join(process.cwd(), "public", "media", filename)
            const correctDir = join(process.cwd(), "public", "media")
            
            // Ensure correct directory exists
            if (!fs.existsSync(correctDir)) {
              fs.mkdirSync(correctDir, { recursive: true })
              fs.chmodSync(correctDir, 0o755)
            }
            
            // Copy file to correct location
            await fs.promises.copyFile(altPath, correctPath)
            fs.chmodSync(correctPath, 0o644)
            console.log(`✅ Copied to correct location: ${correctPath}`)
          } catch (copyError: any) {
            console.warn(`⚠️  Could not copy to public/media: ${copyError.message}`)
          }
          
          fileUrl = `${baseUrl}/media/${filename}`
          console.log(`✅ Saved to alternative location: ${altPath}`)
        } catch (altError: any) {
          console.error("❌ Alternative location also failed:", altError)
          throw new Error(
            `Cannot write file to disk. ` +
            `Primary location failed: ${writeError.message}. ` +
            `Alternative location failed: ${altError.message}. ` +
            `Please check directory permissions on the server.`
          )
        }
      }
    }

    // Save to database
    const media = await prisma.media.create({
      data: {
        url: fileUrl,
        type: fileType,
        filename: uploadedFilename,
        size: file.size,
        altText: uploadedFilename,
      },
    })

    return NextResponse.json(
      {
        success: true,
        media,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error uploading media:", error)
    return NextResponse.json(
      { error: "Failed to upload media", message: error.message },
      { status: 500 }
    )
  }
}
