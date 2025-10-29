"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Download, Search, Plus, Receipt, TrendingDown, Edit, Trash2 } from "lucide-react"

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [eventFilter, setEventFilter] = useState("all")
  
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    event: "",
    activityId: "",
  })
  const [activities, setActivities] = useState<any[]>([])

  const categories = [
    "Giáo dục",
    "Y tế",
    "Cơ sở hạ tầng",
    "Hỗ trợ khẩn cấp",
    "Vận chuyển",
    "Khác",
  ]

  // Fetch expenses from API
  useEffect(() => {
    fetchExpenses()
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activities")
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (err) {
      console.error("Error fetching activities:", err)
    }
  }

  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (eventFilter !== "all") params.append("event", eventFilter)
      
      const response = await fetch(`/api/expenses?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch expenses")
      const data = await response.json()
      setExpenses(data)
      setError("")
    } catch (err: any) {
      console.error("Error fetching expenses:", err)
      setError(err.message || "Failed to load expenses")
    } finally {
      setIsLoading(false)
    }
  }

  // Re-fetch when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchExpenses()
    }
  }, [searchQuery, categoryFilter, eventFilter])

  const handleCreate = () => {
    setEditingExpense(null)
    setFormData({
      title: "",
      amount: "",
      description: "",
      category: "",
      event: "",
      activityId: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (expense: any) => {
    setEditingExpense(expense)
    setFormData({
      title: expense.title || "",
      amount: expense.amount?.toString() || "",
      description: expense.description || "",
      category: expense.category || "",
      event: expense.event || "",
      activityId: expense.activityId || "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.amount || parseFloat(formData.amount) <= 0) {
        alert("Vui lòng nhập đầy đủ thông tin")
        return
      }

      let response
      if (editingExpense) {
        // Update existing
        response = await fetch(`/api/expenses/${editingExpense.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      } else {
        // Create new
        response = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save expense")
      }

      await fetchExpenses()
      setIsDialogOpen(false)
      setEditingExpense(null)
    } catch (err: any) {
      console.error("Error saving expense:", err)
      alert(err.message || "Failed to save expense")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khoản chi này?")) return
    
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete expense")
      }

      await fetchExpenses()
    } catch (err: any) {
      console.error("Error deleting expense:", err)
      alert(err.message || "Failed to delete expense")
    }
  }

  // Calculate stats
  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const expenseCount = expenses.length
  const averageAmount = expenseCount > 0 ? totalAmount / expenseCount : 0
  
  // Get current month expenses
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthExpenses = expenses.filter(e => {
    const date = new Date(e.createdAt)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  const thisMonthAmount = thisMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  // Calculate by category
  const categoryTotals: Record<string, number> = {}
  expenses.forEach(e => {
    const cat = e.category || "Khác"
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (e.amount || 0)
  })

  // Get unique events
  const uniqueEvents = Array.from(new Set(expenses.map(e => e.event).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Chi tiêu</h2>
          <p className="text-gray-600">Theo dõi và quản lý tất cả chi tiêu</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleCreate}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm chi tiêu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingExpense ? "Chỉnh sửa chi tiêu" : "Thêm chi tiêu mới"}</DialogTitle>
              <DialogDescription>
                {editingExpense ? "Cập nhật thông tin chi tiêu" : "Thêm một khoản chi tiêu mới vào hệ thống"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Xây dựng trường học tại bản X"
                />
              </div>
              <div>
                <Label htmlFor="amount">Số tiền (VND) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="20000000"
                />
              </div>
              <div>
                <Label htmlFor="category">Danh mục</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không có</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="activityId">Chiến dịch (tùy chọn)</Label>
                <Select 
                  value={formData.activityId} 
                  onValueChange={(value) => setFormData({...formData, activityId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chiến dịch hoặc để trống" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không thuộc chiến dịch nào</SelectItem>
                    {activities.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id}>
                        {activity.title} {activity.location ? `(${activity.location})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="event">Sự kiện / Dự án</Label>
                <Input
                  id="event"
                  value={formData.event}
                  onChange={(e) => setFormData({...formData, event: e.target.value})}
                  placeholder="Dự án giáo dục 2024"
                />
              </div>
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Chi tiết về khoản chi..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false)
                setEditingExpense(null)
              }}>
                Hủy
              </Button>
              <Button onClick={handleSave}>
                {editingExpense ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                <p className="text-2xl font-bold">{totalAmount.toLocaleString("vi-VN")}₫</p>
              </div>
              <Receipt className="h-12 w-12 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Số khoản chi</p>
                <p className="text-2xl font-bold">{expenseCount}</p>
              </div>
              <TrendingDown className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trung bình</p>
                <p className="text-2xl font-bold">{averageAmount.toLocaleString("vi-VN")}₫</p>
              </div>
              <Receipt className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tháng này</p>
                <p className="text-2xl font-bold">{thisMonthAmount.toLocaleString("vi-VN")}₫</p>
              </div>
              <Receipt className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Overview */}
      {Object.keys(categoryTotals).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiêu theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const total = categoryTotals[category] || 0
                return (
                  <div key={category} className="text-center">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                      <Receipt className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm font-medium">{category}</p>
                    <p className="text-xs text-gray-500">{(total / 1000000).toFixed(1)}M₫</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề, mô tả..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sự kiện" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {uniqueEvents.map((event) => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              // Export CSV functionality
              const csv = [
                ["Ngày", "Tiêu đề", "Số tiền", "Danh mục", "Sự kiện", "Mô tả"],
                ...expenses.map(e => [
                  new Date(e.createdAt).toLocaleDateString("vi-VN"),
                  e.title || "",
                  e.amount.toLocaleString("vi-VN"),
                  e.category || "",
                  e.event || "",
                  e.description || ""
                ])
              ].map(row => row.join(",")).join("\n")
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
              const link = document.createElement("a")
              link.href = URL.createObjectURL(blob)
              link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`
              link.click()
            }}>
              <Download className="mr-2 h-4 w-4" />
              Xuất CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách chi tiêu</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-500 mt-3">Đang tải chi tiêu...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có chi tiêu nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Chiến dịch</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Sự kiện</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => {
                  const dateStr = new Date(expense.createdAt).toLocaleDateString("vi-VN")
                  return (
                    <TableRow key={expense.id}>
                      <TableCell>{dateStr}</TableCell>
                      <TableCell className="font-medium">{expense.title}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        -{expense.amount.toLocaleString("vi-VN")}₫
                      </TableCell>
                      <TableCell>
                        {expense.activity ? (
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{expense.activity.title}</div>
                            {expense.activity.location && (
                              <div className="text-xs text-gray-500">{expense.activity.location}</div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline">Chi tiêu chung</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category || "Khác"}</Badge>
                      </TableCell>
                      <TableCell>{expense.event || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
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
                                <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này không thể hoàn tác. Khoản chi "{expense.title}" sẽ bị xóa vĩnh viễn.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(expense.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}