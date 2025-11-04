"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { FloatingContactMenu } from "@/components/floating-contact-menu"
import { BackgroundMusic } from "@/components/background-music"
import { useEffect, useState } from "react"

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Always render the same structure on server and client to avoid hydration mismatch
  const isLoginPage = pathname?.startsWith("/root-admin/login")
  const isAdminPage = pathname?.startsWith("/root-admin")
  
  if (!isMounted || isLoginPage) {
    return <>{children}</>
  }
  
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {children}
      </main>
      <FloatingContactMenu />
      {/* Chỉ hiển thị nhạc nền trên trang public, không hiển thị ở admin */}
      {!isAdminPage && <BackgroundMusic />}
    </>
  )
}
