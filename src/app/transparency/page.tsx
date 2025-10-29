"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Download } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"

export default function Transparency() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Sample data
  const monthlyData = [
    { month: "T1", income: 50000000, expense: 30000000, balance: 20000000 },
    { month: "T2", income: 75000000, expense: 45000000, balance: 30000000 },
    { month: "T3", income: 60000000, expense: 40000000, balance: 20000000 },
    { month: "T4", income: 80000000, expense: 50000000, balance: 30000000 },
    { month: "T5", income: 70000000, expense: 35000000, balance: 35000000 },
    { month: "T6", income: 90000000, expense: 60000000, balance: 30000000 },
  ]

  const expenseData = [
    { name: "Giáo dục", value: 200000000, color: "#F4A261" },
    { name: "Y tế", value: 150000000, color: "#2A9D8F" },
    { name: "Cơ sở hạ tầng", value: 100000000, color: "#E76F51" },
    { name: "Hỗ trợ khẩn cấp", value: 50000000, color: "#264653" },
  ]

  const recentTransactions = [
    { id: 1, date: "2024-06-15", description: "Quyên góp từ Nguyễn Văn A", amount: 500000, type: "income" },
    { id: 2, date: "2024-06-14", description: "Xây dựng trường học tại bản X", amount: -20000000, type: "expense" },
    { id: 3, date: "2024-06-13", description: "Quyên góp từ Trần Thị B", amount: 1000000, type: "income" },
    { id: 4, date: "2024-06-12", description: "Khám bệnh miễn phí", amount: -5000000, type: "expense" },
    { id: 5, date: "2024-06-11", description: "Quyên góp từ người ẩn danh", amount: 200000, type: "income" },
  ]

  const totalIncome = 500000000
  const totalExpense = 400000000
  const currentBalance = totalIncome - totalExpense

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-poppins">
              Minh bạch tài chính
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Chúng tôi cam kết minh bạch hoàn toàn trong việc sử dụng mọi đồng quyên góp. 
              Tất cả các khoản thu chi đều được công khai và báo cáo định kỳ.
            </p>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-full p-3 mr-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Tổng thu</p>
                    <p className="text-2xl font-bold text-green-700">
                      {totalIncome.toLocaleString()}đ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-red-500 rounded-full p-3 mr-4">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">Tổng chi</p>
                    <p className="text-2xl font-bold text-red-700">
                      {totalExpense.toLocaleString()}đ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-full p-3 mr-4">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Số dư hiện tại</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {currentBalance.toLocaleString()}đ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">Lọc theo:</span>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="education">Giáo dục</SelectItem>
                <SelectItem value="healthcare">Y tế</SelectItem>
                <SelectItem value="infrastructure">Cơ sở hạ tầng</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Income vs Expense Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Biểu đồ thu chi theo tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString()}đ`} />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Thu" />
                    <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} name="Chi" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bổ chi tiêu theo danh mục</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseData}
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
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()}đ`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Balance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Số dư quỹ theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString()}đ`} />
                  <Bar dataKey="balance" fill="#3B82F6" name="Số dư" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Giao dịch gần đây</h2>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Xem tất cả
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Loại</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="text-right">
                        <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                          {transaction.amount > 0 ? "+" : ""}{transaction.amount.toLocaleString()}đ
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
            </CardContent>
          </Card>
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
                Mọi khoản thu chi đều được công khai và báo cáo định kỳ
              </p>
            </div>
            <div>
              <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Báo cáo định kỳ</h3>
              <p className="text-sm">
                Báo cáo tài chính hàng tháng và hàng quý
              </p>
            </div>
            <div>
              <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hiệu quả sử dụng</h3>
              <p className="text-sm">
                Đảm bảo mọi đồng quyên góp được sử dụng hiệu quả nhất
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
