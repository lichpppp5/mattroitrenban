import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, DollarSign, MapPin, ArrowRight, Star } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4">
                <Heart className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-poppins">
              Mặt Trời Trên Bản
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Mang ánh sáng và hy vọng đến những vùng cao xa xôi, 
              nơi cần sự hỗ trợ và quan tâm nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-8 py-3">
                <Link href="/donate">
                  Quyên góp ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-3">
                <Link href="/about">
                  Tìm hiểu thêm
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">1,200+</h3>
              <p className="text-gray-600">Người được hỗ trợ</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">25+</h3>
              <p className="text-gray-600">Bản làng được hỗ trợ</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">500M+</h3>
              <p className="text-gray-600">VND đã quyên góp</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">50+</h3>
              <p className="text-gray-600">Hoạt động thiện nguyện</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-poppins">
                Câu chuyện của chúng tôi
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                "Mặt Trời Trên Bản" được thành lập với sứ mệnh mang ánh sáng và hy vọng 
                đến những vùng cao xa xôi, nơi mà cuộc sống còn nhiều khó khăn. 
                Chúng tôi tin rằng mỗi đứa trẻ đều có quyền được học tập, 
                mỗi gia đình đều có quyền được sống trong điều kiện tốt hơn.
              </p>
              <p className="text-lg text-gray-700 mb-8">
                Với tình yêu thương và sự đồng cảm, chúng tôi đã và đang thực hiện 
                nhiều hoạt động thiện nguyện ý nghĩa, từ xây dựng trường học, 
                cung cấp học bổng đến hỗ trợ y tế cho đồng bào vùng cao.
              </p>
              <Button asChild variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                <Link href="/about">
                  Đọc thêm câu chuyện
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Tầm nhìn</h3>
                <p className="text-lg mb-6">
                  Trở thành tổ chức thiện nguyện hàng đầu trong việc hỗ trợ 
                  phát triển bền vững cho các vùng cao Việt Nam.
                </p>
                <h3 className="text-2xl font-bold mb-4">Sứ mệnh</h3>
                <p className="text-lg">
                  Mang đến cơ hội học tập, chăm sóc sức khỏe và phát triển 
                  kinh tế cho đồng bào vùng cao thông qua các hoạt động 
                  thiện nguyện minh bạch và hiệu quả.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Hoạt động gần đây
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cùng xem những hoạt động thiện nguyện ý nghĩa mà chúng tôi đã thực hiện
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Heart className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Xây dựng trường học</h3>
                <p className="text-gray-600 mb-4">
                  Hoàn thành xây dựng 2 phòng học mới tại bản X, tỉnh Y, 
                  mang đến không gian học tập tốt hơn cho 50 em học sinh.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <Users className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Khám bệnh miễn phí</h3>
                <p className="text-gray-600 mb-4">
                  Tổ chức khám bệnh miễn phí cho 200 người dân tại 3 bản làng, 
                  cung cấp thuốc và tư vấn sức khỏe.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <Star className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Trao học bổng</h3>
                <p className="text-gray-600 mb-4">
                  Trao 30 suất học bổng cho học sinh nghèo hiếu học, 
                  mỗi suất trị giá 2 triệu đồng.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
              <Link href="/activities">
                Xem tất cả hoạt động
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-poppins">
            Cùng chúng tôi lan tỏa yêu thương
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Mỗi đóng góp của bạn sẽ mang đến hy vọng và cơ hội cho những người cần giúp đỡ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-orange-500 hover:bg-gray-50 px-8 py-3">
              <Link href="/donate">
                Quyên góp ngay
                <Heart className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-500 px-8 py-3">
              <Link href="/contact">
                Liên hệ với chúng tôi
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
