import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="font-poppins font-bold text-xl">
              Mặt Trời Trên Bản
            </span>
          </div>
          <p className="text-gray-300 mb-4">
            © 2025 Mặt Trời Trên Bản. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button asChild size="sm" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white">
              <Link href="/donate">
                <Heart className="mr-2 h-4 w-4" />
                Tham gia quyên góp
              </Link>
            </Button>
            <div className="flex justify-center space-x-6">
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                Giới thiệu
              </Link>
              <Link href="/activities" className="text-gray-300 hover:text-white transition-colors">
                Hoạt động
              </Link>
              <Link href="/donate" className="text-gray-300 hover:text-white transition-colors">
                Quyên góp
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                Liên hệ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}