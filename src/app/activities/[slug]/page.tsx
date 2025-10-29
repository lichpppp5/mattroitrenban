import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Clock, Users, Video, Image as ImageIcon, Share2 } from "lucide-react"
import { ShareButtons } from "@/components/share-buttons"
import { SafeImage } from "@/components/safe-image"

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
              {formatDate(activity.tripDate.toString())}
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
                      <SafeImage 
                        src={img} 
                        alt={`Hình ảnh ${index + 1}`}
                        className="w-full h-full object-cover"
                        placeholder="/api/placeholder/400/400"
                        unoptimized
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
              let hasGallery = false
              if (activity.images) {
                if (typeof activity.images === 'string') {
                  hasGallery = activity.images.trim() !== ''
                } else if (Array.isArray(activity.images)) {
                  hasGallery = (activity.images as string[]).length > 0
                }
              }
              return activity.imageUrl && !activity.videoUrl && !hasGallery ? (
            <Card className="mb-8">
              <CardContent className="p-0">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <SafeImage 
                    src={activity.imageUrl} 
                    alt={activity.title}
                    className="w-full h-full object-cover"
                    placeholder="/api/placeholder/800/450"
                    unoptimized
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
              dangerouslySetInnerHTML={{ __html: activity.content || "" }}
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
