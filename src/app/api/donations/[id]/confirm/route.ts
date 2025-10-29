import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PUT /api/donations/[id]/confirm - Confirm donation (admin only)
export async function PUT(
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

    const donation = await prisma.donation.findUnique({
      where: { id },
    })

    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      )
    }

    // Update donation to confirmed
    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: {
        isConfirmed: true,
        confirmedAt: new Date(),
        confirmedBy: session.user.id,
      },
    })

    return NextResponse.json(updatedDonation)
  } catch (error: any) {
    console.error("Error confirming donation:", error)
    return NextResponse.json(
      { error: error.message || "Failed to confirm donation" },
      { status: 500 }
    )
  }
}

