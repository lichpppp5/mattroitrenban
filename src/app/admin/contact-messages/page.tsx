"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Mail, 
  Search, 
  Check, 
  CheckCircle2, 
  Circle, 
  Calendar,
  User,
  Phone,
  MessageSquare,
  Loader2
} from "lucide-react"

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  isRead: boolean
  createdAt: string
}

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">("all")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [filterStatus])

  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filterStatus === "read") params.append("isRead", "true")
      if (filterStatus === "unread") params.append("isRead", "false")
      
      const response = await fetch(`/api/contact-messages?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch messages")
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error("Error fetching messages:", err)
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/contact-messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      })

      if (!response.ok) throw new Error("Failed to mark as read")

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      )
    } catch (err) {
      console.error("Error marking as read:", err)
      alert("Không thể đánh dấu đã đọc. Vui lòng thử lại.")
    }
  }

  const markAsUnread = async (messageId: string) => {
    try {
      const response = await fetch(`/api/contact-messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: false }),
      })

      if (!response.ok) throw new Error("Failed to mark as unread")

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: false } : msg
        )
      )
    } catch (err) {
      console.error("Error marking as unread:", err)
      alert("Không thể đánh dấu chưa đọc. Vui lòng thử lại.")
    }
  }

  const openMessage = (message: ContactMessage) => {
    setSelectedMessage(message)
    setIsDialogOpen(true)
    // Auto mark as read when opening
    if (!message.isRead) {
      markAsRead(message.id)
    }
  }

  const filteredMessages = messages.filter((msg) => {
    const query = searchQuery.toLowerCase()
    return (
      msg.name.toLowerCase().includes(query) ||
      msg.email.toLowerCase().includes(query) ||
      msg.message.toLowerCase().includes(query) ||
      (msg.subject && msg.subject.toLowerCase().includes(query))
    )
  })

  const unreadCount = messages.filter((m) => !m.isRead).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tin nhắn liên hệ</h2>
          <p className="text-gray-600">Quản lý và phản hồi tin nhắn từ khách hàng</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {unreadCount > 0 && (
            <span className="mr-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
              {unreadCount} mới
            </span>
          )}
          Tổng: {messages.length}
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, chủ đề..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="unread">Chưa đọc</SelectItem>
                <SelectItem value="read">Đã đọc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tin nhắn</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có tin nhắn nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Trạng thái</TableHead>
                    <TableHead>Người gửi</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Chủ đề</TableHead>
                    <TableHead>Tin nhắn</TableHead>
                    <TableHead>Ngày gửi</TableHead>
                    <TableHead className="w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow
                      key={message.id}
                      className={!message.isRead ? "bg-blue-50 hover:bg-blue-100 cursor-pointer" : "cursor-pointer"}
                      onClick={() => openMessage(message)}
                    >
                      <TableCell>
                        {message.isRead ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-blue-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{message.name}</div>
                        {message.phone && (
                          <div className="text-sm text-gray-500">{message.phone}</div>
                        )}
                      </TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell>
                        {message.subject || <span className="text-gray-400">Không có chủ đề</span>}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md truncate">{message.message}</div>
                      </TableCell>
                      <TableCell>
                        {new Date(message.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          {message.isRead ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsUnread(message.id)}
                              title="Đánh dấu chưa đọc"
                            >
                              <Circle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(message.id)}
                              title="Đánh dấu đã đọc"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Chi tiết tin nhắn
            </DialogTitle>
            <DialogDescription>
              {selectedMessage && (
                <span className="text-sm text-gray-500">
                  Gửi lúc: {new Date(selectedMessage.createdAt).toLocaleString("vi-VN")}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="h-4 w-4" />
                    Họ và tên
                  </div>
                  <p className="font-semibold">{selectedMessage.name}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-semibold">
                    <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                      {selectedMessage.email}
                    </a>
                  </p>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Phone className="h-4 w-4" />
                      Số điện thoại
                    </div>
                    <p className="font-semibold">
                      <a href={`tel:${selectedMessage.phone}`} className="text-blue-600 hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </p>
                  </div>
                )}
                {selectedMessage.subject && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <MessageSquare className="h-4 w-4" />
                      Chủ đề
                    </div>
                    <p className="font-semibold">{selectedMessage.subject}</p>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MessageSquare className="h-4 w-4" />
                  Tin nhắn
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || "Liên hệ"}`
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Phản hồi qua Email
                </Button>
                {selectedMessage.isRead ? (
                  <Button variant="outline" onClick={() => markAsUnread(selectedMessage.id)}>
                    <Circle className="mr-2 h-4 w-4" />
                    Đánh dấu chưa đọc
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => markAsRead(selectedMessage.id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Đánh dấu đã đọc
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

