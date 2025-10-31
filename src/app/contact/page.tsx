"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Không thể gửi tin nhắn. Vui lòng thử lại.")
      }

      setIsSubmitted(true)
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: ""
        })
      }, 5000)
    } catch (err: any) {
      console.error("Error submitting message:", err)
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại sau.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-poppins">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. 
              Hãy liên hệ với chúng tôi để được tư vấn hoặc đóng góp ý kiến.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Gửi tin nhắn cho chúng tôi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-green-600 mb-2">
                        Gửi tin nhắn thành công!
                      </h3>
                      <p className="text-gray-600">
                        Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                          {error}
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-base font-semibold">
                            Họ và tên *
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Nhập họ và tên..."
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-base font-semibold">
                            Email *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Nhập email..."
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone" className="text-base font-semibold">
                            Số điện thoại
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="Nhập số điện thoại..."
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="subject" className="text-base font-semibold">
                            Chủ đề
                          </Label>
                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            placeholder="Nhập chủ đề..."
                            value={formData.subject}
                            onChange={handleChange}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-base font-semibold">
                          Tin nhắn *
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Nhập tin nhắn của bạn..."
                          value={formData.message}
                          onChange={handleChange}
                          required
                          className="mt-2"
                          rows={5}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Gửi tin nhắn
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Thông tin liên hệ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">info@mattroitrendb.org</p>
                      <p className="text-gray-600">support@mattroitrendb.org</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-2">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Điện thoại</h3>
                      <p className="text-gray-600">+84 123 456 789</p>
                      <p className="text-gray-600">+84 987 654 321</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-2">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Địa chỉ</h3>
                      <p className="text-gray-600">
                        123 Đường ABC, Phường XYZ<br />
                        Quận 1, Thành phố Hồ Chí Minh<br />
                        Việt Nam
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-gradient-to-r from-red-400 to-orange-500 rounded-full p-2">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Giờ làm việc</h3>
                      <p className="text-gray-600">Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                      <p className="text-gray-600">Thứ 7: 8:00 - 12:00</p>
                      <p className="text-gray-600">Chủ nhật: Nghỉ</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Mạng xã hội
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full justify-start">
                      <div className="bg-blue-500 rounded-full p-1 mr-2">
                        <div className="w-4 h-4"></div>
                      </div>
                      Facebook
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <div className="bg-pink-500 rounded-full p-1 mr-2">
                        <div className="w-4 h-4"></div>
                      </div>
                      Instagram
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <div className="bg-red-500 rounded-full p-1 mr-2">
                        <div className="w-4 h-4"></div>
                      </div>
                      YouTube
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <div className="bg-blue-600 rounded-full p-1 mr-2">
                        <div className="w-4 h-4"></div>
                      </div>
                      LinkedIn
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Vị trí văn phòng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Bản đồ sẽ được hiển thị ở đây</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Câu hỏi thường gặp
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những câu hỏi phổ biến mà chúng tôi thường nhận được
            </p>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Làm thế nào để quyên góp cho tổ chức?
                </h3>
                <p className="text-gray-600">
                  Bạn có thể quyên góp thông qua chuyển khoản ngân hàng, ví điện tử MoMo, 
                  hoặc quét mã QR. Tất cả thông tin thanh toán đều có trên trang quyên góp.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Tôi có thể tham gia hoạt động tình nguyện không?
                </h3>
                <p className="text-gray-600">
                  Chúng tôi luôn chào đón những tình nguyện viên nhiệt huyết. 
                  Hãy liên hệ với chúng tôi để được tư vấn về các cơ hội tham gia.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Làm sao để đảm bảo tính minh bạch của tổ chức?
                </h3>
                <p className="text-gray-600">
                  Chúng tôi công khai tất cả các khoản thu chi trên trang minh bạch tài chính. 
                  Bạn có thể xem báo cáo tài chính định kỳ và theo dõi việc sử dụng quỹ.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
