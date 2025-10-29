import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Clock, Users, Video, Image as ImageIcon, Share2 } from "lucide-react"
import { ShareButtons } from "@/components/share-buttons"

import { prisma } from "@/lib/prisma"

// Fetch activity from database
async function getActivityBySlug(slug: string) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { slug },
    })
    
    // Public users chỉ xem published activities
    // (Đã check ở API route, nhưng cũng check ở đây để an toàn)
    if (!activity || !activity.isPublished) {
      return null
    }
    
    return activity
  } catch (error) {
    console.error("Error fetching activity:", error)
    return null
  }
}

// Fallback mock data (chỉ dùng khi API fail)
const mockActivities: Record<string, any> = {
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
    // Thêm các activities từ trang listing
    "xay-dung-truong-hoc-tai-ban-x-tinh-y": {
      id: 7,
      title: "Xây dựng trường học tại bản X, tỉnh Y",
      slug: "xay-dung-truong-hoc-tai-ban-x-tinh-y",
      content: `
        <h2>Hoàn thành xây dựng trường học</h2>
        <p>Hoàn thành xây dựng 2 phòng học mới với đầy đủ trang thiết bị, mang đến không gian học tập tốt hơn cho 50 em học sinh tại bản X, tỉnh Y.</p>
        <h3>Thông tin dự án</h3>
        <ul>
          <li>Thời gian: 3 tháng</li>
          <li>Tổng kinh phí: 200 triệu đồng</li>
          <li>Số phòng học: 2 phòng</li>
          <li>Số học sinh hưởng lợi: 50 em</li>
        </ul>
        <h3>Kết quả đạt được</h3>
        <p>Dự án đã hoàn thành thành công, mang đến môi trường học tập tốt hơn cho các em học sinh vùng cao.</p>
      `,
      category: "Giáo dục",
      imageUrl: "",
      videoUrl: "",
      location: "Bản X, Tỉnh Y",
      tripDate: "2024-01-15",
      duration: 90,
      volunteerCount: 20,
      status: "completed",
      isUpcoming: false,
      createdAt: "2024-01-15",
    },
    "kham-benh-mien-phi-cho-dong-bao-vung-cao": {
      id: 8,
      title: "Khám bệnh miễn phí cho đồng bào vùng cao",
      slug: "kham-benh-mien-phi-cho-dong-bao-vung-cao",
      content: `
        <h2>Khám bệnh miễn phí cho đồng bào vùng cao</h2>
        <p>Tổ chức khám bệnh miễn phí cho 200 người dân tại 3 bản làng, cung cấp thuốc và tư vấn sức khỏe.</p>
        <h3>Thông tin hoạt động</h3>
        <ul>
          <li>Số người được khám: 200 người</li>
          <li>Địa điểm: 3 bản làng, Tỉnh Z</li>
          <li>Số bác sĩ: 10 người</li>
          <li>Số y tá: 20 người</li>
        </ul>
        <h3>Kết quả</h3>
        <p>Hoạt động đã giúp nhiều người dân tiếp cận với dịch vụ y tế và nhận được tư vấn sức khỏe phù hợp.</p>
      `,
      category: "Y tế",
      imageUrl: "",
      videoUrl: "",
      location: "3 bản làng, Tỉnh Z",
      tripDate: "2024-02-20",
      duration: 1,
      volunteerCount: 30,
      status: "completed",
      isUpcoming: false,
      createdAt: "2024-02-20",
    },
    "trao-hoc-bong-cho-hoc-sinh-ngheo-hieu-hoc": {
      id: 9,
      title: "Trao học bổng cho học sinh nghèo hiếu học",
      slug: "trao-hoc-bong-cho-hoc-sinh-ngheo-hieu-hoc",
      content: `
        <h2>Trao học bổng cho học sinh nghèo hiếu học</h2>
        <p>Trao 30 suất học bổng cho học sinh nghèo hiếu học, mỗi suất trị giá 2 triệu đồng.</p>
        <h3>Thông tin chương trình</h3>
        <ul>
          <li>Số suất học bổng: 30 suất</li>
          <li>Giá trị mỗi suất: 2 triệu đồng</li>
          <li>Tổng giá trị: 60 triệu đồng</li>
          <li>Địa điểm: 5 tỉnh miền núi</li>
        </ul>
        <h3>Mục tiêu</h3>
        <p>Chương trình nhằm khuyến khích các em tiếp tục học tập và phát triển tài năng.</p>
      `,
      category: "Giáo dục",
      imageUrl: "",
      videoUrl: "",
      location: "5 tỉnh miền núi",
      tripDate: "2024-03-10",
      duration: 1,
      volunteerCount: 10,
      status: "completed",
      isUpcoming: false,
      createdAt: "2024-03-10",
    },
    "xay-dung-he-thong-nuoc-sach": {
      id: 10,
      title: "Xây dựng hệ thống nước sạch",
      slug: "xay-dung-he-thong-nuoc-sach",
      content: `
        <h2>Lắp đặt hệ thống nước sạch</h2>
        <p>Lắp đặt hệ thống nước sạch cho 100 hộ gia đình tại bản A, tỉnh B.</p>
        <h3>Thông tin dự án</h3>
        <ul>
          <li>Số hộ được hỗ trợ: 100 hộ</li>
          <li>Địa điểm: Bản A, Tỉnh B</li>
          <li>Thời gian: 2 tháng</li>
        </ul>
        <h3>Lợi ích</h3>
        <p>Dự án giúp cải thiện chất lượng cuộc sống và giảm thiểu các bệnh liên quan đến nước không sạch.</p>
      `,
      category: "Cơ sở hạ tầng",
      imageUrl: "",
      videoUrl: "",
      location: "Bản A, Tỉnh B",
      tripDate: "2024-04-05",
      duration: 60,
      volunteerCount: 15,
      status: "completed",
      isUpcoming: false,
      createdAt: "2024-04-05",
    },
    "ho-tro-phat-trien-kinh-te-ho-gia-dinh": {
      id: 11,
      title: "Hỗ trợ phát triển kinh tế hộ gia đình",
      slug: "ho-tro-phat-trien-kinh-te-ho-gia-dinh",
      content: `
        <h2>Hỗ trợ phát triển kinh tế hộ gia đình</h2>
        <p>Cung cấp giống cây trồng và đào tạo kỹ thuật canh tác cho 50 hộ gia đình.</p>
        <h3>Thông tin chương trình</h3>
        <ul>
          <li>Số hộ tham gia: 50 hộ</li>
          <li>Địa điểm: Bản C, Tỉnh D</li>
          <li>Nội dung: Cung cấp giống cây + Đào tạo kỹ thuật</li>
        </ul>
        <h3>Mục tiêu</h3>
        <p>Chương trình giúp các hộ gia đình có thu nhập ổn định và phát triển kinh tế bền vững.</p>
      `,
      category: "Phát triển kinh tế",
      imageUrl: "",
      videoUrl: "",
      location: "Bản C, Tỉnh D",
      tripDate: "2024-05-12",
      duration: 30,
      volunteerCount: 12,
      status: "completed",
      isUpcoming: false,
      createdAt: "2024-05-12",
    },
    "to-chuc-lop-hoc-tieng-viet-cho-tre-em": {
      id: 12,
      title: "Tổ chức lớp học tiếng Việt cho trẻ em",
      slug: "to-chuc-lop-hoc-tieng-viet-cho-tre-em",
      content: `
        <h2>Lớp học tiếng Việt cho trẻ em</h2>
        <p>Mở lớp học tiếng Việt cho 80 trẻ em dân tộc thiểu số, giúp các em có thể giao tiếp tốt hơn và tiếp cận với giáo dục chính quy.</p>
        <h3>Thông tin lớp học</h3>
        <ul>
          <li>Số học sinh: 80 em</li>
          <li>Địa điểm: Bản E, Tỉnh F</li>
          <li>Thời gian: Cuối tuần</li>
          <li>Giáo viên: 5 tình nguyện viên</li>
        </ul>
        <h3>Kết quả</h3>
        <p>Lớp học giúp các em có thể giao tiếp tốt hơn và tiếp cận với giáo dục chính quy.</p>
      `,
      category: "Giáo dục",
      imageUrl: "",
      videoUrl: "",
      location: "Bản E, Tỉnh F",
      tripDate: "2024-06-01",
      duration: 90,
      volunteerCount: 5,
      status: "completed",
      isUpcoming: false,
      createdAt: "2024-06-01",
    },
  }
  
  // Try to fetch from API first, fallback to mock
  return mockActivities[slug] || null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const activity = await getActivityBySlug(slug)
  
  if (!activity) {
    return {
      title: "Không tìm thấy",
    }
  }
  
  // Strip HTML tags for description
  const description = activity.content?.replace(/<[^>]*>/g, "").substring(0, 160) || ""
  
  return {
    title: `${activity.title} - Mặt Trời Trên Bản`,
    description: description,
  }
}

