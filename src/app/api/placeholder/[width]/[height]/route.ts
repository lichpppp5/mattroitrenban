import { NextRequest, NextResponse } from "next/server"

// Simple placeholder image generator API
// Returns a simple SVG placeholder image

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ width: string; height: string }> }
) {
  const { width, height } = await params
  const w = parseInt(width) || 400
  const h = parseInt(height) || 400

  // Generate a simple SVG placeholder
  const svg = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">
    ${w} × ${h}
  </text>
</svg>
  `.trim()

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}

