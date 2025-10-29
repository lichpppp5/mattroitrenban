"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Receipt, Wallet, Users, Activity as ActivityIcon, TrendingUp } from "lucide-react"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function AdminDashboard() {
  // Sample data
  const monthlyData = [
    { month: "T1", income: 50, expense: 30 },
    { month: "T2", income: 75, expense: 45 },
    { month: "T3", income: 60, expense: 40 },
    { month: "T4", income: 80, expense: 50 },
  ]

  const categoryData = [
    { name: "Giáo dục", value: 200, color: "#F4A261" },
    { name: "Y tế", value: 150, color: "#2A9D8F" },
    { name: "Cơ sở hạ tầng", value: 100, color: "#E76F51" },
    { name: "Khác", value: 50, color: "#264653" },
  ]

  const trendData = [
    { date: "01/01", amount: 50000 },
    { date: "08/01", amount: 120000 },
    { date: "15/01", amount: 180000 },
    { date: "22/01", amount: 250000 },
  ]

  const kpiData = [
    {
      title: "Tổng thu",
      value: "500,000,000",
      unit: "VND",
      icon: DollarSign,
      color: "bg-green-500",
      trend: "+12.5%",
    },
    {
      title: "Tổng chi",
      value: "400,000,000",
      unit: "VND",
      icon: Receipt,
      color: "bg-red-500",
      trend: "+8.3%",
    },
    {
      title: "Số dư",
      value: "100,000,000",
      unit: "VND",
      icon: Wallet,
      color: "bg-blue-500",
      trend: "Stable",
    },
    {
      title: "Người quyên góp",
      value: "2,500",
      unit: "người",
      icon: Users,
      color: "bg-purple-500",
      trend: "+15%",
    },
    {
      title: "Hoạt động",
      value: "50",
      unit: "sự kiện",
      icon: ActivityIcon,
      color: "bg-orange-500",
      trend: "+5",
    },
  ]

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi) => {
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
              <BarChart data={monthlyData}>
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}M VND`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Xu hướng quyên góp</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toLocaleString()} VND`} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: "#3B82F6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-semibold">Nhận quyên góp từ Nguyễn Văn A</p>
                <p className="text-sm text-gray-600">500,000 VND • 2 giờ trước</p>
              </div>
              <span className="text-green-600 font-bold">+500,000₫</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-semibold">Chi phí xây dựng trường học</p>
                <p className="text-sm text-gray-600">20,000,000 VND • 5 giờ trước</p>
              </div>
              <span className="text-red-600 font-bold">-20,000,000₫</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
