"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Calendar, MapPin, Users, ArrowRight, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

// Import utility function (sẽ sử dụng khi tích hợp database)
// Hiện tại activities đã có slug sẵn trong data

export default function Activities() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch activities from API (only published)
  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/activities?published=true")
      if (!response.ok) throw new Error("Failed to fetch activities")
      const data = await response.json()
      setActivities(data)
    } catch (err) {
      console.error("Error fetching activities:", err)
      // Fallback to empty array if API fails
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.content?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Tất cả" || activity.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["Tất cả", "Giáo dục", "Y tế", "Cơ sở hạ tầng", "Phát triển kinh tế"]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-poppins">
              Hoạt động thiện nguyện
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Cùng xem những hoạt động ý nghĩa mà chúng tôi đã và đang thực hiện 
              để mang ánh sáng đến những vùng cao xa xôi
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm hoạt động..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-gray-500">Đang tải...</span>
              </div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy hoạt động nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredActivities.map((activity) => (
                <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/activities/${activity.slug}`}>
                    <div className="h-48 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center cursor-pointer">
                      <Heart className="h-16 w-16 text-white" />
                    </div>
                  </Link>
                  <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-600">
                      {activity.category || "Khác"}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {activity.tripDate 
                        ? new Date(activity.tripDate).toLocaleDateString("vi-VN")
                        : activity.createdAt 
                        ? new Date(activity.createdAt).toLocaleDateString("vi-VN")
                        : ""}
                    </span>
                  </div>
                  <Link href={`/activities/${activity.slug}`}>
                    <CardTitle className="text-lg line-clamp-2 hover:text-orange-500 transition-colors cursor-pointer">
                      {activity.title}
                    </CardTitle>
                  </Link>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {activity.content 
                      ? activity.content.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
                      : "Không có mô tả"}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    {activity.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{activity.location}</span>
                      </div>
                    )}
                    {activity.volunteerCount && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{activity.volunteerCount} tình nguyện viên</span>
                      </div>
                    )}
                  </div>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/activities/${activity.slug}`}>
                        Xem chi tiết
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
              Xem thêm hoạt động
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Thành tựu của chúng tôi
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những con số biết nói về sự cống hiến và tác động tích cực của chúng tôi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">100+</h3>
              <p className="text-gray-600">Hoạt động thiện nguyện</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">5,000+</h3>
              <p className="text-gray-600">Người được hỗ trợ</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">50+</h3>
              <p className="text-gray-600">Bản làng được hỗ trợ</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-red-400 to-orange-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">4</h3>
              <p className="text-gray-600">Năm hoạt động</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-poppins">
            Cùng chúng tôi tạo nên những hoạt động ý nghĩa
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Mỗi đóng góp của bạn sẽ giúp chúng tôi thực hiện thêm nhiều hoạt động thiện nguyện
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
