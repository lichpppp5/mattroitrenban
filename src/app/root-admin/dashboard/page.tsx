"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Receipt, Wallet, Users, Activity as ActivityIcon, TrendingUp, Loader2, Target, Gift, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function AdminDashboard() {
  const [kpiData, setKpiData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchKPIData()
  }, [])

  const fetchKPIData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/kpi")
      if (!response.ok) throw new Error("Failed to fetch KPI data")
      const data = await response.json()
      setKpiData(data)
      setError("")
    } catch (err: any) {
      console.error("Error fetching KPI data:", err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error || !kpiData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">{error || "Không thể tải dữ liệu"}</p>
          <Button onClick={fetchKPIData} className="mt-4">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  const kpiCards = [
    {
      title: "Tổng thu",
      value: kpiData.totalDonations?.toLocaleString("vi-VN") || "0",
      unit: "VND",
      icon: DollarSign,
      color: "bg-green-500",
      trend: "+12.5%",
    },
    {
      title: "Quyên góp dự án",
      value: (kpiData.totalCampaignDonations || 0).toLocaleString("vi-VN"),
      unit: "VND",
      icon: Target,
      color: "bg-blue-500",
      trend: `Chiếm ${kpiData.totalDonations > 0 ? Math.round((kpiData.totalCampaignDonations / kpiData.totalDonations) * 100) : 0}%`,
    },
    {
      title: "Quyên góp chung",
      value: (kpiData.totalGeneralDonations || 0).toLocaleString("vi-VN"),
      unit: "VND",
      icon: Gift,
      color: "bg-purple-500",
      trend: `Chiếm ${kpiData.totalDonations > 0 ? Math.round((kpiData.totalGeneralDonations / kpiData.totalDonations) * 100) : 0}%`,
    },
    {
      title: "Tổng chi",
      value: kpiData.totalExpenses?.toLocaleString("vi-VN") || "0",
      unit: "VND",
      icon: Receipt,
      color: "bg-red-500",
      trend: "+8.3%",
    },
    {
      title: "Số dư",
      value: kpiData.balance?.toLocaleString("vi-VN") || "0",
      unit: "VND",
      icon: Wallet,
      color: "bg-orange-500",
      trend: "Stable",
    },
    {
      title: "Người quyên góp",
      value: kpiData.uniqueDonors?.toLocaleString("vi-VN") || "0",
      unit: "người",
      icon: Users,
      color: "bg-teal-500",
      trend: "+15%",
    },
    {
      title: "Hoạt động",
      value: kpiData.totalActivities?.toLocaleString("vi-VN") || "0",
      unit: "sự kiện",
      icon: ActivityIcon,
      color: "bg-yellow-500",
      trend: "+5",
    },
  ]

  const trendData = kpiData.monthlyData?.map((month: any) => ({
    date: month.month,
    amount: month.income * 1000000, // Convert back from millions
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Tổng quan hoạt động và tài chính</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Chọn kỳ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày qua</SelectItem>
              <SelectItem value="30">30 ngày qua</SelectItem>
              <SelectItem value="90">3 tháng qua</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Xuất báo cáo</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {kpi.title}
                </CardTitle>
                <div className={`${kpi.color} rounded-full p-2`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-gray-500">
                  {kpi.unit} • <span className="text-green-600">{kpi.trend}</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Thu vs Chi theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpiData.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}M VND`} />
                <Bar dataKey="income" fill="#10B981" name="Thu" />
                <Bar dataKey="expense" fill="#EF4444" name="Chi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ chi tiêu</CardTitle>
          </CardHeader>
          <CardContent>
            {kpiData.categoryData && kpiData.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={kpiData.categoryData}
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
                    {kpiData.categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}M VND`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Chưa có dữ liệu chi tiêu
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Xu hướng quyên góp</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString("vi-VN")} VND`} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Chưa có dữ liệu quyên góp
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Stats */}
      {kpiData.activityStats && kpiData.activityStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo dự án</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpiData.activityStats.map((stat: any) => (
                <div
                  key={stat.activityId}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{stat.activityTitle}</h3>
                        <Link
                          href={`/root-admin/activities/${stat.activityId}/stats`}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          Chi tiết
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Tổng quyên góp</p>
                          <p className="text-lg font-bold text-green-600">
                            {stat.totalAmount.toLocaleString("vi-VN")}₫
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Số lượt quyên góp</p>
                          <p className="text-lg font-bold">
                            {stat.donationCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Người quyên góp</p>
                          <p className="text-lg font-bold">
                            {stat.donorCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {kpiData.recentActivity && kpiData.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {kpiData.recentActivity.map((activity: any, index: number) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    activity.type === 'donation' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{activity.description}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(activity.timestamp).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={`font-bold ${
                      activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {activity.amount > 0 ? '+' : ''}
                    {activity.amount.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Chưa có hoạt động nào
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
