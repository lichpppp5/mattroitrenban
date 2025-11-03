"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign, Receipt, Wallet, TrendingUp, Users, ExternalLink, Calendar, MapPin, Download } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export default function CampaignsStatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/campaigns/stats")
      if (!response.ok) throw new Error("Failed to fetch campaigns stats")
      const data = await response.json()
      setStats(data)
      setError("")
    } catch (err: any) {
      console.error("Error fetching campaigns stats:", err)
      setError(err.message || "Failed to load campaigns stats")
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

  const chartData = stats.campaignsStats.map((campaign: any) => ({
    name: campaign.activityTitle.length > 20 
      ? campaign.activityTitle.substring(0, 20) + "..." 
      : campaign.activityTitle,
    quyênGóp: campaign.stats.totalDonations,
    chiTiêu: campaign.stats.totalExpenses,
    sốDư: campaign.stats.balance,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Thống kê theo Chiến dịch</h2>
          <p className="text-gray-600">Tổng quan quyên góp và chi tiêu của tất cả chiến dịch</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng quyên góp</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.overallStats.totalDonations.toLocaleString("vi-VN")}₫
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.overallStats.totalExpenses.toLocaleString("vi-VN")}₫
                </p>
              </div>
              <Receipt className="h-12 w-12 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng số dư</p>
                <p className={`text-2xl font-bold ${stats.overallStats.totalBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {stats.overallStats.totalBalance.toLocaleString("vi-VN")}₫
                </p>
              </div>
              <Wallet className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Số chiến dịch</p>
                <p className="text-2xl font-bold">
                  {stats.overallStats.totalCampaigns}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.overallStats.totalDonationCount} quyên góp • {stats.overallStats.totalExpenseCount} chi tiêu
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ Thu - Chi theo Chiến dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")}₫`}
                />
                <Legend />
                <Bar dataKey="quyênGóp" fill="#10B981" name="Quyên góp" />
                <Bar dataKey="chiTiêu" fill="#EF4444" name="Chi tiêu" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết từng Chiến dịch</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.campaignsStats.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chiến dịch</TableHead>
                    <TableHead>Địa điểm</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Quyên góp</TableHead>
                    <TableHead>Chi tiêu</TableHead>
                    <TableHead>Số dư</TableHead>
                    <TableHead>Tỷ lệ SD</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.campaignsStats.map((campaign: any) => (
                    <TableRow key={campaign.activityId}>
                      <TableCell className="font-medium">
                        <div className="max-w-xs">
                          <div className="font-semibold">{campaign.activityTitle}</div>
                          {campaign.isUpcoming && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Sắp tới
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {campaign.location ? (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            {campaign.location}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {campaign.tripDate ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {new Date(campaign.tripDate).toLocaleDateString("vi-VN")}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-green-600">
                            {campaign.stats.totalDonations.toLocaleString("vi-VN")}₫
                          </div>
                          <div className="text-xs text-gray-500">
                            {campaign.stats.donationCount} lượt • {campaign.stats.uniqueDonors} người
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-red-600">
                            {campaign.stats.totalExpenses.toLocaleString("vi-VN")}₫
                          </div>
                          <div className="text-xs text-gray-500">
                            {campaign.stats.expenseCount} khoản
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-semibold ${
                          campaign.stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {campaign.stats.balance.toLocaleString("vi-VN")}₫
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className={`font-semibold ${
                            campaign.stats.utilizationRate <= 80 ? 'text-green-600' :
                            campaign.stats.utilizationRate <= 100 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {campaign.stats.utilizationRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">tỷ lệ sử dụng</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/root-admin/activities/${campaign.activityId}/stats`}
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                          >
                            Chi tiết
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                // Fetch detailed stats for this campaign
                                const response = await fetch(`/api/activities/${campaign.activityId}/stats`)
                                if (!response.ok) throw new Error("Failed to fetch campaign details")
                                const data = await response.json()
                                
                                // Create CSV content
                                const csvRows = []
                                
                                // Header - Campaign Info
                                csvRows.push(["THỐNG KÊ CHIẾN DỊCH"])
                                csvRows.push([])
                                csvRows.push(["Tên chiến dịch", data.activity.title])
                                if (data.activity.location) {
                                  csvRows.push(["Địa điểm", data.activity.location])
                                }
                                if (data.activity.tripDate) {
                                  csvRows.push(["Ngày thực hiện", new Date(data.activity.tripDate).toLocaleDateString("vi-VN")])
                                }
                                csvRows.push([])
                                
                                // Summary Stats
                                csvRows.push(["TỔNG KẾT"])
                                csvRows.push(["Tổng quyên góp", `${data.stats.totalDonations.toLocaleString("vi-VN")} VND`])
                                csvRows.push(["Số lượt quyên góp", data.stats.donationCount])
                                csvRows.push(["Người quyên góp", data.stats.uniqueDonors])
                                csvRows.push(["Trung bình mỗi lượt", `${data.stats.averageDonation.toLocaleString("vi-VN")} VND`])
                                csvRows.push(["Tổng chi tiêu", `${data.stats.totalExpenses.toLocaleString("vi-VN")} VND`])
                                csvRows.push(["Số khoản chi", data.stats.expenseCount])
                                csvRows.push(["Trung bình mỗi khoản", `${data.stats.averageExpense.toLocaleString("vi-VN")} VND`])
                                csvRows.push(["Số dư", `${data.stats.balance.toLocaleString("vi-VN")} VND`])
                                csvRows.push(["Tỷ lệ sử dụng", `${data.stats.utilizationRate.toFixed(2)}%`])
                                csvRows.push([])
                                
                                // Donations
                                csvRows.push(["DANH SÁCH QUYÊN GÓP"])
                                csvRows.push(["Ngày", "Người quyên góp", "Số tiền", "Lời nhắn", "Trạng thái"])
                                data.donations.forEach((donation: any) => {
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
                                if (data.expenses && data.expenses.length > 0) {
                                  csvRows.push(["DANH SÁCH CHI TIÊU"])
                                  csvRows.push(["Ngày", "Khoản mục", "Danh mục", "Số tiền", "Mô tả"])
                                  data.expenses.forEach((expense: any) => {
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
                                if (data.monthlyData && data.monthlyData.length > 0) {
                                  csvRows.push(["THỐNG KÊ THEO THÁNG"])
                                  csvRows.push(["Tháng", "Quyên góp", "Chi tiêu", "Số dư", "Số lượt quyên", "Số khoản chi"])
                                  data.monthlyData.forEach((month: any) => {
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
                                link.download = `thong-ke-${data.activity.title.replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split('T')[0]}.csv`
                                link.click()
                              } catch (err: any) {
                                console.error("Error exporting CSV:", err)
                                alert("Lỗi khi xuất file CSV: " + (err.message || "Unknown error"))
                              }
                            }}
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            CSV
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Chưa có chiến dịch nào
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

