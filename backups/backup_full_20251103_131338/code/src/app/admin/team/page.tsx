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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Users, Upload, X, ChevronUp, ChevronDown, Eye, EyeOff, UsersRound, Award } from "lucide-react"

export default function AdminTeam() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      role: "executive",
      position: "Chủ tịch",
      bio: "Hơn 15 năm kinh nghiệm trong lĩnh vực phát triển cộng đồng và xã hội",
      image: "",
      email: "nguyenvana@example.com",
      phone: "+84 123 456 789",
      facebookUrl: "",
      linkedinUrl: "",
      displayOrder: 1,
      isActive: true,
    },
    {
      id: 2,
      name: "Trần Thị B",
      role: "executive",
      position: "Phó Chủ tịch",
      bio: "Chuyên gia về giáo dục và phát triển trẻ em vùng cao",
      image: "",
      email: "tranthib@example.com",
      displayOrder: 2,
      isActive: true,
    },
    {
      id: 3,
      name: "Phạm Thị D",
      role: "volunteer",
      position: "Tình nguyện viên",
      bio: "Sinh viên năm 3, tham gia từ 2023",
      image: "",
      displayOrder: 1,
      isActive: true,
    },
    {
      id: 4,
      name: "Đỗ Văn G",
      role: "expert",
      position: "Hỗ trợ Giáo dục",
      bio: "Thạc sĩ Giáo dục, 10 năm kinh nghiệm giảng dạy",
      image: "",
      email: "dovang@example.com",
      displayOrder: 1,
      isActive: true,
    },
  ])

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
    displayOrder: teamMembers.length + 1,
    isActive: true,
  })

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

  const handleToggleActive = (id: number) => {
    setTeamMembers(teamMembers.map(m => 
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ))
  }

  const handleDelete = (id: number) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id))
  }

  const handleMoveOrder = (id: number, direction: "up" | "down") => {
    const current = teamMembers.find(m => m.id === id)
    if (!current) return

    const sameRole = teamMembers.filter(m => m.role === current.role).sort((a, b) => a.displayOrder - b.displayOrder)
    const currentIndex = sameRole.findIndex(m => m.id === id)
    
    if (direction === "up" && currentIndex > 0) {
      const prev = sameRole[currentIndex - 1]
      setTeamMembers(teamMembers.map(m => 
        m.id === id ? { ...m, displayOrder: prev.displayOrder } :
        m.id === prev.id ? { ...m, displayOrder: current.displayOrder } :
        m
      ))
    } else if (direction === "down" && currentIndex < sameRole.length - 1) {
      const next = sameRole[currentIndex + 1]
      setTeamMembers(teamMembers.map(m => 
        m.id === id ? { ...m, displayOrder: next.displayOrder } :
        m.id === next.id ? { ...m, displayOrder: current.displayOrder } :
        m
      ))
    }
  }

  const handleSave = () => {
    if (editingMember) {
      setTeamMembers(teamMembers.map(m => 
        m.id === editingMember.id ? { ...m, ...formData } : m
      ))
    } else {
      const newMember = {
        id: teamMembers.length + 1,
        ...formData,
      }
      setTeamMembers([...teamMembers, newMember])
    }
    setIsDialogOpen(false)
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
