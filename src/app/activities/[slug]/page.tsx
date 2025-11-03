import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Clock, Users, Video, Image as ImageIcon, Share2, ArrowRight } from "lucide-react"
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

// Fetch related activities (other published activities)
async function getRelatedActivities(currentSlug: string) {
  try {
    const activities = await prisma.activity.findMany({
      where: {
        isPublished: true,
        slug: {
          not: currentSlug // Exclude current activity
        }
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 2, // Show only 2 related activities
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        imageUrl: true,
        images: true,
        videoUrl: true,
      },
    })
    return activities
  } catch (error) {
    console.error("Error fetching related activities:", error)
    return []
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

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60

export default async function ActivityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const activity = await getActivityBySlug(slug)
  
  if (!activity) {
    notFound()
  }
  
  // Fetch related activities
  const relatedActivities = await getRelatedActivities(slug)
  
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
            <Button variant="outline" className="mb-6 border-2 border-orange-500 bg-transparent text-orange-500 hover:bg-orange-50 font-semibold">
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
                  {imageArray.map((img: string, index: number) => {
                    // Normalize URL to absolute if it's a local upload
                    const imageUrl = img.startsWith("/uploads/") 
                      ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${img}`
                      : img
                    return (
                      <div 
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity group"
                      >
                        <SafeImage 
                          src={imageUrl} 
                          alt={`Hình ảnh ${index + 1}`}
                          className="w-full h-full object-cover"
                          placeholder="/api/placeholder/400/400"
                          unoptimized
                        />
                      </div>
                    )
                  })}
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
                <Button asChild size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-orange-500 px-8 py-3 font-semibold">
                  <Link href="/donate">
                    Quyên góp hỗ trợ
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Activities */}
        {relatedActivities.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Các chuyến đi khác</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedActivities.map((relatedActivity) => {
                // Parse images or use imageUrl
                let imageArray: string[] = []
                if (relatedActivity.images) {
                  if (typeof relatedActivity.images === 'string') {
                    try {
                      imageArray = JSON.parse(relatedActivity.images)
                    } catch {
                      imageArray = relatedActivity.images.split(',').map((s: string) => s.trim()).filter((s: string) => s)
                    }
                  } else if (Array.isArray(relatedActivity.images)) {
                    imageArray = relatedActivity.images
                  }
                }
                
                const displayImage = imageArray.length > 0 ? imageArray[0] : relatedActivity.imageUrl
                const description = relatedActivity.content?.replace(/<[^>]*>/g, "").substring(0, 100) + "..." || ""
                const hasVideo = !!relatedActivity.videoUrl
                
                return (
                  <Card key={relatedActivity.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    {/* Thumbnail */}
                    {displayImage ? (
                      <Link href={`/activities/${relatedActivity.slug}`}>
                        <div className="relative h-48 bg-gradient-to-br from-yellow-400 to-orange-500 overflow-hidden">
                          <SafeImage 
                            src={displayImage} 
                            alt={relatedActivity.title}
                            className="w-full h-full object-cover"
                            placeholder="/api/placeholder/400/300"
                            unoptimized
                          />
                        </div>
                      </Link>
                    ) : hasVideo ? (
                      <Link href={`/activities/${relatedActivity.slug}`}>
                        <div className="relative h-48 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                          <div className="bg-white rounded-full p-4">
                            <Video className="h-12 w-12 text-orange-500" />
                          </div>
                        </div>
                      </Link>
                    ) : null}
                    
                    <CardContent className="p-6">
                      <Link href={`/activities/${relatedActivity.slug}`}>
                        <h3 className="text-xl font-semibold mb-2 hover:text-orange-500 transition-colors">
                          {relatedActivity.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
                      <Button asChild variant="outline" size="sm" className="border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold">
                        <Link href={`/activities/${relatedActivity.slug}`}>
                          Xem chi tiết
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
