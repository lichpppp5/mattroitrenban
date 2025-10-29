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
import { Switch } from "@/components/ui/switch"
import { Download, Search, Plus, DollarSign, CheckCircle, XCircle, Calendar, MapPin, Clock, AlertTriangle } from "lucide-react"

export default function AdminDonations() {
  const [donations, setDonations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPublicFilter, setIsPublicFilter] = useState("all")
  const [confirmedFilter, setConfirmedFilter] = useState("all") // all, confirmed, pending
  
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    message: "",
    isPublic: true,
    isAnonymous: false,
  })

  // Helper function to check if donation is overdue (unconfirmed after 24h)
  const isOverdue = (donation: any) => {
    if (donation.isConfirmed) return false
    const createdAt = new Date(donation.createdAt)
    const now = new Date()
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    return hoursDiff >= 24
  }

  // Fetch donations from API
  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (isPublicFilter !== "all") params.append("isPublic", isPublicFilter === "public" ? "true" : "false")
      // Don't filter by isConfirmed if "overdue" - we'll filter client-side
      if (confirmedFilter !== "all" && confirmedFilter !== "overdue") {
        params.append("isConfirmed", confirmedFilter === "confirmed" ? "true" : "false")
      }
      
      const response = await fetch(`/api/donations?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch donations")
      let data = await response.json()
      
      // Filter overdue donations client-side if needed
      if (confirmedFilter === "overdue") {
        data = data.filter((d: any) => !d.isConfirmed && isOverdue(d))
      }
      
      setDonations(data)
      setError("")
    } catch (err: any) {
      console.error("Error fetching donations:", err)
      setError(err.message || "Failed to load donations")
    } finally {
      setIsLoading(false)
    }
  }

  // Re-fetch when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchDonations()
    }
  }, [searchQuery, isPublicFilter, confirmedFilter])

  const handleConfirm = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xác nhận đã nhận được tiền quyên góp này?")) {
      return
    }

    try {
      const response = await fetch(`/api/donations/${id}/confirm`, {
        method: "PUT",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to confirm donation")
      }

      await fetchDonations()
      alert("Đã xác nhận quyên góp thành công!")
    } catch (err: any) {
      console.error("Error confirming donation:", err)
      alert(err.message || "Failed to confirm donation")
    }
  }

  const handleCreate = () => {
    setFormData({
      name: "",
      amount: "",
      message: "",
      isPublic: true,
      isAnonymous: false,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        alert("Vui lòng nhập số tiền hợp lệ")
        return
      }

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create donation")
      }

      await fetchDonations()
      setIsDialogOpen(false)
    } catch (err: any) {
      console.error("Error saving donation:", err)
      alert(err.message || "Failed to save donation")
    }
  }

  // Calculate stats - ONLY confirmed donations
  const confirmedDonations = donations.filter(d => d.isConfirmed)
  const totalAmount = confirmedDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
  const donationCount = confirmedDonations.length
  const averageAmount = donationCount > 0 ? totalAmount / donationCount : 0
  
  // Get current month donations - only confirmed
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthDonations = confirmedDonations.filter(d => {
    const date = new Date(d.createdAt)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  const thisMonthAmount = thisMonthDonations.reduce((sum, d) => sum + (d.amount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Quyên góp</h2>
          <p className="text-gray-600">Theo dõi và quản lý tất cả quyên góp</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleCreate}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm quyên góp
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm quyên góp mới</DialogTitle>
              <DialogDescription>
                Thêm một khoản quyên góp mới vào hệ thống
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Tên người quyên góp</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nguyễn Văn A"
                  disabled={formData.isAnonymous}
                />
              </div>
              <div>
                <Label htmlFor="amount">Số tiền (VND) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="500000"
                />
              </div>
              <div>
                <Label htmlFor="message">Lời nhắn</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Lời nhắn từ người quyên góp..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => setFormData({...formData, isAnonymous: checked})}
                />
                <Label htmlFor="isAnonymous">Ẩn danh</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({...formData, isPublic: checked})}
                />
                <Label htmlFor="isPublic">Hiển thị công khai</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave}>
                Tạo mới
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
                <p className="text-sm text-gray-600">Tổng quyên góp</p>
                <p className="text-2xl font-bold">{totalAmount.toLocaleString("vi-VN")}₫</p>
                <p className="text-xs text-gray-500 mt-1">Chỉ tính đã xác nhận</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Số lượt quyên góp</p>
                <p className="text-2xl font-bold">{donationCount}</p>
                <p className="text-xs text-gray-500 mt-1">Đã xác nhận: {donationCount} / Tổng: {donations.length}</p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-500" />
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
              <DollarSign className="h-12 w-12 text-purple-500" />
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
              <DollarSign className="h-12 w-12 text-orange-500" />
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
                  placeholder="Tìm kiếm theo tên, số tiền..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={isPublicFilter} onValueChange={setIsPublicFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Hiển thị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="public">Công khai</SelectItem>
                <SelectItem value="private">Riêng tư</SelectItem>
              </SelectContent>
            </Select>
            <Select value={confirmedFilter} onValueChange={setConfirmedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Xác nhận" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="overdue">Chưa Nhận (&gt;24h)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              // Export CSV functionality
              const csv = [
                ["Ngày", "Người quyên góp", "Số tiền", "Lời nhắn", "Trạng thái"],
                ...donations.map(d => [
                  new Date(d.createdAt).toLocaleDateString("vi-VN"),
                  d.isAnonymous ? "Anonymous" : (d.name || "N/A"),
                  d.amount.toLocaleString("vi-VN"),
                  d.message || "",
                  d.isPublic ? "Công khai" : "Riêng tư"
                ])
              ].map(row => row.join(",")).join("\n")
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
              const link = document.createElement("a")
              link.href = URL.createObjectURL(blob)
              link.download = `donations-${new Date().toISOString().split('T')[0]}.csv`
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
          <CardTitle>Danh sách quyên góp</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-500 mt-3">Đang tải quyên góp...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có quyên góp nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Người quyên góp</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Chiến dịch</TableHead>
                  <TableHead>Lời nhắn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Xác nhận</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => {
                  const dateStr = new Date(donation.createdAt).toLocaleDateString("vi-VN")
                  const overdue = isOverdue(donation)
                  const rowClass = !donation.isConfirmed 
                    ? overdue 
                      ? "bg-red-50 hover:bg-red-100" 
                      : "bg-yellow-50 hover:bg-yellow-100"
                    : ""
                  
                  return (
                    <TableRow key={donation.id} className={rowClass}>
                      <TableCell>{dateStr}</TableCell>
                      <TableCell className="font-medium">
                        {donation.isAnonymous || !donation.name ? "Anonymous" : donation.name}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {donation.amount.toLocaleString("vi-VN")}₫
                      </TableCell>
                      <TableCell>
                        {donation.activity ? (
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{donation.activity.title}</div>
                            {donation.activity.location && (
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                {donation.activity.location}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline">Quyên góp chung</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {donation.message || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={donation.isPublic ? "default" : "secondary"}>
                            {donation.isPublic ? "Công khai" : "Riêng tư"}
                          </Badge>
                          {donation.isConfirmed ? (
                            <div className="flex items-center text-xs text-green-600 mt-1">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Đã xác nhận
                            </div>
                          ) : overdue ? (
                            <div className="flex items-center text-xs text-red-600 mt-1 font-semibold">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Chưa Nhận
                            </div>
                          ) : (
                            <div className="flex items-center text-xs text-yellow-600 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              Chờ xác nhận
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {donation.isConfirmed ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Đã xác nhận
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirm(donation.id)}
                            className={overdue 
                              ? "bg-red-50 hover:bg-red-100 border-red-300 text-red-700" 
                              : "bg-yellow-50 hover:bg-yellow-100 border-yellow-300 text-yellow-700"
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Xác nhận
                          </Button>
                        )}
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