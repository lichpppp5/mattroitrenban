import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Clock, Users, Video, Image as ImageIcon, Share2 } from "lucide-react"
import { ShareButtons } from "@/components/share-buttons"

// Mock data - sẽ lấy từ database sau
const getActivityBySlug = (slug: string) => {
  const activities: Record<string, any> = {
    "chuyen-di-ban-x": {
      id: 1,
      title: "Chuyến đi Bản X - Xây dựng trường học",
      slug: "chuyen-di-ban-x",
      content: `
        <h2>Hành trình đầy cảm xúc</h2>
        <p>Chuyến đi thiện nguyện đến Bản X đã để lại nhiều kỷ niệm đẹp và ý nghĩa. Chúng tôi đã cùng đồng bào địa phương xây dựng ngôi trường mới cho các em nhỏ vùng cao.</p>
        
        <h3>Ngày 1: Khởi động dự án</h3>
        <p>Sau hành trình dài, đội ngũ của chúng tôi đã đến Bản X vào sáng sớm. Buổi sáng đầu tiên, chúng tôi tổ chức lễ khởi công với sự tham gia của đông đảo người dân địa phương.</p>
        
        <h3>Ngày 2-4: Xây dựng</h3>
        <p>Những ngày tiếp theo, chúng tôi cùng làm việc không ngừng nghỉ. Mỗi viên gạch được đặt xuống với tình yêu thương và hy vọng về một tương lai tươi sáng hơn cho các em.</p>
        
        <h3>Ngày 5: Hoàn thiện và trao tặng</h3>
        <p>Ngày cuối cùng, chúng tôi hoàn thiện phần trang trí và tổ chức lễ trao tặng trường học. Những nụ cười rạng rỡ của các em học sinh là phần thưởng quý giá nhất.</p>
        
        <h3>Kết quả</h3>
        <ul>
          <li>Xây dựng 2 phòng học mới với diện tích 60m²/phòng</li>
          <li>Trang bị đầy đủ bàn ghế, bảng viết cho 50 em học sinh</li>
          <li>Hỗ trợ sách vở, đồ dùng học tập cho tất cả học sinh</li>
          <li>Tổng trị giá dự án: 250.000.000 VND</li>
        </ul>
        
        <h3>Cảm ơn</h3>
        <p>Chúng tôi xin chân thành cảm ơn tất cả các nhà hảo tâm đã đóng góp cho dự án này. Nhờ sự hỗ trợ của các bạn, chúng tôi đã mang đến một môi trường học tập tốt hơn cho các em nhỏ vùng cao.</p>
      `,
      category: "Giáo dục",
      imageUrl: "",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      location: "Bản X, Tỉnh Y",
      tripDate: "2024-06-15",
      duration: 5,
      volunteerCount: 15,
      status: "completed",
      isUpcoming: false,
      createdAt: "2024-06-15",
    },
    "kham-benh-mien-phi": {
      id: 2,
      title: "Khám bệnh miễn phí tại 3 bản làng",
      slug: "kham-benh-mien-phi",
      content: `
        <h2>Chương trình khám bệnh miễn phí</h2>
        <p>Chúng tôi đã tổ chức chương trình khám bệnh và phát thuốc miễn phí cho đồng bào tại 3 bản làng vùng cao.</p>
        
        <h3>Kết quả</h3>
        <ul>
          <li>Khám bệnh cho 200 người dân</li>
          <li>Phát thuốc miễn phí cho các trường hợp cần điều trị</li>
          <li>Tư vấn sức khỏe và dinh dưỡng</li>
          <li>Hỗ trợ các trường hợp cần chuyển viện</li>
        </ul>
        
        <p>Chúng tôi rất vui được hỗ trợ và chăm sóc sức khỏe cho đồng bào vùng cao.</p>
      `,
      category: "Y tế",
      imageUrl: "",
      videoUrl: "",
      location: "Bản A, B, C - Tỉnh Y",
      tripDate: "2024-06-10",
      duration: 3,
      volunteerCount: 20,
      status: "completed",
      isUpcoming: false,
      createdAt: "2024-06-10",
      images: [
        "/placeholder-image-1.jpg",
        "/placeholder-image-2.jpg",
        "/placeholder-image-3.jpg",
        "/placeholder-image-4.jpg",
      ],
    },
    "trao-hoc-bong": {
      id: 3,
      title: "Trao học bổng tại Bản Z",
      slug: "trao-hoc-bong",
      content: `
        <h2>Lễ trao học bổng</h2>
        <p>Buổi lễ trao 30 suất học bổng cho các em học sinh nghèo hiếu học tại Bản Z.</p>
        <p>Mỗi suất học bổng trị giá 2 triệu đồng, giúp các em có thêm động lực để tiếp tục học tập.</p>
      `,
      category: "Giáo dục",
      imageUrl: "",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      location: "Bản Z, Tỉnh Y",
      tripDate: "2024-06-05",
      duration: 2,
      volunteerCount: 10,
      status: "completed",
      isUpcoming: false,
      createdAt: "2024-06-05",
    },
    "chuyen-di-ban-m": {
      id: 4,
      title: "Xây dựng cầu đi bộ tại Bản M",
      slug: "chuyen-di-ban-m",
      content: `
        <h2>Dự án xây dựng cầu đi bộ</h2>
        <p>Dự án xây dựng cầu đi bộ để giúp các em học sinh và người dân đi lại an toàn hơn, đặc biệt vào mùa mưa.</p>
        <h3>Thông tin chuyến đi</h3>
        <ul>
          <li>Thời gian: 15/07/2024 - 19/07/2024 (5 ngày)</li>
          <li>Địa điểm: Bản M, Huyện X, Tỉnh Y</li>
          <li>Số lượng tình nguyện viên: 15 người</li>
          <li>Trạng thái: Đang chuẩn bị</li>
        </ul>
        <h3>Nhiệm vụ</h3>
        <p>Chúng tôi sẽ xây dựng cầu đi bộ dài 20m để giúp các em học sinh và người dân địa phương đi lại an toàn hơn, đặc biệt trong mùa mưa lũ.</p>
        <h3>Tham gia cùng chúng tôi</h3>
        <p>Chúng tôi đang cần thêm tình nguyện viên tham gia. Hãy liên hệ với chúng tôi nếu bạn muốn tham gia!</p>
      `,
      category: "Cơ sở hạ tầng",
      imageUrl: "",
      videoUrl: "",
      location: "Bản M, Huyện X, Tỉnh Y",
      tripDate: "2024-07-15",
      duration: 5,
      volunteerCount: 15,
      status: "preparing",
      isUpcoming: true,
      createdAt: "2024-06-13",
    },
    "tang-sach": {
      id: 5,
      title: "Tặng sách và đồ dùng học tập",
      slug: "tang-sach",
      content: `
        <h2>Chuyến đi đặc biệt - Tặng sách và đồ dùng học tập</h2>
        <p>Chuyến đi đặc biệt mang sách, vở, bút và đồ dùng học tập đến cho 200 em học sinh tại 5 điểm trường vùng cao.</p>
        <h3>Thông tin chuyến đi</h3>
        <ul>
          <li>Thời gian: 05/08/2024 - 07/08/2024 (3 ngày)</li>
          <li>Địa điểm: 5 điểm trường - Tỉnh Y</li>
          <li>Số lượng tình nguyện viên: 20 người</li>
          <li>Trạng thái: Đăng ký mở</li>
        </ul>
        <h3>Hoạt động</h3>
        <ul>
          <li>Tặng sách giáo khoa và sách tham khảo</li>
          <li>Tặng vở, bút, thước kẻ và các đồ dùng học tập</li>
          <li>Tổ chức hoạt động đọc sách cùng các em</li>
          <li>Trao quà cho các em học sinh xuất sắc</li>
        </ul>
        <h3>Đăng ký tham gia</h3>
        <p>Chúng tôi đang mở đăng ký cho tình nguyện viên. Hãy liên hệ với chúng tôi để đăng ký tham gia!</p>
      `,
      category: "Giáo dục",
      imageUrl: "",
      videoUrl: "",
      location: "5 điểm trường - Tỉnh Y",
      tripDate: "2024-08-05",
      duration: 3,
      volunteerCount: 20,
      status: "registration_open",
      isUpcoming: true,
      createdAt: "2024-06-10",
    },
    "ho-tro-khan-cap": {
      id: 6,
      title: "Hỗ trợ khẩn cấp mùa mưa lũ",
      slug: "ho-tro-khan-cap",
      content: `
        <h2>Chương trình hỗ trợ khẩn cấp mùa mưa lũ</h2>
        <p>Chương trình hỗ trợ khẩn cấp cho các hộ gia đình bị ảnh hưởng bởi mưa lũ, cung cấp lương thực và nhu yếu phẩm.</p>
        <h3>Thông tin chuyến đi</h3>
        <ul>
          <li>Thời gian: 20/08/2024 - 21/08/2024 (2 ngày)</li>
          <li>Địa điểm: Vùng lũ - Tỉnh Y</li>
          <li>Số lượng tình nguyện viên: 10 người</li>
          <li>Trạng thái: Sắp mở đăng ký</li>
        </ul>
        <h3>Hoạt động hỗ trợ</h3>
        <ul>
          <li>Phát gạo, lương thực cho các hộ gia đình</li>
          <li>Cung cấp nước sạch và nhu yếu phẩm</li>
          <li>Hỗ trợ dọn dẹp nhà cửa sau lũ</li>
          <li>Khám sức khỏe và phát thuốc</li>
        </ul>
        <h3>Thông báo</h3>
        <p>Chúng tôi sẽ thông báo khi mở đăng ký cho tình nguyện viên. Hãy theo dõi website của chúng tôi!</p>
      `,
      category: "Hỗ trợ khẩn cấp",
      imageUrl: "",
      videoUrl: "",
      location: "Vùng lũ - Tỉnh Y",
      tripDate: "2024-08-20",
      duration: 2,
      volunteerCount: 10,
      status: "upcoming",
      isUpcoming: true,
      createdAt: "2024-06-05",
    },
  }
  
  return activities[slug] || null
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const activity = getActivityBySlug(params.slug)
  
  if (!activity) {
    return {
      title: "Không tìm thấy",
    }
  }
  
  return {
    title: `${activity.title} - Mặt Trời Trên Bản`,
    description: activity.content.substring(0, 160),
  }
}

