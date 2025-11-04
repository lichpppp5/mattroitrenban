import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// API route to manually revalidate pages after admin updates
// GET /api/revalidate?path=/team (for background jobs, no auth required)
// POST /api/revalidate?path=/team (for admin, requires auth)

// GET - Allow background revalidation (no auth required for internal use)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path") || "/"
    
    // Revalidate multiple paths if comma-separated
    const paths = path.split(",").map(p => p.trim()).filter(Boolean)
    
    for (const p of paths) {
      revalidatePath(p)
    }
    
    return NextResponse.json({ 
      revalidated: true, 
      paths: paths,
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

// POST - Require auth for manual revalidation
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
    const path = searchParams.get("path") || "/"
    
    // Revalidate multiple paths if comma-separated
    const paths = path.split(",").map(p => p.trim()).filter(Boolean)
    
    for (const p of paths) {
      revalidatePath(p)
    }
    
    return NextResponse.json({ 
      revalidated: true, 
      paths: paths,
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
