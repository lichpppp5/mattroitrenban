import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, DollarSign, MapPin, ArrowRight, Star, Calendar, Clock, Video, Image as ImageIcon, Play } from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getRecentActivities() {
  try {
    const activities = await prisma.activity.findMany({
      where: {
        isPublished: true,
        isUpcoming: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        images: true,
        videoUrl: true,
        content: true,
        category: true,
        location: true,
        tripDate: true,
        createdAt: true,
      },
    })
    return activities
  } catch (error) {
    console.error("Error fetching recent activities:", error)
    return []
  }
}

async function getUpcomingTrips() {
  try {
    const trips = await prisma.activity.findMany({
      where: {
        isPublished: true,
        isUpcoming: true,
      },
      orderBy: {
        tripDate: "asc",
      },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        tripDate: true,
        duration: true,
        volunteerCount: true,
        category: true,
      },
    })
    return trips
  } catch (error) {
    console.error("Error fetching upcoming trips:", error)
    return []
  }
}

async function getSiteContent() {
  try {
    const contents = await prisma.siteContent.findMany({
      orderBy: { key: "asc" },
    })
    
    const contentMap: Record<string, any> = {}
    contents.forEach((item) => {
      contentMap[item.key] = item.type === "json" 
        ? JSON.parse(item.value) 
        : item.value
    })
    
    // Return với defaults nếu không có trong database
    return {
      heroTitle: contentMap["heroTitle"] || "Mặt Trời Trên Bản",
      heroSubtitle: contentMap["heroSubtitle"] || "Mang ánh sáng và hy vọng đến những vùng cao xa xôi, nơi cần sự hỗ trợ và quan tâm nhất",
      heroBannerImage: contentMap["heroBannerImage"] || null,
      heroButton1Text: contentMap["heroButton1Text"] || "Quyên góp ngay",
      heroButton2Text: contentMap["heroButton2Text"] || "Tìm hiểu thêm",
      stat1Number: contentMap["stat1Number"] || "1,200+",
      stat1Label: contentMap["stat1Label"] || "Người được hỗ trợ",
      stat2Number: contentMap["stat2Number"] || "25+",
      stat2Label: contentMap["stat2Label"] || "Bản làng được hỗ trợ",
      stat3Number: contentMap["stat3Number"] || "500M+",
      stat3Label: contentMap["stat3Label"] || "VND đã quyên góp",
      stat4Number: contentMap["stat4Number"] || "50+",
      stat4Label: contentMap["stat4Label"] || "Hoạt động thiện nguyện",
      aboutTitle: contentMap["aboutTitle"] || "Về chúng tôi",
      aboutSubtitle: contentMap["aboutSubtitle"] || "Câu chuyện của chúng tôi",
      aboutContent: contentMap["aboutContent"] || "",
      aboutVisionTitle: contentMap["aboutVisionTitle"] || "Tầm nhìn",
      aboutVisionContent: contentMap["aboutVisionContent"] || "Trở thành tổ chức thiện nguyện hàng đầu trong việc hỗ trợ phát triển bền vững cho các vùng cao Việt Nam.",
      aboutMissionTitle: contentMap["aboutMissionTitle"] || "Sứ mệnh",
      aboutMissionContent: contentMap["aboutMissionContent"] || "Mang đến cơ hội học tập, chăm sóc sức khỏe và phát triển kinh tế cho đồng bào vùng cao thông qua các hoạt động thiện nguyện minh bạch và hiệu quả.",
      activitiesTitle: contentMap["activitiesTitle"] || "Chuyến đi thiện nguyện gần đây",
      activitiesSubtitle: contentMap["activitiesSubtitle"] || "Cùng xem lại những khoảnh khắc đẹp và ý nghĩa từ các chuyến đi của chúng tôi",
      upcomingTripsTitle: contentMap["upcomingTripsTitle"] || "Lịch trình các chuyến tiếp theo",
      upcomingTripsSubtitle: contentMap["upcomingTripsSubtitle"] || "Tham gia cùng chúng tôi trong những chuyến đi thiện nguyện sắp tới",
      donationTitle: contentMap["donationTitle"] || "Cùng chúng tôi lan tỏa yêu thương",
      donationSubtitle: contentMap["donationSubtitle"] || "Mỗi đóng góp của bạn sẽ mang đến hy vọng và cơ hội cho những người cần giúp đỡ",
      donationButtonText: contentMap["donationButtonText"] || "Quyên góp ngay",
    }
  } catch (error) {
    console.error("Error fetching site content:", error)
    // Return defaults on error
    return {
      heroTitle: "Mặt Trời Trên Bản",
      heroSubtitle: "Mang ánh sáng và hy vọng đến những vùng cao xa xôi, nơi cần sự hỗ trợ và quan tâm nhất",
      heroBannerImage: null,
      heroButton1Text: "Quyên góp ngay",
      heroButton2Text: "Tìm hiểu thêm",
      stat1Number: "1,200+",
      stat1Label: "Người được hỗ trợ",
      stat2Number: "25+",
      stat2Label: "Bản làng được hỗ trợ",
      stat3Number: "500M+",
      stat3Label: "VND đã quyên góp",
      stat4Number: "50+",
      stat4Label: "Hoạt động thiện nguyện",
      aboutTitle: "Về chúng tôi",
      aboutSubtitle: "Câu chuyện của chúng tôi",
      aboutContent: "",
      aboutVisionTitle: "Tầm nhìn",
      aboutVisionContent: "Trở thành tổ chức thiện nguyện hàng đầu trong việc hỗ trợ phát triển bền vững cho các vùng cao Việt Nam.",
      aboutMissionTitle: "Sứ mệnh",
      aboutMissionContent: "Mang đến cơ hội học tập, chăm sóc sức khỏe và phát triển kinh tế cho đồng bào vùng cao thông qua các hoạt động thiện nguyện minh bạch và hiệu quả.",
      activitiesTitle: "Chuyến đi thiện nguyện gần đây",
      activitiesSubtitle: "Cùng xem lại những khoảnh khắc đẹp và ý nghĩa từ các chuyến đi của chúng tôi",
      upcomingTripsTitle: "Lịch trình các chuyến tiếp theo",
      upcomingTripsSubtitle: "Tham gia cùng chúng tôi trong những chuyến đi thiện nguyện sắp tới",
      donationTitle: "Cùng chúng tôi lan tỏa yêu thương",
      donationSubtitle: "Mỗi đóng góp của bạn sẽ mang đến hy vọng và cơ hội cho những người cần giúp đỡ",
      donationButtonText: "Quyên góp ngay",
    }
  }
}

