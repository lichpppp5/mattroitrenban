"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, DollarSign, Users, TrendingUp, Calendar, MapPin, Receipt, Wallet, Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RechartsPieChart, Pie as RechartsPie, Cell as RechartsCell } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function ActivityStatsPage() {
  const params = useParams()
  const router = useRouter()
  const activityId = params.id as string
  
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (activityId) {
      fetchStats()
    }
  }, [activityId])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/activities/${activityId}/stats`)
      if (!response.ok) throw new Error("Failed to fetch activity stats")
      const data = await response.json()
      setStats(data)
      setError("")
    } catch (err: any) {
      console.error("Error fetching activity stats:", err)
      setError(err.message || "Failed to load activity stats")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">{error || "Không thể tải thống kê"}</p>
          <Button onClick={fetchStats} className="mt-4">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h2 className="text-3xl font-bold text-gray-900">Thống kê chi tiết dự án</h2>
        </div>
        <Button
          onClick={() => {
            try {
              // Create CSV content
              const csvRows = []
              
              // Header - Campaign Info
              csvRows.push(["THỐNG KÊ CHIẾN DỊCH"])
              csvRows.push([])
              csvRows.push(["Tên chiến dịch", stats.activity.title])
              if (stats.activity.location) {
                csvRows.push(["Địa điểm", stats.activity.location])
              }
              if (stats.activity.tripDate) {
                csvRows.push(["Ngày thực hiện", new Date(stats.activity.tripDate).toLocaleDateString("vi-VN")])
              }
              csvRows.push([])
              
              // Summary Stats
              csvRows.push(["TỔNG KẾT"])
              csvRows.push(["Tổng quyên góp", `${stats.stats.totalDonations.toLocaleString("vi-VN")} VND`])
              csvRows.push(["Số lượt quyên góp", stats.stats.donationCount])
              csvRows.push(["Người quyên góp", stats.stats.uniqueDonors])
              csvRows.push(["Trung bình mỗi lượt", `${stats.stats.averageDonation.toLocaleString("vi-VN")} VND`])
              csvRows.push(["Tổng chi tiêu", `${stats.stats.totalExpenses.toLocaleString("vi-VN")} VND`])
              csvRows.push(["Số khoản chi", stats.stats.expenseCount])
              csvRows.push(["Trung bình mỗi khoản", `${stats.stats.averageExpense.toLocaleString("vi-VN")} VND`])
              csvRows.push(["Số dư", `${stats.stats.balance.toLocaleString("vi-VN")} VND`])
              csvRows.push(["Tỷ lệ sử dụng", `${stats.stats.utilizationRate.toFixed(2)}%`])
              csvRows.push([])
              
              // Donations
              csvRows.push(["DANH SÁCH QUYÊN GÓP"])
              csvRows.push(["Ngày", "Người quyên góp", "Số tiền", "Lời nhắn", "Trạng thái"])
              stats.donations.forEach((donation: any) => {
                csvRows.push([
                  new Date(donation.createdAt).toLocaleDateString("vi-VN"),
                  donation.isAnonymous ? "Ẩn danh" : (donation.name || "N/A"),
                  donation.amount.toLocaleString("vi-VN"),
                  (donation.message || "").replace(/\n/g, " "),
                  donation.isPublic ? "Công khai" : "Riêng tư"
                ])
              })
              csvRows.push([])
              
              // Expenses
              if (stats.expenses && stats.expenses.length > 0) {
                csvRows.push(["DANH SÁCH CHI TIÊU"])
                csvRows.push(["Ngày", "Khoản mục", "Danh mục", "Số tiền", "Mô tả"])
                stats.expenses.forEach((expense: any) => {
                  csvRows.push([
                    new Date(expense.createdAt).toLocaleDateString("vi-VN"),
                    expense.title,
                    expense.category || "Khác",
                    expense.amount.toLocaleString("vi-VN"),
                    (expense.description || "").replace(/\n/g, " ")
                  ])
                })
                csvRows.push([])
              }
              
              // Monthly breakdown
              if (stats.monthlyData && stats.monthlyData.length > 0) {
                csvRows.push(["THỐNG KÊ THEO THÁNG"])
                csvRows.push(["Tháng", "Quyên góp", "Chi tiêu", "Số dư", "Số lượt quyên", "Số khoản chi"])
                stats.monthlyData.forEach((month: any) => {
                  csvRows.push([
                    month.month,
                    `${month.donations.toLocaleString("vi-VN")} VND`,
                    `${month.expenses.toLocaleString("vi-VN")} VND`,
                    `${month.balance.toLocaleString("vi-VN")} VND`,
                    month.donationCount || 0,
                    month.expenseCount || 0
                  ])
                })
              }
              
              // Category breakdown
              if (stats.categoryData && stats.categoryData.length > 0) {
                csvRows.push([])
                csvRows.push(["PHÂN BỔ CHI TIÊU THEO DANH MỤC"])
                csvRows.push(["Danh mục", "Số tiền"])
                stats.categoryData.forEach((cat: any) => {
                  csvRows.push([
                    cat.name,
                    `${cat.value.toLocaleString("vi-VN")} VND`
                  ])
                })
              }
              
              // Convert to CSV string
              const csv = csvRows.map(row => 
                row.map(cell => {
                  // Escape commas and quotes in CSV
                  const cellStr = String(cell || "")
                  if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
                    return `"${cellStr.replace(/"/g, '""')}"`
                  }
                  return cellStr
                }).join(",")
              ).join("\n")
              
              // Download
              const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
              const link = document.createElement("a")
              link.href = URL.createObjectURL(blob)
              const safeTitle = stats.activity.title.replace(/[^a-zA-Z0-9]/g, "-")
              link.download = `thong-ke-${safeTitle}-${new Date().toISOString().split('T')[0]}.csv`
              link.click()
            } catch (err: any) {
              console.error("Error exporting CSV:", err)
              alert("Lỗi khi xuất file CSV: " + (err.message || "Unknown error"))
            }
          }}
          className="mb-4"
        >
          <Download className="h-4 w-4 mr-2" />
          Xuất CSV
        </Button>
      </div>

      {/* Activity Info */}
      <div className="mt-2 space-y-1">
        <h3 className="text-xl font-semibold text-gray-800">{stats.activity.title}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {stats.activity.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {stats.activity.location}
            </div>
          )}
          {stats.activity.tripDate && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(stats.activity.tripDate).toLocaleDateString("vi-VN")}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards - Donations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng quyên góp</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.stats.totalDonations.toLocaleString("vi-VN")}₫
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.stats.donationCount} lượt
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.stats.totalExpenses.toLocaleString("vi-VN")}₫
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.stats.expenseCount} khoản
                </p>
              </div>
              <Receipt className="h-12 w-12 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={`border-l-4 ${stats.stats.balance >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Số dư</p>
                <p className={`text-2xl font-bold ${stats.stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {stats.stats.balance.toLocaleString("vi-VN")}₫
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Tỷ lệ SD: {stats.stats.utilizationRate.toFixed(1)}%
                </p>
              </div>
              <Wallet className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Người quyên góp</p>
                <p className="text-2xl font-bold">
                  {stats.stats.uniqueDonors}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  TB: {stats.stats.averageDonation.toLocaleString("vi-VN")}₫
                </p>
              </div>
              <Users className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Thu - Chi theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.monthlyData && stats.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")}₫`}
                  />
                  <Legend />
                  <Bar dataKey="donations" fill="#10B981" name="Quyên góp" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Chi tiêu" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Chưa có dữ liệu theo tháng
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ chi tiêu theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categoryData && stats.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <RechartsPie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => {
                      const percent = entry.percent as number
                      return `${entry.name} ${(percent * 100).toFixed(0)}%`
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.categoryData.map((entry: any, index: number) => {
                      const colors = ["#F4A261", "#2A9D8F", "#E76F51", "#E63946", "#457B9D", "#264653"]
                      return (
                        <RechartsCell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      )
                    })}
                  </RechartsPie>
                  <Tooltip formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")}₫`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Chưa có chi tiêu nào
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      {stats.expenses && stats.expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sao kê chi tiêu ({stats.expenses.length} khoản)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Khoản mục</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Mô tả</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.expenses.map((expense: any) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {new Date(expense.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category || "Khác"}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-red-600">
                      {expense.amount.toLocaleString("vi-VN")}₫
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {expense.description || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách quyên góp ({stats.donations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.donations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Người quyên góp</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Lời nhắn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.donations.map((donation: any) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      {new Date(donation.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {donation.isAnonymous || !donation.name ? "Ẩn danh" : donation.name}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {donation.amount.toLocaleString("vi-VN")}₫
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {donation.message || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Chưa có quyên góp nào cho dự án này
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

