"use client"

import { useEffect } from "react"

export function FaviconInjector() {
  useEffect(() => {
    // Fetch favicon URL from database
    fetch("/api/content?key=site.favicon")
      .then(res => res.json())
      .then(data => {
        const faviconUrl = data?.value || "/favicon.ico"
        
        // Remove existing favicon links
        const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
        existingLinks.forEach(link => link.remove())
        
        // Create new favicon links
        const link1 = document.createElement("link")
        link1.rel = "icon"
        link1.href = faviconUrl
        link1.sizes = "any"
        document.head.appendChild(link1)
        
        const link2 = document.createElement("link")
        link2.rel = "icon"
        link2.href = faviconUrl
        link2.type = "image/x-icon"
        document.head.appendChild(link2)
        
        const link3 = document.createElement("link")
        link3.rel = "shortcut icon"
        link3.href = faviconUrl
        document.head.appendChild(link3)
        
        const link4 = document.createElement("link")
        link4.rel = "apple-touch-icon"
        link4.href = faviconUrl
        document.head.appendChild(link4)
        
        console.log("✅ Favicon injected:", faviconUrl)
      })
      .catch(err => {
        console.error("Error fetching favicon:", err)
        // Fallback to default
        const link = document.createElement("link")
        link.rel = "icon"
        link.href = "/favicon.ico"
        document.head.appendChild(link)
      })
  }, [])
  
  return null
}

