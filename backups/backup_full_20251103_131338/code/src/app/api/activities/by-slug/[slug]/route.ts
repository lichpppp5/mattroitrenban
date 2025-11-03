import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Lấy activity theo slug (cho public pages)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const activity = await prisma.activity.findUnique({
      where: { slug },
    })
    
    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }
    
    // Public users chỉ xem published activities
    const session = await getServerSession(authOptions)
    if (!session && !activity.isPublished) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(activity)
  } catch (error: any) {
    console.error("Error fetching activity by slug:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity", message: error.message },
      { status: 500 }
    )
  }
}

