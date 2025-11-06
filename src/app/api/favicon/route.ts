import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// POST - Upload favicon
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "admin" && session.user.role !== "editor")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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

    // Validate file type (favicon should be .ico, .png, or .svg)
    const allowedTypes = ["image/x-icon", "image/vnd.microsoft.icon", "image/png", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload .ico, .png, or .svg file" },
        { status: 400 }
      )
    }

    // Check file size (max 1MB for favicon)
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 1MB" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine file extension
    let extension = ".ico"
    if (file.type === "image/png") {
      extension = ".png"
    } else if (file.type === "image/svg+xml") {
      extension = ".svg"
    }

    // Save to app/favicon.ico (Next.js will automatically serve this)
    // Also save to public/favicon.ico for compatibility
    const appFaviconPath = join(process.cwd(), "src", "app", "favicon.ico")
    const publicFaviconPath = join(process.cwd(), "public", "favicon.ico")
    const publicFaviconPathWithExt = join(process.cwd(), "public", `favicon${extension}`)

    // Ensure directories exist
    const fs = require("fs")
    const appDir = join(process.cwd(), "src", "app")
    const publicDir = join(process.cwd(), "public")
    
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true })
    }
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    // Write favicon files
    await writeFile(appFaviconPath, buffer)
    await writeFile(publicFaviconPath, buffer)
    if (extension !== ".ico") {
      await writeFile(publicFaviconPathWithExt, buffer)
    }
    
    console.log(`✅ Favicon saved to: ${appFaviconPath}`)
    console.log(`✅ Favicon saved to: ${publicFaviconPath}`)

    // Generate URL - always use /favicon.ico for consistency
    const faviconUrl = `/favicon.ico`
    
    // Save to database
    const { prisma } = require("@/lib/prisma")
    await prisma.siteContent.upsert({
      where: { key: "site.favicon" },
      update: { value: faviconUrl, type: "text" },
      create: { key: "site.favicon", value: faviconUrl, type: "text" },
    })

    return NextResponse.json(
      {
        success: true,
        url: faviconUrl,
        message: "Favicon uploaded successfully",
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error uploading favicon:", error)
    return NextResponse.json(
      { error: "Failed to upload favicon", message: error.message },
      { status: 500 }
    )
  }
}

// GET - Get current favicon info
export async function GET(request: NextRequest) {
  try {
    const appFaviconPath = join(process.cwd(), "src", "app", "favicon.ico")
    const publicFaviconPath = join(process.cwd(), "public", "favicon.ico")
    
    const exists = existsSync(appFaviconPath) || existsSync(publicFaviconPath)
    
    return NextResponse.json({
      exists,
      url: "/favicon.ico",
    })
  } catch (error: any) {
    console.error("Error checking favicon:", error)
    return NextResponse.json(
      { error: "Failed to check favicon", message: error.message },
      { status: 500 }
    )
  }
}

