import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// API route to manually revalidate pages after admin updates
// POST /api/revalidate?path=/team
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admin/editor can trigger revalidation
    if (!session || (session.user.role !== "admin" && session.user.role !== "editor")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path") || "/team"
    const tag = searchParams.get("tag")
    
    if (tag) {
      revalidateTag(tag)
    } else {
      revalidatePath(path)
    }
    
    return NextResponse.json({ 
      revalidated: true, 
      path: path || tag,
      now: Date.now() 
    })
  } catch (error: any) {
    console.error("Error revalidating:", error)
    return NextResponse.json(
      { error: "Failed to revalidate", message: error.message },
      { status: 500 }
    )
  }
}

