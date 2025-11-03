import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Lấy danh sách payment methods (public chỉ xem active)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = session && (session.user.role === "admin" || session.user.role === "editor")
    
    const where: any = {}
    
    // Public chỉ xem active methods
    if (!isAdmin) {
      where.isActive = true
    }
    
    const methods = await prisma.paymentMethod.findMany({
      where,
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
    })
    
    return NextResponse.json(methods)
  } catch (error: any) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment methods", message: error.message },
      { status: 500 }
    )
  }
}

// POST - Tạo payment method mới (chỉ admin/editor)
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
    
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      )
    }
    
    const method = await prisma.paymentMethod.create({
      data: {
        name: body.name,
        type: body.type,
        icon: body.icon || null,
        accountNumber: body.accountNumber || null,
        accountName: body.accountName || null,
        bankName: body.bankName || null,
        branch: body.branch || null,
        qrCode: body.qrCode || null,
        description: body.description || null,
        instructions: body.instructions || null,
        displayOrder: body.displayOrder || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    })
    
    return NextResponse.json(method, { status: 201 })
  } catch (error: any) {
    console.error("Error creating payment method:", error)
    return NextResponse.json(
      { error: "Failed to create payment method", message: error.message },
      { status: 500 }
    )
  }
}

