"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, Mail, X, HelpCircle } from "lucide-react"

export function FloatingContactMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)

  // Có thể lấy từ settings hoặc database
  const contactInfo = {
    phone: "+84 123 456 789",
    messengerUrl: "https://m.me/mattroitrenban",
    email: "info@mattroitrenban.vn",
  }

  // Tạm thời enable, có thể kiểm tra từ settings sau
  if (!isEnabled) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Contact Buttons */}
      {isOpen && (
        <div className="flex flex-col items-center space-y-3 mb-3">
          {/* Phone Button */}
          <a
            href={`tel:${contactInfo.phone}`}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center justify-center w-14 h-14 animate-in fade-in slide-in-from-bottom-2 duration-300"
            title={`Gọi ${contactInfo.phone}`}
          >
            <Phone className="h-6 w-6" />
          </a>

          {/* Messenger Button */}
          <a
            href={contactInfo.messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center justify-center w-14 h-14 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75"
            title="Facebook Messenger"
          >
            <MessageCircle className="h-6 w-6" />
          </a>

          {/* Email Button */}
          <a
            href={`mailto:${contactInfo.email}?subject=Liên hệ từ website`}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center justify-center w-14 h-14 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150"
            title={`Gửi email đến ${contactInfo.email}`}
          >
            <Mail className="h-6 w-6" />
          </a>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full p-4 shadow-lg transition-all hover:scale-110 w-14 h-14 ${
          isOpen 
            ? "bg-gray-500 hover:bg-gray-600" 
            : "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
        }`}
        title={isOpen ? "Đóng menu" : "Mở menu liên hệ"}
        aria-label={isOpen ? "Đóng menu liên hệ" : "Mở menu liên hệ"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <HelpCircle className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  )
}
