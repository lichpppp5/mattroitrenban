"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { Download, Search, Plus, FileText, Eye, Edit, Trash2, Upload, Image as ImageIcon, Video, X, Calendar } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function AdminActivities() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Fetch activities from API
  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      // Admin can see ALL activities (published and draft)
      // No filter applied - API will handle based on session
      const response = await fetch("/api/activities")
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch activities`)
      }
      const data = await response.json()
      console.log("Fetched activities:", data.length, "items") // Debug log
      // Normalize data - ensure duration and volunteerCount are numbers (not strings)
      const normalizedData: any[] = Array.isArray(data) ? data.map((activity: any) => {
        return {
          ...activity,
          duration: activity.duration !== null && activity.duration !== undefined 
            ? (typeof activity.duration === 'string' ? parseInt(activity.duration) || null : Number(activity.duration) || null)
            : null,
          volunteerCount: activity.volunteerCount !== null && activity.volunteerCount !== undefined
            ? (typeof activity.volunteerCount === 'string' ? parseInt(activity.volunteerCount) || null : Number(activity.volunteerCount) || null)
            : null,
        }
      }) : []
      setActivities(normalizedData)
      setError("")
    } catch (err: any) {
      console.error("Error fetching activities:", err)
      setError(err.message || "Failed to load activities")
      setActivities([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    imageUrl: "",
    images: [] as string[], // Array of image URLs for gallery
    videoUrl: "",
    category: "",
    location: "",
    tripDate: "",
    duration: "",
    volunteerCount: "",
    status: "draft",
    isUpcoming: false,
    isPublished: false,
  })
  
  const [uploadingImages, setUploadingImages] = useState<string[]>([]) // Track which files are uploading

  const categories = [
    "Giáo dục",
    "Y tế", 
    "Cơ sở hạ tầng",
    "Phát triển kinh tế",
    "Hỗ trợ khẩn cấp",
    "Khác"
  ]

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleCreate = () => {
    setEditingActivity(null)
    setFormData({
      title: "",
      slug: "",
      content: "",
      imageUrl: "",
      images: [],
      videoUrl: "",
      category: "",
      location: "",
      tripDate: "",
      duration: "",
      volunteerCount: "",
      status: "draft",
      isUpcoming: false,
      isPublished: false,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (activity: any) => {
    setEditingActivity(activity)
    setFormData({
      title: activity.title,
      slug: activity.slug,
      content: activity.content || "",
      imageUrl: activity.imageUrl || "",
      images: (() => {
        if (!activity.images) return []
        if (typeof activity.images === 'string') {
          try {
            return JSON.parse(activity.images)
          } catch {
            return []
          }
        }
        return Array.isArray(activity.images) ? activity.images : []
      })(),
      videoUrl: activity.videoUrl || "",
      category: activity.category || "",
      location: activity.location || "",
      tripDate: activity.tripDate || "",
      duration: activity.duration?.toString() || "",
      volunteerCount: activity.volunteerCount?.toString() || "",
      status: activity.status || "draft",
      isUpcoming: activity.isUpcoming || false,
      isPublished: activity.isPublished || false, // Use isPublished directly from database
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hoạt động này?")) return
    
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete activity")
      }
      
      // Refresh activities list
      await fetchActivities()
    } catch (err: any) {
      console.error("Error deleting activity:", err)
      alert(err.message || "Failed to delete activity")
    }
  }

  const handleSave = async () => {
    try {
      // Ensure slug is generated if not provided
      if (!formData.title) {
        alert("Vui lòng nhập tiêu đề")
        return
      }
      
      const finalSlug = formData.slug || generateSlug(formData.title)
      
      // Convert images array to JSON string for storage
      // Ensure status and isPublished are synchronized
      const finalIsPublished = formData.isPublished || false
      const finalStatus = finalIsPublished ? "published" : (formData.status || "draft")
      
      const activityData = {
        ...formData,
        slug: finalSlug,
        images: formData.images.length > 0 ? JSON.stringify(formData.images) : null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        volunteerCount: formData.volunteerCount ? parseInt(formData.volunteerCount) : null,
        tripDate: formData.tripDate || null,
        status: finalStatus,
        isPublished: finalIsPublished, // Ensure this is explicitly set
        isUpcoming: formData.isUpcoming || false,
      }
      
      let response
      if (editingActivity) {
        // Update existing
        response = await fetch(`/api/activities/${editingActivity.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activityData),
        })
      } else {
        // Create new
        response = await fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activityData),
        })
      }
      
      // Check if response is actually JSON before parsing
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        // Server returned HTML (likely error page)
        const text = await response.text()
        console.error("Non-JSON response:", text.substring(0, 200))
        throw new Error(`Server error: HTTP ${response.status}. Response is not JSON.`)
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: `HTTP ${response.status}: Failed to save activity`
        }))
        throw new Error(error.error || `HTTP ${response.status}: Failed to save activity`)
      }
      
      const savedActivity = await response.json()
      
      // Refresh activities list
      await fetchActivities()
      setIsDialogOpen(false)
      setEditingActivity(null)
      
      // Show success message
      alert(editingActivity ? "Đã cập nhật hoạt động thành công!" : "Đã tạo hoạt động thành công!")
    } catch (err: any) {
      console.error("Error saving activity:", err)
      const errorMessage = err.message || "Failed to save activity"
      setError(errorMessage)
      
      // Better error display
      let displayMessage = errorMessage
      if (errorMessage.includes("not valid JSON") || errorMessage.includes("is not JSON")) {
        displayMessage = "Lỗi kết nối server. Vui lòng kiểm tra lại hoặc thử lại sau."
      } else if (errorMessage.includes("Unauthorized")) {
        displayMessage = "Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại."
      } else if (errorMessage.includes("Slug already exists")) {
        displayMessage = "URL slug đã tồn tại. Vui lòng thay đổi slug."
      }
      
      alert(`Lỗi: ${displayMessage}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Hoạt động</h2>
          <p className="text-gray-600">Tạo và quản lý các hoạt động thiện nguyện</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleCreate}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo hoạt động
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingActivity ? "Chỉnh sửa hoạt động" : "Tạo hoạt động mới"}</DialogTitle>
              <DialogDescription>
                Điền thông tin chi tiết về chuyến đi thiện nguyện
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({...formData, title: e.target.value, slug: generateSlug(e.target.value)})
                  }}
                  placeholder="Ví dụ: Xây dựng trường học tại bản X"
                />
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="xay-dung-truong-hoc-ban-x"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Danh mục</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      <SelectItem value="preparing">Đang chuẩn bị</SelectItem>
                      <SelectItem value="registration_open">Đăng ký mở</SelectItem>
                      <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                      <SelectItem value="completed">Đã hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location & Trip Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Địa điểm</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Bản X, Tỉnh Y"
                  />
                </div>
                <div>
                  <Label htmlFor="tripDate">Ngày diễn ra</Label>
                  <Input
                    id="tripDate"
                    type="date"
                    value={formData.tripDate}
                    onChange={(e) => setFormData({...formData, tripDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Duration & Volunteers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Thời gian (ngày)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor="volunteerCount">Số tình nguyện viên</Label>
                  <Input
                    id="volunteerCount"
                    type="number"
                    value={formData.volunteerCount}
                    onChange={(e) => setFormData({...formData, volunteerCount: e.target.value})}
                    placeholder="15"
                  />
                </div>
              </div>

              {/* Image Gallery Upload */}
              <div>
                <Label>Album ảnh (có thể upload nhiều ảnh)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 mb-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border group">
                      <img 
                        src={img} 
                        alt={`Image ${index + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(`Image failed to load: ${img}`)
                          // Replace with placeholder or remove
                          const target = e.target as HTMLImageElement
                          target.src = "/api/placeholder/400/400"
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== index)
                          setFormData({...formData, images: newImages})
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {uploadingImages.length > 0 && (
                    <div className="border-2 border-dashed border-blue-300 rounded-lg aspect-square flex items-center justify-center bg-blue-50">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm text-blue-600">Đang upload...</p>
                        <p className="text-xs text-gray-500">{uploadingImages.length} file(s)</p>
                      </div>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="gallery-upload"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || [])
                        
                        for (const file of files) {
                          try {
                            // Check file size (max 10MB per image)
                            if (file.size > 10 * 1024 * 1024) {
                              alert(`File "${file.name}" quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Vui lòng chọn file nhỏ hơn 10MB`)
                              continue
                            }
                            
                            // Upload to server instead of just using base64
                            const uploadFormData = new FormData()
                            uploadFormData.append("file", file)
                            
                            const uploadResponse = await fetch("/api/media", {
                              method: "POST",
                              body: uploadFormData,
                              credentials: "include", // Include cookies for auth
                            })
                            
                            // ALWAYS check content-type before parsing JSON
                            const contentType = uploadResponse.headers.get("content-type")
                            if (!contentType || !contentType.includes("application/json")) {
                              const text = await uploadResponse.text()
                              console.error("Upload failed - non-JSON response:", text.substring(0, 500))
                              throw new Error(`Lỗi upload: Server trả về HTML thay vì JSON (HTTP ${uploadResponse.status}). Có thể do session hết hạn hoặc lỗi server.`)
                            }
                            
                            if (!uploadResponse.ok) {
                              const errorData = await uploadResponse.json().catch(() => ({
                                error: `HTTP ${uploadResponse.status}: Upload failed`
                              }))
                              throw new Error(errorData.error || `HTTP ${uploadResponse.status}: Upload failed`)
                            }
                            
                            const uploadData = await uploadResponse.json()
                            const imageUrl = uploadData.media?.url || uploadData.url
                            
                            if (imageUrl) {
                              // Use functional update to avoid stale closure
                              setFormData((prev) => ({
                                ...prev,
                                images: [...prev.images, imageUrl],
                              }))
                            } else {
                              // Fallback to base64 if upload fails but no error thrown
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setFormData((prev) => ({
                                  ...prev,
                                  images: [...prev.images, reader.result as string],
                                }))
                              }
                              reader.readAsDataURL(file)
                            }
                          } catch (uploadErr: any) {
                            console.error("Error uploading image:", uploadErr)
                            const errorMessage = uploadErr.message || "Lỗi không xác định"
                            
                            // Show error to user
                            alert(`Không thể upload "${file.name}": ${errorMessage}\n\nVui lòng:\n1. Kiểm tra đã đăng nhập chưa\n2. Thử đăng nhập lại\n3. Kiểm tra kết nối mạng\n4. Thử upload lại`)
                            
                            // Don't use base64 fallback - require successful upload
                            // User can try uploading again or use image URL instead
                          }
                        }
                        
                        // Reset file input
                        const input = e.target as HTMLInputElement
                        if (input) input.value = ""
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => document.getElementById('gallery-upload')?.click()}
                      className="flex flex-col items-center justify-center w-full h-full"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Thêm ảnh</span>
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <Label className="text-sm text-gray-600 mb-2 block">Hoặc thêm URL ảnh:</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          if (input.value.trim()) {
                            setFormData((prev) => ({
                              ...prev,
                              images: [...prev.images, input.value.trim()],
                            }))
                            input.value = ''
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="https://example.com/image.jpg"]') as HTMLInputElement
                        if (input?.value.trim()) {
                          setFormData((prev) => ({
                            ...prev,
                            images: [...prev.images, input.value.trim()],
                          }))
                          input.value = ''
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Video URL */}
              <div>
                <Label htmlFor="videoUrl">Video URL (YouTube, Vimeo, hoặc Cloudinary)</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                />
                {formData.videoUrl && (
                  <p className="text-xs text-gray-500 mt-1">
                    Dán link video từ YouTube, Vimeo hoặc Cloudinary
                  </p>
                )}
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">Nội dung bài viết *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={10}
                  placeholder="Viết nội dung chi tiết về chuyến đi thiện nguyện..."
                />
              </div>

              {/* Options */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => {
                      setFormData({
                        ...formData,
                        isPublished: checked,
                        status: checked ? "published" : "draft"
                      })
                    }}
                  />
                  <Label htmlFor="isPublished">Xuất bản ngay</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isUpcoming"
                    checked={formData.isUpcoming}
                    onCheckedChange={(checked) => setFormData({...formData, isUpcoming: checked})}
                  />
                  <Label htmlFor="isUpcoming">Chuyến sắp tới</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave}>
                {editingActivity ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng hoạt động</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
              <FileText className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã xuất bản</p>
                <p className="text-2xl font-bold">{activities.filter(a => a.isPublished).length}</p>
              </div>
              <Eye className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bản nháp</p>
                <p className="text-2xl font-bold">{activities.filter(a => a.status === "draft").length}</p>
              </div>
              <FileText className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chuyến sắp tới</p>
                <p className="text-2xl font-bold">{activities.filter(a => a.isUpcoming).length}</p>
              </div>
              <Calendar className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Xuất CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hoạt động</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Xem</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Chưa có hoạt động nào. Hãy tạo hoạt động mới!
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        activity.status === "published" ? "default" : 
                        activity.status === "upcoming" || activity.status === "registration_open" ? "default" :
                        "secondary"
                      }
                    >
                      {activity.status === "published" ? "Đã xuất bản" : 
                       activity.status === "draft" ? "Bản nháp" :
                       activity.status === "preparing" ? "Đang chuẩn bị" :
                       activity.status === "registration_open" ? "Đăng ký mở" :
                       activity.status === "upcoming" ? "Sắp diễn ra" :
                       "Đã hoàn thành"}
                    </Badge>
                    {activity.isUpcoming && (
                      <Badge variant="outline" className="ml-2">Sắp tới</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString("vi-VN") : "-"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/activities/${activity.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" title="Xem trên website">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(activity)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa hoạt động "{activity.title}"? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(activity.id)} className="bg-red-600 hover:bg-red-700">
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}