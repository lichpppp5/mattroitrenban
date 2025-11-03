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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Users, Upload, X, ChevronUp, ChevronDown, Eye, EyeOff, UsersRound, Award } from "lucide-react"

export default function AdminTeam() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Fetch team members from API
  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/team")
      if (!response.ok) throw new Error("Failed to fetch team members")
      const data = await response.json()
      setTeamMembers(data)
      setError("")
    } catch (err: any) {
      console.error("Error fetching team members:", err)
      setError(err.message || "Failed to load team members")
    } finally {
      setIsLoading(false)
    }
  }
  const [formData, setFormData] = useState({
    name: "",
    role: "volunteer",
    position: "",
    bio: "",
    image: "",
    email: "",
    phone: "",
    facebookUrl: "",
    linkedinUrl: "",
    displayOrder: 0,
    isActive: true,
  })
  
  // Update formData displayOrder when teamMembers changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      displayOrder: teamMembers.length + 1
    }))
  }, [teamMembers.length])

  const memberRoles = [
    { value: "executive", label: "Ban điều hành", icon: "👥" },
    { value: "volunteer", label: "Tình nguyện viên", icon: "❤️" },
    { value: "expert", label: "Hỗ trợ", icon: "🤝" },
  ]

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "executive":
        return "default"
      case "volunteer":
        return "default"
      case "expert":
        return "default"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: string) => {
    return memberRoles.find(r => r.value === role)?.label || role
  }

  const handleCreate = () => {
    setEditingMember(null)
    setFormData({
      name: "",
      role: "volunteer",
      position: "",
      bio: "",
      image: "",
      email: "",
      phone: "",
      facebookUrl: "",
      linkedinUrl: "",
      displayOrder: teamMembers.length + 1,
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (member: any) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      position: member.position || "",
      bio: member.bio || "",
      image: member.image || "",
      email: member.email || "",
      phone: member.phone || "",
      facebookUrl: member.facebookUrl || "",
      linkedinUrl: member.linkedinUrl || "",
      displayOrder: member.displayOrder,
      isActive: member.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleToggleActive = async (id: string) => {
    try {
      const member = teamMembers.find(m => m.id === id)
      if (!member) return
      
      const response = await fetch(`/api/team/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...member,
          isActive: !member.isActive,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update member")
      }
      
      await fetchTeamMembers()
    } catch (err: any) {
      console.error("Error toggling active:", err)
      alert(err.message || "Failed to update member")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thành viên này?")) return
    
    try {
      const response = await fetch(`/api/team/${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete member")
      }
      
      await fetchTeamMembers()
    } catch (err: any) {
      console.error("Error deleting member:", err)
      alert(err.message || "Failed to delete member")
    }
  }

  const handleMoveOrder = async (id: string, direction: "up" | "down") => {
    try {
      const current = teamMembers.find(m => m.id === id)
      if (!current) return

      const sameRole = teamMembers.filter(m => m.role === current.role).sort((a, b) => a.displayOrder - b.displayOrder)
      const currentIndex = sameRole.findIndex(m => m.id === id)
      
      let targetMember
      if (direction === "up" && currentIndex > 0) {
        targetMember = sameRole[currentIndex - 1]
      } else if (direction === "down" && currentIndex < sameRole.length - 1) {
        targetMember = sameRole[currentIndex + 1]
      } else {
        return
      }
      
      // Swap displayOrder
      const tempOrder = current.displayOrder
      const response1 = await fetch(`/api/team/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...current, displayOrder: targetMember.displayOrder }),
      })
      const response2 = await fetch(`/api/team/${targetMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...targetMember, displayOrder: tempOrder }),
      })
      
      if (!response1.ok || !response2.ok) {
        throw new Error("Failed to update order")
      }
      
      await fetchTeamMembers()
    } catch (err: any) {
      console.error("Error moving order:", err)
      alert(err.message || "Failed to update order")
    }
  }

  const handleSave = async () => {
    try {
      let response
      if (editingMember) {
        // Update existing
        response = await fetch(`/api/team/${editingMember.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      } else {
        // Create new
        response = await fetch("/api/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      }
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save member")
      }
      
      // Refresh team members list
      await fetchTeamMembers()
      setIsDialogOpen(false)
      setEditingMember(null)
    } catch (err: any) {
      console.error("Error saving member:", err)
      setError(err.message || "Failed to save member")
      alert(err.message || "Failed to save member")
    }
  }

  const handleImageUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({...formData, image: reader.result as string})
      }
      reader.readAsDataURL(file)
    }
  }

  const sortedMembers = [...teamMembers].sort((a, b) => {
    if (a.role !== b.role) return a.role.localeCompare(b.role)
    return a.displayOrder - b.displayOrder
  })

  const executiveCount = teamMembers.filter(m => m.role === "executive").length
  const volunteerCount = teamMembers.filter(m => m.role === "volunteer").length
  const expertCount = teamMembers.filter(m => m.role === "expert").length

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
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Đội ngũ</h2>
          <p className="text-gray-600">Quản lý thông tin thành viên đội ngũ</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleCreate}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm thành viên
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMember ? "Chỉnh sửa thành viên" : "Thêm thành viên mới"}</DialogTitle>
              <DialogDescription>
                Thông tin sẽ được hiển thị trên trang Đội ngũ
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Họ và tên *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Vai trò *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {memberRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.icon} {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="position">Chức vụ / Vị trí</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  placeholder="Ví dụ: Chủ tịch, Tình nguyện viên, Chuyên gia Giáo dục"
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label>Ảnh đại diện</Label>
                {formData.image ? (
                  <div className="relative mt-2 inline-block">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="h-32 w-32 object-cover border rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600"
                      onClick={() => setFormData({...formData, image: ""})}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-2 text-center">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload ảnh
                    </Button>
                  </div>
                )}
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="Hoặc nhập URL ảnh..."
                  className="mt-2"
                />
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Tiểu sử / Giới thiệu</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  placeholder="Giới thiệu về thành viên, kinh nghiệm, đóng góp..."
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+84 123 456 789"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebookUrl">Facebook URL</Label>
                  <Input
                    id="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({...formData, facebookUrl: e.target.value})}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              {/* Display Order & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 1})}
                    min={1}
                  />
                  <p className="text-xs text-gray-500 mt-1">Thứ tự trong cùng nhóm vai trò</p>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Hiển thị công khai</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave}>
                {editingMember ? "Cập nhật" : "Tạo mới"}
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
                <p className="text-sm text-gray-600">Tổng thành viên</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ban điều hành</p>
                <p className="text-2xl font-bold">{executiveCount}</p>
              </div>
              <Users className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tình nguyện viên</p>
                <p className="text-2xl font-bold">{volunteerCount}</p>
              </div>
              <UsersRound className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hỗ trợ</p>
                <p className="text-2xl font-bold">{expertCount}</p>
              </div>
              <Award className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách thành viên</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Thứ tự</TableHead>
                <TableHead>Thành viên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.map((member, index, arr) => {
                const sameRolePrev = arr.slice(0, index).reverse().find(m => m.role === member.role)
                const sameRoleNext = arr.slice(index + 1).find(m => m.role === member.role)
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex flex-col items-center space-y-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveOrder(member.id, "up")}
                          disabled={!sameRolePrev}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-sm">{member.displayOrder}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveOrder(member.id, "down")}
                          disabled={!sameRoleNext}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {member.image ? (
                          <img src={member.image} alt={member.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{member.name}</p>
                          {member.bio && (
                            <p className="text-xs text-gray-500 line-clamp-1">{member.bio}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {getRoleLabel(member.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.position || <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={member.isActive}
                          onCheckedChange={() => handleToggleActive(member.id)}
                        />
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? "Hiển thị" : "Ẩn"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
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
                                Bạn có chắc chắn muốn xóa thành viên "{member.name}"? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(member.id)} className="bg-red-600 hover:bg-red-700">
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
