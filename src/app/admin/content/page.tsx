"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Eye, FileText, Image as ImageIcon, Settings } from "lucide-react"

export default function AdminContent() {
  const [siteContent, setSiteContent] = useState({
    siteTitle: "Mặt Trời Trên Bản",
    siteDescription: "Tổ chức thiện nguyện Mặt Trời Trên Bản - Chung tay hỗ trợ vùng cao, mang ánh sáng đến những nơi cần thiết",
    heroTitle: "Mặt Trời Trên Bản",
    heroSubtitle: "Mang ánh sáng và hy vọng đến những vùng cao xa xôi, nơi cần sự hỗ trợ và quan tâm nhất",
    aboutTitle: "Về chúng tôi",
    aboutContent: "Tổ chức thiện nguyện Mặt Trời Trên Bản được thành lập với sứ mệnh mang ánh sáng và hy vọng đến những vùng cao xa xôi...",
    contactEmail: "info@mattroitrendb.org",
    contactPhone: "+84 123 456 789",
    contactAddress: "123 Đường ABC, Phường XYZ, Quận 1, Thành phố Hồ Chí Minh",
  })

  const handleSave = () => {
    // Save logic here
    console.log("Saving content:", siteContent)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Nội dung</h2>
          <p className="text-gray-600">Chỉnh sửa nội dung website</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Xem trước
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
            <Save className="mr-2 h-4 w-4" />
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Thông tin chung</TabsTrigger>
          <TabsTrigger value="homepage">Trang chủ</TabsTrigger>
          <TabsTrigger value="about">Giới thiệu</TabsTrigger>
          <TabsTrigger value="contact">Liên hệ</TabsTrigger>
        </TabsList>

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
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Homepage */}
        <TabsContent value="homepage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Nội dung trang chủ
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
                <Label htmlFor="heroSubtitle">Tiêu đề phụ</Label>
                <Textarea
                  id="heroSubtitle"
                  value={siteContent.heroSubtitle}
                  onChange={(e) => setSiteContent({...siteContent, heroSubtitle: e.target.value})}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Nội dung trang giới thiệu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="aboutTitle">Tiêu đề trang giới thiệu</Label>
                <Input
                  id="aboutTitle"
                  value={siteContent.aboutTitle}
                  onChange={(e) => setSiteContent({...siteContent, aboutTitle: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="aboutContent">Nội dung giới thiệu</Label>
                <Textarea
                  id="aboutContent"
                  value={siteContent.aboutContent}
                  onChange={(e) => setSiteContent({...siteContent, aboutContent: e.target.value})}
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Thông tin liên hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <div>
                <Label htmlFor="contactAddress">Địa chỉ</Label>
                <Textarea
                  id="contactAddress"
                  value={siteContent.contactAddress}
                  onChange={(e) => setSiteContent({...siteContent, contactAddress: e.target.value})}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
