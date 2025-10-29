"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search, Plus, Receipt, TrendingDown } from "lucide-react"

export default function AdminExpenses() {
  const expenses = [
    {
      id: 1,
      title: "Xây dựng trường học tại bản X",
      amount: 20000000,
      category: "Giáo dục",
      description: "Chi phí xây dựng 2 phòng học mới",
      spentBy: "Nguyễn Văn A",
      date: "2024-06-15",
      event: "Dự án giáo dục 2024",
    },
    {
      id: 2,
      title: "Khám bệnh miễn phí",
      amount: 5000000,
      category: "Y tế",
      description: "Chi phí thuốc và dụng cụ y tế",
      spentBy: "Trần Thị B",
      date: "2024-06-14",
      event: "Hoạt động y tế 2024",
    },
    {
      id: 3,
      title: "Trao học bổng",
      amount: 60000000,
      category: "Giáo dục",
      description: "30 suất học bổng x 2 triệu đồng",
      spentBy: "Lê Văn C",
      date: "2024-06-13",
      event: "Chương trình học bổng 2024",
    },
  ]

  const categories = [
    { name: "Giáo dục", color: "bg-blue-500" },
    { name: "Y tế", color: "bg-green-500" },
    { name: "Cơ sở hạ tầng", color: "bg-orange-500" },
    { name: "Hỗ trợ khẩn cấp", color: "bg-red-500" },
    { name: "Vận chuyển", color: "bg-purple-500" },
    { name: "Khác", color: "bg-gray-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý Chi tiêu</h2>
          <p className="text-gray-600">Theo dõi và quản lý tất cả chi tiêu</p>
        </div>
        <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
          <Plus className="mr-2 h-4 w-4" />
          Thêm chi tiêu
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                <p className="text-2xl font-bold">400,000,000₫</p>
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
                <p className="text-2xl font-bold">150</p>
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
                <p className="text-2xl font-bold">2,666,667₫</p>
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
                <p className="text-2xl font-bold">45,000,000₫</p>
              </div>
              <Receipt className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiêu theo danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div key={category.name} className="text-center">
                <div className={`${category.color} rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center`}>
                  <Receipt className="h-8 w-8 text-white" />
                </div>
                <p className="text-sm font-medium">{category.name}</p>
                <p className="text-xs text-gray-500">150M₫</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="education">Giáo dục</SelectItem>
                <SelectItem value="healthcare">Y tế</SelectItem>
                <SelectItem value="infrastructure">Cơ sở hạ tầng</SelectItem>
                <SelectItem value="emergency">Hỗ trợ khẩn cấp</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sự kiện" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="education-2024">Dự án giáo dục 2024</SelectItem>
                <SelectItem value="healthcare-2024">Hoạt động y tế 2024</SelectItem>
                <SelectItem value="scholarship-2024">Chương trình học bổng 2024</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Sự kiện</TableHead>
                <TableHead>Người chi</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell className="font-semibold text-red-600">
                    -{expense.amount.toLocaleString()}₫
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell>{expense.event}</TableCell>
                  <TableCell>{expense.spentBy}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Xem chi tiết
                    </Button>
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
