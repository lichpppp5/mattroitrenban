import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/donations/submit - Public endpoint to submit donations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, amount, message, isPublic, isAnonymous, activityId } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
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

    // Create donation (public endpoint, no authentication required)
    // isConfirmed = false by default, admin will confirm later
    const donation = await prisma.donation.create({
      data: {
        name: isAnonymous ? null : name || null,
        amount: parseFloat(amount),
        message: message || null,
        isPublic: isPublic !== undefined ? isPublic : true,
        isAnonymous: isAnonymous || false,
        activityId: activityId || null,
        isConfirmed: false, // Chưa xác nhận, cần admin xác nhận
      },
    })

    return NextResponse.json(
      { 
        success: true, 
        donation,
        message: "Cảm ơn bạn đã quyên góp! Vui lòng thực hiện chuyển khoản theo thông tin phương thức thanh toán."
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating donation:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create donation" },
      { status: 500 }
    )
  }
}
