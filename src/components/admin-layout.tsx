"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { 
  LayoutDashboard, 
  DollarSign, 
  Receipt, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  TrendingUp,
  Users,
  Activity as ActivityIcon,
  LogOut,
  CreditCard,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { canEditContent, canManageUsers, canManageSettings } from "@/lib/permissions"

// Định nghĩa menu items với role requirements
const allSidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/root-admin/dashboard",
    requiredRole: "viewer" as const,
  },
  {
    title: "Donations",
    icon: DollarSign,
    href: "/root-admin/donations",
    requiredRole: "viewer" as const,
  },
  {
    title: "Expenses",
    icon: Receipt,
    href: "/root-admin/expenses",
    requiredRole: "viewer" as const,
  },
  {
    title: "Phương thức TT",
    icon: CreditCard,
    href: "/root-admin/payment-methods",
    requiredRole: "editor" as const,
  },
  {
    title: "Activities",
    icon: ActivityIcon,
    href: "/root-admin/activities",
    requiredRole: "editor" as const,
  },
  {
    title: "Thống kê Chiến dịch",
    icon: BarChart3,
    href: "/root-admin/campaigns-stats",
    requiredRole: "viewer" as const,
  },
  {
    title: "Team",
    icon: Users,
    href: "/root-admin/team",
    requiredRole: "editor" as const,
  },
  {
    title: "Content",
    icon: FileText,
    href: "/root-admin/content",
    requiredRole: "editor" as const,
  },
  {
    title: "Media",
    icon: ImageIcon,
    href: "/root-admin/media",
    requiredRole: "editor" as const,
  },
  {
    title: "Users",
    icon: Users,
    href: "/root-admin/users",
    requiredRole: "admin" as const,
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/root-admin/settings",
    requiredRole: "admin" as const,
  }
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/root-admin/login")
    } else if (status === "authenticated") {
      const userRole = session?.user?.role
      if (userRole !== "admin" && userRole !== "editor") {
        router.push("/")
      }
    }
  }, [status, session, router])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/root-admin/login" })
    router.push("/root-admin/login")
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center space-x-2 border-b border-gray-800 p-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-lg">Admin Panel</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {allSidebarItems
                .filter((item) => {
                  const userRole = session?.user?.role
                  if (item.requiredRole === "admin") {
                    return canManageUsers(userRole)
                  } else if (item.requiredRole === "editor") {
                    return canEditContent(userRole)
                  }
                  return true // viewer có thể xem tất cả menu items dành cho viewer
                })
                .map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${
                          isActive
                            ? "bg-orange-500 text-white"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  )
                })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-800 p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <div className="bg-white shadow">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Quản lý website Mặt Trời Trên Bản</p>
          </div>
        </div>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
