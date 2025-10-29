"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Heart, CreditCard, Smartphone, QrCode, CheckCircle, Users, DollarSign } from "lucide-react"

export default function Donate() {
  const [donationAmount, setDonationAmount] = useState("")
  const [donorName, setDonorName] = useState("")
  const [donorMessage, setDonorMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isPublic, setIsPublic] = useState(true)

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000]

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle donation logic here
    console.log({
      amount: donationAmount,
      name: donorName,
      message: donorMessage,
      isAnonymous,
      isPublic
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4">
                <Heart className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-poppins">
              Quyên góp
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Mỗi đóng góp của bạn sẽ mang đến hy vọng và cơ hội cho những người cần giúp đỡ. 
              Cùng chúng tôi lan tỏa yêu thương đến những vùng cao xa xôi.
            </p>
          </div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Thông tin quyên góp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDonate} className="space-y-6">
                    {/* Amount */}
                    <div>
                      <Label htmlFor="amount" className="text-base font-semibold">
                        Số tiền quyên góp (VND)
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Nhập số tiền..."
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="mt-2 text-lg"
                      />
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {quickAmounts.map((amount) => (
                          <Button
                            key={amount}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDonationAmount(amount.toString())}
                            className="text-sm"
                          >
                            {amount.toLocaleString()}đ
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Donor Name */}
                    <div>
                      <Label htmlFor="name" className="text-base font-semibold">
                        Tên người quyên góp
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Nhập tên của bạn..."
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="mt-2"
                        disabled={isAnonymous}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <Label htmlFor="message" className="text-base font-semibold">
                        Lời nhắn (tùy chọn)
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Nhập lời nhắn của bạn..."
                        value={donorMessage}
                        onChange={(e) => setDonorMessage(e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="anonymous"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="anonymous" className="text-sm">
                          Quyên góp ẩn danh
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="public"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="public" className="text-sm">
                          Hiển thị công khai trên website
                        </Label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3"
                    >
                      <Heart className="mr-2 h-5 w-5" />
                      Quyên góp ngay
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Phương thức thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <CreditCard className="h-6 w-6 text-blue-500 mr-3" />
                      <div>
                        <h3 className="font-semibold">Chuyển khoản ngân hàng</h3>
                        <p className="text-sm text-gray-600">STK: 1234567890</p>
                        <p className="text-sm text-gray-600">Ngân hàng: Vietcombank</p>
                        <p className="text-sm text-gray-600">Chủ TK: Mặt Trời Trên Bản</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <Smartphone className="h-6 w-6 text-green-500 mr-3" />
                      <div>
                        <h3 className="font-semibold">Ví điện tử MoMo</h3>
                        <p className="text-sm text-gray-600">SĐT: 0901234567</p>
                        <p className="text-sm text-gray-600">Tên: Mặt Trời Trên Bản</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <QrCode className="h-6 w-6 text-purple-500 mr-3" />
                      <div>
                        <h3 className="font-semibold">QR Code</h3>
                        <p className="text-sm text-gray-600">Quét mã QR để thanh toán</p>
                        <div className="mt-2 w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                          <QrCode className="h-12 w-12 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Donations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Quyên góp gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <div>
                          <p className="font-semibold text-sm">Nguyễn Văn A</p>
                          <p className="text-xs text-gray-600">2 giờ trước</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">500,000đ</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                        <div>
                          <p className="font-semibold text-sm">Trần Thị B</p>
                          <p className="text-xs text-gray-600">5 giờ trước</p>
                        </div>
                      </div>
                      <span className="font-bold text-blue-600">1,000,000đ</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-purple-500 mr-2" />
                        <div>
                          <p className="font-semibold text-sm">Người ẩn danh</p>
                          <p className="text-xs text-gray-600">1 ngày trước</p>
                        </div>
                      </div>
                      <span className="font-bold text-purple-600">200,000đ</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Tổng quan quyên góp
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cùng xem những con số biết nói về sự ủng hộ của cộng đồng
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">500M+</h3>
              <p className="text-gray-600">VND đã quyên góp</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">2,500+</h3>
              <p className="text-gray-600">Lượt quyên góp</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">1,200+</h3>
              <p className="text-gray-600">Người được hỗ trợ</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-red-400 to-orange-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">100%</h3>
              <p className="text-gray-600">Minh bạch tài chính</p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency Note */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-poppins">
              Cam kết minh bạch
            </h2>
            <p className="text-lg mb-6">
              Chúng tôi cam kết sử dụng mọi đồng quyên góp một cách minh bạch và hiệu quả. 
              Tất cả các khoản thu chi đều được công khai trên website và báo cáo định kỳ.
            </p>
            <Button asChild variant="secondary" className="bg-white text-orange-500 hover:bg-gray-50">
              <a href="/transparency">
                Xem báo cáo tài chính
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
