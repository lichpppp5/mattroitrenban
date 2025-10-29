"use client"

import { useState } from "react"

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  placeholder?: string
  unoptimized?: boolean
}

export function SafeImage({ 
  src, 
  alt, 
  className, 
  width,
  height,
  placeholder = '/api/placeholder/800/450',
  unoptimized = false
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      if (placeholder) {
        setHasError(true)
        setImgSrc(placeholder)
      } else {
        // Nếu không có placeholder, ẩn ảnh
        const img = document.querySelector(`img[alt="${alt}"]`) as HTMLImageElement
        if (img) {
          img.style.display = 'none'
        }
      }
    }
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={handleError}
    />
  )
}