export default async function ActivityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const activity = await getActivityBySlug(slug)
  
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
        {(() => {
          // Parse images from JSON string or use array directly
          let imageArray: string[] = []
          if (activity.images) {
            if (typeof activity.images === 'string') {
              try {
                imageArray = JSON.parse(activity.images)
              } catch (e) {
                // If parsing fails, try splitting by comma
                imageArray = activity.images.split(',').map((s: string) => s.trim()).filter((s: string) => s)
              }
            } else if (Array.isArray(activity.images)) {
              imageArray = activity.images
            }
          }
          
          // Fallback to imageUrl if no images array
          if (imageArray.length === 0 && activity.imageUrl) {
            imageArray = [activity.imageUrl]
          }
          
          return imageArray.length > 0 ? (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <ImageIcon className="mr-2 h-6 w-6 text-orange-500" />
                  Album ảnh
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageArray.map((img: string, index: number) => (
                    <div 
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity group"
                    >
                      <img 
                        src={img} 
                        alt={`Hình ảnh ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback nếu ảnh lỗi
                          const target = e.target as HTMLImageElement
                          target.src = '/api/placeholder/400/400'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null
        })()}

        {/* Main Image - Only show if no video and no gallery */}
        {(() => {
          const hasGallery = activity.images && (
            typeof activity.images === 'string' 
              ? activity.images.trim() !== '' 
              : Array.isArray(activity.images) && activity.images.length > 0
          )
          return activity.imageUrl && !activity.videoUrl && !hasGallery ? (
            <Card className="mb-8">
              <CardContent className="p-0">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <img 
                    src={activity.imageUrl} 
                    alt={activity.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/api/placeholder/800/450'
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null
        })()}

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
