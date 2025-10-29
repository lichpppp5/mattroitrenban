import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, Target, Award, MapPin, Calendar, ArrowRight } from "lucide-react"

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-poppins">
              Về chúng tôi
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Câu chuyện về tổ chức thiện nguyện "Mặt Trời Trên Bản" - 
              nơi tình yêu thương và sự đồng cảm được lan tỏa đến những vùng cao xa xôi
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-poppins">
                Câu chuyện hình thành
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p>
                  "Mặt Trời Trên Bản" được thành lập vào năm 2020 bởi một nhóm bạn trẻ 
                  có chung tình yêu với vùng cao và mong muốn đóng góp cho cộng đồng. 
                  Xuất phát từ một chuyến đi thiện nguyện tại tỉnh Lào Cai, chúng tôi 
                  đã chứng kiến những khó khăn mà đồng bào vùng cao phải đối mặt.
                </p>
                <p>
                  Từ những căn nhà tạm bợ, những đứa trẻ không có điều kiện đến trường, 
                  đến những gia đình thiếu thốn về y tế và giáo dục - tất cả đã thôi thúc 
                  chúng tôi hành động.
                </p>
                <p>
                  Với tình yêu thương và sự đồng cảm, chúng tôi bắt đầu những hoạt động 
                  thiện nguyện đầu tiên, từ việc quyên góp quần áo, sách vở đến xây dựng 
                  những công trình phúc lợi cho cộng đồng.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-white">
                <div className="flex items-center mb-4">
                  <Calendar className="h-6 w-6 mr-2" />
                  <span className="font-semibold">Thành lập: 2020</span>
                </div>
                <div className="flex items-center mb-4">
                  <MapPin className="h-6 w-6 mr-2" />
                  <span className="font-semibold">Hoạt động: 15 tỉnh thành</span>
                </div>
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 mr-2" />
                  <span className="font-semibold">Thành viên: 50+ người</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-6 w-6 mr-2" />
                  <span className="font-semibold">Hoạt động: 100+ dự án</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Tầm nhìn & Sứ mệnh
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những giá trị cốt lõi định hướng mọi hoạt động của chúng tôi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 mr-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Tầm nhìn</h3>
              </div>
              <p className="text-lg text-gray-700">
                Trở thành tổ chức thiện nguyện hàng đầu trong việc hỗ trợ phát triển 
                bền vững cho các vùng cao Việt Nam, góp phần thu hẹp khoảng cách 
                phát triển giữa các vùng miền và tạo cơ hội công bằng cho mọi trẻ em.
              </p>
            </Card>
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-3 mr-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Sứ mệnh</h3>
              </div>
              <p className="text-lg text-gray-700">
                Mang đến cơ hội học tập, chăm sóc sức khỏe và phát triển kinh tế 
                cho đồng bào vùng cao thông qua các hoạt động thiện nguyện minh bạch, 
                hiệu quả và bền vững.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Giá trị cốt lõi
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những nguyên tắc định hướng mọi hoạt động của chúng tôi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tình yêu thương</h3>
              <p className="text-gray-600">
                Đặt tình yêu thương làm nền tảng cho mọi hoạt động, 
                lan tỏa sự ấm áp đến những nơi cần thiết nhất.
              </p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Đồng cảm</h3>
              <p className="text-gray-600">
                Hiểu và chia sẻ những khó khăn của đồng bào vùng cao, 
                đặt mình vào hoàn cảnh của họ để hỗ trợ hiệu quả.
              </p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Minh bạch</h3>
              <p className="text-gray-600">
                Đảm bảo tính minh bạch trong mọi hoạt động, 
                công khai tài chính và báo cáo kết quả một cách rõ ràng.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Đội ngũ của chúng tôi
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những con người tâm huyết đang ngày đêm cống hiến cho sứ mệnh cao cả
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ban điều hành</h3>
              <p className="text-gray-600 mb-4">
                Những người lãnh đạo có kinh nghiệm và tâm huyết, 
                định hướng chiến lược phát triển của tổ chức.
              </p>
              <p className="text-sm text-gray-500">5 thành viên</p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tình nguyện viên</h3>
              <p className="text-gray-600 mb-4">
                Những bạn trẻ nhiệt huyết, sẵn sàng cống hiến thời gian 
                và công sức cho các hoạt động thiện nguyện.
              </p>
              <p className="text-sm text-gray-500">30+ thành viên</p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chuyên gia</h3>
              <p className="text-gray-600 mb-4">
                Các chuyên gia trong lĩnh vực giáo dục, y tế, 
                xây dựng hỗ trợ tư vấn và triển khai dự án.
              </p>
              <p className="text-sm text-gray-500">15+ chuyên gia</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-poppins">
            Cùng chúng tôi viết tiếp câu chuyện
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Mỗi đóng góp của bạn sẽ giúp chúng tôi lan tỏa ánh sáng đến nhiều vùng cao hơn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-orange-500 hover:bg-gray-50 px-8 py-3">
              <a href="/donate">
                Tham gia quyên góp
                <Heart className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-500 px-8 py-3">
              <a href="/contact">
                Liên hệ với chúng tôi
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
