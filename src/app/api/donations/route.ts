import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/donations - Get all donations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin and editor can view donations
    if (session.user.role !== "admin" && session.user.role !== "editor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const method = searchParams.get("method")
    const isPublic = searchParams.get("isPublic")
    const isConfirmed = searchParams.get("isConfirmed")
    const search = searchParams.get("search")

    const where: any = {}
    if (method && method !== "all") {
      where.method = method
    }
    if (isPublic !== null) {
      where.isPublic = isPublic === "true"
    }
    if (isConfirmed !== null) {
      where.isConfirmed = isConfirmed === "true"
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ]
    }

    const donations = await prisma.donation.findMany({
      where,
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            tripDate: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(donations)
  } catch (error: any) {
    console.error("Error fetching donations:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch donations" },
      { status: 500 }
    )
  }
}

// POST /api/donations - Create new donation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin and editor can create donations
    if (session.user.role !== "admin" && session.user.role !== "editor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, amount, message, isPublic, isAnonymous, method } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      )
    }

    // Create donation
    const donation = await prisma.donation.create({
      data: {
        name: isAnonymous ? null : name,
        amount: parseFloat(amount),
        message,
        isPublic: isPublic !== undefined ? isPublic : true,
        isAnonymous: isAnonymous || false,
      },
    })

    return NextResponse.json(donation, { status: 201 })
  } catch (error: any) {
    console.error("Error creating donation:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create donation" },
      { status: 500 }
    )
  }
}
