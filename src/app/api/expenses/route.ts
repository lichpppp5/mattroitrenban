import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/expenses - Get all expenses
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin and editor can view expenses
    if (session.user.role !== "admin" && session.user.role !== "editor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const event = searchParams.get("event")
    const search = searchParams.get("search")

    const where: any = {}
    if (category && category !== "all") {
      where.category = category
    }
    if (event && event !== "all") {
      where.event = event
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(expenses)
  } catch (error: any) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch expenses" },
      { status: 500 }
    )
  }
}

// POST /api/expenses - Create new expense
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin and editor can create expenses
    if (session.user.role !== "admin" && session.user.role !== "editor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, amount, description, category, event, activityId } = body

    // Validate required fields
    if (!title || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Title and valid amount are required" },
        { status: 400 }
      )
    }

    // Validate activityId if provided
    if (activityId) {
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
      })
      if (!activity) {
        return NextResponse.json(
          { error: "Activity not found" },
          { status: 400 }
        )
      }
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        description,
        category,
        event,
        activityId: activityId || null,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error: any) {
    console.error("Error creating expense:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create expense" },
      { status: 500 }
    )
  }
}
