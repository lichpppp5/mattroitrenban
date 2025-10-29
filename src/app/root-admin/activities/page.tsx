"use client"

import { useState } from "react"
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
import { Download, Search, Plus, FileText, Eye, Edit, Trash2, Upload, Image as ImageIcon, Video, X, Calendar } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function AdminActivities() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<any>(null)
  const [activities, setActivities] = useState([
    {
      id: 1,
      title: "Xây dựng trường học tại bản X, tỉnh Y",
      slug: "xay-dung-truong-hoc-ban-x-tinh-y",
      category: "Giáo dục",
      status: "published",
      createdAt: "2024-06-15",
      updatedAt: "2024-06-15",
      views: 1250,
      location: "Bản X, Tỉnh Y",
      tripDate: "2024-06-15",
      duration: 5,
      volunteerCount: 15,
      isUpcoming: false,
    },
    {
      id: 2,
      title: "Khám bệnh miễn phí cho đồng bào vùng cao",
      slug: "kham-benh-mien-phi-dong-bao-vung-cao",
      category: "Y tế",
      status: "published",
      createdAt: "2024-06-14",
      updatedAt: "2024-06-14",
      views: 890,
      location: "Bản A, B, C - Tỉnh Y",
      tripDate: "2024-06-14",
      duration: 3,
      volunteerCount: 20,
      isUpcoming: false,
    },
    {
      id: 3,
      title: "Xây dựng cầu đi bộ tại Bản M",
      slug: "xay-dung-cau-di-bo-ban-m",
      category: "Cơ sở hạ tầng",
      status: "preparing",
      createdAt: "2024-06-13",
      updatedAt: "2024-06-13",
      views: 0,
      location: "Bản M, Huyện X, Tỉnh Y",
      tripDate: "2024-07-15",
      duration: 5,
      volunteerCount: 15,
      isUpcoming: true,
    },
  ])

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
      images: (activity.images && typeof activity.images === 'string' 
        ? JSON.parse(activity.images) 
        : Array.isArray(activity.images) 
        ? activity.images 
        : []) as string[],
      videoUrl: activity.videoUrl || "",
      category: activity.category || "",
      location: activity.location || "",
      tripDate: activity.tripDate || "",
      duration: activity.duration?.toString() || "",
      volunteerCount: activity.volunteerCount?.toString() || "",
      status: activity.status || "draft",
      isUpcoming: activity.isUpcoming || false,
      isPublished: activity.status === "published",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setActivities(activities.filter(a => a.id !== id))
  }

  const handleSave = () => {
    // Convert images array to JSON string for storage
    const activityData = {
      ...formData,
      images: formData.images.length > 0 ? JSON.stringify(formData.images) : null,
    }
    
    if (editingActivity) {
      // Update existing
      setActivities(activities.map(a => 
        a.id === editingActivity.id 
          ? { ...a, ...activityData, updatedAt: new Date().toISOString().split('T')[0] }
          : a
      ))
    } else {
      // Create new
      const newActivity = {
        id: activities.length + 1,
        ...activityData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        views: 0,
      }
      setActivities([...activities, newActivity])
    }
    setIsDialogOpen(false)
    setEditingActivity(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
                      <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== index)
                          setFormData({...formData, images: newImages})
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="gallery-upload"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        files.forEach((file) => {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setFormData({
                              ...formData,
                              images: [...formData.images, reader.result as string],
                            })
                          }
                          reader.readAsDataURL(file)
                        })
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
                            setFormData({
                              ...formData,
                              images: [...formData.images, input.value.trim()],
                            })
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
                          setFormData({
                            ...formData,
                            images: [...formData.images, input.value.trim()],
                          })
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
                <p className="text-2xl font-bold">{activities.filter(a => a.status === "published").length}</p>
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
                <TableHead>Lượt xem</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
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
                  <TableCell>{activity.createdAt}</TableCell>
                  <TableCell>{activity.views.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}