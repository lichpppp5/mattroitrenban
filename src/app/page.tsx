import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, DollarSign, MapPin, ArrowRight, Star, Calendar, Clock, Video, Image as ImageIcon, Play } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { SafeImage } from "@/components/safe-image"

async function getRecentActivities() {
  try {
    // Fetch activities - chỉ cần published, không filter isUpcoming
    // Vì có thể có activities vừa published vừa có thể là upcoming
    const activities = await prisma.activity.findMany({
      where: {
        isPublished: true,
        // Remove isUpcoming filter - show all published activities as recent
        // Only exclude if explicitly marked as upcoming for the "upcoming trips" section
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
        isUpcoming: true, // Add this to check later
      },
    })
    
    // Filter out upcoming trips from recent activities (they show in separate section)
    const recentOnly = activities.filter(a => !a.isUpcoming)
    
    console.log(`[Home] Fetched ${activities.length} total published activities, ${recentOnly.length} recent (non-upcoming)`)
    
    // If no recent-only activities, show all published (including upcoming) but limit to 6
    if (recentOnly.length === 0 && activities.length > 0) {
      console.log(`[Home] No non-upcoming activities, showing all published instead`)
      return activities.slice(0, 6) || []
    }
    
    return recentOnly || []
  } catch (error) {
    console.error("Error fetching recent activities:", error)
    // Return empty array on error to prevent page crash
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
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        images: true,
        location: true,
        tripDate: true,
        duration: true,
        volunteerCount: true,
        isUpcoming: true,
      },
    })
    
    return trips || []
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

    // Prioritize site.banner from Settings over heroBannerImage from Content
    const bannerImage = contentMap["site.banner"] || contentMap["heroBannerImage"] || null
    
    return {
      heroTitle: contentMap["heroTitle"] || "Mặt Trời Trên Bản",
      heroSubtitle: contentMap["heroSubtitle"] || "Mang ánh sáng và hy vọng đến những vùng cao xa xôi, nơi cần sự hỗ trợ và quan tâm nhất",
      heroBannerImage: bannerImage,
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
      aboutSubtitle: contentMap["aboutSubtitle"] || "Mặt Trời Trên Bản là một tổ chức thiện nguyện được thành lập với mục tiêu mang ánh sáng và hy vọng đến những vùng cao xa xôi.",
      aboutDescription: contentMap["aboutDescription"] || "Chúng tôi tin rằng mỗi người đều có quyền được tiếp cận với giáo dục, y tế và các dịch vụ cơ bản. Với sự hỗ trợ của các tình nguyện viên và nhà tài trợ, chúng tôi đã và đang thực hiện nhiều hoạt động ý nghĩa.",
      aboutButtonText: contentMap["aboutButtonText"] || "Xem thêm về chúng tôi",
      activitiesTitle: contentMap["activitiesTitle"] || "Hoạt động nổi bật",
      activitiesSubtitle: contentMap["activitiesSubtitle"] || "Cùng xem những hoạt động ý nghĩa mà chúng tôi đã và đang thực hiện",
      activitiesButtonText: contentMap["activitiesButtonText"] || "Xem tất cả hoạt động",
      upcomingTitle: contentMap["upcomingTitle"] || "Chuyến đi sắp tới",
      upcomingSubtitle: contentMap["upcomingSubtitle"] || "Tham gia cùng chúng tôi trong những chuyến đi sắp tới",
      donationTitle: contentMap["donationTitle"] || "Chung tay quyên góp",
      donationSubtitle: contentMap["donationSubtitle"] || "Mỗi đóng góp của bạn đều có ý nghĩa và tạo nên sự khác biệt",
      donationButtonText: contentMap["donationButtonText"] || "Quyên góp ngay",
    }
  } catch (error) {
    console.error("Error fetching site content:", error)
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
      aboutSubtitle: "Mặt Trời Trên Bản là một tổ chức thiện nguyện được thành lập với mục tiêu mang ánh sáng và hy vọng đến những vùng cao xa xôi.",
      aboutDescription: "Chúng tôi tin rằng mỗi người đều có quyền được tiếp cận với giáo dục, y tế và các dịch vụ cơ bản. Với sự hỗ trợ của các tình nguyện viên và nhà tài trợ, chúng tôi đã và đang thực hiện nhiều hoạt động ý nghĩa.",
      aboutButtonText: "Xem thêm về chúng tôi",
      activitiesTitle: "Hoạt động nổi bật",
      activitiesSubtitle: "Cùng xem những hoạt động ý nghĩa mà chúng tôi đã và đang thực hiện",
      activitiesButtonText: "Xem tất cả hoạt động",
      upcomingTitle: "Chuyến đi sắp tới",
      upcomingSubtitle: "Tham gia cùng chúng tôi trong những chuyến đi sắp tới",
      donationTitle: "Chung tay quyên góp",
      donationSubtitle: "Mỗi đóng góp của bạn đều có ý nghĩa và tạo nên sự khác biệt",
      donationButtonText: "Quyên góp ngay",
    }
  }
}

