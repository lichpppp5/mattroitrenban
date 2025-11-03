"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { FloatingContactMenu } from "@/components/floating-contact-menu"
import { useEffect, useState } from "react"

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Always render the same structure on server and client to avoid hydration mismatch
  const isLoginPage = pathname?.startsWith("/root-admin/login")
  
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
    </>
  )
}
