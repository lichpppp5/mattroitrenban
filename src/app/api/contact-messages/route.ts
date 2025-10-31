import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Lấy danh sách tin nhắn (cần auth)
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
    const isRead = searchParams.get("isRead")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {}
    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === "true"
    }

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.contactMessage.count({ where }),
    ])

    return NextResponse.json({
      messages,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("Error fetching contact messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages", message: error.message },
      { status: 500 }
    )
  }
}

// POST - Tạo tin nhắn mới (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Create contact message
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
        isRead: false,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Tin nhắn đã được gửi thành công",
        contactMessage,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating contact message:", error)
    return NextResponse.json(
      { error: "Failed to send message", message: error.message },
      { status: 500 }
    )
  }
}