// Enable ISR for homepage - revalidate every 60 seconds
export const revalidate = 60

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
  // Đảm bảo không có filter, opacity, hoặc brightness làm tối ảnh
  const heroStyle: React.CSSProperties = safeBannerUrl ? {
    backgroundImage: `url(${safeBannerUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    // Loại bỏ tất cả filter có thể làm tối ảnh
    filter: 'none',
    WebkitFilter: 'none',
    // Đảm bảo opacity và brightness ở mức tối đa
    opacity: 1,
    // Không có overlay, không có darkening
  } : {}
  
  return (
    <div className="min-h-screen">
      {/* Hero Section - Không có overlay, ảnh hiển thị sáng */}
      <section 
        className={heroClassName}
        style={heroStyle}
      >
        {/* Không có overlay div - đã xóa hoàn toàn để ảnh sáng */}
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
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
                {siteContent.aboutTitle}
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                {siteContent.aboutSubtitle}
              </p>
              <p className="text-gray-600 mb-8">
                {siteContent.aboutDescription}
              </p>
              <Button asChild variant="outline" className="border-2 border-orange-500 bg-transparent text-orange-500 hover:bg-orange-50 font-semibold">
                <Link href="/about">
                  {siteContent.aboutButtonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">15+</div>
                  <div className="text-sm opacity-90">Năm kinh nghiệm</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">50+</div>
                  <div className="text-sm opacity-90">Hoạt động</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">1,200+</div>
                  <div className="text-sm opacity-90">Người được hỗ trợ</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">25+</div>
                  <div className="text-sm opacity-90">Bản làng</div>
                </div>
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
              {siteContent.activitiesTitle}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {siteContent.activitiesSubtitle}
            </p>
          </div>

          {recentActivities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {recentActivities.map((activity) => {
                // Normalize image URL to absolute if it's a local upload
                // Support both /uploads/ (legacy) and /media/ (new)
                const imageArray = activity.images ? (typeof activity.images === 'string' ? JSON.parse(activity.images) : activity.images) : []
                const mainImage = activity.imageUrl || (imageArray.length > 0 ? imageArray[0] : null)
                
                return (
                  <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {mainImage && (
                      <div className="relative h-64 bg-gradient-to-br from-yellow-400 to-orange-500">
                        {/* Normalize URL to absolute if it's a local upload */}
                        {/* Support both /uploads/ (legacy) and /media/ (new) */}
                        {(() => {
                          const imageUrl = (mainImage.startsWith("/uploads/") || mainImage.startsWith("/media/"))
                            ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${mainImage}`
                            : mainImage
                          return (
                            <SafeImage
                              src={imageUrl}
                              alt={activity.title}
                              className="w-full h-full object-cover"
                              placeholder="/api/placeholder/800/450"
                              unoptimized
                            />
                          )
                        })()}
                        {activity.videoUrl && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="bg-white rounded-full p-4 cursor-pointer hover:scale-110 transition-transform">
                              <Play className="h-8 w-8 text-orange-500" />
                            </div>
                          </div>
                        )}
                        {activity.isUpcoming && (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center absolute top-2 left-2">
                            <Calendar className="h-4 w-4 mr-1" />
                            Sắp diễn ra
                          </span>
                        )}
                        {activity.category && (
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center absolute top-2 right-2">
                            {activity.category}
                          </span>
                        )}
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {activity.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {activity.content || "Không có mô tả"}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        {activity.location && (
                          <>
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="mr-4">{activity.location}</span>
                          </>
                        )}
                        {activity.tripDate && (
                          <>
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{new Date(activity.tripDate).toLocaleDateString('vi-VN')}</span>
                          </>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="w-full border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold">
                        <Link href={`/activities/${activity.slug}`} className="flex items-center justify-center">
                          Xem chi tiết
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">Chưa có hoạt động nào được đăng.</p>
              <p className="text-gray-500">Vui lòng quay lại sau để xem các hoạt động của chúng tôi.</p>
            </div>
          )}

          <div className="text-center">
            <Button asChild variant="outline" className="border-2 border-orange-500 bg-transparent text-orange-500 hover:bg-orange-50 font-semibold">
              <Link href="/activities">
                {siteContent.activitiesButtonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Trips */}
      {upcomingTrips.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
                {siteContent.upcomingTitle}
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                {siteContent.upcomingSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingTrips.map((trip) => {
                // Get first image from images array or use imageUrl
                const imageArray = trip.images ? (typeof trip.images === 'string' ? JSON.parse(trip.images) : trip.images) : []
                const tripImage = trip.imageUrl || (imageArray.length > 0 ? imageArray[0] : null)
                
                return (
                  <Card key={trip.id} className="bg-white border-2 border-orange-200 hover:border-orange-400 transition-colors overflow-hidden">
                    {tripImage && (
                      <div className="relative h-48 bg-gradient-to-br from-yellow-400 to-orange-500">
                        {(() => {
                          const imageUrl = (tripImage.startsWith("/uploads/") || tripImage.startsWith("/media/"))
                            ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${tripImage}`
                            : tripImage
                          return (
                            <SafeImage
                              src={imageUrl}
                              alt={trip.title}
                              className="w-full h-full object-cover"
                              placeholder="/api/placeholder/800/450"
                              unoptimized
                            />
                          )
                        })()}
                        {trip.isUpcoming && (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold absolute top-2 right-2">
                            Sắp diễn ra
                          </span>
                        )}
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-orange-100 rounded-full p-2">
                            <Calendar className="h-5 w-5 text-orange-500" />
                          </div>
                          <span className="ml-3 text-gray-700 font-medium">
                            {trip.tripDate ? new Date(trip.tripDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                          </span>
                        </div>
                        {!tripImage && trip.isUpcoming && (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Sắp diễn ra
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {trip.title}
                      </h3>
                      {trip.location && (
                        <p className="text-gray-600 text-sm mb-4 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {trip.location}
                        </p>
                      )}
                      <div className="flex justify-between items-center text-gray-700 text-sm mb-4">
                        {trip.duration && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{trip.duration} ngày</span>
                          </div>
                        )}
                        {trip.volunteerCount && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{trip.volunteerCount} TNV</span>
                          </div>
                        )}
                      </div>
                      <Button asChild variant="outline" className="w-full border-2 border-orange-500 bg-transparent text-orange-500 hover:bg-orange-50 font-semibold">
                        <Link href={`/activities/${trip.slug}`}>
                          Xem chi tiết
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            <div className="text-center mt-12">
              <Button asChild variant="outline" className="border-2 border-orange-500 bg-transparent text-orange-500 hover:bg-orange-50 font-semibold">
                <Link href="/activities?upcoming=true">
                  {siteContent.upcomingTripButtonText || "Xem tất cả chuyến đi"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Donation CTA */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-poppins">
            {siteContent.donationTitle}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            {siteContent.donationSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white">
              <Link href="/donate">
                {siteContent.donationButtonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white text-orange-500 hover:bg-gray-50 px-8 py-3">
              <Link href="/transparency">
                Xem minh bạch tài chính
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-orange-500 px-8 py-3 font-semibold">
              <Link href="/about">
                Tìm hiểu thêm
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
