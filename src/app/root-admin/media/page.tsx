"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, Image as ImageIcon, FileText, Trash2, Download, Search, Loader2, AlertCircle, Music } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface MediaFile {
  id: string
  url: string
  type: string
  filename: string | null
  size: number | null
  altText: string | null
  uploadedAt: string
}

export default function AdminMedia() {
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchMedia()
  }, [])

  // Normalize URL - ensure absolute URL for local files
  const normalizeUrl = (url: string): string => {
    if (!url) return url
    // If it's already an absolute URL (external), keep it
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }
    // If it's a relative path, make it absolute
    if (url.startsWith("/uploads/") || url.startsWith("/media/")) {
      return `${window.location.origin}${url}`
    }
    // For any other format, assume it's relative and add origin
    return `${window.location.origin}${url.startsWith("/") ? url : "/" + url}`
  }

  const fetchMedia = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/media")
      if (!response.ok) throw new Error("Failed to fetch media")
      const data = await response.json()
      // Normalize URLs for all media files
      const normalizedMedia = (data.media || []).map((file: MediaFile) => ({
        ...file,
        url: normalizeUrl(file.url),
      }))
      setMediaFiles(normalizedMedia)
    } catch (err: any) {
      console.error("Error fetching media:", err)
      setError("Không thể tải danh sách media")
      setMediaFiles([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError("")
    setSuccess("")

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/media", {
            method: "POST",
            body: formData,
          })

          // Check if response is actually JSON before parsing
          const contentType = response.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            // Server returned HTML (likely error page)
            const text = await response.text()
            console.error("Media upload - Non-JSON response:", text.substring(0, 200))
            throw new Error(`Server error: HTTP ${response.status}. Response is not JSON. Kiểm tra server logs.`)
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              error: `HTTP ${response.status}: Upload failed`
            }))
            throw new Error(errorData.error || `HTTP ${response.status}: Upload failed`)
          }

          return await response.json()
        } catch (err: any) {
          console.error(`Error uploading ${file.name}:`, err)
          return { error: err.message, filename: file.name }
        }
      })

      const results = await Promise.allSettled(uploadPromises)
      const successful = results.filter(r => r.status === "fulfilled" && !r.value?.error).length
      const failed = results.filter(r => r.status === "rejected" || r.value?.error)
      
      if (successful === files.length) {
        setSuccess(`Đã upload thành công ${files.length} file(s)!`)
        setError("")
      } else if (successful > 0) {
        setError(`Chỉ upload thành công ${successful}/${files.length} file(s). Các file lỗi: ${failed.map((r: any) => r.value?.filename || r.reason?.message || "unknown").join(", ")}`)
      } else {
        const errorMessages = failed.map((r: any) => {
          if (r.status === "rejected") return r.reason?.message || "Unknown error"
          return r.value?.error || "Upload failed"
        }).join("; ")
        setError(`Không thể upload file nào. Lỗi: ${errorMessages}`)
      }
      
      // Refresh media list
      await fetchMedia()
      
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (err: any) {
      console.error("Error uploading files:", err)
      let errorMessage = err.message || "Không thể upload file. Vui lòng thử lại."
      
      // Better error messages
      if (errorMessage.includes("not valid JSON") || errorMessage.includes("is not JSON")) {
        errorMessage = "Lỗi kết nối server. Vui lòng kiểm tra logs hoặc thử lại sau."
      } else if (errorMessage.includes("Unauthorized")) {
        errorMessage = "Bạn không có quyền upload. Vui lòng đăng nhập lại."
      } else if (errorMessage.includes("File size")) {
        errorMessage = "File quá lớn. Kích thước tối đa là 10MB."
      }
      
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa file này?")) return

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      setMediaFiles((prev) => prev.filter((file) => file.id !== id))
      setSuccess("Đã xóa file thành công!")
    } catch (err: any) {
      console.error("Error deleting file:", err)
      setError("Không thể xóa file. Vui lòng thử lại.")
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const stats = {
    total: mediaFiles.length,
    images: mediaFiles.filter((f) => f.type === "image").length,
    documents: mediaFiles.filter((f) => f.type === "document").length,
    videos: mediaFiles.filter((f) => f.type === "video").length,
    audio: mediaFiles.filter((f) => f.type === "audio").length,
    totalSize: mediaFiles.reduce((sum, f) => sum + (f.size || 0), 0),
  }

  const filteredFiles = mediaFiles.filter(
    (file) =>
      (file.filename || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.altText || "").toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng file</p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.images}</p>
              </div>
              <ImageIcon className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Video</p>
                <p className="text-2xl font-bold">{stats.videos}</p>
              </div>
              <FileText className="h-12 w-12 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Audio</p>
                <p className="text-2xl font-bold">{stats.audio}</p>
              </div>
              <FileText className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tài liệu</p>
                <p className="text-2xl font-bold">{stats.documents}</p>
              </div>
              <FileText className="h-12 w-12 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dung lượng</p>
              <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
            </div>
            <Upload className="h-12 w-12 text-orange-500" />
          </div>
        </CardContent>
      </Card>

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
              Hỗ trợ: JPG, PNG, GIF, PDF, DOC, DOCX, MP3, WAV, OGG, M4A (tối đa 10MB)
            </p>
            <Input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.mp3,.wav,.ogg,.m4a,.aac,.flac,audio/*"
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
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Đang tải media...</span>
            </div>
          </CardContent>
        </Card>
      ) : filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? "Không tìm thấy file nào" : "Chưa có file nào. Hãy upload file đầu tiên!"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              {file.type === "image" ? (
                <div className="aspect-video bg-gray-100 relative">
                  <Image
                    src={file.url}
                    alt={file.altText || file.filename || "Image"}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      console.error(`Image failed to load: ${file.url}`)
                      // Replace with placeholder
                      const target = e.target as HTMLImageElement
                      const placeholderUrl = `${window.location.origin}/api/placeholder/800/450`
                      if (target.src !== placeholderUrl) {
                        target.src = placeholderUrl
                      }
                    }}
                  />
                </div>
              ) : file.type === "audio" ? (
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center justify-center p-4">
                  <Music className="h-12 w-12 text-purple-500 mb-2" />
                  <audio controls className="w-full max-w-full" style={{ maxHeight: "60px" }}>
                    <source src={file.url} />
                    Trình duyệt của bạn không hỗ trợ audio.
                  </audio>
                </div>
              ) : file.type === "video" ? (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-red-400" />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-medium text-sm truncate">{file.filename || "Untitled"}</h3>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                <p className="text-xs text-gray-500">
                  {new Date(file.uploadedAt).toLocaleDateString("vi-VN")}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">
                    {file.type === "image" ? "Hình ảnh" : 
                     file.type === "video" ? "Video" : 
                     file.type === "audio" ? "Audio" : 
                     "Tài liệu"}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, "_blank")}
                      title="Xem/Download"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(file.id)}
                      title="Xóa"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