export default function ActivityDetailPage({ params }: { params: { slug: string } }) {
  const activity = getActivityBySlug(params.slug)
  
  if (!activity) {
    notFound()
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
          <Link href="/activities">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Xem tất cả chuyến đi
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category & Status */}
        <div className="flex items-center space-x-2 mb-4">
          <Badge variant="outline">{activity.category}</Badge>
          {activity.isUpcoming && (
            <Badge className="bg-green-500">Sắp tới</Badge>
          )}
          {activity.status === "completed" && (
            <Badge className="bg-blue-500">Đã hoàn thành</Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-poppins">
          {activity.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-gray-600">
          {activity.tripDate && (
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-orange-500" />
              {formatDate(activity.tripDate)}
            </div>
          )}
          {activity.location && (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-orange-500" />
              {activity.location}
            </div>
          )}
          {activity.duration && (
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-500" />
              {activity.duration} ngày
            </div>
          )}
          {activity.volunteerCount && (
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-orange-500" />
              {activity.volunteerCount} tình nguyện viên
            </div>
          )}
        </div>

        {/* Video Section */}
        {activity.videoUrl && (
          <Card className="mb-8">
            <CardContent className="p-0">
              <div className="relative w-full aspect-video bg-gradient-to-br from-yellow-400 to-orange-500 rounded-t-lg overflow-hidden">
                <iframe
                  src={activity.videoUrl}
                  title={activity.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Image Gallery */}
        {activity.images && activity.images.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <ImageIcon className="mr-2 h-6 w-6 text-orange-500" />
                Album ảnh
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {activity.images.map((img: string, index: number) => (
                  <div 
                    key={index}
                    className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Image */}
        {activity.imageUrl && !activity.videoUrl && (
          <Card className="mb-8">
            <CardContent className="p-0">
              <div className="relative w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="h-24 w-24 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        <Card className="mb-8">
          <CardContent className="p-6 md:p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: activity.content }}
            />
          </CardContent>
        </Card>

        {/* Share Section */}
        <ShareButtons slug={activity.slug} title={activity.title} />

        {/* CTA Section */}
        {activity.isUpcoming && (
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-4">Tham gia cùng chúng tôi</h3>
              <p className="mb-6">
                Bạn muốn tham gia chuyến đi thiện nguyện này? Hãy liên hệ với chúng tôi ngay!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="bg-white text-orange-500 hover:bg-gray-50">
                  <Link href="/contact">
                    Liên hệ ngay
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-500">
                  <Link href="/donate">
                    Quyên góp hỗ trợ
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Activities */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Các chuyến đi khác</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Khám bệnh miễn phí tại 3 bản làng</h3>
                <p className="text-gray-600 mb-4">Album ảnh ghi lại những khoảnh khắc đầy ấm áp...</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/activities/kham-benh-mien-phi">
                    Xem chi tiết
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Trao học bổng tại Bản Z</h3>
                <p className="text-gray-600 mb-4">Video cảm động về buổi lễ trao học bổng...</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/activities/trao-hoc-bong">
                    Xem chi tiết
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