export default async function Home() {
  const recentActivities = await getRecentActivities()
  const upcomingTrips = await getUpcomingTrips()
  const siteContent = await getSiteContent()
  
  // Đảm bảo heroBannerImage luôn là string hoặc null để tránh hydration mismatch
  const safeBannerUrl = siteContent.heroBannerImage && typeof siteContent.heroBannerImage === 'string' && siteContent.heroBannerImage.trim() !== '' ? siteContent.heroBannerImage : null
  
  // Tính toán className một cách deterministic - luôn có cùng số lượng classes
  const heroClassName = safeBannerUrl 
    ? "relative py-20" 
    : "relative py-20 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50"
  
  // Style object phải luôn là object, không bao giờ undefined
  const heroStyle: React.CSSProperties = safeBannerUrl ? {
    backgroundImage: `url(${safeBannerUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {}
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className={heroClassName}
        style={heroStyle}
      >
        {safeBannerUrl ? (
          <div className="absolute inset-0 bg-black/20" />
        ) : null}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4">
                <Heart className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-poppins">
              {siteContent.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              {siteContent.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-8 py-3">
                <Link href="/donate">
                  {siteContent.heroButton1Text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-orange-500 bg-transparent text-orange-500 hover:bg-orange-50 px-8 py-3 font-semibold">
                <Link href="/about">
                  {siteContent.heroButton2Text}
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
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{siteContent.stat1Number}</h3>
              <p className="text-gray-600">{siteContent.stat1Label}</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{siteContent.stat2Number}</h3>
              <p className="text-gray-600">{siteContent.stat2Label}</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{siteContent.stat3Number}</h3>
              <p className="text-gray-600">{siteContent.stat3Label}</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{siteContent.stat4Number}</h3>
              <p className="text-gray-600">{siteContent.stat4Label}</p>
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
                {siteContent.aboutSubtitle}
              </h2>
              {siteContent.aboutContent ? (
                <div className="text-lg text-gray-700 mb-8 whitespace-pre-line">
                  {siteContent.aboutContent}
                </div>
              ) : (
                <>
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
                </>
              )}
              <Button asChild variant="outline" className="border-2 border-orange-500 bg-transparent text-orange-500 hover:bg-orange-50 font-semibold">
                <Link href="/about">
                  Đọc thêm câu chuyện
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">{siteContent.aboutVisionTitle}</h3>
                <p className="text-lg mb-6">
                  {siteContent.aboutVisionContent}
                </p>
                <h3 className="text-2xl font-bold mb-4">{siteContent.aboutMissionTitle}</h3>
                <p className="text-lg">
                  {siteContent.aboutMissionContent}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chuyến đi thiện nguyện gần đây */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              {siteContent.activitiesTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {siteContent.activitiesSubtitle}
            </p>
          </div>
          {recentActivities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có hoạt động nào được đăng tải</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentActivities.map((activity) => {
                // Parse images if exists
                let imageArray: string[] = []
                if (activity.images) {
                  try {
                    imageArray = typeof activity.images === 'string' 
                      ? JSON.parse(activity.images) 
                      : Array.isArray(activity.images) 
                      ? activity.images 
                      : []
                  } catch {
                    imageArray = []
                  }
                }
                const hasImage = activity.imageUrl || imageArray.length > 0
                const hasVideo = !!activity.videoUrl
                // Format date in a consistent way to avoid hydration mismatch
                const dateStr = activity.tripDate 
                  ? new Date(activity.tripDate).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit"
                    })
                  : activity.createdAt
                  ? new Date(activity.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit"
                    })
                  : ""
                
                return (
                  <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/activities/${activity.slug}`}>
                      <div className="relative h-64 bg-gradient-to-br from-yellow-400 to-orange-500">
                        {hasImage ? (
                          <img 
                            src={activity.imageUrl || imageArray[0]} 
                            alt={activity.title}
                            className="w-full h-full object-cover"
                          />
                        ) : hasVideo ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white rounded-full p-4 cursor-pointer hover:scale-110 transition-transform">
                              <Play className="h-12 w-12 text-orange-500 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        ) : imageArray.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 p-4 w-full h-full">
                            {imageArray.slice(0, 3).map((img, idx) => (
                              <div key={idx} className="bg-white/20 rounded overflow-hidden">
                                <img src={img} alt={`${activity.title} ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {imageArray.length > 3 && (
                              <div className="bg-white/20 rounded flex items-center justify-center">
                                <span className="text-white font-bold">+{imageArray.length - 3}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="h-16 w-16 text-white" />
                          </div>
                        )}
                        {hasVideo && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                              <Video className="h-4 w-4 mr-1" />
                              VIDEO
                            </span>
                          </div>
                        )}
                        {!hasImage && !hasVideo && imageArray.length === 0 && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                              <ImageIcon className="h-4 w-4 mr-1" />
                              HÌNH ẢNH
                            </span>
                          </div>
                        )}
                        {dateStr && (
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-white font-semibold">{dateStr}</p>
                          </div>
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {activity.content 
                          ? activity.content.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
                          : "Không có mô tả"}
                      </p>
                      {activity.location && (
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <MapPin className="h-4 w-4 mr-1" />
                          {activity.location}
                        </div>
                      )}
                      <Link href={`/activities/${activity.slug}`}>
                        <Button variant="outline" size="sm" className="w-full border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold">
                          {hasVideo ? "Xem video đầy đủ" : imageArray.length > 0 ? "Xem album đầy đủ" : "Xem chi tiết"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-2 border-orange-500 bg-transparent text-orange-500 hover:bg-orange-50 font-semibold">
              <Link href="/activities">
                Xem tất cả chuyến đi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Lịch trình các chuyến tiếp theo */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              {siteContent.upcomingTripsTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {siteContent.upcomingTripsSubtitle}
            </p>
          </div>
          {upcomingTrips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có chuyến đi sắp tới nào được lên lịch</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTrips.map((trip) => {
                const dateStr = trip.tripDate 
                  ? new Date(trip.tripDate).toLocaleDateString("vi-VN", { 
                      year: "numeric", 
                      month: "2-digit", 
                      day: "2-digit" 
                    })
                  : "Chưa xác định"
                const weekdayStr = trip.tripDate
                  ? new Date(trip.tripDate).toLocaleDateString("vi-VN", { weekday: 'long' })
                  : ""
                
                return (
                  <Card key={trip.id} className="bg-white border-2 border-orange-200 hover:border-orange-400 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="bg-orange-100 rounded-full p-2">
                            <Calendar className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{dateStr}</p>
                            {weekdayStr && (
                              <p className="text-sm text-gray-500">{weekdayStr}</p>
                            )}
                          </div>
                        </div>
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Sắp diễn ra
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900">
                        {trip.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {trip.category} tại {trip.location || "chưa xác định"}.
                      </p>
                      <div className="space-y-2 mb-4">
                        {trip.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                            {trip.location}
                          </div>
                        )}
                        {trip.duration && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-orange-500" />
                            {trip.duration} ngày
                          </div>
                        )}
                        {trip.volunteerCount && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2 text-orange-500" />
                            {trip.volunteerCount} tình nguyện viên
                          </div>
                        )}
                      </div>
                      <Button asChild variant="outline" className="w-full border-2 border-orange-500 bg-transparent text-orange-500 hover:bg-orange-50 font-semibold">
                        <Link href={`/activities/${trip.slug}`}>
                          Tìm hiểu thêm
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white">
              <Link href="/activities">
                Xem tất cả lịch trình
                <Calendar className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-poppins">
            {siteContent.donationTitle}
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            {siteContent.donationSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-orange-500 hover:bg-gray-50 px-8 py-3">
              <Link href="/donate">
                {siteContent.donationButtonText}
                <Heart className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-orange-500 px-8 py-3 font-semibold">
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
