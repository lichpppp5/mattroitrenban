/**
 * Utility functions for handling image URLs
 */

/**
 * Normalize image URL to absolute URL if needed
 * Handles both relative and absolute URLs
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return ""
  
  // If already absolute URL (starts with http:// or https://), return as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  
  // If starts with /, make it absolute using NEXT_PUBLIC_APP_URL or current origin
  if (url.startsWith("/")) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== "undefined" ? window.location.origin : "") ||
                   "http://localhost:3000"
    return `${baseUrl}${url}`
  }
  
  // Otherwise return as is (might be base64 or other format)
  return url
}

/**
 * Check if URL is a local upload (starts with /uploads/)
 */
export function isLocalUpload(url: string): boolean {
  return url.startsWith("/uploads/") || url.includes("/uploads/")
}

