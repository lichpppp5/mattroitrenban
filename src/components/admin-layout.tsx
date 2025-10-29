"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard"
  },
  {
    title: "Donations",
    icon: DollarSign,
    href: "/admin/donations"
  },
  {
    title: "Expenses",
    icon: Receipt,
    href: "/admin/expenses"
  },
  {
    title: "Phương thức TT",
    icon: CreditCard,
    href: "/admin/payment-methods"
  },
  {
    title: "Activities",
    icon: ActivityIcon,
    href: "/admin/activities"
  },
  {
    title: "Team",
    icon: Users,
    href: "/admin/team"
  },
  {
    title: "Content",
    icon: FileText,
    href: "/admin/content"
  },
  {
    title: "Media",
    icon: ImageIcon,
    href: "/admin/media"
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users"
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings"
  }
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

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
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
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
