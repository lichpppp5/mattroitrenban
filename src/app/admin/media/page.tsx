"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, Image as ImageIcon, FileText, Trash2, Download, Search } from "lucide-react"

export default function AdminMedia() {
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const mediaFiles = [
    {
      id: 1,
      name: "hero-banner.jpg",
      type: "image",
      size: "2.5 MB",
      url: "/api/placeholder/400/200",
      uploadedAt: "2024-06-15",
      altText: "Banner trang chủ",
    },
    {
      id: 2,
      name: "about-team.jpg",
      type: "image", 
      size: "1.8 MB",
      url: "/api/placeholder/400/200",
      uploadedAt: "2024-06-14",
      altText: "Đội ngũ tổ chức",
    },
    {
      id: 3,
      name: "activity-report.pdf",
      type: "document",
      size: "850 KB",
      url: "#",
      uploadedAt: "2024-06-13",
      altText: "Báo cáo hoạt động",
    },
  ]

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    setUploading(false)
    console.log("Uploaded files:", files)
  }

  const filteredFiles = mediaFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.altText.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Media</h2>
          <p className="text-gray-600">Upload và quản lý hình ảnh, tài liệu</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng file</p>
                <p className="text-2xl font-bold">150</p>
              </div>
              <FileText className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hình ảnh</p>
                <p className="text-2xl font-bold">120</p>
              </div>
              <ImageIcon className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tài liệu</p>
                <p className="text-2xl font-bold">30</p>
              </div>
              <FileText className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dung lượng</p>
                <p className="text-2xl font-bold">2.5 GB</p>
              </div>
              <Upload className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Kéo thả file vào đây hoặc click để chọn
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Hỗ trợ: JPG, PNG, GIF, PDF, DOC, DOCX (tối đa 10MB)
            </p>
            <Input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {uploading ? "Đang upload..." : "Chọn file"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            {file.type === "image" ? (
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <CardContent className="p-4">
              <h3 className="font-medium text-sm truncate">{file.name}</h3>
              <p className="text-xs text-gray-500">{file.size}</p>
              <p className="text-xs text-gray-500">{file.uploadedAt}</p>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline" className="text-xs">
                  {file.type === "image" ? "Hình ảnh" : "Tài liệu"}
                </Badge>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
