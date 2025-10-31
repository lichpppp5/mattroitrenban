import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Lấy danh sách team members (public chỉ xem active)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get("role")
    
    const session = await getServerSession(authOptions)
    const isAdmin = session && (session.user.role === "admin" || session.user.role === "editor")
    
    const where: any = {}
    
    // Public chỉ xem active members
    if (!isAdmin) {
      where.isActive = true
    }
    
    if (role) {
      where.role = role
    }
    
    const members = await prisma.teamMember.findMany({
      where,
      orderBy: [
        { role: "asc" },
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
    })
    
    const response = NextResponse.json(members)
    
    // Add cache headers - shorter cache for team (updates more frequently)
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
    
    return response
  } catch (error: any) {
    console.error("Error fetching team members:", error)
    return NextResponse.json(
      { error: "Failed to fetch team members", message: error.message },
      { status: 500 }
    )
  }
}

// POST - Tạo team member mới (chỉ admin/editor)
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
    const {
      name,
      role,
      position,
      bio,
      image,
      email,
      phone,
      facebookUrl,
      linkedinUrl,
      displayOrder,
      isActive,
    } = body
    
    if (!name || !role) {
      return NextResponse.json(
        { error: "Name and role are required" },
        { status: 400 }
      )
    }
    
    const member = await prisma.teamMember.create({
      data: {
        name,
        role,
        position: position || null,
        bio: bio || null,
        image: image || null,
        email: email || null,
        phone: phone || null,
        facebookUrl: facebookUrl || null,
        linkedinUrl: linkedinUrl || null,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })
    
    // Revalidate team page after create
    try {
      const { revalidatePath } = await import("next/cache")
      revalidatePath("/team")
    } catch (e) {
      console.warn("Failed to revalidate team page:", e)
    }
    
    return NextResponse.json(member, { status: 201 })
  } catch (error: any) {
    console.error("Error creating team member:", error)
    return NextResponse.json(
      { error: "Failed to create team member", message: error.message },
      { status: 500 }
    )
  }
}

