import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/donations/public - Get public donations for display on donate page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")

    const donations = await prisma.donation.findMany({
      where: {
        isPublic: true,
        isConfirmed: true, // Chỉ hiển thị donations đã được xác nhận
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    // Don't expose sensitive data, only return display data
    const publicDonations = donations.map((donation) => ({
      id: donation.id,
      name: donation.isAnonymous ? "Người ẩn danh" : donation.name || "Khách hàng",
      amount: donation.amount,
      message: donation.message,
      isAnonymous: donation.isAnonymous,
      createdAt: donation.createdAt,
    }))

    return NextResponse.json(publicDonations)
  } catch (error: any) {
    console.error("Error fetching public donations:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch donations" },
      { status: 500 }
    )
  }
}
