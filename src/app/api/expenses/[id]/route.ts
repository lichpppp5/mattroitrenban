import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/expenses/[id] - Get expense by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin and editor can view expenses
    if (session.user.role !== "admin" && session.user.role !== "editor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const expense = await prisma.expense.findUnique({
      where: { id },
    })

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error: any) {
    console.error("Error fetching expense:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch expense" },
      { status: 500 }
    )
  }
}

// PUT /api/expenses/[id] - Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin and editor can update expenses
    if (session.user.role !== "admin" && session.user.role !== "editor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, amount, description, category, event, activityId } = body

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

    // Prepare update data
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (event !== undefined) updateData.event = event
    if (activityId !== undefined) updateData.activityId = activityId || null

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(expense)
  } catch (error: any) {
    console.error("Error updating expense:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update expense" },
      { status: 500 }
    )
  }
}

// DELETE /api/expenses/[id] - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admin and editor can delete expenses
    if (session.user.role !== "admin" && session.user.role !== "editor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.expense.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Expense deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting expense:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete expense" },
      { status: 500 }
    )
  }
}
