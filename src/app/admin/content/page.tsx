"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Eye, FileText, Image as ImageIcon, Settings, Upload, X, TrendingUp, Heart, Users, Share2, Search, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminContent() {
  const [siteContent, setSiteContent] = useState({
    // General
    siteTitle: "Mặt Trời Trên Bản",
    siteDescription: "Tổ chức thiện nguyện Mặt Trời Trên Bản - Chung tay hỗ trợ vùng cao, mang ánh sáng đến những nơi cần thiết",
    
    // Hero Section
    heroTitle: "Mặt Trời Trên Bản",
    heroSubtitle: "Mang ánh sáng và hy vọng đến những vùng cao xa xôi, nơi cần sự hỗ trợ và quan tâm nhất",
    heroBannerImage: "",
    heroButton1Text: "Quyên góp ngay",
    heroButton2Text: "Tìm hiểu thêm",
    
    // Stats Section
    stat1Number: "1,200+",
    stat1Label: "Người được hỗ trợ",
    stat2Number: "25+",
    stat2Label: "Bản làng được hỗ trợ",
    stat3Number: "500M+",
    stat3Label: "VND đã quyên góp",
    stat4Number: "50+",
    stat4Label: "Hoạt động thiện nguyện",
    
    // About Section
    aboutTitle: "Về chúng tôi",
    aboutSubtitle: "Câu chuyện của chúng tôi",
    aboutContent: "Tổ chức thiện nguyện Mặt Trời Trên Bản được thành lập với sứ mệnh mang ánh sáng và hy vọng đến những vùng cao xa xôi...",
    aboutVisionTitle: "Tầm nhìn",
    aboutVisionContent: "Trở thành tổ chức thiện nguyện hàng đầu trong việc hỗ trợ phát triển bền vững cho các vùng cao Việt Nam.",
    aboutMissionTitle: "Sứ mệnh",
    aboutMissionContent: "Mang đến cơ hội học tập, chăm sóc sức khỏe và phát triển kinh tế cho đồng bào vùng cao thông qua các hoạt động thiện nguyện minh bạch và hiệu quả.",
    
    // Activities Section
    activitiesTitle: "Chuyến đi thiện nguyện gần đây",
    activitiesSubtitle: "Cùng xem lại những khoảnh khắc đẹp và ý nghĩa từ các chuyến đi của chúng tôi",
    
    // Upcoming Trips Section
    upcomingTripsTitle: "Lịch trình các chuyến tiếp theo",
    upcomingTripsSubtitle: "Tham gia cùng chúng tôi trong những chuyến đi thiện nguyện sắp tới",
    
    // Donation Section
    donationTitle: "Cùng chúng tôi lan tỏa yêu thương",
    donationSubtitle: "Mỗi đóng góp của bạn sẽ mang đến hy vọng và cơ hội cho những người cần giúp đỡ",
    donationButtonText: "Quyên góp ngay",
    donationMethods: "Momo, Chuyển khoản, Tiền mặt",
    
    // Contact Section
    contactTitle: "Liên hệ với chúng tôi",
    contactSubtitle: "Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn",
    contactEmail: "info@mattroitrenban.vn",
    contactPhone: "+84 123 456 789",
    contactAddress: "123 Đường ABC, Phường XYZ, Quận 1, Thành phố Hồ Chí Minh",
    contactFormTitle: "Gửi tin nhắn",
    
    // Footer Section
    footerDescription: "Tổ chức thiện nguyện chuyên hỗ trợ vùng cao, mang ánh sáng và hy vọng đến những nơi cần thiết nhất. Cùng chúng tôi lan tỏa yêu thương.",
    footerCopyright: "© 2024 Mặt Trời Trên Bản. Tất cả quyền được bảo lưu.",
    
    // Social Media
    facebookUrl: "https://facebook.com/mattroitrenban",
    instagramUrl: "https://instagram.com/mattroitrenban",
    youtubeUrl: "https://youtube.com/@mattroitrenban",
    tiktokUrl: "",
    
    // SEO
    metaKeywords: "thiện nguyện, từ thiện, vùng cao, hỗ trợ, cộng đồng",
    metaAuthor: "Mặt Trời Trên Bản",
    ogTitle: "Mặt Trời Trên Bản - Tổ chức thiện nguyện",
    ogDescription: "Tổ chức thiện nguyện Mặt Trời Trên Bản - Chung tay hỗ trợ vùng cao",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/content")
      if (!response.ok) throw new Error("Failed to fetch content")
      const data = await response.json()
      
      // Merge with defaults
      setSiteContent((prev) => ({ ...prev, ...data }))
    } catch (err: any) {
      console.error("Error fetching content:", err)
      // Use defaults if fetch fails
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError("")
    
    try {
      // Save all content fields to database
      const updates = Object.entries(siteContent).map(async ([key, value]) => {
        const response = await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key,
            value,
            type: typeof value === "object" ? "json" : "text",
          }),
        })
        
        if (!response.ok) {
          throw new Error(`Failed to save ${key}`)
        }
      })
      
      await Promise.all(updates)
      alert("Nội dung đã được lưu thành công!")
    } catch (err: any) {
      console.error("Error saving content:", err)
      setSaveError(err.message || "Không thể lưu nội dung. Vui lòng thử lại.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (field: string, file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSiteContent({...siteContent, [field]: reader.result as string})
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Đang tải nội dung...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Nội dung</h2>
          <p className="text-gray-600">Chỉnh sửa tất cả nội dung trên website</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <a href="/" target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Xem trước
            </a>
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu tất cả
              </>
            )}
          </Button>
        </div>
      </div>

      {saveError && (
        <Alert variant="destructive">
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full">
            <TabsTrigger value="general">Chung</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="stats">Thống kê</TabsTrigger>
            <TabsTrigger value="about">Giới thiệu</TabsTrigger>
            <TabsTrigger value="activities">Hoạt động</TabsTrigger>
            <TabsTrigger value="donation">Quyên góp</TabsTrigger>
            <TabsTrigger value="contact">Liên hệ</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="social">Mạng xã hội</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>
        </div>

        {/* General Info */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Thông tin chung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteTitle">Tên website</Label>
                <Input
                  id="siteTitle"
                  value={siteContent.siteTitle}
                  onChange={(e) => setSiteContent({...siteContent, siteTitle: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="siteDescription">Mô tả website</Label>
                <Textarea
                  id="siteDescription"
                  value={siteContent.siteDescription}
                  onChange={(e) => setSiteContent({...siteContent, siteDescription: e.target.value})}
                  rows={3}
                  placeholder="Mô tả ngắn gọn về website..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Hero Section (Trang chủ)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="heroTitle">Tiêu đề chính</Label>
                <Input
                  id="heroTitle"
                  value={siteContent.heroTitle}
                  onChange={(e) => setSiteContent({...siteContent, heroTitle: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="heroSubtitle">Tiêu đề phụ / Mô tả</Label>
                <Textarea
                  id="heroSubtitle"
                  value={siteContent.heroSubtitle}
                  onChange={(e) => setSiteContent({...siteContent, heroSubtitle: e.target.value})}
                  rows={3}
                />
              </div>
              
              {/* Banner Image */}
              <div>
                <Label>Ảnh Banner Hero</Label>
                {siteContent.heroBannerImage ? (
                  <div className="relative mt-2">
                    <img 
                      src={siteContent.heroBannerImage} 
                      alt="Hero Banner" 
                      className="w-full h-64 object-cover rounded-lg border"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
                      onClick={() => setSiteContent({...siteContent, heroBannerImage: ""})}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mt-2 text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Chưa có banner</p>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="hero-banner-upload"
                      onChange={(e) => handleImageUpload("heroBannerImage", e.target.files?.[0] || null)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('hero-banner-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Banner
                    </Button>
                  </div>
                )}
                <Input
                  value={siteContent.heroBannerImage}
                  onChange={(e) => setSiteContent({...siteContent, heroBannerImage: e.target.value})}
                  placeholder="Hoặc nhập URL banner..."
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="heroButton1Text">Text nút 1</Label>
                  <Input
                    id="heroButton1Text"
                    value={siteContent.heroButton1Text}
                    onChange={(e) => setSiteContent({...siteContent, heroButton1Text: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="heroButton2Text">Text nút 2</Label>
                  <Input
                    id="heroButton2Text"
                    value={siteContent.heroButton2Text}
                    onChange={(e) => setSiteContent({...siteContent, heroButton2Text: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Section */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Section Thống kê
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stat1Number">Số liệu 1</Label>
                  <Input
                    id="stat1Number"
                    value={siteContent.stat1Number}
                    onChange={(e) => setSiteContent({...siteContent, stat1Number: e.target.value})}
                    placeholder="1,200+"
                  />
                  <Input
                    value={siteContent.stat1Label}
                    onChange={(e) => setSiteContent({...siteContent, stat1Label: e.target.value})}
                    placeholder="Người được hỗ trợ"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="stat2Number">Số liệu 2</Label>
                  <Input
                    id="stat2Number"
                    value={siteContent.stat2Number}
                    onChange={(e) => setSiteContent({...siteContent, stat2Number: e.target.value})}
                    placeholder="25+"
                  />
                  <Input
                    value={siteContent.stat2Label}
                    onChange={(e) => setSiteContent({...siteContent, stat2Label: e.target.value})}
                    placeholder="Bản làng được hỗ trợ"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="stat3Number">Số liệu 3</Label>
                  <Input
                    id="stat3Number"
                    value={siteContent.stat3Number}
                    onChange={(e) => setSiteContent({...siteContent, stat3Number: e.target.value})}
                    placeholder="500M+"
                  />
                  <Input
                    value={siteContent.stat3Label}
                    onChange={(e) => setSiteContent({...siteContent, stat3Label: e.target.value})}
                    placeholder="VND đã quyên góp"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="stat4Number">Số liệu 4</Label>
                  <Input
                    id="stat4Number"
                    value={siteContent.stat4Number}
                    onChange={(e) => setSiteContent({...siteContent, stat4Number: e.target.value})}
                    placeholder="50+"
                  />
                  <Input
                    value={siteContent.stat4Label}
                    onChange={(e) => setSiteContent({...siteContent, stat4Label: e.target.value})}
                    placeholder="Hoạt động thiện nguyện"
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Section */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Nội dung trang Giới thiệu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="aboutTitle">Tiêu đề chính</Label>
                <Input
                  id="aboutTitle"
                  value={siteContent.aboutTitle}
                  onChange={(e) => setSiteContent({...siteContent, aboutTitle: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="aboutSubtitle">Tiêu đề phụ</Label>
                <Input
                  id="aboutSubtitle"
                  value={siteContent.aboutSubtitle}
                  onChange={(e) => setSiteContent({...siteContent, aboutSubtitle: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="aboutContent">Nội dung giới thiệu</Label>
                <Textarea
                  id="aboutContent"
                  value={siteContent.aboutContent}
                  onChange={(e) => setSiteContent({...siteContent, aboutContent: e.target.value})}
                  rows={8}
                  placeholder="Nội dung chi tiết về tổ chức..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aboutVisionTitle">Tiêu đề Tầm nhìn</Label>
                  <Input
                    id="aboutVisionTitle"
                    value={siteContent.aboutVisionTitle}
                    onChange={(e) => setSiteContent({...siteContent, aboutVisionTitle: e.target.value})}
                  />
                  <Textarea
                    value={siteContent.aboutVisionContent}
                    onChange={(e) => setSiteContent({...siteContent, aboutVisionContent: e.target.value})}
                    rows={4}
                    placeholder="Nội dung tầm nhìn..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="aboutMissionTitle">Tiêu đề Sứ mệnh</Label>
                  <Input
                    id="aboutMissionTitle"
                    value={siteContent.aboutMissionTitle}
                    onChange={(e) => setSiteContent({...siteContent, aboutMissionTitle: e.target.value})}
                  />
                  <Textarea
                    value={siteContent.aboutMissionContent}
                    onChange={(e) => setSiteContent({...siteContent, aboutMissionContent: e.target.value})}
                    rows={4}
                    placeholder="Nội dung sứ mệnh..."
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Section */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                Section Hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="activitiesTitle">Tiêu đề Section Chuyến đi</Label>
                <Input
                  id="activitiesTitle"
                  value={siteContent.activitiesTitle}
                  onChange={(e) => setSiteContent({...siteContent, activitiesTitle: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="activitiesSubtitle">Mô tả Section Chuyến đi</Label>
                <Textarea
                  id="activitiesSubtitle"
                  value={siteContent.activitiesSubtitle}
                  onChange={(e) => setSiteContent({...siteContent, activitiesSubtitle: e.target.value})}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="upcomingTripsTitle">Tiêu đề Section Lịch trình</Label>
                <Input
                  id="upcomingTripsTitle"
                  value={siteContent.upcomingTripsTitle}
                  onChange={(e) => setSiteContent({...siteContent, upcomingTripsTitle: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="upcomingTripsSubtitle">Mô tả Section Lịch trình</Label>
                <Textarea
                  id="upcomingTripsSubtitle"
                  value={siteContent.upcomingTripsSubtitle}
                  onChange={(e) => setSiteContent({...siteContent, upcomingTripsSubtitle: e.target.value})}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donation Section */}
        <TabsContent value="donation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                Section Quyên góp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="donationTitle">Tiêu đề</Label>
                <Input
                  id="donationTitle"
                  value={siteContent.donationTitle}
                  onChange={(e) => setSiteContent({...siteContent, donationTitle: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="donationSubtitle">Mô tả</Label>
                <Textarea
                  id="donationSubtitle"
                  value={siteContent.donationSubtitle}
                  onChange={(e) => setSiteContent({...siteContent, donationSubtitle: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="donationButtonText">Text nút quyên góp</Label>
                <Input
                  id="donationButtonText"
                  value={siteContent.donationButtonText}
                  onChange={(e) => setSiteContent({...siteContent, donationButtonText: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="donationMethods">Phương thức quyên góp</Label>
                <Input
                  id="donationMethods"
                  value={siteContent.donationMethods}
                  onChange={(e) => setSiteContent({...siteContent, donationMethods: e.target.value})}
                  placeholder="Momo, Chuyển khoản, Tiền mặt"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Section */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Thông tin liên hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactTitle">Tiêu đề Section</Label>
                <Input
                  id="contactTitle"
                  value={siteContent.contactTitle}
                  onChange={(e) => setSiteContent({...siteContent, contactTitle: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="contactSubtitle">Mô tả Section</Label>
                <Textarea
                  id="contactSubtitle"
                  value={siteContent.contactSubtitle}
                  onChange={(e) => setSiteContent({...siteContent, contactSubtitle: e.target.value})}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={siteContent.contactEmail}
                    onChange={(e) => setSiteContent({...siteContent, contactEmail: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Số điện thoại</Label>
                  <Input
                    id="contactPhone"
                    value={siteContent.contactPhone}
                    onChange={(e) => setSiteContent({...siteContent, contactPhone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contactAddress">Địa chỉ</Label>
                <Textarea
                  id="contactAddress"
                  value={siteContent.contactAddress}
                  onChange={(e) => setSiteContent({...siteContent, contactAddress: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="contactFormTitle">Tiêu đề Form liên hệ</Label>
                <Input
                  id="contactFormTitle"
                  value={siteContent.contactFormTitle}
                  onChange={(e) => setSiteContent({...siteContent, contactFormTitle: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Section */}
        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Nội dung Footer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="footerDescription">Mô tả Footer</Label>
                <Textarea
                  id="footerDescription"
                  value={siteContent.footerDescription}
                  onChange={(e) => setSiteContent({...siteContent, footerDescription: e.target.value})}
                  rows={4}
                  placeholder="Mô tả ngắn gọn về tổ chức trong footer..."
                />
              </div>
              <div>
                <Label htmlFor="footerCopyright">Bản quyền</Label>
                <Input
                  id="footerCopyright"
                  value={siteContent.footerCopyright}
                  onChange={(e) => setSiteContent({...siteContent, footerCopyright: e.target.value})}
                  placeholder="© 2024 Mặt Trời Trên Bản. Tất cả quyền được bảo lưu."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="mr-2 h-5 w-5" />
                Mạng xã hội
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facebookUrl">Facebook URL</Label>
                <Input
                  id="facebookUrl"
                  value={siteContent.facebookUrl}
                  onChange={(e) => setSiteContent({...siteContent, facebookUrl: e.target.value})}
                  placeholder="https://facebook.com/mattroitrenban"
                />
              </div>
              <div>
                <Label htmlFor="instagramUrl">Instagram URL</Label>
                <Input
                  id="instagramUrl"
                  value={siteContent.instagramUrl}
                  onChange={(e) => setSiteContent({...siteContent, instagramUrl: e.target.value})}
                  placeholder="https://instagram.com/mattroitrenban"
                />
              </div>
              <div>
                <Label htmlFor="youtubeUrl">YouTube URL</Label>
                <Input
                  id="youtubeUrl"
                  value={siteContent.youtubeUrl}
                  onChange={(e) => setSiteContent({...siteContent, youtubeUrl: e.target.value})}
                  placeholder="https://youtube.com/@mattroitrenban"
                />
              </div>
              <div>
                <Label htmlFor="tiktokUrl">TikTok URL</Label>
                <Input
                  id="tiktokUrl"
                  value={siteContent.tiktokUrl}
                  onChange={(e) => setSiteContent({...siteContent, tiktokUrl: e.target.value})}
                  placeholder="https://tiktok.com/@mattroitrenban"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                SEO & Meta Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaKeywords">Keywords (phân cách bằng dấu phẩy)</Label>
                <Input
                  id="metaKeywords"
                  value={siteContent.metaKeywords}
                  onChange={(e) => setSiteContent({...siteContent, metaKeywords: e.target.value})}
                  placeholder="thiện nguyện, từ thiện, vùng cao"
                />
              </div>
              <div>
                <Label htmlFor="metaAuthor">Tác giả / Người tạo</Label>
                <Input
                  id="metaAuthor"
                  value={siteContent.metaAuthor}
                  onChange={(e) => setSiteContent({...siteContent, metaAuthor: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="ogTitle">Open Graph Title</Label>
                <Input
                  id="ogTitle"
                  value={siteContent.ogTitle}
                  onChange={(e) => setSiteContent({...siteContent, ogTitle: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="ogDescription">Open Graph Description</Label>
                <Textarea
                  id="ogDescription"
                  value={siteContent.ogDescription}
                  onChange={(e) => setSiteContent({...siteContent, ogDescription: e.target.value})}
                  rows={3}
                  placeholder="Mô tả khi chia sẻ lên mạng xã hội..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}