"use client"

import { usePathname } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Don't wrap login page with AdminLayout
  if (pathname?.startsWith("/root-admin/login")) {
    return <>{children}</>
  }
  
  return <AdminLayout>{children}</AdminLayout>
}