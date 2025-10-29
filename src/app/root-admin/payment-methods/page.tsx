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
import { Plus, Edit, Trash2, CreditCard, Upload, X, ChevronUp, ChevronDown, Eye, EyeOff, Wallet } from "lucide-react"

export default function AdminPaymentMethods() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<any>(null)
  
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      name: "MoMo",
      type: "e-wallet",
      icon: "",
      accountNumber: "0901234567",
      accountName: "Mặt Trời Trên Bản",
      qrCode: "",
      isActive: true,
      displayOrder: 1,
      description: "Quét QR code hoặc chuyển khoản qua số điện thoại",
      instructions: "1. Mở app MoMo\n2. Quét QR code hoặc nhập số điện thoại\n3. Nhập số tiền và nội dung chuyển khoản",
    },
    {
      id: 2,
      name: "Chuyển khoản ngân hàng",
      type: "bank",
      icon: "",
      accountNumber: "1234567890",
      accountName: "Mặt Trời Trên Bản",
      bankName: "Vietcombank",
      branch: "Chi nhánh Hồ Chí Minh",
      qrCode: "",
      isActive: true,
      displayOrder: 2,
      description: "Chuyển khoản qua ngân hàng",
      instructions: "1. Chuyển khoản đến số tài khoản\n2. Nội dung: [Tên] - Quyên góp",
    },
    {
      id: 3,
      name: "ZaloPay",
      type: "e-wallet",
      icon: "",
      accountNumber: "0901234567",
      accountName: "Mặt Trời Trên Bản",
      qrCode: "",
      isActive: true,
      displayOrder: 3,
      description: "Chuyển khoản qua ZaloPay",
      instructions: "1. Mở app ZaloPay\n2. Quét QR code\n3. Nhập số tiền",
    },
    {
      id: 4,
      name: "Tiền mặt",
      type: "cash",
      icon: "",
      accountNumber: "",
      accountName: "",
      qrCode: "",
      isActive: false,
      displayOrder: 4,
      description: "Nộp tiền mặt trực tiếp tại văn phòng",
      instructions: "Liên hệ văn phòng để nộp tiền mặt trực tiếp",
    },
  ])

  const [formData, setFormData] = useState({
    name: "",
    type: "bank",
    icon: "",
    accountNumber: "",
    accountName: "",
    bankName: "",
    branch: "",
    qrCode: "",
    description: "",
    instructions: "",
    isActive: true,
    displayOrder: paymentMethods.length + 1,
  })

  const paymentTypes = [
    { value: "bank", label: "Ngân hàng", icon: "🏦" },
    { value: "e-wallet", label: "Ví điện tử", icon: "💳" },
    { value: "cash", label: "Tiền mặt", icon: "💵" },
    { value: "card", label: "Thẻ tín dụng", icon: "💳" },
    { value: "crypto", label: "Cryptocurrency", icon: "₿" },
  ]

  const handleCreate = () => {
    setEditingMethod(null)
    setFormData({
      name: "",
      type: "bank",
      icon: "",
      accountNumber: "",
      accountName: "",
      bankName: "",
      branch: "",
      qrCode: "",
      description: "",
      instructions: "",
      isActive: true,
      displayOrder: paymentMethods.length + 1,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (method: any) => {
    setEditingMethod(method)
    setFormData({
      name: method.name,
      type: method.type,
      icon: method.icon || "",
      accountNumber: method.accountNumber || "",
      accountName: method.accountName || "",
      bankName: method.bankName || "",
      branch: method.branch || "",
      qrCode: method.qrCode || "",
      description: method.description || "",
      instructions: method.instructions || "",
      isActive: method.isActive,
      displayOrder: method.displayOrder,
    })
    setIsDialogOpen(true)
  }

  const handleToggleActive = (id: number) => {
    setPaymentMethods(paymentMethods.map(m => 
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ))
  }

  const handleDelete = (id: number) => {
    setPaymentMethods(paymentMethods.filter(m => m.id !== id).map((m, index) => ({
      ...m,
      displayOrder: index + 1
    })))
  }

  const handleMoveOrder = (id: number, direction: "up" | "down") => {
    const current = paymentMethods.find(m => m.id === id)
    if (!current) return

    const sorted = [...paymentMethods].sort((a, b) => a.displayOrder - b.displayOrder)
    const currentIndex = sorted.findIndex(m => m.id === id)
    
    if (direction === "up" && currentIndex > 0) {
      const prev = sorted[currentIndex - 1]
      setPaymentMethods(paymentMethods.map(m => 
        m.id === id ? { ...m, displayOrder: prev.displayOrder } :
        m.id === prev.id ? { ...m, displayOrder: current.displayOrder } :
        m
      ))
    } else if (direction === "down" && currentIndex < sorted.length - 1) {
      const next = sorted[currentIndex + 1]
      setPaymentMethods(paymentMethods.map(m => 
        m.id === id ? { ...m, displayOrder: next.displayOrder } :
        m.id === next.id ? { ...m, displayOrder: current.displayOrder } :
        m
      ))
    }
  }

  const handleSave = () => {
    if (editingMethod) {
      // Update
      setPaymentMethods(paymentMethods.map(m => 
        m.id === editingMethod.id ? { ...m, ...formData } : m
      ))
    } else {
      // Create
      const newMethod = {
        id: paymentMethods.length + 1,
        ...formData,
      }
      setPaymentMethods([...paymentMethods, newMethod])
    }
    setIsDialogOpen(false)
  }

  const handleImageUpload = (field: string, file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({...formData, [field]: reader.result as string})
      }
      reader.readAsDataURL(file)
    }
  }

  const sortedMethods = [...paymentMethods].sort((a, b) => a.displayOrder - b.displayOrder)
  const activeMethods = paymentMethods.filter(m => m.isActive).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Phương thức Thanh toán</h2>
          <p className="text-gray-600">Quản lý các phương thức thanh toán cho quyên góp</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleCreate}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm phương thức
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMethod ? "Chỉnh sửa phương thức" : "Thêm phương thức thanh toán"}</DialogTitle>
              <DialogDescription>
                Thông tin sẽ được hiển thị trên trang quyên góp
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tên phương thức *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ví dụ: MoMo, Chuyển khoản ngân hàng"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Loại *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Icon Upload */}
              <div>
                <Label>Icon/Logo</Label>
                {formData.icon ? (
                  <div className="relative mt-2 inline-block">
                    <img 
                      src={formData.icon} 
                      alt="Icon" 
                      className="h-16 w-16 object-contain border rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600"
                      onClick={() => setFormData({...formData, icon: ""})}
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
                      id="icon-upload"
                      onChange={(e) => handleImageUpload("icon", e.target.files?.[0] || null)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('icon-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Icon
                    </Button>
                  </div>
                )}
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="Hoặc nhập URL icon..."
                  className="mt-2"
                />
              </div>

              {/* Account Info */}
              {(formData.type === "bank" || formData.type === "e-wallet") && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountNumber">Số tài khoản/SĐT *</Label>
                      <Input
                        id="accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                        placeholder="1234567890 hoặc 0901234567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountName">Tên chủ tài khoản *</Label>
                      <Input
                        id="accountName"
                        value={formData.accountName}
                        onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                        placeholder="Mặt Trời Trên Bản"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Bank Specific */}
              {formData.type === "bank" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Tên ngân hàng</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                      placeholder="Vietcombank"
                    />
                  </div>
                  <div>
                    <Label htmlFor="branch">Chi nhánh</Label>
                    <Input
                      id="branch"
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      placeholder="Chi nhánh Hồ Chí Minh"
                    />
                  </div>
                </div>
              )}

              {/* QR Code */}
              {(formData.type === "e-wallet" || formData.type === "bank") && (
                <div>
                  <Label>QR Code</Label>
                  {formData.qrCode ? (
                    <div className="relative mt-2 inline-block">
                      <img 
                        src={formData.qrCode} 
                        alt="QR Code" 
                        className="h-48 w-48 object-contain border rounded-lg"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600"
                        onClick={() => setFormData({...formData, qrCode: ""})}
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
                        id="qr-upload"
                        onChange={(e) => handleImageUpload("qrCode", e.target.files?.[0] || null)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('qr-upload')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload QR Code
                      </Button>
                    </div>
                  )}
                  <Input
                    value={formData.qrCode}
                    onChange={(e) => setFormData({...formData, qrCode: e.target.value})}
                    placeholder="Hoặc nhập URL QR code..."
                    className="mt-2"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <Label htmlFor="description">Mô tả ngắn</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2}
                  placeholder="Quét QR code hoặc chuyển khoản qua số điện thoại"
                />
              </div>

              {/* Instructions */}
              <div>
                <Label htmlFor="instructions">Hướng dẫn sử dụng</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  rows={4}
                  placeholder="1. Mở app MoMo&#10;2. Quét QR code&#10;3. Nhập số tiền"
                />
                <p className="text-xs text-gray-500 mt-1">Sử dụng xuống dòng để tạo danh sách bước</p>
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
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Kích hoạt</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave}>
                {editingMethod ? "Cập nhật" : "Tạo mới"}
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
                <p className="text-sm text-gray-600">Tổng phương thức</p>
                <p className="text-2xl font-bold">{paymentMethods.length}</p>
              </div>
              <CreditCard className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">{activeMethods}</p>
              </div>
              <Eye className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã tắt</p>
                <p className="text-2xl font-bold text-red-600">{paymentMethods.length - activeMethods}</p>
              </div>
              <EyeOff className="h-12 w-12 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ví điện tử</p>
                <p className="text-2xl font-bold">{paymentMethods.filter(m => m.type === "e-wallet").length}</p>
              </div>
              <Wallet className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phương thức thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Thứ tự</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Thông tin</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMethods.map((method, index) => (
                <TableRow key={method.id}>
                  <TableCell>
                    <div className="flex flex-col items-center space-y-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveOrder(method.id, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold text-sm">{method.displayOrder}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveOrder(method.id, "down")}
                        disabled={index === sortedMethods.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {method.icon ? (
                        <img src={method.icon} alt={method.name} className="h-8 w-8 object-contain" />
                      ) : (
                        <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{method.name}</p>
                        {method.description && (
                          <p className="text-xs text-gray-500">{method.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {paymentTypes.find(t => t.value === method.type)?.label || method.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {method.accountNumber && (
                        <p><span className="font-semibold">TK/SĐT:</span> {method.accountNumber}</p>
                      )}
                      {method.accountName && (
                        <p><span className="font-semibold">Chủ TK:</span> {method.accountName}</p>
                      )}
                      {method.bankName && (
                        <p><span className="font-semibold">Ngân hàng:</span> {method.bankName}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={method.isActive}
                        onCheckedChange={() => handleToggleActive(method.id)}
                      />
                      <Badge variant={method.isActive ? "default" : "secondary"}>
                        {method.isActive ? "Hoạt động" : "Đã tắt"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(method)}>
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
                              Bạn có chắc chắn muốn xóa phương thức "{method.name}"? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(method.id)} className="bg-red-600 hover:bg-red-700">
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
