"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Download, Loader2, Target, Gift, Receipt, Wallet, MapPin, Users, Heart, AlertCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts"

interface TransparencyData {
  summary: {
    totalDonations: number
    totalCampaignDonations: number
    totalGeneralDonations: number
    totalExpenses: number
    balance: number
    donationCount: number
    expenseCount: number
  }
  monthlyData: Array<{
    month: string
    income: number
    expense: number
    balance: number
  }>
  categoryData: Array<{
    name: string
    value: number
    color: string
  }>
  donations: Array<{
    id: string
    name: string
    amount: number
    message: string | null
    isAnonymous: boolean
    createdAt: string
    activity: {
      id: string
      title: string
      slug: string
      location: string | null
    } | null
  }>
  expenses: Array<{
    id: string
    title: string
    amount: number
    description: string | null
    category: string | null
    createdAt: string
    activity: {
      id: string
      title: string
      slug: string
      location: string | null
    } | null
  }>
  transactions: Array<{
    id: string
    type: "income" | "expense"
    date: string
    description: string
    amount: number
    detail: any
  }>
}

export default function Transparency() {
  const [data, setData] = useState<TransparencyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<"all" | "campaign" | "general">("all")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/transparency")
      if (!response.ok) throw new Error("Failed to fetch transparency data")
      const transparencyData = await response.json()
      setData(transparencyData)
      setError("")
    } catch (err: any) {
      console.error("Error fetching transparency data:", err)
      setError(err.message || "Không thể tải dữ liệu minh bạch")
    } finally {
      setLoading(false)
    }
  }

  const filteredDonations = data?.donations.filter(d => {
    if (selectedFilter === "campaign") return d.activity !== null
    if (selectedFilter === "general") return d.activity === null
    return true
  }) || []

  const filteredTransactions = data?.transactions.filter(t => {
    if (selectedFilter === "campaign") {
      if (t.type === "income") return t.detail.activity !== null
      if (t.type === "expense") return t.detail.activity !== null
    }
    if (selectedFilter === "general") {
      if (t.type === "income") return t.detail.activity === null
      if (t.type === "expense") return t.detail.activity === null
    }
    return true
  }) || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-gray-600">Đang tải dữ liệu minh bạch...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || "Không thể tải dữ liệu"}</p>
          <Button onClick={fetchData}>Thử lại</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-4 shadow-lg transform hover:scale-105 transition-transform">
                <DollarSign className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-poppins">
              Minh bạch tài chính
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Chúng tôi cam kết minh bạch hoàn toàn trong việc sử dụng mọi đồng quyên góp. 
              Tất cả các khoản thu chi đều được công khai và cập nhật theo thời gian thực.
            </p>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-green-500 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng quyên góp</p>
                    <p className="text-2xl font-bold text-green-600">
                      {data.summary.totalDonations.toLocaleString("vi-VN")}₫
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {data.summary.donationCount} lượt quyên góp
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Quyên góp dự án</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {data.summary.totalCampaignDonations.toLocaleString("vi-VN")}₫
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {data.summary.totalDonations > 0 
                        ? Math.round((data.summary.totalCampaignDonations / data.summary.totalDonations) * 100) 
                        : 0}% tổng quyên góp
                    </p>
                  </div>
                  <Target className="h-12 w-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Quyên góp chung</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {data.summary.totalGeneralDonations.toLocaleString("vi-VN")}₫
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {data.summary.totalDonations > 0 
                        ? Math.round((data.summary.totalGeneralDonations / data.summary.totalDonations) * 100) 
                        : 0}% tổng quyên góp
                    </p>
                  </div>
                  <Gift className="h-12 w-12 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={`border-l-4 shadow-lg ${data.summary.balance >= 0 ? 'border-l-red-500' : 'border-l-orange-500'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                    <p className="text-2xl font-bold text-red-600">
                      {data.summary.totalExpenses.toLocaleString("vi-VN")}₫
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {data.summary.expenseCount} khoản chi
                    </p>
                  </div>
                  <Receipt className="h-12 w-12 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Balance Card */}
          <Card className={`border-2 shadow-lg mb-8 ${data.summary.balance >= 0 ? 'border-blue-300 bg-blue-50' : 'border-orange-300 bg-orange-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Số dư quỹ hiện tại</p>
                  <p className={`text-3xl font-bold ${data.summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {data.summary.balance.toLocaleString("vi-VN")}₫
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tỷ lệ sử dụng: {data.summary.totalDonations > 0 
                      ? Math.round((data.summary.totalExpenses / data.summary.totalDonations) * 100) 
                      : 0}%
                  </p>
                </div>
                <Wallet className={`h-16 w-16 ${data.summary.balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Income vs Expense Chart */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Biểu đồ thu chi theo tháng</CardTitle>
              </CardHeader>
              <CardContent>
                {data.monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")}₫`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#10B981" 
                        strokeWidth={2} 
                        name="Quyên góp" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expense" 
                        stroke="#EF4444" 
                        strokeWidth={2} 
                        name="Chi tiêu" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    Chưa có dữ liệu theo tháng
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expense Distribution */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Phân bổ chi tiêu theo danh mục</CardTitle>
              </CardHeader>
              <CardContent>
                {data.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.categoryData}
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
                        {data.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")}₫`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    Chưa có chi tiêu nào
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Balance Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Số dư quỹ theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              {data.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")}₫`} />
                    <Bar dataKey="balance" fill="#3B82F6" name="Số dư" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  Chưa có dữ liệu theo tháng
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Detailed Transactions */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Chi tiết giao dịch</h2>
            <div className="flex items-center gap-4">
              <Select value={selectedFilter} onValueChange={(value: any) => setSelectedFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Lọc giao dịch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="campaign">Quyên góp dự án</SelectItem>
                  <SelectItem value="general">Quyên góp chung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="donations">Quyên góp</TabsTrigger>
              <TabsTrigger value="expenses">Chi tiêu</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Giao dịch gần đây</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ngày</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Chiến dịch</TableHead>
                            <TableHead className="text-right">Số tiền</TableHead>
                            <TableHead>Loại</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                {new Date(transaction.date).toLocaleDateString("vi-VN")}
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-medium">{transaction.description}</p>
                                  {transaction.type === "income" && transaction.detail.message && (
                                    <p className="text-xs text-gray-500 truncate">
                                      {transaction.detail.message}
                                    </p>
                                  )}
                                  {transaction.type === "expense" && transaction.detail.description && (
                                    <p className="text-xs text-gray-500 truncate">
                                      {transaction.detail.description}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {transaction.detail.activity ? (
                                  <Link 
                                    href={`/activities/${transaction.detail.activity.slug}`}
                                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                  >
                                    <Target className="h-3 w-3" />
                                    {transaction.detail.activity.title}
                                  </Link>
                                ) : (
                                  <Badge variant="outline">Chung</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                                  {transaction.amount > 0 ? "+" : ""}{transaction.amount.toLocaleString("vi-VN")}₫
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                                  {transaction.type === "income" ? "Thu" : "Chi"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Chưa có giao dịch nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="donations" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Danh sách quyên góp ({filteredDonations.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredDonations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ngày</TableHead>
                            <TableHead>Người quyên góp</TableHead>
                            <TableHead>Chiến dịch</TableHead>
                            <TableHead className="text-right">Số tiền</TableHead>
                            <TableHead>Lời nhắn</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDonations.map((donation) => (
                            <TableRow key={donation.id}>
                              <TableCell>
                                {new Date(donation.createdAt).toLocaleDateString("vi-VN")}
                              </TableCell>
                              <TableCell className="font-medium">
                                {donation.isAnonymous ? (
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <Users className="h-4 w-4" />
                                    Người ủng hộ ẩn danh
                                  </span>
                                ) : (
                                  donation.name
                                )}
                              </TableCell>
                              <TableCell>
                                {donation.activity ? (
                                  <Link 
                                    href={`/activities/${donation.activity.slug}`}
                                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                  >
                                    <Target className="h-3 w-3" />
                                    {donation.activity.title}
                                  </Link>
                                ) : (
                                  <Badge variant="outline">Quyên góp chung</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-bold text-green-600">
                                {donation.amount.toLocaleString("vi-VN")}₫
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <p className="text-sm text-gray-600 truncate">
                                  {donation.message || "-"}
                                </p>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Chưa có quyên góp nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Danh sách chi tiêu ({data.expenses.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {data.expenses.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ngày</TableHead>
                            <TableHead>Khoản mục</TableHead>
                            <TableHead>Chiến dịch</TableHead>
                            <TableHead>Danh mục</TableHead>
                            <TableHead className="text-right">Số tiền</TableHead>
                            <TableHead>Mô tả</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.expenses.map((expense) => (
                            <TableRow key={expense.id}>
                              <TableCell>
                                {new Date(expense.createdAt).toLocaleDateString("vi-VN")}
                              </TableCell>
                              <TableCell className="font-medium">{expense.title}</TableCell>
                              <TableCell>
                                {expense.activity ? (
                                  <Link 
                                    href={`/activities/${expense.activity.slug}`}
                                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                  >
                                    <Target className="h-3 w-3" />
                                    {expense.activity.title}
                                  </Link>
                                ) : (
                                  <Badge variant="outline">Chi tiêu chung</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{expense.category || "Khác"}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-bold text-red-600">
                                {expense.amount.toLocaleString("vi-VN")}₫
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <p className="text-sm text-gray-600 truncate">
                                  {expense.description || "-"}
                                </p>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Chưa có chi tiêu nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Transparency Commitment */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-poppins">
            Cam kết minh bạch của chúng tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div>
              <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Công khai tài chính</h3>
              <p className="text-sm">
                Mọi khoản thu chi đều được công khai và cập nhật theo thời gian thực
              </p>
            </div>
            <div>
              <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Báo cáo định kỳ</h3>
              <p className="text-sm">
                Báo cáo tài chính chi tiết theo từng chiến dịch và theo tháng
              </p>
            </div>
            <div>
              <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hiệu quả sử dụng</h3>
              <p className="text-sm">
                Đảm bảo mọi đồng quyên góp được sử dụng hiệu quả và minh bạch nhất
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
