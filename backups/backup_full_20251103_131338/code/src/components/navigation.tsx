"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Heart } from "lucide-react"
import Image from "next/image"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    // Fetch logo from settings
    fetch("/api/content")
      .then(res => res.json())
      .then(data => {
        if (data && data["site.logo"]) {
          setLogoUrl(data["site.logo"])
        }
      })
      .catch(err => console.error("Error fetching logo:", err))
  }, [])

  const navItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/about", label: "Giới thiệu" },
    { href: "/activities", label: "Hoạt động" },
    { href: "/team", label: "Đội ngũ" },
    { href: "/donate", label: "Quyên góp" },
    { href: "/transparency", label: "Minh bạch" },
    { href: "/contact", label: "Liên hệ" },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {logoUrl ? (
              <div className="relative h-10 w-10">
                <Image 
                  src={logoUrl} 
                  alt="Logo Mặt Trời Trên Bản"
                  fill
                  className="object-contain"
                  unoptimized={logoUrl.startsWith('data:')}
                />
              </div>
            ) : (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2">
                <Heart className="h-6 w-6 text-white" />
              </div>
            )}
            <span className="font-poppins font-bold text-xl text-gray-800">
              Mặt Trời Trên Bản
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-orange-500 transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold">
              <Link href="/activities?published=true&upcoming=true">Chiến dịch đang diễn ra</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-3 py-2">
                <Button asChild className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold">
                  <Link href="/activities?published=true&upcoming=true" onClick={() => setIsOpen(false)}>Chiến dịch đang diễn ra</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
