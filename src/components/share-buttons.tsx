"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Share2 } from "lucide-react"

export function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const url = `https://mattroitrenban.vn/activities/${slug}`
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      alert("Đã copy link!")
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      alert("Đã copy link!")
    }
  }
  
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Share2 className="mr-2 h-5 w-5 text-orange-500" />
          Chia sẻ chuyến đi này
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" asChild>
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Facebook
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a 
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Twitter
            </a>
          </Button>
          <Button variant="outline" onClick={handleCopyLink}>
            <Share2 className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
