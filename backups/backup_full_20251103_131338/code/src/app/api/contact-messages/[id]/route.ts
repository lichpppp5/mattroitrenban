import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// PATCH - Cập nhật tin nhắn (chỉ có thể đánh dấu đã đọc/chưa đọc)
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
    const { isRead } = body

    if (typeof isRead !== "boolean") {
      return NextResponse.json(
        { error: "isRead must be a boolean" },
        { status: 400 }
      )
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { isRead },
    })

    return NextResponse.json(message)
  } catch (error: any) {
    console.error("Error updating contact message:", error)
    return NextResponse.json(
      { error: "Failed to update message", message: error.message },
      { status: 500 }
    )
  }
}

// GET - Lấy chi tiết một tin nhắn
export async function GET(
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

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(message)
  } catch (error: any) {
    console.error("Error fetching contact message:", error)
    return NextResponse.json(
      { error: "Failed to fetch message", message: error.message },
      { status: 500 }
    )
  }
}

